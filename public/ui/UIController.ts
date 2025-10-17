/**
 * UIコントローラークラス
 * サイドバー、デバッグエリア、ウェルカム画面などのUI状態を管理
 */
export class UIController {
  private active_sidebar_panel: string = "explorer";
  private debug_area_expanded: boolean = false;

  /**
   * サイドバーパネルを切り替え
   */
  public switchSidebarPanel(panel: string): void {
    // すべてのサイドバータブを非アクティブ化
    const tabs = document.querySelectorAll(".sidebar-tab");
    tabs.forEach((tab) => tab.classList.remove("active"));

    // クリックされたタブをアクティブ化
    const active_tab = document.querySelector(
      `.sidebar-tab[data-panel="${panel}"]`
    );
    if (active_tab) {
      active_tab.classList.add("active");
    }

    // すべてのサイドバーパネルを非表示
    const panels = document.querySelectorAll(".sidebar-panel");
    panels.forEach((p) => p.classList.remove("active"));

    // 選択されたパネルを表示
    const active_panel = document.querySelector(
      `.sidebar-panel[data-panel="${panel}"]`
    );
    if (active_panel) {
      active_panel.classList.add("active");
    }

    this.active_sidebar_panel = panel;
  }

  /**
   * デバッグパネルを切り替え
   */
  public switchDebugPanel(panel: string): void {
    // すべてのデバッグタブを非アクティブ化
    const tabs = document.querySelectorAll(".debug-tab");
    tabs.forEach((tab) => tab.classList.remove("active"));

    // クリックされたタブをアクティブ化
    const active_tab = document.querySelector(
      `.debug-tab[data-panel="${panel}"]`
    );
    if (active_tab) {
      active_tab.classList.add("active");
    }

    // すべてのデバッグパネルを非表示
    const panels = document.querySelectorAll(".debug-panel");
    panels.forEach((p) => p.classList.remove("active"));

    // 選択されたパネルを表示
    const active_panel = document.querySelector(
      `.debug-panel[data-panel="${panel}"]`
    );
    if (active_panel) {
      active_panel.classList.add("active");
    }
  }

  /**
   * デバッグエリアをトグル
   */
  public toggleDebugArea(): void {
    const debug_area = document.getElementById("debug-area");
    const toggle_button = document.getElementById(
      "debug-toggle"
    ) as HTMLElement;
    const icon = toggle_button?.querySelector(".material-icons");

    if (debug_area) {
      this.debug_area_expanded = !this.debug_area_expanded;
      if (this.debug_area_expanded) {
        debug_area.classList.remove("collapsed");
        if (icon) icon.textContent = "expand_more";
      } else {
        debug_area.classList.add("collapsed");
        if (icon) icon.textContent = "expand_less";
      }
    }
  }

  /**
   * ウェルカム画面を非表示にしてエディタを表示
   */
  public hideWelcomeScreen(): void {
    const welcome = document.getElementById("welcome-screen") as HTMLElement;
    const editor_area = document.getElementById("editor-area") as HTMLElement;

    if (welcome) welcome.style.display = "none";
    if (editor_area) editor_area.style.display = "flex";
  }

  /**
   * エディタを非表示にしてウェルカム画面を表示
   */
  public showWelcomeScreen(): void {
    const welcome = document.getElementById("welcome-screen") as HTMLElement;
    const editor_area = document.getElementById("editor-area") as HTMLElement;

    if (welcome) welcome.style.display = "flex";
    if (editor_area) editor_area.style.display = "none";
  }

  /**
   * エディタエリアを表示（タブが既にある場合に使用）
   */
  public showEditor(): void {
    const welcome = document.getElementById("welcome-screen") as HTMLElement;
    const editor_area = document.getElementById("editor-area") as HTMLElement;

    if (welcome) welcome.style.display = "none";
    if (editor_area) editor_area.style.display = "flex";
  }

  /**
   * ステータスバーを更新
   */
  public updateStatusBar(info?: {
    line?: number;
    column?: number;
    language?: string;
  }): void {
    // カーソル位置を更新
    if (info?.line !== undefined && info?.column !== undefined) {
      const cursor_info = document.querySelector(
        "#status-bar .status-left .status-item:first-child"
      );
      if (cursor_info) {
        cursor_info.textContent = `Ln ${info.line}, Col ${info.column}`;
      }
    }

    // 言語を更新
    if (info?.language) {
      const language_info = document.querySelector(
        "#status-bar .status-right .status-item:first-child"
      );
      if (language_info) {
        language_info.textContent = info.language.toUpperCase();
      }
    }
  }

  /**
   * コンソールにログを出力
   */
  public logToConsole(message: string): void {
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
