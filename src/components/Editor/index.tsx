import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import LexicalErrorBoundary from "@lexical/react/LexicalErrorBoundary";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";

import { EditorTheme } from "./EditorTheme";
import {
  getSavedStateFromLocalStorage,
  LocalStoragePlugin,
} from "./plugins/LocalStoragePlugin";

export function Editor() {
  const initialConfig = {
    editorState: getSavedStateFromLocalStorage(),
    namespace: "rich-text-editor",
    theme: EditorTheme,
    onError(error: Error) {
      console.log(error);
    },
  };

  return (
    <div className="mx-auto w-full max-w-5xl">
      <LexicalComposer initialConfig={initialConfig}>
        <div className="relative min-h-[200px] bg-editor-background ">
          <RichTextPlugin
            contentEditable={
              <ContentEditable className="px-8 py-8 text-editor-text focus:outline-none" />
            }
            placeholder={
              <div className="pointer-events-none absolute left-8 top-8 select-none text-disabled">
                Enter some text...
              </div>
            }
            ErrorBoundary={LexicalErrorBoundary}
          />
        </div>

        <HistoryPlugin />
        <LocalStoragePlugin />
      </LexicalComposer>
    </div>
  );
}
