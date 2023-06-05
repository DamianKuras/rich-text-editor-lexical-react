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

import { useState } from "react";
import { SettingsContext } from "./context/SettingsContext";
import { AutoSavePlugin } from "./plugins/AutoSavePlugin";
import {
  LocalStoragePlugin,
  SAVE_TO_LOCAL_STORAGE,
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
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(false);
  const [autoSaveInterval, setAutoSaveInterval] = useState(3);
  return (
    <div className="w-full max-w-5xl mx-auto">
      <SettingsContext.Provider
        value={{
          AutoSaveEnabled: autoSaveEnabled,
          AutoSaveInterval: autoSaveInterval,
          setAutoSaveEnabled,
          setAutoSaveInterval,
        }}
      >
        <LexicalComposer initialConfig={initialConfig}>
          <ToolbarPlugin />
          <div className="relative min-h-[200px] bg-editor-background ">
            <RichTextPlugin
              contentEditable={
                <ContentEditable className="px-8 py-8 text-editor-text focus:outline-none" />
              }
              placeholder={
                <div className="absolute pointer-events-none select-none text-disabled left-8 top-8">
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
          <AutoSavePlugin
            SaveCommand={SAVE_TO_LOCAL_STORAGE}
            AutoSaveEnabled={autoSaveEnabled}
            AutoSaveInterval={autoSaveInterval}
          />
        </LexicalComposer>
      </SettingsContext.Provider>
    </div>
  );
}
