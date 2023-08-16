import { CodeHighlightNode, CodeNode } from "@lexical/code";
import { LinkNode } from "@lexical/link";
import { ListItemNode, ListNode } from "@lexical/list";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import LexicalErrorBoundary from "@lexical/react/LexicalErrorBoundary";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { HorizontalRuleNode } from "@lexical/react/LexicalHorizontalRuleNode";
import { HorizontalRulePlugin } from "@lexical/react/LexicalHorizontalRulePlugin";
import { ListPlugin } from "@lexical/react/LexicalListPlugin";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { TabIndentationPlugin } from "@lexical/react/LexicalTabIndentationPlugin";
import { HeadingNode, QuoteNode } from "@lexical/rich-text";
import { useState } from "react";
import { IconContext } from "react-icons";
import { EditorTheme } from "./EditorTheme";
import { ToolbarPlugin } from "./Toolbar";
import { SettingsContext } from "./context/SettingsContext";
import { AutoSavePlugin } from "./plugins/AutoSavePlugin";
import CodeHighlightPlugin from "./plugins/CodeHighlightPlugin";
import FloatingLinkEditorPlugin from "./plugins/FloatingLinkEditorPlugin";
import LinkPlugin from "./plugins/LinkPlugin";
import {
  LocalStoragePlugin,
  SAVE_TO_LOCAL_STORAGE,
  getSavedStateFromLocalStorage,
} from "./plugins/LocalStoragePlugin";
import { ShowHtmlPlugin } from "./plugins/ShowHtmlPlugin";

export type BlockType =
  | "paragraph"
  | "h1"
  | "h2"
  | "h3"
  | "bullet"
  | "number"
  | "quote"
  | "code";

export function Editor() {
  const initialConfig = {
    editorState: getSavedStateFromLocalStorage(),
    namespace: "rich-text-editor",
    theme: EditorTheme,
    onError(error: Error) {
      console.log(error);
    },
    nodes: [
      HeadingNode,
      ListNode,
      ListItemNode,
      QuoteNode,
      HorizontalRuleNode,
      CodeHighlightNode,
      CodeNode,
      LinkNode,
    ],
  };

  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);
  const [autoSaveInterval, setAutoSaveInterval] = useState(3000);

  return (
    <div className="mx-auto w-full max-w-5xl">
      <SettingsContext.Provider
        value={{
          autoSaveEnabled: autoSaveEnabled,
          autoSaveInterval: autoSaveInterval,
          setAutoSaveEnabled,
          setAutoSaveInterval,
        }}
      >
        <LexicalComposer initialConfig={initialConfig}>
          <div className="sticky top-0 z-10 flex justify-between bg-gray-500 p-1">
            <IconContext.Provider
              value={{
                className: "text-white-600 w-4 h-4 inline-block",
              }}
            >
              <div className="flex max-w-full overflow-auto">
                <ToolbarPlugin />
                <ShowHtmlPlugin />
              </div>
            </IconContext.Provider>
          </div>
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
          <HorizontalRulePlugin />
          <LinkPlugin />

          <FloatingLinkEditorPlugin />
          <ListPlugin />
          <LocalStoragePlugin />
          <CodeHighlightPlugin />
          <TabIndentationPlugin />
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
