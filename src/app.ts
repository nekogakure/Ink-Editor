import { app, BrowserWindow } from "electron";
import { WindowManager } from "./core/WindowManager";
import { MenuManager } from "./core/MenuManager";
import { IpcManager } from "./core/IpcManager";

/**
 * InkEditorのメインプロセス
 * アプリケーションのエントリーポイント
 */
class InkEditor {
  private window_manager: WindowManager;
  private menu_manager: MenuManager;
  private ipc_manager: IpcManager;

  constructor() {
    this.window_manager = new WindowManager();
    this.menu_manager = new MenuManager();
    this.ipc_manager = new IpcManager();
    this.initialize();
  }

  /**
   * アプリケーションを初期化
   */
  private initialize(): void {
    app.whenReady().then(() => {
      const main_window = this.window_manager.createMainWindow();
      this.menu_manager.setupMenu(main_window);
      this.ipc_manager.setupHandlers(this.window_manager);

      app.on("activate", () => {
        if (BrowserWindow.getAllWindows().length === 0) {
          this.window_manager.createMainWindow();
        }
      });
    });

    app.on("window-all-closed", () => {
      if (process.platform !== "darwin") {
        app.quit();
      }
    });
  }
}

// アプリケーションを起動
new InkEditor();
