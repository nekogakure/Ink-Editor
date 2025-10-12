import { FileManager } from "./utils/FileManager";
import { ExplorerManager } from "./utils/ExplorerManager";
import { EditorManager } from "./editors/EditorManager";
import { TabManager } from "./utils/TabManager";
import { SearchManager } from "./utils/SearchManager";
import { SessionManager } from "./utils/SessionManager";
import { UIController } from "./ui/UIController";
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
  private ui_controller: UIController;
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
    
    // セッションマネージャーを初期化
    this.session_manager = new SessionManager(
      this.editor_manager,
      this.explorer_manager,
      this.tab_manager
    );
    
    // UIコントローラーを初期化
    this.ui_controller = new UIController();
    
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
   * エディタを初期化（遅延初期化）
   */
  private ensureEditorInitialized(): void {
    if (this.editor_initialized) return;

    console.log("Initializing editor for the first time...");
    this.editor_manager.initialize("editor-container");
    this.editor_initialized = true;
  }
}

// DOMが読み込まれたらUIマネージャーを初期化
document.addEventListener("DOMContentLoaded", () => {
  new UIManager();
});
