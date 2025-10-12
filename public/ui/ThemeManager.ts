import { EditorManager } from "../editors/EditorManager";

/**
 * テーマ管理クラス
 * ライト/ダークテーマの切り替えを管理
 */
export class ThemeManager {
  private current_theme: "light" | "dark" = "light";
  private editor_manager: EditorManager | null = null;

  constructor(editor_manager?: EditorManager) {
    this.editor_manager = editor_manager || null;
  }

  /**
   * エディタマネージャーを設定
   */
  public setEditorManager(editor_manager: EditorManager): void {
    this.editor_manager = editor_manager;
  }

  /**
   * テーマを適用
   */
  public applyTheme(theme: "light" | "dark"): void {
    this.current_theme = theme;
    const root = document.documentElement;

    if (theme === "dark") {
      // ダークテーマのCSS変数を設定
      root.style.setProperty("--color-bg-primary", "#1e1e1e");
      root.style.setProperty("--color-bg-secondary", "#252526");
      root.style.setProperty("--color-bg-tertiary", "#2d2d30");
      root.style.setProperty("--color-bg-hover", "#2a2d2e");
      root.style.setProperty("--color-bg-active", "#37373d");
      root.style.setProperty("--color-border", "#3e3e42");
      root.style.setProperty("--color-text-primary", "#cccccc");
      root.style.setProperty("--color-text-secondary", "#9d9d9d");
      root.style.setProperty("--color-text-tertiary", "#6d6d6d");
      root.style.setProperty("--color-shadow", "rgba(0, 0, 0, 0.3)");
      root.style.setProperty("--color-shadow-strong", "rgba(0, 0, 0, 0.5)");

      // Monaco Editorのテーマを変更
      if (this.editor_manager) {
        this.editor_manager.setTheme("vs-dark");
      }

      // bodyにdarkクラスを追加
      document.body.classList.add("dark-theme");
      document.body.classList.remove("light-theme");
    } else {
      // ライトテーマのCSS変数を設定
      root.style.setProperty("--color-bg-primary", "#ffffff");
      root.style.setProperty("--color-bg-secondary", "#f5f5f5");
      root.style.setProperty("--color-bg-tertiary", "#e8e8e8");
      root.style.setProperty("--color-bg-hover", "#f0f0f0");
      root.style.setProperty("--color-bg-active", "#e0e0e0");
      root.style.setProperty("--color-border", "#d0d0d0");
      root.style.setProperty("--color-text-primary", "#1a1a1a");
      root.style.setProperty("--color-text-secondary", "#666666");
      root.style.setProperty("--color-text-tertiary", "#999999");
      root.style.setProperty("--color-shadow", "rgba(0, 0, 0, 0.1)");
      root.style.setProperty("--color-shadow-strong", "rgba(0, 0, 0, 0.2)");

      // Monaco Editorのテーマを変更
      if (this.editor_manager) {
        this.editor_manager.setTheme("vs");
      }

      // bodyにlightクラスを追加
      document.body.classList.add("light-theme");
      document.body.classList.remove("dark-theme");
    }

    console.log(`Theme applied: ${theme}`);
  }

  /**
   * テーマを切り替え
   */
  public toggleTheme(): void {
    const newTheme = this.current_theme === "light" ? "dark" : "light";
    this.applyTheme(newTheme);
  }

  /**
   * 現在のテーマを取得
   */
  public getCurrentTheme(): "light" | "dark" {
    return this.current_theme;
  }
}
