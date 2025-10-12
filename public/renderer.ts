import { FileManager } from "./utils/FileManager";
import { ExplorerManager } from "./utils/ExplorerManager";
import { EditorManager } from "./editors/EditorManager";
import { TabManager } from "./utils/TabManager";
import { SearchManager } from "./utils/SearchManager";
import { SessionManager } from "./utils/SessionManager";
import { SettingsManager } from "./utils/SettingsManager";
import { UIController } from "./ui/UIController";
import { ThemeManager } from "./ui/ThemeManager";
import { SettingsDialogController } from "./ui/SettingsDialogController";
import { FileHandlers } from "./handlers/FileHandlers";
import { SearchHandlers } from "./handlers/SearchHandlers";
import { EventHandlers } from "./handlers/EventHandlers";

/**
 * レンダラープロセス
 * UIのインタラクションとイベント処理を管理
 */

/**
 * UIマネージャークラス
 * すべてのマネージャーとハンドラーを統合
 */
class UIManager {
  private file_manager: FileManager;
  private explorer_manager: ExplorerManager;
  private editor_manager: EditorManager;
  private tab_manager: TabManager;
  private search_manager: SearchManager;
  private session_manager: SessionManager;
  private settings_manager: SettingsManager;
  private ui_controller: UIController;
  private theme_manager: ThemeManager;
  private settings_dialog: SettingsDialogController;
  private file_handlers: FileHandlers;
  private search_handlers: SearchHandlers;
  private event_handlers: EventHandlers;
  private editor_initialized: boolean = false;

  constructor() {
    // 基本的なマネージャーを初期化
    this.file_manager = new FileManager();
    this.explorer_manager = new ExplorerManager();
    this.editor_manager = new EditorManager();
    this.tab_manager = new TabManager();
    this.search_manager = new SearchManager();
    this.settings_manager = new SettingsManager();

    // セッションマネージャーを初期化
    this.session_manager = new SessionManager(
      this.editor_manager,
      this.explorer_manager,
      this.tab_manager
    );

    // UIコントローラーを初期化
    this.ui_controller = new UIController();

    // テーママネージャーを初期化
    this.theme_manager = new ThemeManager(this.editor_manager);

    // 設定ダイアログを初期化
    this.settings_dialog = new SettingsDialogController(
      this.settings_manager,
      this.theme_manager,
      this.editor_manager
    );

    // ハンドラーを初期化
    this.file_handlers = new FileHandlers(
      this.editor_manager,
      this.file_manager,
      this.tab_manager,
      this.explorer_manager,
      this.ui_controller,
      this.session_manager
    );

    this.search_handlers = new SearchHandlers(
      this.editor_manager,
      this.file_manager,
      this.tab_manager,
      this.explorer_manager,
      this.ui_controller
    );

    this.event_handlers = new EventHandlers(
      this.editor_manager,
      this.file_manager,
      this.tab_manager,
      this.explorer_manager,
      this.search_manager,
      this.ui_controller,
      this.file_handlers,
      this.search_handlers
    );

    // 初期化
    this.initializeUI();
  }

  /**
   * UIを初期化
   */
  private async initializeUI(): Promise<void> {
    console.log("InkEditor initialized");
    this.ui_controller.updateStatusBar();

    // イベントリスナーを設定
    this.event_handlers.setupAllListeners();

    // 設定ボタンのイベントリスナーを追加
    this.setupSettingsButton();

    // 保存された設定を適用
    const settings = this.settings_manager.getSettings();
    this.theme_manager.applyTheme(settings.theme);

    // セッション状態を復元
    const restored = await this.session_manager.restoreSession();

    if (restored) {
      // セッションが復元された場合、エディタを初期化
      this.ensureEditorInitialized();
    } else {
      // セッションがない場合はウェルカム画面を表示
      this.ui_controller.showWelcomeScreen();
    }
  }

  /**
   * 設定ボタンのイベントリスナーを設定
   */
  private setupSettingsButton(): void {
    const settings_button = document.getElementById("btn-settings");
    if (settings_button) {
      settings_button.addEventListener("click", () => {
        this.settings_dialog.show();
      });
    }
  }

  /**
   * エディタを初期化（遅延初期化）
   */
  private ensureEditorInitialized(): void {
    if (this.editor_initialized) return;

    console.log("Initializing editor for the first time...");
    this.editor_manager.initialize("editor-container");

    // エディタ初期化後にテーママネージャーにエディタを設定
    this.theme_manager.setEditorManager(this.editor_manager);

    // 保存された設定を適用
    const settings = this.settings_manager.getSettings();
    this.editor_manager.updateOptions({
      fontSize: settings.fontSize,
      tabSize: settings.tabSize,
      wordWrap: settings.wordWrap,
      minimap: { enabled: settings.minimap },
    });

    this.editor_initialized = true;
  }
}

// DOMが読み込まれたらUIマネージャーを初期化
document.addEventListener("DOMContentLoaded", () => {
  new UIManager();
});
