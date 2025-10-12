import { FileManager } from "./utils/FileManager";
import { ExplorerManager } from "./utils/ExplorerManager";
import { EditorManager } from "./editors/EditorManager";
import { TabManager } from "./utils/TabManager";

/**
 * レンダラープロセス
 * UIのインタラクションとイベント処理を管理
 */

/**
 * UIマネージャークラス
 */
class UIManager {
  private active_sidebar_panel: string = "explorer";
  private debug_area_expanded: boolean = false;
  private file_manager: FileManager;
  private explorer_manager: ExplorerManager;
  private editor_manager: EditorManager;
  private tab_manager: TabManager;
  private editor_initialized: boolean = false;

  constructor() {
    this.file_manager = new FileManager();
    this.explorer_manager = new ExplorerManager();
    this.editor_manager = new EditorManager();
    this.tab_manager = new TabManager();
    this.initializeUI();
    this.setupEventListeners();
    this.setupElectronListeners();
    this.setupCustomEventListeners();
  }

  /**
   * エディタを初期化（遅延初期化）
   */
  private ensureEditorInitialized(): void {
    if (this.editor_initialized) return;

    console.log("Initializing editor for the first time...");
    this.editor_manager.initialize("editor-container");
    this.editor_initialized = true;
  }

  /**
   * UIを初期化
   */
  private initializeUI(): void {
    console.log("InkEditor initialized");
    this.updateStatusBar();
  }

  /**
   * イベントリスナーを設定
   */
  private setupEventListeners(): void {
    // ツールバーボタン
    this.addClickListener("btn-new", () => this.handleNewFile());
    this.addClickListener("btn-open", () => this.handleOpenFile());
    this.addClickListener("btn-open-folder", () => this.handleOpenFolder());
    this.addClickListener("btn-save", () => this.handleSaveFile());
    this.addClickListener("btn-build", () => this.handleBuild());
    this.addClickListener("btn-run", () => this.handleRun());
    this.addClickListener("btn-settings", () => this.handleSettings());

    // エクスプローラーのボタン
    this.addClickListener("btn-open-folder-explorer", () =>
      this.handleOpenFolder()
    );
    this.addClickListener("btn-refresh-tree", () => this.handleRefreshTree());

    // ウェルカム画面ボタン
    this.addClickListener("welcome-new", () => this.handleNewFile());
    this.addClickListener("welcome-open", () => this.handleOpenFolder());

    // サイドバータブ
    const sidebar_tabs = document.querySelectorAll(".sidebar-tab");
    sidebar_tabs.forEach((tab) => {
      tab.addEventListener("click", (e) => {
        const target = e.currentTarget as HTMLElement;
        const panel = target.dataset.panel;
        if (panel) {
          this.switchSidebarPanel(panel);
        }
      });
    });

    // デバッグエリアトグル
    this.addClickListener("debug-toggle", () => this.toggleDebugArea());

    // デバッグタブ
    const debug_tabs = document.querySelectorAll(".debug-tab");
    debug_tabs.forEach((tab) => {
      tab.addEventListener("click", (e) => {
        const target = e.currentTarget as HTMLElement;
        const panel = target.dataset.panel;
        if (panel) {
          this.switchDebugPanel(panel);
        }
      });
    });

    // タブクローズボタン
    document.addEventListener("click", (e) => {
      const target = e.target as HTMLElement;
      if (target.closest(".tab-close")) {
        this.handleCloseTab();
      }
    });
  }

  /**
   * Electronからのイベントリスナーを設定
   */
  private setupElectronListeners(): void {
    if (window.electronAPI) {
      window.electronAPI.onMenuNewFile(() => this.handleNewFile());
      window.electronAPI.onMenuOpenFile(() => this.handleOpenFile());
      window.electronAPI.onMenuOpenFolder(() => this.handleOpenFolder());
      window.electronAPI.onMenuSaveFile(() => this.handleSaveFile());
      window.electronAPI.onMenuSaveFileAs(() => this.handleSaveFileAs());
    }
  }

  /**
   * カスタムイベントリスナーを設定
   */
  private setupCustomEventListeners(): void {
    // ファイルエクスプローラーからファイルが開かれたとき
    window.addEventListener("file-open", ((e: CustomEvent) => {
      this.handleFileOpen(e.detail.path, e.detail.name);
    }) as EventListener);

    // エディタの内容が変更されたとき
    window.addEventListener("editor-content-changed", ((e: CustomEvent) => {
      const active_tab = this.tab_manager.getActiveTab();
      if (active_tab) {
        this.tab_manager.setTabModified(active_tab.id, true);
      }
      this.file_manager.markAsModified();
      this.updateStatusBar();
    }) as EventListener);

    // タブが変更されたとき
    window.addEventListener("tab-changed", ((e: CustomEvent) => {
      this.handleTabChange(e.detail);
    }) as EventListener);

    // すべてのタブが閉じられたとき
    window.addEventListener("all-tabs-closed", (() => {
      this.showWelcomeScreen();
    }) as EventListener);
  }

  /**
   * クリックイベントリスナーを追加
   */
  private addClickListener(id: string, handler: () => void): void {
    const element = document.getElementById(id);
    if (element) {
      element.addEventListener("click", handler);
    }
  }

  /**
   * サイドバーパネルを切り替え
   */
  private switchSidebarPanel(panel: string): void {
    // タブの切り替え
    const tabs = document.querySelectorAll(".sidebar-tab");
    tabs.forEach((tab) => {
      const tabElement = tab as HTMLElement;
      if (tabElement.dataset.panel === panel) {
        tabElement.classList.add("active");
      } else {
        tabElement.classList.remove("active");
      }
    });

    // パネルの切り替え
    const panels = document.querySelectorAll(".sidebar-panel");
    panels.forEach((panelElement) => {
      const panelDiv = panelElement as HTMLElement;
      if (panelDiv.id === `${panel}-panel`) {
        panelDiv.classList.add("active");
      } else {
        panelDiv.classList.remove("active");
      }
    });

    this.active_sidebar_panel = panel;
  }

  /**
   * デバッグパネルを切り替え
   */
  private switchDebugPanel(panel: string): void {
    // タブの切り替え
    const tabs = document.querySelectorAll(".debug-tab");
    tabs.forEach((tab) => {
      const tabElement = tab as HTMLElement;
      if (tabElement.dataset.panel === panel) {
        tabElement.classList.add("active");
      } else {
        tabElement.classList.remove("active");
      }
    });

    // パネルの切り替え
    const panels = document.querySelectorAll(".debug-panel");
    panels.forEach((panelElement) => {
      const panelDiv = panelElement as HTMLElement;
      if (panelDiv.id === `${panel}-panel`) {
        panelDiv.classList.add("active");
      } else {
        panelDiv.classList.remove("active");
      }
    });
  }

  /**
   * デバッグエリアの表示/非表示を切り替え
   */
  private toggleDebugArea(): void {
    const debug_area = document.getElementById("debug-area");
    const toggle_button = document.getElementById("debug-toggle");
    const icon = toggle_button?.querySelector(".material-icons");

    if (debug_area) {
      this.debug_area_expanded = !this.debug_area_expanded;

      if (this.debug_area_expanded) {
        debug_area.classList.remove("collapsed");
        if (icon) icon.textContent = "keyboard_arrow_down";
      } else {
        debug_area.classList.add("collapsed");
        if (icon) icon.textContent = "keyboard_arrow_up";
      }
    }
  }

  /**
   * ウェルカム画面を非表示にする
   */
  private hideWelcomeScreen(): void {
    const welcome = document.getElementById("welcome-screen");
    const editor = document.getElementById("editor-area");

    // エディタを初期化（初回のみ）
    this.ensureEditorInitialized();

    if (welcome) welcome.style.display = "none";
    if (editor) {
      editor.style.display = "flex";
      // エディタエリアが表示されたら、Monaco Editorのレイアウトを更新
      setTimeout(() => {
        this.editor_manager.layout();
      }, 100);
    }
  }

  /**
   * ウェルカム画面を表示する
   */
  private showWelcomeScreen(): void {
    const welcome = document.getElementById("welcome-screen");
    const editor = document.getElementById("editor-area");
    if (welcome) welcome.style.display = "flex";
    if (editor) editor.style.display = "none";
  }

  /**
   * ステータスバーを更新
   */
  private updateStatusBar(): void {
    const status_line = document.getElementById("status-line");
    const status_encoding = document.getElementById("status-encoding");
    const status_language = document.getElementById("status-language");

    if (status_line) status_line.textContent = "Ln 1, Col 1";
    if (status_encoding) status_encoding.textContent = "UTF-8";
    if (status_language) status_language.textContent = "Plain Text";
  }

  /**
   * 新規ファイル作成
   */
  private handleNewFile(): void {
    console.log("New file");

    // ウェルカム画面を非表示にしてエディタを表示（エディタも初期化）
    this.hideWelcomeScreen();

    // 新しいタブを作成
    const tab_id = this.tab_manager.createTab(
      "Untitled",
      null,
      "",
      "plaintext"
    );

    // エディタをクリア
    this.editor_manager.clear();
    this.editor_manager.setLanguage("plaintext");

    // FileManagerの状態を更新
    this.file_manager.setCurrentFile(null, "", false);

    this.logToConsole("New file created");
    this.updateStatusBar();
  }

  /**
   * ファイルを開く
   */
  private async handleOpenFile(): Promise<void> {
    console.log("Open file");
    this.logToConsole("Opening file...");

    const result = await this.file_manager.openFile();
    if (result.success && result.content && result.path) {
      // 既存のタブをチェック
      const existing_tab = this.tab_manager.findTabByFilePath(result.path);
      if (existing_tab) {
        // 既に開いているタブをアクティブ化
        this.tab_manager.activateTab(existing_tab.id);
        return;
      }

      // ウェルカム画面を非表示にしてエディタを表示（エディタも初期化）
      this.hideWelcomeScreen();

      // 言語を検出
      const language = this.editor_manager.detectLanguageFromPath(result.path);

      // 新しいタブを作成
      const tab_id = this.tab_manager.createTab(
        this.getFileNameFromPath(result.path),
        result.path,
        result.content,
        language
      );

      // エディタに内容を表示
      this.editor_manager.setValue(result.content);
      this.editor_manager.setLanguage(language);

      // FileManagerの状態を更新（既にopenFile()で更新済みだが念のため）
      this.file_manager.setCurrentFile(result.path, result.content, false);

      this.logToConsole(`File opened: ${result.path}`);
      this.updateStatusBar();
    } else if (result.error) {
      this.logToConsole(`Error: ${result.error}`);
    }
  }

  /**
   * フォルダを開く
   */
  private async handleOpenFolder(): Promise<void> {
    console.log("Open folder");
    this.logToConsole("Opening folder...");

    const result = await this.file_manager.openFolder();
    if (result.success && result.path) {
      await this.explorer_manager.openFolder(result.path);
      this.logToConsole(`Folder opened: ${result.path}`);

      // ツリーが表示されたらemptyメッセージを非表示
      const tree_empty = document.querySelector(".tree-empty") as HTMLElement;
      if (tree_empty) {
        tree_empty.style.display = "none";
      }
    } else if (result.error) {
      this.logToConsole(`Error: ${result.error}`);
    }
  }

  /**
   * ツリーを更新
   */
  private async handleRefreshTree(): Promise<void> {
    console.log("Refresh tree");
    await this.explorer_manager.refreshTree();
    this.logToConsole("Explorer refreshed");
  }

  /**
   * ファイルを保存
   */
  private async handleSaveFile(): Promise<void> {
    console.log("Save file");

    const active_tab = this.tab_manager.getActiveTab();
    if (!active_tab) {
      this.logToConsole("No active tab");
      return;
    }

    // エディタから内容を取得
    const content = this.editor_manager.getValue();

    const result = await this.file_manager.saveFile(content);
    if (result.success && result.path) {
      // タブの変更フラグをクリア
      this.tab_manager.setTabModified(active_tab.id, false);

      // ファイルパスを更新（新規保存の場合）
      if (result.path !== active_tab.file_path) {
        this.tab_manager.updateTabFilePath(active_tab.id, result.path);
      }

      // タブの内容を更新
      this.tab_manager.updateTabContent(active_tab.id, content);

      // FileManagerの状態を更新
      this.file_manager.setCurrentFile(result.path, content, false);

      this.logToConsole(`File saved: ${result.path}`);
      this.updateStatusBar();
    } else if (result.error) {
      this.logToConsole(`Error: ${result.error}`);
    }
  }

  /**
   * 名前を付けて保存
   */
  private async handleSaveFileAs(): Promise<void> {
    console.log("Save file as");

    const active_tab = this.tab_manager.getActiveTab();
    if (!active_tab) {
      this.logToConsole("No active tab");
      return;
    }

    // エディタから内容を取得
    const content = this.editor_manager.getValue();

    const result = await this.file_manager.saveFileAs(content);
    if (result.success && result.path) {
      // タブの変更フラグをクリア
      this.tab_manager.setTabModified(active_tab.id, false);

      // ファイルパスを更新
      this.tab_manager.updateTabFilePath(active_tab.id, result.path);

      // タブの内容を更新
      this.tab_manager.updateTabContent(active_tab.id, content);

      // FileManagerの状態を更新
      this.file_manager.setCurrentFile(result.path, content, false);

      this.logToConsole(`File saved: ${result.path}`);
      this.updateStatusBar();
    } else if (result.error) {
      this.logToConsole(`Error: ${result.error}`);
    }
  }

  /**
   * エクスプローラーからファイルを開く
   */
  private async handleFileOpen(
    file_path: string,
    file_name: string
  ): Promise<void> {
    this.logToConsole(`Opening: ${file_name}`);

    if (!window.electronAPI) return;

    const result = await window.electronAPI.readFile(file_path);
    if (result.success && result.content) {
      // 既存のタブをチェック
      const existing_tab = this.tab_manager.findTabByFilePath(file_path);
      if (existing_tab) {
        this.tab_manager.activateTab(existing_tab.id);
        return;
      }

      // ウェルカム画面を非表示にしてエディタを表示（エディタも初期化）
      this.hideWelcomeScreen();

      // 言語を検出
      const language = this.editor_manager.detectLanguageFromPath(file_path);

      // 新しいタブを作成
      const tab_id = this.tab_manager.createTab(
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

      this.logToConsole(`File opened: ${file_name}`);
    } else if (result.error) {
      this.logToConsole(`Error: ${result.error}`);
    }
  }

  /**
   * タブが変更されたときの処理
   */
  private handleTabChange(detail: any): void {
    console.log("Tab changed:", detail);

    // エディタの内容を更新
    this.editor_manager.setValue(detail.content);
    this.editor_manager.setLanguage(detail.language);

    // ファイルマネージャーの状態を更新
    this.file_manager.setCurrentFile(
      detail.file_path,
      detail.content,
      detail.is_modified
    );

    this.updateStatusBar();
  }

  /**
   * ファイルパスからファイル名を取得
   */
  private getFileNameFromPath(file_path: string): string {
    const parts = file_path.split(/[/\\]/);
    return parts[parts.length - 1] ?? "Untitled";
  }

  /**
   * ビルド実行
   */
  private handleBuild(): void {
    console.log("Build");
    this.logToConsole("Building project...");
  }

  /**
   * 実行
   */
  private handleRun(): void {
    console.log("Run");
    this.logToConsole("Running application...");
  }

  /**
   * 設定を開く
   */
  private handleSettings(): void {
    console.log("Settings");
    this.logToConsole("Opening settings...");
  }

  /**
   * タブを閉じる
   */
  private handleCloseTab(): void {
    console.log("Close tab");
    this.logToConsole("Tab closed");
  }

  /**
   * コンソールにログを出力
   */
  private logToConsole(message: string): void {
    const console_output = document.querySelector(".console-output");
    if (console_output) {
      const message_element = document.createElement("div");
      message_element.className = "console-message";
      message_element.textContent = `[${new Date().toLocaleTimeString()}] ${message}`;
      console_output.appendChild(message_element);

      // 自動スクロール
      console_output.scrollTop = console_output.scrollHeight;
    }
  }
}

// DOMが読み込まれたらUIマネージャーを初期化
document.addEventListener("DOMContentLoaded", () => {
  new UIManager();
});
