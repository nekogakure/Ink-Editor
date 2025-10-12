import * as fs from "fs";
import * as path from "path";
import { app } from "electron";

/**
 * アプリケーションの状態
 */
interface AppState {
  lastOpenedFolder: string | null;
  openedFiles: string[];
  activeFile: string | null;
  windowBounds?: {
    width: number;
    height: number;
    x?: number;
    y?: number;
  };
}

/**
 * 状態管理クラス
 * アプリケーションの状態をJSON形式で永続化
 */
export class StateManager {
  private state_file_path: string;
  private state: AppState;

  constructor() {
    // ユーザーデータディレクトリに状態ファイルを保存
    const user_data_path = app.getPath("userData");
    this.state_file_path = path.join(user_data_path, "app-state.json");

    // 初期状態
    this.state = {
      lastOpenedFolder: null,
      openedFiles: [],
      activeFile: null,
    };

    // 状態を読み込み
    this.load();
  }

  /**
   * 状態をファイルから読み込み
   */
  private load(): void {
    try {
      if (fs.existsSync(this.state_file_path)) {
        const data = fs.readFileSync(this.state_file_path, "utf-8");
        this.state = JSON.parse(data);
        console.log("State loaded:", this.state);
      } else {
        console.log("No state file found, using default state");
      }
    } catch (error) {
      console.error("Failed to load state:", error);
    }
  }

  /**
   * 状態をファイルに保存
   */
  private save(): void {
    try {
      fs.writeFileSync(
        this.state_file_path,
        JSON.stringify(this.state, null, 2),
        "utf-8"
      );
      console.log("State saved:", this.state);
    } catch (error) {
      console.error("Failed to save state:", error);
    }
  }

  /**
   * 最後に開いたフォルダを取得
   */
  public getLastOpenedFolder(): string | null {
    return this.state.lastOpenedFolder;
  }

  /**
   * 最後に開いたフォルダを設定
   */
  public setLastOpenedFolder(folder_path: string | null): void {
    this.state.lastOpenedFolder = folder_path;
    this.save();
  }

  /**
   * 開いているファイル一覧を取得
   */
  public getOpenedFiles(): string[] {
    return this.state.openedFiles || [];
  }

  /**
   * 開いているファイル一覧を設定
   */
  public setOpenedFiles(file_paths: string[]): void {
    this.state.openedFiles = file_paths;
    this.save();
  }

  /**
   * アクティブなファイルを取得
   */
  public getActiveFile(): string | null {
    return this.state.activeFile;
  }

  /**
   * アクティブなファイルを設定
   */
  public setActiveFile(file_path: string | null): void {
    this.state.activeFile = file_path;
    this.save();
  }

  /**
   * ウィンドウの境界を取得
   */
  public getWindowBounds():
    | { width: number; height: number; x?: number; y?: number }
    | undefined {
    return this.state.windowBounds;
  }

  /**
   * ウィンドウの境界を設定
   */
  public setWindowBounds(bounds: {
    width: number;
    height: number;
    x?: number;
    y?: number;
  }): void {
    this.state.windowBounds = bounds;
    this.save();
  }

  /**
   * セッション状態を検証
   * ファイルやフォルダが存在するかチェック
   */
  public validateSession(): {
    isValid: boolean;
    validFiles: string[];
    folderExists: boolean;
  } {
    const folder = this.state.lastOpenedFolder;
    const files = this.state.openedFiles || [];

    // フォルダの存在確認
    const folderExists =
      folder !== null &&
      fs.existsSync(folder) &&
      fs.statSync(folder).isDirectory();

    // ファイルの存在確認
    const validFiles = files.filter(
      (file) => fs.existsSync(file) && fs.statSync(file).isFile()
    );

    // アクティブファイルが無効な場合はクリア
    if (this.state.activeFile && !validFiles.includes(this.state.activeFile)) {
      this.state.activeFile = null;
    }

    const isValid = folderExists || validFiles.length > 0;

    return {
      isValid,
      validFiles,
      folderExists,
    };
  }

  /**
   * 状態をクリア
   */
  public clear(): void {
    this.state = {
      lastOpenedFolder: null,
      openedFiles: [],
      activeFile: null,
    };
    this.save();
  }
}
