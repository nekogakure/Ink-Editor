import { SettingsManager } from "../utils/SettingsManager";
import { ThemeManager } from "./ThemeManager";
import { EditorManager } from "../editors/EditorManager";

/**
 * 設定ダイアログコントローラー
 * 設定ダイアログの表示と操作を管理
 */
export class SettingsDialogController {
  private settings_manager: SettingsManager;
  private theme_manager: ThemeManager;
  private editor_manager: EditorManager;
  private dialog_element: HTMLElement | null = null;

  constructor(
    settings_manager: SettingsManager,
    theme_manager: ThemeManager,
    editor_manager: EditorManager
  ) {
    this.settings_manager = settings_manager;
    this.theme_manager = theme_manager;
    this.editor_manager = editor_manager;
    this.dialog_element = document.getElementById("settings-dialog");
    this.setupEventListeners();
  }

  /**
   * イベントリスナーを設定
   */
  private setupEventListeners(): void {
    // 閉じるボタン
    const close_button = document.getElementById("settings-close");
    if (close_button) {
      close_button.addEventListener("click", () => this.hide());
    }

    // オーバーレイクリックで閉じる
    if (this.dialog_element) {
      this.dialog_element.addEventListener("click", (e) => {
        if (e.target === this.dialog_element) {
          this.hide();
        }
      });
    }

    // 適用ボタン
    const apply_button = document.getElementById("settings-apply");
    if (apply_button) {
      apply_button.addEventListener("click", () => this.applySettings());
    }

    // リセットボタン
    const reset_button = document.getElementById("settings-reset");
    if (reset_button) {
      reset_button.addEventListener("click", () => this.resetSettings());
    }

    // 設定変更イベント
    window.addEventListener("setting-changed", ((e: CustomEvent) => {
      this.onSettingChanged(e.detail.key, e.detail.value);
    }) as EventListener);
  }

  /**
   * ダイアログを表示
   */
  public show(): void {
    if (!this.dialog_element) return;

    // 現在の設定を読み込んでフォームに反映
    this.loadSettingsToForm();

    // ダイアログを表示
    this.dialog_element.style.display = "flex";
  }

  /**
   * ダイアログを非表示
   */
  public hide(): void {
    if (!this.dialog_element) return;
    this.dialog_element.style.display = "none";
  }

  /**
   * 現在の設定をフォームに読み込み
   */
  private loadSettingsToForm(): void {
    const settings = this.settings_manager.getSettings();

    // テーマ
    const theme_select = document.getElementById(
      "setting-theme"
    ) as HTMLSelectElement;
    if (theme_select) {
      theme_select.value = settings.theme;
    }

    // フォントサイズ
    const font_size_input = document.getElementById(
      "setting-font-size"
    ) as HTMLInputElement;
    if (font_size_input) {
      font_size_input.value = settings.fontSize.toString();
    }

    // タブサイズ
    const tab_size_input = document.getElementById(
      "setting-tab-size"
    ) as HTMLInputElement;
    if (tab_size_input) {
      tab_size_input.value = settings.tabSize.toString();
    }

    // ワードラップ
    const word_wrap_select = document.getElementById(
      "setting-word-wrap"
    ) as HTMLSelectElement;
    if (word_wrap_select) {
      word_wrap_select.value = settings.wordWrap;
    }

    // ミニマップ
    const minimap_checkbox = document.getElementById(
      "setting-minimap"
    ) as HTMLInputElement;
    if (minimap_checkbox) {
      minimap_checkbox.checked = settings.minimap;
    }

    // 自動保存
    const auto_save_checkbox = document.getElementById(
      "setting-auto-save"
    ) as HTMLInputElement;
    if (auto_save_checkbox) {
      auto_save_checkbox.checked = settings.autoSave;
    }

    // 保存時にフォーマット
    const format_on_save_checkbox = document.getElementById(
      "setting-format-on-save"
    ) as HTMLInputElement;
    if (format_on_save_checkbox) {
      format_on_save_checkbox.checked = settings.formatOnSave;
    }
  }

  /**
   * 設定を適用
   */
  private applySettings(): void {
    // フォームから設定を取得
    const theme_select = document.getElementById(
      "setting-theme"
    ) as HTMLSelectElement;
    const font_size_input = document.getElementById(
      "setting-font-size"
    ) as HTMLInputElement;
    const tab_size_input = document.getElementById(
      "setting-tab-size"
    ) as HTMLInputElement;
    const word_wrap_select = document.getElementById(
      "setting-word-wrap"
    ) as HTMLSelectElement;
    const minimap_checkbox = document.getElementById(
      "setting-minimap"
    ) as HTMLInputElement;
    const auto_save_checkbox = document.getElementById(
      "setting-auto-save"
    ) as HTMLInputElement;
    const format_on_save_checkbox = document.getElementById(
      "setting-format-on-save"
    ) as HTMLInputElement;

    // 設定を更新
    this.settings_manager.updateSettings({
      theme: theme_select?.value as "light" | "dark",
      fontSize: parseInt(font_size_input?.value || "14"),
      tabSize: parseInt(tab_size_input?.value || "4"),
      wordWrap: word_wrap_select?.value as "on" | "off",
      minimap: minimap_checkbox?.checked || true,
      autoSave: auto_save_checkbox?.checked || false,
      formatOnSave: format_on_save_checkbox?.checked || false,
    });

    // ダイアログを閉じる
    this.hide();

    console.log("Settings applied");
  }

  /**
   * 設定をリセット
   */
  private resetSettings(): void {
    if (confirm("Reset all settings to default?")) {
      this.settings_manager.resetSettings();
      this.loadSettingsToForm();
      console.log("Settings reset to default");
    }
  }

  /**
   * 設定変更時の処理
   */
  private onSettingChanged(key: string, value: any): void {
    switch (key) {
      case "theme":
        this.theme_manager.applyTheme(value);
        break;

      case "fontSize":
        this.editor_manager.updateOptions({ fontSize: value });
        break;

      case "tabSize":
        this.editor_manager.updateOptions({ tabSize: value });
        break;

      case "wordWrap":
        this.editor_manager.updateOptions({ wordWrap: value });
        break;

      case "minimap":
        this.editor_manager.updateOptions({
          minimap: { enabled: value },
        });
        break;

      default:
        break;
    }
  }
}
