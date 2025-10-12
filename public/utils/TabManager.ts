/**
 * タブ管理マネージャー
 * 複数ファイルのタブ管理を担当
 */

interface Tab {
  id: string;
  label: string;
  file_path: string | null;
  is_modified: boolean;
  is_active: boolean;
  content: string;
  language: string;
}

export class TabManager {
  private tabs: Map<string, Tab> = new Map();
  private active_tab_id: string | null = null;
  private tab_counter: number = 0;
  private tab_bar_element: HTMLElement | null = null;

  constructor() {
    this.tab_bar_element = document.getElementById("tab-bar");
    // 既存のタブをクリア（HTMLに静的なタブがある場合）
    if (this.tab_bar_element) {
      this.tab_bar_element.innerHTML = "";
    }
  }

  /**
   * 新しいタブを作成
   */
  public createTab(
    label: string = "Untitled",
    file_path: string | null = null,
    content: string = "",
    language: string = "plaintext"
  ): string {
    this.tab_counter++;
    const tab_id = `tab-${this.tab_counter}`;

    const tab: Tab = {
      id: tab_id,
      label: file_path
        ? this.getFileNameFromPath(file_path)
        : `${label}-${this.tab_counter}`,
      file_path,
      is_modified: false,
      is_active: false,
      content,
      language,
    };

    console.log(`Creating tab: ${tab_id}, label: ${tab.label}`);
    this.tabs.set(tab_id, tab);
    this.renderTab(tab);

    // 最初のタブまたは新しいタブをアクティブにする
    this.activateTab(tab_id);

    console.log(`Total tabs: ${this.tabs.size}`);
    return tab_id;
  }

  /**
   * タブをアクティブ化
   */
  public activateTab(tab_id: string): void {
    const tab = this.tabs.get(tab_id);
    if (!tab) return;

    // 既存のアクティブタブを非アクティブ化
    if (this.active_tab_id) {
      const old_active = this.tabs.get(this.active_tab_id);
      if (old_active) {
        old_active.is_active = false;
        this.updateTabElement(old_active);
      }
    }

    // 新しいタブをアクティブ化
    tab.is_active = true;
    this.active_tab_id = tab_id;
    this.updateTabElement(tab);

    // カスタムイベントを発火
    this.fireTabChangeEvent(tab);
  }

  /**
   * タブを閉じる
   */
  public closeTab(tab_id: string): boolean {
    const tab = this.tabs.get(tab_id);
    if (!tab) return false;

    // 変更がある場合は確認（今後実装）
    if (tab.is_modified) {
      // TODO: 保存確認ダイアログ
      console.log(`Tab ${tab.label} has unsaved changes`);
    }

    // タブ要素を削除
    const tab_element = document.querySelector(`[data-tab-id="${tab_id}"]`);
    if (tab_element) {
      tab_element.remove();
    }

    // タブデータを削除
    this.tabs.delete(tab_id);

    // アクティブタブが閉じられた場合、別のタブをアクティブにする
    if (this.active_tab_id === tab_id) {
      this.active_tab_id = null;
      const remaining_tabs = Array.from(this.tabs.keys());
      if (remaining_tabs.length > 0) {
        this.activateTab(remaining_tabs[0]!);
      } else {
        // すべてのタブが閉じられた場合
        this.fireAllTabsClosedEvent();
      }
    }

    return true;
  }

  /**
   * タブの内容を更新
   */
  public updateTabContent(tab_id: string, content: string): void {
    const tab = this.tabs.get(tab_id);
    if (!tab) return;

    tab.content = content;
  }

  /**
   * タブの変更フラグを設定
   */
  public setTabModified(tab_id: string, is_modified: boolean): void {
    const tab = this.tabs.get(tab_id);
    if (!tab) return;

    tab.is_modified = is_modified;
    this.updateTabElement(tab);
  }

  /**
   * タブのファイルパスを更新（保存時など）
   */
  public updateTabFilePath(tab_id: string, file_path: string): void {
    const tab = this.tabs.get(tab_id);
    if (!tab) return;

    tab.file_path = file_path;
    tab.label = this.getFileNameFromPath(file_path);
    this.updateTabElement(tab);
  }

  /**
   * アクティブなタブを取得
   */
  public getActiveTab(): Tab | null {
    if (!this.active_tab_id) return null;
    return this.tabs.get(this.active_tab_id) ?? null;
  }

  /**
   * タブIDでタブを取得
   */
  public getTab(tab_id: string): Tab | null {
    return this.tabs.get(tab_id) ?? null;
  }

  /**
   * すべてのタブを取得
   */
  public getAllTabs(): Tab[] {
    return Array.from(this.tabs.values());
  }

  /**
   * ファイルパスからタブを検索
   */
  public findTabByFilePath(file_path: string): Tab | null {
    for (const tab of this.tabs.values()) {
      if (tab.file_path === file_path) {
        return tab;
      }
    }
    return null;
  }

  /**
   * タブが存在するか確認
   */
  public hasTab(tab_id: string): boolean {
    return this.tabs.has(tab_id);
  }

  /**
   * タブの数を取得
   */
  public getTabCount(): number {
    return this.tabs.size;
  }

  /**
   * タブをレンダリング
   */
  private renderTab(tab: Tab): void {
    if (!this.tab_bar_element) {
      console.error("Tab bar element not found!");
      return;
    }

    console.log(`Rendering tab: ${tab.id}`);

    const tab_element = document.createElement("div");
    tab_element.className = "tab";
    tab_element.setAttribute("data-tab-id", tab.id);

    const label = document.createElement("span");
    label.className = "tab-label";
    label.textContent = tab.label;

    const close_button = document.createElement("button");
    close_button.className = "tab-close";
    close_button.innerHTML = '<span class="material-icons">close</span>';
    close_button.addEventListener("click", (e) => {
      e.stopPropagation();
      this.closeTab(tab.id);
    });

    tab_element.appendChild(label);
    tab_element.appendChild(close_button);

    // タブクリックでアクティブ化
    tab_element.addEventListener("click", () => {
      this.activateTab(tab.id);
    });

    this.tab_bar_element.appendChild(tab_element);
    console.log(
      `Tab rendered. Total children: ${this.tab_bar_element.children.length}`
    );
  }

  /**
   * タブ要素を更新
   */
  private updateTabElement(tab: Tab): void {
    const tab_element = document.querySelector(
      `[data-tab-id="${tab.id}"]`
    ) as HTMLElement;
    if (!tab_element) return;

    // アクティブ状態を更新
    if (tab.is_active) {
      tab_element.classList.add("active");
    } else {
      tab_element.classList.remove("active");
    }

    // ラベルを更新（変更フラグを含む）
    const label = tab_element.querySelector(".tab-label");
    if (label) {
      label.textContent = tab.is_modified ? `● ${tab.label}` : tab.label;
    }
  }

  /**
   * タブ情報を更新
   */
  public updateTab(
    tab_id: string,
    updates: {
      label?: string;
      file_path?: string;
      content?: string;
      language?: string;
    }
  ): void {
    const tab = this.tabs.get(tab_id);
    if (!tab) {
      console.warn(`Tab with id "${tab_id}" not found`);
      return;
    }

    if (updates.label !== undefined) tab.label = updates.label;
    if (updates.file_path !== undefined) tab.file_path = updates.file_path;
    if (updates.content !== undefined) tab.content = updates.content;
    if (updates.language !== undefined) tab.language = updates.language;

    this.updateTabElement(tab);
  }

  /**
   * ファイルパスからファイル名を取得
   */
  private getFileNameFromPath(file_path: string): string {
    const parts = file_path.split(/[/\\]/);
    return parts[parts.length - 1] ?? "Untitled";
  }

  /**
   * タブ変更イベントを発火
   */
  private fireTabChangeEvent(tab: Tab): void {
    const event = new CustomEvent("tab-changed", {
      detail: {
        tab_id: tab.id,
        label: tab.label,
        file_path: tab.file_path,
        content: tab.content,
        language: tab.language,
      },
    });
    window.dispatchEvent(event);
  }

  /**
   * すべてのタブが閉じられたイベントを発火
   */
  private fireAllTabsClosedEvent(): void {
    const event = new CustomEvent("all-tabs-closed");
    window.dispatchEvent(event);
  }

  /**
   * すべてのタブをクリア
   */
  public clearAllTabs(): void {
    this.tabs.clear();
    this.active_tab_id = null;
    this.tab_counter = 0;
    if (this.tab_bar_element) {
      this.tab_bar_element.innerHTML = "";
    }
  }
}
