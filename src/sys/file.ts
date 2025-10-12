import * as fs from "fs/promises";
import * as path from "path";

/**
 * ファイルシステムマネージャー
 * ファイルの読み書き、ディレクトリ操作を担当
 */
export class FileManager {
  /**
   * ファイルを読み込む
   */
  public async readFile(file_path: string): Promise<{
    success: boolean;
    content?: string;
    path?: string;
    error?: string;
  }> {
    try {
      const content = await fs.readFile(file_path, "utf-8");
      return { success: true, content, path: file_path };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * ファイルに書き込む
   */
  public async writeFile(
    file_path: string,
    content: string
  ): Promise<{
    success: boolean;
    path?: string;
    error?: string;
  }> {
    try {
      await fs.writeFile(file_path, content, "utf-8");
      return { success: true, path: file_path };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
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
    try {
      const entries = await fs.readdir(dir_path, { withFileTypes: true });
      const items = entries.map((entry) => ({
        name: entry.name,
        path: path.join(dir_path, entry.name),
        isDirectory: entry.isDirectory(),
        isFile: entry.isFile(),
      }));

      // ディレクトリを先に、ファイルを後に並び替え
      items.sort((a, b) => {
        if (a.isDirectory && !b.isDirectory) return -1;
        if (!a.isDirectory && b.isDirectory) return 1;
        return a.name.localeCompare(b.name);
      });

      return { success: true, items };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * ファイルが存在するかチェック
   */
  public async fileExists(file_path: string): Promise<boolean> {
    try {
      await fs.access(file_path);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * ディレクトリを作成
   */
  public async createDirectory(dir_path: string): Promise<{
    success: boolean;
    error?: string;
  }> {
    try {
      await fs.mkdir(dir_path, { recursive: true });
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }
}
