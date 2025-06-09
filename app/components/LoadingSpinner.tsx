"use client";

import React from "react";

const LoadingSpinner: React.FC = () => {
  return (
    <div className="fixed inset-0 bg-black/20 dark:bg-black/40 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="bg-background/90 backdrop-blur-md rounded-lg p-6 shadow-lg border border-border">
        <div className="flex flex-col items-center space-y-4">
          {/* スピナー */}
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          {/* テキスト */}
          <p className="text-foreground text-sm font-medium">読み込み中...</p>
        </div>
      </div>
    </div>
  );
};

export default LoadingSpinner;