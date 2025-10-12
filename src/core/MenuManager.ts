import { Menu, BrowserWindow, app } from "electron";

/**
 * メニューマネージャー
 * アプリケーションメニューの作成と管理を担当
 */
export class MenuManager {
  /**
   * アプリケーションメニューを設定
   */
  public setupMenu(main_window: BrowserWindow | null): void {
    const template: Electron.MenuItemConstructorOptions[] = [
      {
        label: "File",
        submenu: [
          {
            label: "New File",
            accelerator: "CmdOrCtrl+N",
            click: () => {
              main_window?.webContents.send("menu-new-file");
            },
          },
          {
            label: "Open File",
            accelerator: "CmdOrCtrl+O",
            click: () => {
              main_window?.webContents.send("menu-open-file");
            },
          },
          {
            label: "Open Folder",
            accelerator: "CmdOrCtrl+Shift+O",
            click: () => {
              main_window?.webContents.send("menu-open-folder");
            },
          },
          { type: "separator" },
          {
            label: "Save",
            accelerator: "CmdOrCtrl+S",
            click: () => {
              main_window?.webContents.send("menu-save-file");
            },
          },
          {
            label: "Save As...",
            accelerator: "CmdOrCtrl+Shift+S",
            click: () => {
              main_window?.webContents.send("menu-save-file-as");
            },
          },
          { type: "separator" },
          {
            label: "Exit",
            accelerator: "CmdOrCtrl+Q",
            click: () => {
              app.quit();
            },
          },
        ],
      },
      {
        label: "Edit",
        submenu: [
          { role: "undo" },
          { role: "redo" },
          { type: "separator" },
          { role: "cut" },
          { role: "copy" },
          { role: "paste" },
          { role: "selectAll" },
        ],
      },
      {
        label: "View",
        submenu: [
          { role: "reload" },
          { role: "toggleDevTools" },
          { type: "separator" },
          { role: "resetZoom" },
          { role: "zoomIn" },
          { role: "zoomOut" },
          { type: "separator" },
          { role: "togglefullscreen" },
        ],
      },
    ];

    const menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);
  }
}
