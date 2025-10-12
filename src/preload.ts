import { contextBridge, ipcRenderer } from "electron";

/**
 * プリロードスクリプト
 * レンダラープロセスとメインプロセス間の安全な通信を提供
 */

// レンダラープロセスに公開するAPI
contextBridge.exposeInMainWorld("electronAPI", {
  // アプリケーション情報
  getAppPath: () => ipcRenderer.invoke("get-app-path"),
  getVersion: () => ipcRenderer.invoke("get-version"),

  // メニューイベントリスナー
  onMenuNewFile: (callback: () => void) => {
    ipcRenderer.on("menu-new-file", callback);
  },
  onMenuOpenFile: (callback: () => void) => {
    ipcRenderer.on("menu-open-file", callback);
  },
  onMenuOpenFolder: (callback: () => void) => {
    ipcRenderer.on("menu-open-folder", callback);
  },
  onMenuSaveFile: (callback: () => void) => {
    ipcRenderer.on("menu-save-file", callback);
  },
  onMenuSaveFileAs: (callback: () => void) => {
    ipcRenderer.on("menu-save-file-as", callback);
  },

  // ダイアログ
  openFileDialog: () => ipcRenderer.invoke("open-file-dialog"),
  openFolderDialog: () => ipcRenderer.invoke("open-folder-dialog"),
  saveFileDialog: () => ipcRenderer.invoke("save-file-dialog"),

  // ファイル操作
  readFile: (filePath: string) => ipcRenderer.invoke("read-file", filePath),
  writeFile: (filePath: string, content: string) =>
    ipcRenderer.invoke("write-file", filePath, content),
  readDirectory: (dirPath: string) =>
    ipcRenderer.invoke("read-directory", dirPath),
  fileExists: (filePath: string) => ipcRenderer.invoke("file-exists", filePath),
  createDirectory: (dirPath: string) =>
    ipcRenderer.invoke("create-directory", dirPath),
});

// TypeScript型定義
declare global {
  interface Window {
    electronAPI: {
      // アプリケーション情報
      getAppPath: () => Promise<string>;
      getVersion: () => Promise<string>;

      // メニューイベント
      onMenuNewFile: (callback: () => void) => void;
      onMenuOpenFile: (callback: () => void) => void;
      onMenuOpenFolder: (callback: () => void) => void;
      onMenuSaveFile: (callback: () => void) => void;
      onMenuSaveFileAs: (callback: () => void) => void;

      // ダイアログ
      openFileDialog: () => Promise<string | null>;
      openFolderDialog: () => Promise<string | null>;
      saveFileDialog: () => Promise<string | null>;

      // ファイル操作
      readFile: (filePath: string) => Promise<{
        success: boolean;
        content?: string;
        path?: string;
        error?: string;
      }>;
      writeFile: (
        filePath: string,
        content: string
      ) => Promise<{
        success: boolean;
        path?: string;
        error?: string;
      }>;
      readDirectory: (dirPath: string) => Promise<{
        success: boolean;
        items?: Array<{
          name: string;
          path: string;
          isDirectory: boolean;
          isFile: boolean;
        }>;
        error?: string;
      }>;
      fileExists: (filePath: string) => Promise<boolean>;
      createDirectory: (dirPath: string) => Promise<{
        success: boolean;
        error?: string;
      }>;
    };
  }
}
