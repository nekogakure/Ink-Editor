export {}

/**
 * レンダラープロセス
 * UIのインタラクションとイベント処理を管理
 */

declare global {
  interface Window {
    electronAPI?: {
      getAppPath: () => Promise<string>;
      getVersion: () => Promise<string>;
      onMenuNewFile: (callback: () => void) => void;
      onMenuOpenFile: (callback: () => void) => void;
      onMenuSaveFile: (callback: () => void) => void;
    };
  }
}

/**
 * UIマネージャークラス
 */
class UIManager {
  private active_sidebar_panel: string = "explorer";
  private debug_area_expanded: boolean = false;

  constructor() {
    this.initializeUI();
    this.setupEventListeners();
    this.setupElectronListeners();
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
    this.addClickListener("btn-save", () => this.handleSaveFile());
    this.addClickListener("btn-build", () => this.handleBuild());
    this.addClickListener("btn-run", () => this.handleRun());
    this.addClickListener("btn-settings", () => this.handleSettings());

    // ウェルカム画面ボタン
    this.addClickListener("welcome-new", () => this.handleNewFile());
    this.addClickListener("welcome-open", () => this.handleOpenFile());

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
      window.electronAPI.onMenuSaveFile(() => this.handleSaveFile());
    }
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
    this.logToConsole("New file created");
  }

  /**
   * ファイルを開く
   */
  private handleOpenFile(): void {
    console.log("Open file");
    this.logToConsole("Opening file...");
  }

  /**
   * ファイルを保存
   */
  private handleSaveFile(): void {
    console.log("Save file");
    this.logToConsole("File saved");
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
