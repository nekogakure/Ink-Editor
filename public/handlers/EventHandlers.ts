import { EditorManager } from "../editors/EditorManager";
import { FileManager } from "../utils/FileManager";
import { TabManager } from "../utils/TabManager";
import { ExplorerManager } from "../utils/ExplorerManager";
import { SearchManager } from "../utils/SearchManager";
import { UIController } from "../ui/UIController";
import { FileHandlers } from "./FileHandlers";
import { SearchHandlers } from "./SearchHandlers";

/**
 * イベントハンドラー統合クラス
 * すべてのイベントリスナーを設定
 */
export class EventHandlers {
  private editor_manager: EditorManager;
  private file_manager: FileManager;
  private tab_manager: TabManager;
  private explorer_manager: ExplorerManager;
  private search_manager: SearchManager;
  private ui_controller: UIController;
  private file_handlers: FileHandlers;
  private search_handlers: SearchHandlers;

  constructor(
    editor_manager: EditorManager,
    file_manager: FileManager,
    tab_manager: TabManager,
    explorer_manager: ExplorerManager,
    search_manager: SearchManager,
    ui_controller: UIController,
    file_handlers: FileHandlers,
    search_handlers: SearchHandlers
  ) {
    this.editor_manager = editor_manager;
    this.file_manager = file_manager;
    this.tab_manager = tab_manager;
    this.explorer_manager = explorer_manager;
    this.search_manager = search_manager;
    this.ui_controller = ui_controller;
    this.file_handlers = file_handlers;
    this.search_handlers = search_handlers;
  }

  /**
   * すべてのイベントリスナーを設定
   */
  public setupAllListeners(): void {
    this.setupToolbarListeners();
    this.setupSidebarListeners();
    this.setupDebugListeners();
    this.setupSearchListeners();
    this.setupElectronListeners();
    this.setupCustomEventListeners();
  }

  /**
   * ツールバーのイベントリスナーを設定
   */
  private setupToolbarListeners(): void {
    this.addClickListener("btn-new", () => this.file_handlers.handleNewFile());
    this.addClickListener("btn-open", () =>
      this.file_handlers.handleOpenFile()
    );
    this.addClickListener("btn-open-folder", () =>
      this.file_handlers.handleOpenFolder()
    );
    this.addClickListener("btn-save", () =>
      this.file_handlers.handleSaveFile()
    );
    this.addClickListener("btn-build", () => this.file_handlers.handleBuild());
    this.addClickListener("btn-run", () => this.file_handlers.handleRun());
    this.addClickListener("btn-settings", () =>
      this.file_handlers.handleSettings()
    );

    // エクスプローラーのボタン
    this.addClickListener("btn-open-folder-explorer", () =>
      this.file_handlers.handleOpenFolder()
    );
    this.addClickListener("btn-refresh-tree", () =>
      this.file_handlers.handleRefreshTree()
    );

    // ウェルカム画面ボタン
    this.addClickListener("welcome-new", () =>
      this.file_handlers.handleNewFile()
    );
    this.addClickListener("welcome-open", () =>
      this.file_handlers.handleOpenFolder()
    );
  }

  /**
   * サイドバーのイベントリスナーを設定
   */
  private setupSidebarListeners(): void {
    const sidebar_tabs = document.querySelectorAll(".sidebar-tab");
    sidebar_tabs.forEach((tab) => {
      tab.addEventListener("click", (e) => {
        const target = e.currentTarget as HTMLElement;
        const panel = target.dataset.panel;
        if (panel) {
          this.ui_controller.switchSidebarPanel(panel);
        }
      });
    });
  }

  /**
   * デバッグエリアのイベントリスナーを設定
   */
  private setupDebugListeners(): void {
    this.addClickListener("debug-toggle", () =>
      this.ui_controller.toggleDebugArea()
    );

    const debug_tabs = document.querySelectorAll(".debug-tab");
    debug_tabs.forEach((tab) => {
      tab.addEventListener("click", (e) => {
        const target = e.currentTarget as HTMLElement;
        const panel = target.dataset.panel;
        if (panel) {
          this.ui_controller.switchDebugPanel(panel);
        }
      });
    });
  }

  /**
   * 検索のイベントリスナーを設定
   */
  private setupSearchListeners(): void {
    const search_input = document.querySelector(
      ".search-input"
    ) as HTMLInputElement;
    const search_mode_radios = document.querySelectorAll(
      'input[name="search-mode"]'
    );

    if (search_input) {
      search_input.addEventListener("input", () => {
        const query = search_input.value;
        const mode = this.search_manager.getSearchMode();
        this.search_manager.performSearch(query, mode);
      });
    }

    search_mode_radios.forEach((radio) => {
      radio.addEventListener("change", (e) => {
        const target = e.target as HTMLInputElement;
        const mode = target.value as "current" | "all";
        this.search_manager.setSearchMode(mode);

        if (search_input && search_input.value.trim()) {
          this.search_manager.performSearch(search_input.value, mode);
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
      window.electronAPI.onMenuNewFile(() =>
        this.file_handlers.handleNewFile()
      );
      window.electronAPI.onMenuOpenFile(() =>
        this.file_handlers.handleOpenFile()
      );
      window.electronAPI.onMenuOpenFolder(() =>
        this.file_handlers.handleOpenFolder()
      );
      window.electronAPI.onMenuSaveFile(() =>
        this.file_handlers.handleSaveFile()
      );
      window.electronAPI.onMenuSaveFileAs(() =>
        this.file_handlers.handleSaveFileAs()
      );
    }
  }

  /**
   * カスタムイベントリスナーを設定
   */
  private setupCustomEventListeners(): void {
    // ファイルエクスプローラーからファイルが開かれたとき
    window.addEventListener("file-open", ((e: CustomEvent) => {
      this.file_handlers.handleFileOpen(e.detail.path, e.detail.name);
    }) as EventListener);

    // エディタの内容が変更されたとき
    window.addEventListener("editor-content-changed", ((e: CustomEvent) => {
      const active_tab = this.tab_manager.getActiveTab();
      if (active_tab) {
        this.tab_manager.setTabModified(active_tab.id, true);
      }
      this.file_manager.markAsModified();
      this.ui_controller.updateStatusBar();
    }) as EventListener);

    // タブが変更されたとき
    window.addEventListener("tab-changed", ((e: CustomEvent) => {
      this.handleTabChange(e.detail);
    }) as EventListener);

    // すべてのタブが閉じられたとき
    window.addEventListener("all-tabs-closed", (() => {
      this.ui_controller.showWelcomeScreen();
    }) as EventListener);

    // 現在のファイル内を検索
    window.addEventListener("search-in-current", ((e: CustomEvent) => {
      this.search_handlers.handleSearchInCurrent(e.detail.query);
    }) as EventListener);

    // すべてのファイルを検索
    window.addEventListener("search-in-all", ((e: CustomEvent) => {
      this.search_handlers.handleSearchInAll(e.detail.query);
    }) as EventListener);

    // 検索結果にジャンプ
    window.addEventListener("jump-to-search-result", ((e: CustomEvent) => {
      this.search_handlers.handleJumpToSearchResult(e.detail);
    }) as EventListener);
  }

  /**
   * クリックリスナーを追加（ヘルパー）
   */
  private addClickListener(id: string, handler: () => void): void {
    const element = document.getElementById(id);
    if (element) {
      element.addEventListener("click", handler);
    } else {
      console.warn(`Element with id "${id}" not found`);
    }
  }

  /**
   * タブ変更時の処理
   */
  private handleTabChange(tab: any): void {
    console.log("Tab changed:", tab);

    // エディタの内容を更新
    this.editor_manager.setValue(tab.content);
    this.editor_manager.setLanguage(tab.language);

    // FileManagerの状態を更新
    this.file_manager.setCurrentFile(tab.file_path, tab.content, false);

    this.ui_controller.updateStatusBar();
  }

  /**
   * タブを閉じる
   */
  private handleCloseTab(): void {
    console.log("Close tab");
    this.ui_controller.logToConsole("Tab closed");
  }
}
