import { dialog, BrowserWindow } from "electron";

/**
 * ダイアログマネージャー
 * ファイル/フォルダ選択ダイアログを管理
 */
export class DialogManager {
  /**
   * ファイルを開くダイアログを表示
   */
  public async showOpenFileDialog(
    main_window: BrowserWindow
  ): Promise<string | null> {
    const result = await dialog.showOpenDialog(main_window, {
      properties: ["openFile"],
      filters: [
        { name: "All Files", extensions: ["*"] },
        { name: "Text Files", extensions: ["txt", "md"] },
        { name: "JavaScript", extensions: ["js", "jsx"] },
        { name: "TypeScript", extensions: ["ts", "tsx"] },
        { name: "HTML", extensions: ["html", "htm"] },
        { name: "CSS", extensions: ["css", "scss", "sass", "less"] },
        { name: "JSON", extensions: ["json", "jsonc"] },
        { name: "XML", extensions: ["xml"] },
        { name: "Python", extensions: ["py", "pyw"] },
        { name: "Java", extensions: ["java"] },
        { name: "C/C++", extensions: ["c", "cpp", "h", "hpp"] },
        { name: "C#", extensions: ["cs"] },
        { name: "Go", extensions: ["go"] },
        { name: "Rust", extensions: ["rs"] },
      ],
    });

    if (result.canceled || result.filePaths.length === 0) {
      return null;
    }

    return result.filePaths[0] ?? null;
  }

  /**
   * フォルダを開くダイアログを表示
   */
  public async showOpenFolderDialog(
    main_window: BrowserWindow
  ): Promise<string | null> {
    const result = await dialog.showOpenDialog(main_window, {
      properties: ["openDirectory"],
    });

    if (result.canceled || result.filePaths.length === 0) {
      return null;
    }

    return result.filePaths[0] ?? null;
  }

  /**
   * ファイル保存ダイアログを表示
   */
  public async showSaveFileDialog(
    main_window: BrowserWindow
  ): Promise<string | null> {
    const result = await dialog.showSaveDialog(main_window, {
      filters: [
        { name: "All Files", extensions: ["*"] },
        { name: "Text Files", extensions: ["txt", "md"] },
        { name: "JavaScript", extensions: ["js", "jsx"] },
        { name: "TypeScript", extensions: ["ts", "tsx"] },
        { name: "HTML", extensions: ["html", "htm"] },
        { name: "CSS", extensions: ["css", "scss", "sass", "less"] },
        { name: "JSON", extensions: ["json", "jsonc"] },
        { name: "XML", extensions: ["xml"] },
        { name: "Python", extensions: ["py", "pyw"] },
        { name: "Java", extensions: ["java"] },
        { name: "C/C++", extensions: ["c", "cpp", "h", "hpp"] },
        { name: "C#", extensions: ["cs"] },
        { name: "Go", extensions: ["go"] },
        { name: "Rust", extensions: ["rs"] },
      ],
    });

    if (result.canceled || !result.filePath) {
      return null;
    }

    return result.filePath;
  }
}
