import { BrowserWindow } from "electron";
import * as path from "path";

/**
 * ウィンドウマネージャー
 * ウィンドウの作成と管理を担当
 */
export class WindowManager {
  private window: BrowserWindow | null = null;

  /**
   * メインウィンドウを作成
   */
  public createMainWindow(): BrowserWindow {
    this.window = new BrowserWindow({
      width: 1400,
      height: 900,
      minWidth: 800,
      minHeight: 600,
      backgroundColor: "#ffffff",
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        preload: path.join(__dirname, "../preload.js"),
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
    this.window.once("ready-to-show", () => {
      this.window?.show();
    });

    // HTMLファイルを読み込み
    this.window.loadFile(path.join(__dirname, "../../public/index.html"));

    // 開発モードの場合はDevToolsを開く
    if (process.argv.includes("--dev")) {
      this.window.webContents.openDevTools();
    }

    // ウィンドウが閉じられたらリファレンスをクリア
    this.window.on("closed", () => {
      this.window = null;
    });

    return this.window;
  }

  /**
   * メインウィンドウを取得
   */
  public getMainWindow(): BrowserWindow | null {
    return this.window;
  }
}
