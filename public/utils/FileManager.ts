/**
 * ファイルマネージャー（レンダラー側）
 * ファイル操作のロジックを管理
 */
export class FileManager {
  private current_file_path: string | null = null;
  private current_file_content: string = "";
  private is_modified: boolean = false;

  /**
   * 新規ファイルを作成
   */
  public createNewFile(): void {
    this.current_file_path = null;
    this.current_file_content = "";
    this.is_modified = false;
  }

  /**
   * ファイルを開く
   */
  public async openFile(): Promise<{
    success: boolean;
    content?: string;
    path?: string;
    error?: string;
  }> {
    if (!window.electronAPI) {
      return { success: false, error: "Electron API not available" };
    }

    const file_path = await window.electronAPI.openFileDialog();
    if (!file_path) {
      return { success: false, error: "No file selected" };
    }

    const result = await window.electronAPI.readFile(file_path);
    if (result.success && result.content) {
      this.current_file_path = file_path;
      this.current_file_content = result.content;
      this.is_modified = false;
      return { success: true, content: result.content, path: file_path };
    }

    return result;
  }

  /**
   * ファイルを保存
   */
  public async saveFile(content: string): Promise<{
    success: boolean;
    path?: string;
    error?: string;
  }> {
    if (!window.electronAPI) {
      return { success: false, error: "Electron API not available" };
    }

    // ファイルパスがない場合は「名前を付けて保存」
    if (!this.current_file_path) {
      return await this.saveFileAs(content);
    }

    const result = await window.electronAPI.writeFile(
      this.current_file_path,
      content
    );

    if (result.success) {
      this.current_file_content = content;
      this.is_modified = false;
    }

    return result;
  }

  /**
   * 名前を付けてファイルを保存
   */
  public async saveFileAs(content: string): Promise<{
    success: boolean;
    path?: string;
    error?: string;
  }> {
    if (!window.electronAPI) {
      return { success: false, error: "Electron API not available" };
    }

    const file_path = await window.electronAPI.saveFileDialog();
    if (!file_path) {
      return { success: false, error: "No file selected" };
    }

    const result = await window.electronAPI.writeFile(file_path, content);

    if (result.success) {
      this.current_file_path = file_path;
      this.current_file_content = content;
      this.is_modified = false;
    }

    return result;
  }

  /**
   * フォルダを開く
   */
  public async openFolder(): Promise<{
    success: boolean;
    path?: string;
    error?: string;
  }> {
    if (!window.electronAPI) {
      return { success: false, error: "Electron API not available" };
    }

    const folder_path = await window.electronAPI.openFolderDialog();
    if (!folder_path) {
      return { success: false, error: "No folder selected" };
    }

    return { success: true, path: folder_path };
  }

  /**
   * ディレクトリの内容を読み込む
   */
  public async readDirectory(dir_path: string): Promise<{
    success: boolean;
    items?: Array<{
      name: string;
      path: string;
      isDirectory: boolean;
      isFile: boolean;
    }>;
    error?: string;
  }> {
    if (!window.electronAPI) {
      return { success: false, error: "Electron API not available" };
    }

    return await window.electronAPI.readDirectory(dir_path);
  }

  /**
   * 現在のファイルパスを取得
   */
  public getCurrentFilePath(): string | null {
    return this.current_file_path;
  }

  /**
   * 現在のファイルが変更されているかチェック
   */
  public isModified(): boolean {
    return this.is_modified;
  }

  /**
   * 変更フラグを設定
   */
  public setModified(modified: boolean): void {
    this.is_modified = modified;
  }

  /**
   * 変更済みとしてマーク
   */
  public markAsModified(): void {
    this.is_modified = true;
  }

  /**
   * ファイル名を取得
   */
  public getFileName(): string {
    if (!this.current_file_path) {
      return "Untitled";
    }
    const parts = this.current_file_path.split(/[/\\]/);
    return parts[parts.length - 1] ?? "Untitled";
  }
}
