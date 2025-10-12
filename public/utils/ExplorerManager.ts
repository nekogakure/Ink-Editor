/**
 * エクスプローラーマネージャー
 * ファイルツリーの表示と管理
 */
export class ExplorerManager {
  private root_path: string | null = null;
  private tree_container: HTMLElement | null = null;

  constructor() {
    this.tree_container = document.querySelector(".tree-view");
  }

  /**
   * フォルダを開いてツリーを表示
   */
  public async openFolder(folder_path: string): Promise<void> {
    this.root_path = folder_path;
    await this.refreshTree();
  }

  /**
   * ツリーを更新
   */
  public async refreshTree(): Promise<void> {
    if (!this.tree_container || !this.root_path) return;

    this.tree_container.innerHTML = "";
    await this.loadDirectory(this.root_path, this.tree_container, 0);
  }

  /**
   * ディレクトリを読み込んでツリーに追加
   */
  private async loadDirectory(
    dir_path: string,
    parent_element: HTMLElement,
    depth: number
  ): Promise<void> {
    if (!window.electronAPI) return;

    const result = await window.electronAPI.readDirectory(dir_path);
    if (!result.success || !result.items) return;

    for (const item of result.items) {
      // 隠しファイルをスキップ
      if (item.name.startsWith(".")) continue;

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
            item_element.classList.remove("expanded");
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
            item_element.classList.add("expanded");
            icon.textContent = "folder_open";
            await this.loadDirectory(item.path, parent_element, depth + 1);
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
   * ルートパスを取得
   */
  public getRootPath(): string | null {
    return this.root_path;
  }
}
