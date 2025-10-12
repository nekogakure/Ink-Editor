/**
 * 検索マネージャー
 * ファイル内検索とプロジェクト全体検索を管理
 */

interface SearchResult {
  file_path: string;
  file_name: string;
  line_number: number;
  line_content: string;
  match_start: number;
  match_end: number;
}

export class SearchManager {
  private search_panel: HTMLElement | null = null;
  private search_input: HTMLInputElement | null = null;
  private search_results_container: HTMLElement | null = null;
  private search_mode: "current" | "all" = "current";
  private current_results: SearchResult[] = [];

  constructor() {
    this.search_panel = document.getElementById("search-panel");
    this.search_input = document.querySelector(
      ".search-input"
    ) as HTMLInputElement;
    this.search_results_container = document.querySelector(
      ".search-results"
    ) as HTMLElement;
  }

  /**
   * 検索を実行
   */
  public async performSearch(
    query: string,
    mode: "current" | "all"
  ): Promise<void> {
    if (!query.trim()) {
      this.clearResults();
      return;
    }

    this.search_mode = mode;
    this.current_results = [];

    if (mode === "current") {
      await this.searchInCurrentFile(query);
    } else {
      await this.searchInAllFiles(query);
    }

    this.renderResults();
  }

  /**
   * 現在のファイル内を検索
   */
  private async searchInCurrentFile(query: string): Promise<void> {
    // エディタの内容を取得するイベントを発火
    const event = new CustomEvent("search-in-current", { detail: { query } });
    window.dispatchEvent(event);
  }

  /**
   * すべてのファイルを検索
   */
  private async searchInAllFiles(query: string): Promise<void> {
    if (!window.electronAPI) return;

    // フォルダパスを取得するイベントを発火
    const event = new CustomEvent("search-in-all", { detail: { query } });
    window.dispatchEvent(event);
  }

  /**
   * 検索結果を設定（外部から呼ばれる）
   */
  public setResults(results: SearchResult[]): void {
    this.current_results = results;
    this.renderResults();
  }

  /**
   * 検索結果をレンダリング
   */
  private renderResults(): void {
    if (!this.search_results_container) return;

    this.search_results_container.innerHTML = "";

    if (this.current_results.length === 0) {
      const no_results = document.createElement("div");
      no_results.className = "search-no-results";
      no_results.textContent = "No results found";
      this.search_results_container.appendChild(no_results);
      return;
    }

    // 結果数を表示
    const results_count = document.createElement("div");
    results_count.className = "search-results-count";
    results_count.textContent = `${this.current_results.length} results`;
    this.search_results_container.appendChild(results_count);

    // ファイルごとにグループ化
    const grouped = this.groupByFile(this.current_results);

    for (const [file_path, results] of grouped) {
      if (results.length === 0) continue;

      const file_group = document.createElement("div");
      file_group.className = "search-file-group";

      const file_header = document.createElement("div");
      file_header.className = "search-file-header";
      file_header.innerHTML = `
        <span class="material-icons">description</span>
        <span>${results[0]?.file_name ?? "Unknown"}</span>
        <span class="search-file-count">${results.length}</span>
      `;
      file_group.appendChild(file_header);

      const results_list = document.createElement("div");
      results_list.className = "search-results-list";

      for (const result of results) {
        const result_item = document.createElement("div");
        result_item.className = "search-result-item";

        const line_num = document.createElement("span");
        line_num.className = "search-line-number";
        line_num.textContent = `${result.line_number}`;

        const line_content = document.createElement("span");
        line_content.className = "search-line-content";

        // マッチ部分をハイライト
        const before = result.line_content.substring(0, result.match_start);
        const match = result.line_content.substring(
          result.match_start,
          result.match_end
        );
        const after = result.line_content.substring(result.match_end);

        line_content.innerHTML = `${this.escapeHtml(
          before
        )}<mark>${this.escapeHtml(match)}</mark>${this.escapeHtml(after)}`;

        result_item.appendChild(line_num);
        result_item.appendChild(line_content);

        // クリックで該当箇所にジャンプ
        result_item.addEventListener("click", () => {
          this.jumpToResult(result);
        });

        results_list.appendChild(result_item);
      }

      file_group.appendChild(results_list);
      this.search_results_container.appendChild(file_group);
    }
  }

  /**
   * ファイルごとにグループ化
   */
  private groupByFile(results: SearchResult[]): Map<string, SearchResult[]> {
    const grouped = new Map<string, SearchResult[]>();

    for (const result of results) {
      if (!grouped.has(result.file_path)) {
        grouped.set(result.file_path, []);
      }
      grouped.get(result.file_path)!.push(result);
    }

    return grouped;
  }

  /**
   * 検索結果にジャンプ
   */
  private jumpToResult(result: SearchResult): void {
    const event = new CustomEvent("jump-to-search-result", {
      detail: result,
    });
    window.dispatchEvent(event);
  }

  /**
   * 検索結果をクリア
   */
  public clearResults(): void {
    if (this.search_results_container) {
      this.search_results_container.innerHTML = "";
    }
    this.current_results = [];
  }

  /**
   * HTMLエスケープ
   */
  private escapeHtml(text: string): string {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }

  /**
   * 検索モードを取得
   */
  public getSearchMode(): "current" | "all" {
    return this.search_mode;
  }

  /**
   * 検索モードを設定
   */
  public setSearchMode(mode: "current" | "all"): void {
    this.search_mode = mode;
  }
}
