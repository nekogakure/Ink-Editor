// Monaco EditorはCDNから読み込まれるため、グローバル変数として参照
declare const monaco: typeof import("monaco-editor");

/**
 * Monaco Editorマネージャー
 * VS Code互換のエディタ機能を提供
 */
export class EditorManager {
  private editor: any | null = null;
  private container: HTMLElement | null = null;
  private current_language: string = "plaintext";
  private is_programmatic_change: boolean = false; // プログラムによる変更かどうか

  /**
   * エディタを初期化
   */
  public initialize(container_id: string): void {
    this.container = document.getElementById(container_id);
    if (!this.container) {
      console.error(`Container with id "${container_id}" not found`);
      return;
    }

    // Monaco Editorが読み込まれるまで待機
    if (typeof monaco === "undefined") {
      console.error("Monaco Editor is not loaded yet. Retrying...");
      setTimeout(() => this.initialize(container_id), 100);
      return;
    }

    console.log("Initializing Monaco Editor...");

    try {
      // Monaco Editorを作成
      this.editor = monaco.editor.create(this.container, {
        value: "",
        language: "plaintext",
        theme: "vs",
        automaticLayout: true,
        fontSize: 14,
        fontFamily: "Consolas, Monaco, 'Courier New', monospace",
        lineNumbers: "on",
        minimap: {
          enabled: true,
        },
        scrollBeyondLastLine: false,
        wordWrap: "off",
        tabSize: 4,
        insertSpaces: false,
        detectIndentation: false,
        folding: true,
        foldingStrategy: "indentation",
        renderLineHighlight: "all",
        selectOnLineNumbers: true,
        roundedSelection: false,
        readOnly: false,
        cursorStyle: "line",
        mouseWheelZoom: true,
        quickSuggestions: {
          other: true,
          comments: true,
          strings: true,
        },
        suggestOnTriggerCharacters: true,
        acceptSuggestionOnCommitCharacter: true,
        acceptSuggestionOnEnter: "on",
        snippetSuggestions: "inline",
      });

      console.log("Monaco Editor initialized successfully");

      // 変更イベントを監視
      this.editor.onDidChangeModelContent(() => {
        // プログラムによる変更の場合はイベントを発火しない
        if (!this.is_programmatic_change) {
          this.onContentChange();
        }
      });

      // ウィンドウリサイズ時にレイアウトを更新
      window.addEventListener("resize", () => {
        this.editor?.layout();
      });
    } catch (error) {
      console.error("Failed to initialize Monaco Editor:", error);
    }
  }

  /**
   * エディタの内容を取得
   */
  public getValue(): string {
    return this.editor?.getValue() ?? "";
  }

  /**
   * エディタの内容を設定
   */
  public setValue(value: string): void {
    if (!this.editor) {
      console.error("Editor is not initialized. Cannot set value.");
      return;
    }
    console.log(`Setting editor value: ${value.substring(0, 50)}...`);

    // プログラムによる変更であることを示す
    this.is_programmatic_change = true;
    this.editor.setValue(value);

    // 少し待ってからフラグをリセット（非同期イベントのため）
    setTimeout(() => {
      this.is_programmatic_change = false;
    }, 0);
  }

  /**
   * 言語モードを設定
   */
  public setLanguage(language: string): void {
    if (!this.editor) {
      console.error("Editor is not initialized. Cannot set language.");
      return;
    }
    console.log(`Setting language to: ${language}`);
    this.current_language = language;
    const model = this.editor.getModel();
    if (model) {
      monaco.editor.setModelLanguage(model, language);
    }
  }

  /**
   * ファイルパスから言語を推測
   */
  public detectLanguageFromPath(file_path: string): string {
    const extension = file_path.split(".").pop()?.toLowerCase() ?? "";

    const language_map: { [key: string]: string } = {
      js: "javascript",
      jsx: "javascript",
      ts: "typescript",
      tsx: "typescript",
      json: "json",
      html: "html",
      htm: "html",
      css: "css",
      scss: "scss",
      sass: "sass",
      less: "less",
      md: "markdown",
      py: "python",
      java: "java",
      c: "c",
      cpp: "cpp",
      h: "c",
      hpp: "cpp",
      cs: "csharp",
      go: "go",
      rs: "rust",
      php: "php",
      rb: "ruby",
      xml: "xml",
      yaml: "yaml",
      yml: "yaml",
      sh: "shell",
      bat: "bat",
      ps1: "powershell",
      sql: "sql",
      txt: "plaintext",
    };

    return language_map[extension] ?? "plaintext";
  }

  /**
   * エディタにフォーカス
   */
  public focus(): void {
    this.editor?.focus();
  }

  /**
   * エディタをクリア
   */
  public clear(): void {
    this.setValue("");
  }

  /**
   * エディタのレイアウトを更新（サイズ変更時など）
   */
  public layout(): void {
    if (!this.editor) {
      console.warn("Editor is not initialized. Cannot update layout.");
      return;
    }
    this.editor.layout();
  }

  /**
   * 指定した行にジャンプ
   */
  public goToLine(line_number: number): void {
    if (!this.editor) {
      console.warn("Editor is not initialized. Cannot go to line.");
      return;
    }

    // 行にジャンプしてカーソルを移動
    this.editor.revealLineInCenter(line_number);
    this.editor.setPosition({ lineNumber: line_number, column: 1 });
  }

  /**
   * 読み取り専用モードを設定
   */
  public setReadOnly(readonly: boolean): void {
    if (!this.editor) return;
    this.editor.updateOptions({ readOnly: readonly });
  }

  /**
   * カーソル位置を取得
   */
  public getCursorPosition(): { line: number; column: number } {
    const position = this.editor?.getPosition();
    return {
      line: position?.lineNumber ?? 1,
      column: position?.column ?? 1,
    };
  }

  /**
   * カーソル位置を設定
   */
  public setCursorPosition(line: number, column: number): void {
    if (!this.editor) return;
    this.editor.setPosition({ lineNumber: line, column });
    this.editor.revealPositionInCenter({ lineNumber: line, column });
  }

  /**
   * テーマを設定
   */
  public setTheme(theme: "vs" | "vs-dark" | "hc-black"): void {
    monaco.editor.setTheme(theme);
  }

  /**
   * エディタの表示/非表示を切り替え
   */
  public show(): void {
    if (this.container) {
      this.container.style.display = "block";
    }
  }

  public hide(): void {
    if (this.container) {
      this.container.style.display = "none";
    }
  }

  /**
   * エディタを破棄
   */
  public dispose(): void {
    this.editor?.dispose();
    this.editor = null;
  }

  /**
   * 内容変更時のコールバック
   */
  private onContentChange(): void {
    // カスタムイベントを発火
    const event = new CustomEvent("editor-content-changed", {
      detail: {
        value: this.getValue(),
        language: this.current_language,
      },
    });
    window.dispatchEvent(event);
  }

  /**
   * エディタインスタンスを取得（高度な操作用）
   */
  public getEditor(): any | null {
    return this.editor;
  }
}
