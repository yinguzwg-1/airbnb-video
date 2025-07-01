// 诊断脚本 - 用于识别错误来源
console.log('=== 错误诊断脚本已加载 ===');

// 监听所有错误
window.addEventListener('error', function(event) {
  console.log('=== 捕获到错误 ===');
  console.log('错误消息:', event.message);
  console.log('错误文件:', event.filename);
  console.log('错误行号:', event.lineno);
  console.log('错误列号:', event.colno);
  console.log('错误对象:', event.error);
  console.log('时间戳:', new Date().toISOString());
  console.log('当前URL:', window.location.href);
  console.log('用户代理:', navigator.userAgent);
  console.log('==================');
});

// 监听未处理的Promise拒绝
window.addEventListener('unhandledrejection', function(event) {
  console.log('=== 捕获到未处理的Promise拒绝 ===');
  console.log('原因:', event.reason);
  console.log('Promise:', event.promise);
  console.log('时间戳:', new Date().toISOString());
  console.log('当前URL:', window.location.href);
  console.log('==============================');
});

// 检查是否有浏览器扩展
console.log('=== 浏览器扩展检查 ===');
console.log('Chrome扩展:', window.chrome && window.chrome.runtime);
console.log('Firefox扩展:', window.browser && window.browser.runtime);
console.log('Safari扩展:', window.safari && window.safari.extension);

// 检查全局对象
console.log('=== 全局对象检查 ===');
console.log('window.tracker:', window.tracker);
console.log('window.__NEXT_DATA__:', window.__NEXT_DATA__);

// 检查DOM状态
console.log('=== DOM状态检查 ===');
console.log('document.readyState:', document.readyState);
console.log('document.body:', document.body ? '存在' : '不存在');

// 检查环境变量
console.log('=== 环境变量检查 ===');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('NEXT_PUBLIC_LOCAL_HOST:', process.env.NEXT_PUBLIC_LOCAL_HOST);
console.log('NEXT_PUBLIC_APP_ID:', process.env.NEXT_PUBLIC_APP_ID);

console.log('=== 诊断脚本加载完成 ==='); 