import { ListItemNode, ListNode } from "@lexical/list";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import LexicalErrorBoundary from "@lexical/react/LexicalErrorBoundary";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { HorizontalRuleNode } from "@lexical/react/LexicalHorizontalRuleNode";
import { HorizontalRulePlugin } from "@lexical/react/LexicalHorizontalRulePlugin";
import { ListPlugin } from "@lexical/react/LexicalListPlugin";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { HeadingNode, QuoteNode } from "@lexical/rich-text";
import { EditorTheme } from "./EditorTheme";
import { ToolbarPlugin } from "./Toolbar";

import {
  LocalStoragePlugin,
  getSavedStateFromLocalStorage,
} from "./plugins/LocalStoragePlugin";

export type BlockType =
  | "paragraph"
  | "h1"
  | "h2"
  | "h3"
  | "bullet"
  | "number"
  | "quote";

export function Editor() {
  const initialConfig = {
    editorState: getSavedStateFromLocalStorage(),
    namespace: "rich-text-editor",
    theme: EditorTheme,
    onError(error: Error) {
      console.log(error);
    },
    nodes: [HeadingNode, ListNode, ListItemNode, QuoteNode, HorizontalRuleNode],
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
        <ListPlugin />
        <LocalStoragePlugin />
      </LexicalComposer>
    </div>
  );
}
