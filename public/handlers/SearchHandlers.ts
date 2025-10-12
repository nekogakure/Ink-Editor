import { EditorManager } from "../editors/EditorManager";
import { FileManager } from "../utils/FileManager";
import { TabManager } from "../utils/TabManager";
import { ExplorerManager } from "../utils/ExplorerManager";
import { UIController } from "../ui/UIController";

/**
 * 検索ハンドラークラス
 * 検索機能の処理
 */
export class SearchHandlers {
  private editor_manager: EditorManager;
  private file_manager: FileManager;
  private tab_manager: TabManager;
  private explorer_manager: ExplorerManager;
  private ui_controller: UIController;

  constructor(
    editor_manager: EditorManager,
    file_manager: FileManager,
    tab_manager: TabManager,
    explorer_manager: ExplorerManager,
    ui_controller: UIController
  ) {
    this.editor_manager = editor_manager;
    this.file_manager = file_manager;
    this.tab_manager = tab_manager;
    this.explorer_manager = explorer_manager;
    this.ui_controller = ui_controller;
  }

  /**
   * 現在のファイル内を検索
   */
  public async handleSearchInCurrent(query: string): Promise<void> {
    const content = this.editor_manager.getValue();
    const lines = content.split("\n");
    const results: Array<{ line_number: number; content: string }> = [];

    // 各行を検索（完全一致）
    lines.forEach((line, index) => {
      if (line.includes(query)) {
        results.push({
          line_number: index + 1,
          content: line,
        });
      }
    });

    console.log(`Found ${results.length} results in current file`);
  }

  /**
   * すべてのファイルを検索
   */
  public async handleSearchInAll(query: string): Promise<void> {
    if (!window.electronAPI) {
      console.error("electronAPI is not available");
      return;
    }

    const folder = this.explorer_manager.getCurrentFolder();
    if (!folder) {
      console.log("No folder opened");
      return;
    }

    console.log(`Searching for "${query}" in all files...`);
    this.ui_controller.logToConsole(`Searching for "${query}"...`);

    try {
      const results = await this.searchInDirectory(folder, query);
      console.log(`Found ${results.length} results in all files`);
      this.ui_controller.logToConsole(
        `Found ${results.length} results in ${
          new Set(results.map((r) => r.file_path)).size
        } files`
      );
    } catch (error) {
      console.error("Search failed:", error);
      this.ui_controller.logToConsole(`Search failed: ${error}`);
    }
  }

  /**
   * ディレクトリ内を再帰的に検索
   */
  private async searchInDirectory(
    dir_path: string,
    query: string
  ): Promise<
    Array<{
      file_path: string;
      file_name: string;
      line_number: number;
      content: string;
    }>
  > {
    const results: Array<{
      file_path: string;
      file_name: string;
      line_number: number;
      content: string;
    }> = [];

    if (!window.electronAPI) return results;

    try {
      const dir_result = await window.electronAPI.readDirectory(dir_path);
      if (!dir_result.success || !dir_result.items) {
        return results;
      }

      for (const item of dir_result.items) {
        // フィルタリング
        if (this.shouldSkipItem(item.name)) {
          continue;
        }

        if (item.isDirectory) {
          // サブディレクトリを再帰的に検索
          const sub_results = await this.searchInDirectory(item.path, query);
          results.push(...sub_results);
        } else if (item.isFile) {
          // バイナリファイルをスキップ
          if (this.isBinaryFile(item.name)) {
            continue;
          }

          // ファイルを読み込んで検索
          const file_result = await window.electronAPI.readFile(item.path);
          if (file_result.success && file_result.content) {
            const lines = file_result.content.split("\n");
            lines.forEach((line, index) => {
              if (line.includes(query)) {
                results.push({
                  file_path: item.path,
                  file_name: item.name,
                  line_number: index + 1,
                  content: line,
                });
              }
            });
          }
        }
      }
    } catch (error) {
      console.error(`Error searching directory ${dir_path}:`, error);
    }

    return results;
  }

  /**
   * 検索結果にジャンプ
   */
  public async handleJumpToSearchResult(result: any): Promise<void> {
    // ファイルが既に開いているかチェック
    let existing_tab = this.tab_manager.findTabByFilePath(result.file_path);

    if (!existing_tab) {
      // ファイルを開く
      if (window.electronAPI && result.file_path !== "Untitled") {
        const file_result = await window.electronAPI.readFile(result.file_path);
        if (file_result.success && file_result.content) {
          this.ui_controller.hideWelcomeScreen();

          const language = this.editor_manager.detectLanguageFromPath(
            result.file_path
          );
          const tab_id = this.tab_manager.createTab(
            result.file_name,
            result.file_path,
            file_result.content,
            language
          );

          this.editor_manager.setValue(file_result.content);
          this.editor_manager.setLanguage(language);
          this.file_manager.setCurrentFile(
            result.file_path,
            file_result.content,
            false
          );

          existing_tab = this.tab_manager.getTab(tab_id);
        }
      }
    } else {
      // 既に開いている場合はアクティブ化
      this.tab_manager.activateTab(existing_tab.id);
    }

    // 該当行にジャンプ
    this.editor_manager.goToLine(result.line_number);
    this.editor_manager.focus();
  }

  /**
   * スキップすべきアイテムかチェック
   */
  private shouldSkipItem(name: string): boolean {
    const skip_items = ["node_modules", "dist", "build", ".git", ".vscode"];
    if (skip_items.includes(name)) return true;
    if (name.startsWith(".")) return true;
    return false;
  }

  /**
   * バイナリファイルかチェック
   */
  private isBinaryFile(filename: string): boolean {
    const binary_extensions = [
      // 画像
      ".png",
      ".jpg",
      ".jpeg",
      ".gif",
      ".bmp",
      ".ico",
      ".svg",
      ".webp",
      // 動画
      ".mp4",
      ".avi",
      ".mov",
      ".wmv",
      ".flv",
      ".mkv",
      // 音声
      ".mp3",
      ".wav",
      ".ogg",
      ".flac",
      ".aac",
      // アーカイブ
      ".zip",
      ".rar",
      ".7z",
      ".tar",
      ".gz",
      ".bz2",
      // 実行ファイル
      ".exe",
      ".dll",
      ".so",
      ".dylib",
      ".app",
      // フォント
      ".ttf",
      ".otf",
      ".woff",
      ".woff2",
      ".eot",
      // その他
      ".pdf",
      ".doc",
      ".docx",
      ".xls",
      ".xlsx",
      ".ppt",
      ".pptx",
      ".db",
      ".sqlite",
      ".bin",
      ".dat",
    ];

    const lower_filename = filename.toLowerCase();
    return binary_extensions.some((ext) => lower_filename.endsWith(ext));
  }
}
