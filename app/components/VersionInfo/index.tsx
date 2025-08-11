'use client';

import { getVersionInfo } from '../../../version';

export const VersionInfo = () => {
  const versionInfo = getVersionInfo();

  // 在控制台打印版本信息
  if (typeof window !== 'undefined') {
    console.log('🚀 App Version Info:', versionInfo);
    console.log(`�� Version: ${versionInfo.version}`);
    console.log(`⏰ Build Time: ${versionInfo.buildTime}`);
    console.log(`🔗 Commit: ${versionInfo.commitHash}`);
  }

  return (
    <div className="text-xs text-gray-500 p-2">
      v{versionInfo.version} | {new Date(versionInfo.buildTime).toLocaleDateString()}
    </div>
  );
};