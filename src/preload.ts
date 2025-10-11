import { contextBridge, ipcRenderer } from "electron";

/**
 * プリロードスクリプト
 * レンダラープロセスとメインプロセス間の安全な通信を提供
 */

// レンダラープロセスに公開するAPI
contextBridge.exposeInMainWorld("electronAPI", {
  // アプリケーション情報を取得
  getAppPath: () => ipcRenderer.invoke("get-app-path"),
  getVersion: () => ipcRenderer.invoke("get-version"),

  // メニューイベントリスナー
  onMenuNewFile: (callback: () => void) => {
    ipcRenderer.on("menu-new-file", callback);
  },
  onMenuOpenFile: (callback: () => void) => {
    ipcRenderer.on("menu-open-file", callback);
  },
  onMenuSaveFile: (callback: () => void) => {
    ipcRenderer.on("menu-save-file", callback);
  },
});

// TypeScript型定義
declare global {
  interface Window {
    electronAPI: {
      getAppPath: () => Promise<string>;
      getVersion: () => Promise<string>;
      onMenuNewFile: (callback: () => void) => void;
      onMenuOpenFile: (callback: () => void) => void;
      onMenuSaveFile: (callback: () => void) => void;
    };
  }
}
