/**
 * 設定管理クラス
 * アプリケーションの設定を管理
 */

export interface AppSettings {
  theme: "light" | "dark";
  fontSize: number;
  tabSize: number;
  wordWrap: "on" | "off";
  minimap: boolean;
  autoSave: boolean;
  formatOnSave: boolean;
}

export class SettingsManager {
  private settings: AppSettings;
  private readonly STORAGE_KEY = "ink-editor-settings";

  constructor() {
    // デフォルト設定
    this.settings = {
      theme: "light",
      fontSize: 14,
      tabSize: 4,
      wordWrap: "off",
      minimap: true,
      autoSave: false,
      formatOnSave: false,
    };

    // 設定を読み込み
    this.loadSettings();
  }

  /**
   * 設定を読み込み
   */
  private loadSettings(): void {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        this.settings = { ...this.settings, ...parsed };
        console.log("Settings loaded:", this.settings);
      }
    } catch (error) {
      console.error("Failed to load settings:", error);
    }
  }

  /**
   * 設定を保存
   */
  private saveSettings(): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.settings));
      console.log("Settings saved:", this.settings);
    } catch (error) {
      console.error("Failed to save settings:", error);
    }
  }

  /**
   * すべての設定を取得
   */
  public getSettings(): AppSettings {
    return { ...this.settings };
  }

  /**
   * 特定の設定を取得
   */
  public getSetting<K extends keyof AppSettings>(key: K): AppSettings[K] {
    return this.settings[key];
  }

  /**
   * 設定を更新
   */
  public updateSetting<K extends keyof AppSettings>(
    key: K,
    value: AppSettings[K]
  ): void {
    this.settings[key] = value;
    this.saveSettings();

    // 設定変更イベントを発火
    this.fireSettingsChangedEvent(key, value);
  }

  /**
   * 複数の設定を一括更新
   */
  public updateSettings(updates: Partial<AppSettings>): void {
    this.settings = { ...this.settings, ...updates };
    this.saveSettings();

    // 各変更についてイベントを発火
    Object.keys(updates).forEach((key) => {
      this.fireSettingsChangedEvent(
        key as keyof AppSettings,
        updates[key as keyof AppSettings]
      );
    });
  }

  /**
   * テーマを切り替え
   */
  public toggleTheme(): void {
    const newTheme = this.settings.theme === "light" ? "dark" : "light";
    this.updateSetting("theme", newTheme);
  }

  /**
   * 設定をリセット
   */
  public resetSettings(): void {
    this.settings = {
      theme: "light",
      fontSize: 14,
      tabSize: 4,
      wordWrap: "off",
      minimap: true,
      autoSave: false,
      formatOnSave: false,
    };
    this.saveSettings();

    // リセットイベントを発火
    const event = new CustomEvent("settings-reset");
    window.dispatchEvent(event);
  }

  /**
   * 設定変更イベントを発火
   */
  private fireSettingsChangedEvent(key: string, value: any): void {
    const event = new CustomEvent("setting-changed", {
      detail: { key, value },
    });
    window.dispatchEvent(event);
  }
}
