import { app, BrowserWindow, ipcMain, Menu } from "electron";
import * as path from "path";

/**
 * InkEditorのメインプロセス
 * Electronアプリケーションのライフサイクルを管理
 */
class InkEditor {
  private main_window: BrowserWindow | null = null;

  /**
   * アプリケーションを初期化
   */
  constructor() {
    this.initializeApp();
  }

  /**
   * アプリケーションの初期化処理
   */
  private initializeApp(): void {
    // アプリケーションの準備完了時にウィンドウを作成
    app.whenReady().then(() => {
      this.createWindow();
      this.setupMenu();
      this.setupIpcHandlers();

      app.on("activate", () => {
        if (BrowserWindow.getAllWindows().length === 0) {
          this.createWindow();
        }
      });
    });

    app.on("window-all-closed", () => {
      if (process.platform !== "darwin") {
        app.quit();
      }
    });
  }

  /**
   * メインウィンドウを作成
   */
  private createWindow(): void {
    this.main_window = new BrowserWindow({
      width: 1400,
      height: 900,
      minWidth: 800,
      minHeight: 600,
      backgroundColor: "#ffffff",
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        preload: path.join(__dirname, "preload.js"),
      },
      titleBarStyle: "hidden",
      titleBarOverlay: {
        color: "#ffffff",
        symbolColor: "#000000",
        height: 40,
      },
      frame: true,
      show: false,
    });

    // ウィンドウの準備ができたら表示
    this.main_window.once("ready-to-show", () => {
      this.main_window?.show();
    });

    // HTMLファイルを読み込み
    this.main_window.loadFile(path.join(__dirname, "../public/index.html"));

    // 開発モードの場合はDevToolsを開く
    if (process.argv.includes("--dev")) {
      this.main_window.webContents.openDevTools();
    }

    // ウィンドウが閉じられたらリファレンスをクリア
    this.main_window.on("closed", () => {
      this.main_window = null;
    });
  }

  /**
   * アプリケーションメニューを設定
   */
  private setupMenu(): void {
    const template: Electron.MenuItemConstructorOptions[] = [
      {
        label: "File",
        submenu: [
          {
            label: "New File",
            accelerator: "CmdOrCtrl+N",
            click: () => {
              this.main_window?.webContents.send("menu-new-file");
            },
          },
          {
            label: "Open File",
            accelerator: "CmdOrCtrl+O",
            click: () => {
              this.main_window?.webContents.send("menu-open-file");
            },
          },
          {
            label: "Save",
            accelerator: "CmdOrCtrl+S",
            click: () => {
              this.main_window?.webContents.send("menu-save-file");
            },
          },
          { type: "separator" },
          {
            label: "Exit",
            accelerator: "CmdOrCtrl+Q",
            click: () => {
              app.quit();
            },
          },
        ],
      },
      {
        label: "Edit",
        submenu: [
          { role: "undo" },
          { role: "redo" },
          { type: "separator" },
          { role: "cut" },
          { role: "copy" },
          { role: "paste" },
          { role: "selectAll" },
        ],
      },
      {
        label: "View",
        submenu: [
          { role: "reload" },
          { role: "toggleDevTools" },
          { type: "separator" },
          { role: "resetZoom" },
          { role: "zoomIn" },
          { role: "zoomOut" },
          { type: "separator" },
          { role: "togglefullscreen" },
        ],
      },
    ];

    const menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);
  }

  /**
   * IPCハンドラーを設定
   */
  private setupIpcHandlers(): void {
    // レンダラープロセスからのメッセージをハンドル
    ipcMain.handle("get-app-path", () => {
      return app.getPath("userData");
    });

    ipcMain.handle("get-version", () => {
      return app.getVersion();
    });
  }
}

// アプリケーションを起動
new InkEditor();
