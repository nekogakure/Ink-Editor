import { EditorManager } from "../editors/EditorManager";
import { ExplorerManager } from "./ExplorerManager";
import { TabManager } from "./TabManager";

/**
 * セッション管理クラス
 * アプリケーションの状態を保存・復元
 */
export class SessionManager {
  private editor_manager: EditorManager;
  private explorer_manager: ExplorerManager;
  private tab_manager: TabManager;

  constructor(
    editor_manager: EditorManager,
    explorer_manager: ExplorerManager,
    tab_manager: TabManager
  ) {
    this.editor_manager = editor_manager;
    this.explorer_manager = explorer_manager;
    this.tab_manager = tab_manager;
  }

  /**
   * セッション状態を復元
   */
  public async restoreSession(): Promise<boolean> {
    if (!window.electronAPI) {
      console.log("No electronAPI available");
      return false;
    }

    try {
      console.log("Restoring session...");

      // セッションの検証
      const validation = await window.electronAPI.validateSession();
      console.log("Session validation:", validation);

      if (!validation.isValid) {
        console.log("Invalid session");
        return false;
      }

      // フォルダが存在する場合は復元
      if (validation.folderExists) {
        const session = await window.electronAPI.getSessionState();
        if (session.lastOpenedFolder) {
          console.log("Restoring folder:", session.lastOpenedFolder);
          await this.explorer_manager.openFolder(session.lastOpenedFolder);
        }
      }

      // 有効なファイルがある場合は復元
      if (validation.validFiles.length > 0) {
        console.log("Restoring files:", validation.validFiles);

        const session = await window.electronAPI.getSessionState();

        // ファイルを順番に開く
        for (const file_path of validation.validFiles) {
          const file_result = await window.electronAPI.readFile(file_path);
          if (file_result.success && file_result.content) {
            const file_name = file_path.split(/[/\\]/).pop() || "Untitled";
            const language =
              this.editor_manager.detectLanguageFromPath(file_path);

            this.tab_manager.createTab(
              file_name,
              file_path,
              file_result.content,
              language
            );
          }
        }

        // アクティブファイルを復元
        if (
          session.activeFile &&
          validation.validFiles.includes(session.activeFile)
        ) {
          const active_tab = this.tab_manager.findTabByFilePath(
            session.activeFile
          );
          if (active_tab) {
            this.tab_manager.activateTab(active_tab.id);
          }
        } else if (validation.validFiles.length > 0) {
          // アクティブファイルがない場合は最初のタブをアクティブ化
          const first_tab = this.tab_manager.getActiveTab();
          if (first_tab) {
            this.tab_manager.activateTab(first_tab.id);
          }
        }

        console.log("Session restored successfully");
        return true;
      }

      return false;
    } catch (error) {
      console.error("Failed to restore session:", error);
      return false;
    }
  }

  /**
   * セッション状態を保存
   */
  public async saveSession(): Promise<void> {
    if (!window.electronAPI) return;

    try {
      // 現在のフォルダを保存
      const folder = this.explorer_manager.getCurrentFolder();
      await window.electronAPI.setLastOpenedFolder(folder);

      // 開いているファイルを保存
      const opened_files = this.tab_manager
        .getAllTabs()
        .filter((tab) => tab.file_path !== "Untitled" && tab.file_path !== null)
        .map((tab) => tab.file_path) as string[];
      await window.electronAPI.setOpenedFiles(opened_files);

      // アクティブファイルを保存
      const active_tab = this.tab_manager.getActiveTab();
      const active_file =
        active_tab && active_tab.file_path !== "Untitled"
          ? active_tab.file_path
          : null;
      await window.electronAPI.setActiveFile(active_file);

      console.log("Session saved");
    } catch (error) {
      console.error("Failed to save session:", error);
    }
  }
}
