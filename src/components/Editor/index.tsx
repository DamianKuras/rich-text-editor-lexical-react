import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import LexicalErrorBoundary from "@lexical/react/LexicalErrorBoundary";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { HorizontalRuleNode } from "@lexical/react/LexicalHorizontalRuleNode";
import { HorizontalRulePlugin } from "@lexical/react/LexicalHorizontalRulePlugin";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { EditorTheme } from "./EditorTheme";
import {
  getSavedStateFromLocalStorage,
  LocalStoragePlugin,
} from "./plugins/LocalStoragePlugin";
import { ToolbarPlugin } from "./Toolbar";

export function Editor() {
  const initialConfig = {
    editorState: getSavedStateFromLocalStorage(),
    namespace: "rich-text-editor",
    theme: EditorTheme,
    onError(error: Error) {
      console.log(error);
    },
    nodes: [HorizontalRuleNode],
  };

  return (
    <div className="mx-auto w-full max-w-5xl">
      <LexicalComposer initialConfig={initialConfig}>
        <ToolbarPlugin />
        <div className="relative min-h-[200px] bg-editor-background ">
          <RichTextPlugin
            contentEditable={
              <ContentEditable className="px-8 py-8 text-editor-text focus:outline-none" />
            }
            placeholder={
              <div className="text-disabled pointer-events-none absolute left-8 top-8 select-none">
                Enter some text...
              </div>
            }
            ErrorBoundary={LexicalErrorBoundary}
          />
        </div>

        <HistoryPlugin />
        <HorizontalRulePlugin />
        <LocalStoragePlugin />
      </LexicalComposer>
    </div>
  );
}
