/**
 * エクスプローラーマネージャー
 * ファイルツリーの表示と管理
 */
export class ExplorerManager {
  private root_path: string | null = null;
  private tree_container: HTMLElement | null = null;
  private expanded_folders: Set<string> = new Set();

  constructor() {
    this.tree_container = document.querySelector(".tree-view");
  }

  /**
   * フォルダを開いてツリーを表示
   */
  public async openFolder(folder_path: string): Promise<void> {
    this.root_path = folder_path;
    this.expanded_folders.clear();
    await this.refreshTree();
  }

  /**
   * ツリーを更新
   */
  public async refreshTree(): Promise<void> {
    if (!this.tree_container || !this.root_path) return;

    // 空メッセージを非表示
    const tree_empty = this.tree_container.querySelector(
      ".tree-empty"
    ) as HTMLElement;
    if (tree_empty) {
      tree_empty.style.display = "none";
    }

    // ツリーをクリアして再構築
    const items = Array.from(
      this.tree_container.querySelectorAll(".tree-item")
    );
    items.forEach((item) => item.remove());

    await this.loadDirectory(this.root_path, this.tree_container, 0, true);
  }

  /**
   * ディレクトリを読み込んでツリーに追加
   */
  private async loadDirectory(
    dir_path: string,
    parent_element: HTMLElement,
    depth: number,
    is_root: boolean = false
  ): Promise<void> {
    if (!window.electronAPI) return;

    const result = await window.electronAPI.readDirectory(dir_path);
    if (!result.success || !result.items) return;

    // ルートフォルダの表示
    if (is_root) {
      const root_name = dir_path.split(/[/\\]/).pop() || dir_path;
      const root_element = document.createElement("div");
      root_element.className = "tree-item expanded";
      root_element.style.paddingLeft = "12px";
      root_element.dataset.path = dir_path;
      root_element.dataset.isDirectory = "true";

      const icon = document.createElement("span");
      icon.className = "material-icons tree-icon";
      icon.textContent = "folder_open";

      const label = document.createElement("span");
      label.textContent = root_name;

      root_element.appendChild(icon);
      root_element.appendChild(label);
      parent_element.appendChild(root_element);

      this.expanded_folders.add(dir_path);
      depth = 1; // 子要素は depth 1 から
    }

    for (const item of result.items) {
      // 隠しファイルとnode_modules, distをスキップ
      if (
        item.name.startsWith(".") ||
        item.name === "node_modules" ||
        item.name === "dist" ||
        item.name === "dist_public"
      ) {
        continue;
      }

      const item_element = document.createElement("div");
      item_element.className = "tree-item";
      item_element.style.paddingLeft = `${depth * 16 + 12}px`;
      item_element.dataset.path = item.path;
      item_element.dataset.isDirectory = item.isDirectory.toString();

      const icon = document.createElement("span");
      icon.className = "material-icons tree-icon";
      icon.textContent = item.isDirectory ? "folder" : "description";

      const label = document.createElement("span");
      label.textContent = item.name;

      item_element.appendChild(icon);
      item_element.appendChild(label);

      // クリックイベント
      item_element.addEventListener("click", async (e) => {
        e.stopPropagation();

        // すべてのアイテムから選択を解除
        const all_items = document.querySelectorAll(".tree-item");
        all_items.forEach((i) => i.classList.remove("selected"));

        // クリックされたアイテムを選択
        item_element.classList.add("selected");

        if (item.isDirectory) {
          // フォルダの展開/折りたたみ
          const is_expanded = item_element.classList.contains("expanded");
          if (is_expanded) {
            // 折りたたみ
            item_element.classList.remove("expanded");
            icon.textContent = "folder";
            this.expanded_folders.delete(item.path);

            // 子要素を削除
            let next_element = item_element.nextElementSibling;
            while (
              next_element &&
              next_element.classList.contains("tree-item")
            ) {
              const next_depth = parseInt(
                (next_element as HTMLElement).style.paddingLeft
              );
              if (next_depth <= depth * 16 + 12) break;
              const to_remove = next_element;
              next_element = next_element.nextElementSibling;
              to_remove.remove();
            }
          } else {
            // 展開
            item_element.classList.add("expanded");
            icon.textContent = "folder_open";
            this.expanded_folders.add(item.path);

            // 子要素を読み込んで現在の要素の後に挿入
            await this.loadDirectoryAfterElement(
              item.path,
              item_element,
              depth + 1
            );
          }
        } else {
          // ファイルを開く
          const event = new CustomEvent("file-open", {
            detail: { path: item.path, name: item.name },
          });
          window.dispatchEvent(event);
        }
      });

      parent_element.appendChild(item_element);
    }
  }

  /**
   * 指定した要素の後にディレクトリをロード
   */
  private async loadDirectoryAfterElement(
    dir_path: string,
    after_element: HTMLElement,
    depth: number
  ): Promise<void> {
    if (!window.electronAPI || !this.tree_container) return;

    const result = await window.electronAPI.readDirectory(dir_path);
    if (!result.success || !result.items) return;

    // 挿入位置を取得
    let insert_position = after_element.nextSibling;

    for (const item of result.items) {
      // 隠しファイルとnode_modules, distをスキップ
      if (
        item.name.startsWith(".") ||
        item.name === "node_modules" ||
        item.name === "dist" ||
        item.name === "dist_public"
      ) {
        continue;
      }

      const item_element = document.createElement("div");
      item_element.className = "tree-item";
      item_element.style.paddingLeft = `${depth * 16 + 12}px`;
      item_element.dataset.path = item.path;
      item_element.dataset.isDirectory = item.isDirectory.toString();

      const icon = document.createElement("span");
      icon.className = "material-icons tree-icon";
      icon.textContent = item.isDirectory ? "folder" : "description";

      const label = document.createElement("span");
      label.textContent = item.name;

      item_element.appendChild(icon);
      item_element.appendChild(label);

      // クリックイベント
      item_element.addEventListener("click", async (e) => {
        e.stopPropagation();

        const all_items = document.querySelectorAll(".tree-item");
        all_items.forEach((i) => i.classList.remove("selected"));
        item_element.classList.add("selected");

        if (item.isDirectory) {
          const is_expanded = item_element.classList.contains("expanded");
          if (is_expanded) {
            item_element.classList.remove("expanded");
            icon.textContent = "folder";
            this.expanded_folders.delete(item.path);

            let next_element = item_element.nextElementSibling;
            while (
              next_element &&
              next_element.classList.contains("tree-item")
            ) {
              const next_depth = parseInt(
                (next_element as HTMLElement).style.paddingLeft
              );
              if (next_depth <= depth * 16 + 12) break;
              const to_remove = next_element;
              next_element = next_element.nextElementSibling;
              to_remove.remove();
            }
          } else {
            item_element.classList.add("expanded");
            icon.textContent = "folder_open";
            this.expanded_folders.add(item.path);
            await this.loadDirectoryAfterElement(
              item.path,
              item_element,
              depth + 1
            );
          }
        } else {
          const event = new CustomEvent("file-open", {
            detail: { path: item.path, name: item.name },
          });
          window.dispatchEvent(event);
        }
      });

      // 要素を挿入
      if (insert_position) {
        this.tree_container.insertBefore(item_element, insert_position);
      } else {
        this.tree_container.appendChild(item_element);
      }
    }
  }

  /**
   * ルートパスを取得
   */
  public getRootPath(): string | null {
    return this.root_path;
  }
}
