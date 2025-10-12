import { EditorManager } from "../editors/EditorManager";
import { FileManager } from "../utils/FileManager";
import { TabManager } from "../utils/TabManager";
import { ExplorerManager } from "../utils/ExplorerManager";
import { UIController } from "../ui/UIController";
import { SessionManager } from "../utils/SessionManager";

/**
 * ファイル操作ハンドラークラス
 * ファイルの新規作成、開く、保存などの処理
 */
export class FileHandlers {
  private editor_manager: EditorManager;
  private file_manager: FileManager;
  private tab_manager: TabManager;
  private explorer_manager: ExplorerManager;
  private ui_controller: UIController;
  private session_manager: SessionManager;

  constructor(
    editor_manager: EditorManager,
    file_manager: FileManager,
    tab_manager: TabManager,
    explorer_manager: ExplorerManager,
    ui_controller: UIController,
    session_manager: SessionManager
  ) {
    this.editor_manager = editor_manager;
    this.file_manager = file_manager;
    this.tab_manager = tab_manager;
    this.explorer_manager = explorer_manager;
    this.ui_controller = ui_controller;
    this.session_manager = session_manager;
  }

  /**
   * 新規ファイルを作成
   */
  public handleNewFile(): void {
    console.log("New file");
    this.ui_controller.logToConsole("Creating new file...");

    // ウェルカム画面を非表示にしてエディタを表示
    this.ui_controller.hideWelcomeScreen();

    // 新しいタブを作成
    this.tab_manager.createTab("Untitled", "Untitled", "", "plaintext");

    // エディタをクリア
    this.editor_manager.clear();
    this.editor_manager.setLanguage("plaintext");

    // FileManagerの状態を更新
    this.file_manager.setCurrentFile(null, "", false);

    this.ui_controller.logToConsole("New file created");
    this.ui_controller.updateStatusBar();
  }

  /**
   * ファイルを開く
   */
  public async handleOpenFile(): Promise<void> {
    console.log("Open file");
    this.ui_controller.logToConsole("Opening file...");

    const result = await this.file_manager.openFile();
    if (result.success && result.content && result.path) {
      // 既存のタブをチェック
      const existing_tab = this.tab_manager.findTabByFilePath(result.path);
      if (existing_tab) {
        // 既に開いているタブをアクティブ化
        this.tab_manager.activateTab(existing_tab.id);
        return;
      }

      // ウェルカム画面を非表示にしてエディタを表示
      this.ui_controller.hideWelcomeScreen();

      // 言語を検出
      const language = this.editor_manager.detectLanguageFromPath(result.path);

      // 新しいタブを作成
      this.tab_manager.createTab(
        this.getFileNameFromPath(result.path),
        result.path,
        result.content,
        language
      );

      // エディタに内容を表示
      this.editor_manager.setValue(result.content);
      this.editor_manager.setLanguage(language);

      // FileManagerの状態を更新
      this.file_manager.setCurrentFile(result.path, result.content, false);

      this.ui_controller.logToConsole(`File opened: ${result.path}`);
      this.ui_controller.updateStatusBar();

      // セッションを保存
      await this.session_manager.saveSession();
    } else if (result.error) {
      this.ui_controller.logToConsole(`Error: ${result.error}`);
    }
  }

  /**
   * フォルダを開く
   */
  public async handleOpenFolder(): Promise<void> {
    console.log("Open folder");
    this.ui_controller.logToConsole("Opening folder...");

    const result = await this.file_manager.openFolder();
    if (result.success && result.path) {
      await this.explorer_manager.openFolder(result.path);
      this.ui_controller.logToConsole(`Folder opened: ${result.path}`);

      // ツリーが表示されたらemptyメッセージを非表示
      const tree_empty = document.querySelector(".tree-empty") as HTMLElement;
      if (tree_empty) {
        tree_empty.style.display = "none";
      }

      // セッションを保存
      await this.session_manager.saveSession();
    } else if (result.error) {
      this.ui_controller.logToConsole(`Error: ${result.error}`);
    }
  }

  /**
   * ファイルを保存
   */
  public async handleSaveFile(): Promise<void> {
    console.log("Save file");
    this.ui_controller.logToConsole("Saving file...");

    const content = this.editor_manager.getValue();
    const result = await this.file_manager.saveFile(content);

    if (result.success && result.path) {
      // タブの変更フラグをクリア
      const active_tab = this.tab_manager.getActiveTab();
      if (active_tab) {
        this.tab_manager.setTabModified(active_tab.id, false);

        // ファイル名とパスを更新（名前を付けて保存の場合）
        if (active_tab.file_path === "Untitled" && result.path) {
          const language = this.editor_manager.detectLanguageFromPath(
            result.path
          );
          this.tab_manager.updateTab(active_tab.id, {
            label: this.getFileNameFromPath(result.path),
            file_path: result.path,
            language: language,
          });
          this.editor_manager.setLanguage(language);
        }
      }

      this.ui_controller.logToConsole(`File saved: ${result.path}`);
      this.ui_controller.updateStatusBar();

      // セッションを保存
      await this.session_manager.saveSession();
    } else if (result.error) {
      this.ui_controller.logToConsole(`Error: ${result.error}`);
    }
  }

  /**
   * 名前を付けて保存
   */
  public async handleSaveFileAs(): Promise<void> {
    console.log("Save file as");
    this.ui_controller.logToConsole("Saving file as...");

    const content = this.editor_manager.getValue();
    const result = await this.file_manager.saveFileAs(content);

    if (result.success && result.path) {
      // タブの変更フラグをクリア
      const active_tab = this.tab_manager.getActiveTab();
      if (active_tab) {
        this.tab_manager.setTabModified(active_tab.id, false);

        // ファイル名とパスを更新
        const language = this.editor_manager.detectLanguageFromPath(
          result.path
        );
        this.tab_manager.updateTab(active_tab.id, {
          label: this.getFileNameFromPath(result.path),
          file_path: result.path,
          language: language,
        });
        this.editor_manager.setLanguage(language);
      }

      this.ui_controller.logToConsole(`File saved as: ${result.path}`);
      this.ui_controller.updateStatusBar();

      // セッションを保存
      await this.session_manager.saveSession();
    } else if (result.error) {
      this.ui_controller.logToConsole(`Error: ${result.error}`);
    }
  }

  /**
   * ファイルを開く（エクスプローラーから）
   */
  public async handleFileOpen(
    file_path: string,
    file_name: string
  ): Promise<void> {
    console.log(`Opening file from explorer: ${file_path}`);

    // 既存のタブをチェック
    const existing_tab = this.tab_manager.findTabByFilePath(file_path);
    if (existing_tab) {
      // 既に開いているタブをアクティブ化
      this.tab_manager.activateTab(existing_tab.id);
      return;
    }

    // ファイルを読み込み
    if (window.electronAPI) {
      const result = await window.electronAPI.readFile(file_path);
      if (result.success && result.content) {
        // ウェルカム画面を非表示
        this.ui_controller.hideWelcomeScreen();

        // 言語を検出
        const language = this.editor_manager.detectLanguageFromPath(file_path);

        // 新しいタブを作成
        this.tab_manager.createTab(
          file_name,
          file_path,
          result.content,
          language
        );

        // エディタに内容を表示
        this.editor_manager.setValue(result.content);
        this.editor_manager.setLanguage(language);

        // FileManagerの状態を更新
        this.file_manager.setCurrentFile(file_path, result.content, false);

        this.ui_controller.logToConsole(`File opened: ${file_path}`);
        this.ui_controller.updateStatusBar();

        // セッションを保存
        await this.session_manager.saveSession();
      } else if (result.error) {
        this.ui_controller.logToConsole(`Error: ${result.error}`);
      }
    }
  }

  /**
   * ツリーを更新
   */
  public async handleRefreshTree(): Promise<void> {
    console.log("Refresh tree");
    await this.explorer_manager.refreshTree();
    this.ui_controller.logToConsole("File tree refreshed");
  }

  /**
   * ファイルパスからファイル名を取得
   */
  private getFileNameFromPath(path: string): string {
    return path.split(/[/\\]/).pop() || "Untitled";
  }

  /**
   * ビルド
   */
  public handleBuild(): void {
    console.log("Build");
    this.ui_controller.logToConsole("Building project...");
  }

  /**
   * 実行
   */
  public handleRun(): void {
    console.log("Run");
    this.ui_controller.logToConsole("Running project...");
  }

  /**
   * 設定
   */
  public handleSettings(): void {
    console.log("Settings");
    this.ui_controller.logToConsole("Opening settings...");
  }
}
