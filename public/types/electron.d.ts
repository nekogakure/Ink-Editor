/**
 * Electron API型定義
 */

export {};

declare global {
  interface Window {
    electronAPI?: {
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

      // セッション状態管理
      getSessionState: () => Promise<{
        lastOpenedFolder: string | null;
        openedFiles: string[];
        activeFile: string | null;
      }>;
      validateSession: () => Promise<{
        isValid: boolean;
        validFiles: string[];
        folderExists: boolean;
      }>;
      setLastOpenedFolder: (folderPath: string | null) => Promise<void>;
      setOpenedFiles: (filePaths: string[]) => Promise<void>;
      setActiveFile: (filePath: string | null) => Promise<void>;
      clearSession: () => Promise<void>;
    };
  }
}
