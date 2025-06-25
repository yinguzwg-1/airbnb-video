// src/types/global.d.ts
import { AdvancedTracker } from '../components/BurryPoint/advancedTracker';

declare global {
  interface Window {
    tracker?: AdvancedTracker; // 明确类型且可选
  }
}

export {};