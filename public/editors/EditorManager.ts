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
   * C/C++言語の設定
   */
  private configureCppLanguage(): void {
    // C言語の補完プロバイダーを登録
    monaco.languages.registerCompletionItemProvider("c", {
      provideCompletionItems: (model, position) => {
        const suggestions = this.getCppSuggestions();
        return { suggestions };
      },
    });

    // C++言語の補完プロバイダーを登録
    monaco.languages.registerCompletionItemProvider("cpp", {
      provideCompletionItems: (model, position) => {
        const suggestions = this.getCppSuggestions();
        return { suggestions };
      },
    });

    console.log("C/C++ language support configured");
  }

  /**
   * C/C++の補完候補を取得
   */
  private getCppSuggestions(): any[] {
    const keywords = [
      "auto",
      "break",
      "case",
      "char",
      "const",
      "continue",
      "default",
      "do",
      "double",
      "else",
      "enum",
      "extern",
      "float",
      "for",
      "goto",
      "if",
      "int",
      "long",
      "register",
      "return",
      "short",
      "signed",
      "sizeof",
      "static",
      "struct",
      "switch",
      "typedef",
      "union",
      "unsigned",
      "void",
      "volatile",
      "while",
      "class",
      "namespace",
      "template",
      "typename",
      "public",
      "private",
      "protected",
      "virtual",
      "override",
      "final",
      "try",
      "catch",
      "throw",
      "new",
      "delete",
      "this",
      "nullptr",
      "constexpr",
      "decltype",
      "noexcept",
      "explicit",
      "inline",
      "friend",
      "operator",
      "bool",
      "true",
      "false",
    ];

    const standardFunctions = [
      "printf",
      "scanf",
      "malloc",
      "free",
      "calloc",
      "realloc",
      "memcpy",
      "memset",
      "strlen",
      "strcpy",
      "strcmp",
      "strcat",
      "fopen",
      "fclose",
      "fread",
      "fwrite",
      "fprintf",
      "fscanf",
      "cout",
      "cin",
      "endl",
      "vector",
      "string",
      "map",
      "set",
      "list",
      "queue",
      "stack",
      "pair",
      "make_pair",
    ];

    const suggestions: any[] = [];

    // キーワードの補完
    keywords.forEach((keyword) => {
      suggestions.push({
        label: keyword,
        kind: monaco.languages.CompletionItemKind.Keyword,
        insertText: keyword,
        detail: "C/C++ keyword",
      });
    });

    // 標準関数の補完
    standardFunctions.forEach((func) => {
      suggestions.push({
        label: func,
        kind: monaco.languages.CompletionItemKind.Function,
        insertText: func,
        detail: "Standard function",
      });
    });

    // よく使うスニペット
    suggestions.push(
      {
        label: "main",
        kind: monaco.languages.CompletionItemKind.Snippet,
        insertText:
          "int main(int argc, char *argv[]) {\n\t${1}\n\treturn 0;\n}",
        insertTextRules:
          monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
        detail: "Main function",
        documentation: "Create a main function",
      },
      {
        label: "for",
        kind: monaco.languages.CompletionItemKind.Snippet,
        insertText:
          "for (int ${1:i} = 0; ${1:i} < ${2:n}; ${1:i}++) {\n\t${3}\n}",
        insertTextRules:
          monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
        detail: "For loop",
        documentation: "Create a for loop",
      },
      {
        label: "if",
        kind: monaco.languages.CompletionItemKind.Snippet,
        insertText: "if (${1:condition}) {\n\t${2}\n}",
        insertTextRules:
          monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
        detail: "If statement",
        documentation: "Create an if statement",
      },
      {
        label: "while",
        kind: monaco.languages.CompletionItemKind.Snippet,
        insertText: "while (${1:condition}) {\n\t${2}\n}",
        insertTextRules:
          monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
        detail: "While loop",
        documentation: "Create a while loop",
      },
      {
        label: "struct",
        kind: monaco.languages.CompletionItemKind.Snippet,
        insertText: "struct ${1:Name} {\n\t${2}\n};",
        insertTextRules:
          monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
        detail: "Struct definition",
        documentation: "Create a struct",
      },
      {
        label: "include",
        kind: monaco.languages.CompletionItemKind.Snippet,
        insertText: "#include <${1:stdio.h}>",
        insertTextRules:
          monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
        detail: "Include header",
        documentation: "Include a header file",
      }
    );

    return suggestions;
  }

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
      // C/C++言語のキーワードと型を定義
      this.configureCppLanguage();

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
   * エディタのオプションを更新
   */
  public updateOptions(options: any): void {
    if (!this.editor) {
      console.warn("Editor is not initialized. Cannot update options.");
      return;
    }
    this.editor.updateOptions(options);
    console.log("Editor options updated:", options);
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
