import { ipcMain, app } from "electron";
import { DialogManager } from "../sys/dialog";
import { FileManager } from "../sys/file";
import { StateManager } from "../sys/StateManager";
import { WindowManager } from "../core/WindowManager";

/**
 * IPCハンドラーマネージャー
 * レンダラープロセスからのIPC通信を処理
 */
export class IpcManager {
  private dialog_manager: DialogManager;
  private file_manager: FileManager;
  private state_manager: StateManager;

  constructor() {
    this.dialog_manager = new DialogManager();
    this.file_manager = new FileManager();
    this.state_manager = new StateManager();
  }

  /**
   * すべてのIPCハンドラーを登録
   */
  public setupHandlers(window_manager: WindowManager): void {
    // アプリケーション情報
    ipcMain.handle("get-app-path", () => {
      return app.getPath("userData");
    });

    ipcMain.handle("get-version", () => {
      return app.getVersion();
    });

    // ファイルダイアログ
    ipcMain.handle("open-file-dialog", async () => {
      const window = window_manager.getMainWindow();
      if (!window) return null;
      return await this.dialog_manager.showOpenFileDialog(window);
    });

    ipcMain.handle("open-folder-dialog", async () => {
      const window = window_manager.getMainWindow();
      if (!window) return null;
      return await this.dialog_manager.showOpenFolderDialog(window);
    });

    ipcMain.handle("save-file-dialog", async () => {
      const window = window_manager.getMainWindow();
      if (!window) return null;
      return await this.dialog_manager.showSaveFileDialog(window);
    });

    // ファイル操作
    ipcMain.handle("read-file", async (_event, file_path: string) => {
      return await this.file_manager.readFile(file_path);
    });

    ipcMain.handle(
      "write-file",
      async (_event, file_path: string, content: string) => {
        return await this.file_manager.writeFile(file_path, content);
      }
    );

    ipcMain.handle("read-directory", async (_event, dir_path: string) => {
      return await this.file_manager.readDirectory(dir_path);
    });

    ipcMain.handle("file-exists", async (_event, file_path: string) => {
      return await this.file_manager.fileExists(file_path);
    });

    ipcMain.handle("create-directory", async (_event, dir_path: string) => {
      return await this.file_manager.createDirectory(dir_path);
    });

    // セッション状態管理
    ipcMain.handle("get-session-state", () => {
      return {
        lastOpenedFolder: this.state_manager.getLastOpenedFolder(),
        openedFiles: this.state_manager.getOpenedFiles(),
        activeFile: this.state_manager.getActiveFile(),
      };
    });

    ipcMain.handle("validate-session", () => {
      return this.state_manager.validateSession();
    });

    ipcMain.handle(
      "set-last-opened-folder",
      (_event, folder_path: string | null) => {
        this.state_manager.setLastOpenedFolder(folder_path);
      }
    );

    ipcMain.handle("set-opened-files", (_event, file_paths: string[]) => {
      this.state_manager.setOpenedFiles(file_paths);
    });

    ipcMain.handle("set-active-file", (_event, file_path: string | null) => {
      this.state_manager.setActiveFile(file_path);
    });

    ipcMain.handle("clear-session", () => {
      this.state_manager.clear();
    });
  }
}
