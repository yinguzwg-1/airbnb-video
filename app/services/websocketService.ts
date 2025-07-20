import { io } from 'socket.io-client';
import { config as configApi } from '@/app/config';

// WebSocket 连接管理
class WebSocketManager {
  private socket: any = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectInterval = 3000;
  private listeners: { [key: string]: Function[] } = {};
  private isConnecting = false;

  connect() {
    // 防止重复连接
    if (this.isConnecting || (this.socket && this.socket.connected)) {
      return;
    }

    this.isConnecting = true;
    
    try {
      // 使用 socket.io-client 连接
      const serverUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
      
      this.socket = io(serverUrl, {
        transports: ['websocket', 'polling'],
        timeout: 10000,
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000
      });

      this.socket.on('connect', () => {
        this.reconnectAttempts = 0;
        this.isConnecting = false;
      });

      this.socket.on('disconnect', (reason: string) => {
        this.isConnecting = false;
        if (reason === 'io server disconnect') {
          // 服务器主动断开，需要手动重连
          this.socket.connect();
        } else {
          this.scheduleReconnect();
        }
      });

      this.socket.on('connect_error', (error: any) => {
        this.isConnecting = false;
        // 不要立即重连，让socket.io自己处理
      });

      this.socket.on('reconnect', (attemptNumber: number) => {
        this.isConnecting = false;
      });

      this.socket.on('reconnect_error', (error: any) => {
        this.isConnecting = false;
      });

      // 监听监控数据更新
      this.socket.on('monitorUpdate', (data: any) => {
        console.log('WebSocket: Monitor update received:', data);
        this.notifyListeners('monitorUpdate', data);
      });

      // 监听同步完成通知
      this.socket.on('syncComplete', (data: any) => {
        console.log('WebSocket: Sync complete received:', data);
        this.notifyListeners('syncComplete', data);
      });

    } catch (error) {
      console.error('WebSocket: Failed to connect:', error);
      this.isConnecting = false;
      this.scheduleReconnect();
    }
  }

  private scheduleReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      setTimeout(() => {
        console.log(`WebSocket: Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
        this.connect();
      }, this.reconnectInterval);
    }
  }

  addListener(event: string, callback: Function) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    // 检查是否已经存在相同的回调函数
    if (!this.listeners[event].includes(callback)) {
      console.log(`WebSocket: Adding listener for event: ${event}`);
      this.listeners[event].push(callback);
    } else {
      console.log(`WebSocket: Listener for event ${event} already exists, skipping`);
    }
  }

  removeListener(event: string, callback: Function) {
    if (this.listeners[event]) {
      const index = this.listeners[event].indexOf(callback);
      if (index > -1) {
        console.log(`WebSocket: Removing listener for event: ${event}`);
        this.listeners[event].splice(index, 1);
      }
    }
  }

  private notifyListeners(event: string, data: any) {
    if (this.listeners[event]) {
      console.log(`WebSocket: Notifying ${this.listeners[event].length} listeners for event: ${event}`);
      this.listeners[event].forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error('WebSocket: Error in listener callback:', error);
        }
      });
    } else {
      console.log(`WebSocket: No listeners for event: ${event}`);
    }
  }

  disconnect() {
    if (this.socket) {
      console.log('WebSocket: Disconnecting...');
      this.socket.disconnect();
      this.socket = null;
    }
    this.isConnecting = false;
  }

  // 获取连接状态
  isConnected(): boolean {
    return this.socket && this.socket.connected;
  }
}

// 创建全局 WebSocket 管理器实例
export const wsManager = new WebSocketManager();

// 延迟初始化，避免在SSR时连接
let isInitialized = false;

const initializeWebSocket = () => {
  if (typeof window !== 'undefined' && !isInitialized) {
    console.log('WebSocket: Initializing...');
    wsManager.connect();
    isInitialized = true;
  }
};

// 导出 WebSocket 服务
export const websocketService = {
  // 初始化并连接 WebSocket
  initialize: () => {
    initializeWebSocket();
    return wsManager;
  },
  
  // 连接 WebSocket
  connect: () => wsManager.connect(),
  
  // 断开连接
  disconnect: () => wsManager.disconnect(),
  
  // 添加事件监听器
  on: (event: string, callback: Function) => {
    console.log(`WebSocket Service: Adding listener for ${event}`);
    initializeWebSocket(); // 确保在添加监听器时已连接
    wsManager.addListener(event, callback);
  },
  
  // 移除事件监听器
  off: (event: string, callback: Function) => {
    console.log(`WebSocket Service: Removing listener for ${event}`);
    wsManager.removeListener(event, callback);
  },
  
  // 检查连接状态
  isConnected: () => wsManager.isConnected(),
  
  // 获取管理器实例
  getManager: () => wsManager
}; 