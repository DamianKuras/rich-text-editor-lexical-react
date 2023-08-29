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
import { IconContext } from "react-icons";
import { EditorTheme } from "./EditorTheme";
import { ToolbarPlugin } from "./Toolbar";
import { SettingsPopover } from "./Toolbar/SettingsPopover";
import { useSettingsContext } from "./context/SettingsContext";
import CodeHighlightPlugin from "./plugins/CodeHighlightPlugin";
import FloatingLinkEditorPlugin from "./plugins/FloatingLinkEditorPlugin";
import LinkPlugin from "./plugins/LinkPlugin";
import { FindAndReplacePlugin } from "./plugins/FindAndReplacePlugin";
import { ShowHtmlPlugin } from "./plugins/ShowHtmlPlugin";
import LocalStorage from "./plugins/StoragePlugin/LocalStorage";
import StoragePlugin from "./plugins/StoragePlugin/StoragePlugin";

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
    namespace: "rich-text-editor",
    theme: EditorTheme,
    onError(error: Error) {
      // eslint-disable-next-line no-console
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

  const { spellcheck } = useSettingsContext();
  const storage = new LocalStorage();

  return (
    <div className="mx-auto w-full max-w-5xl">
      <LexicalComposer initialConfig={initialConfig}>
        <div className="sticky top-0 z-10 flex justify-between bg-gray-500 p-1">
          <IconContext.Provider
            value={{
              className: "text-white-600 w-4 h-4 inline-block",
            }}
          >
            <div className="flex max-w-full overflow-auto">
              <div className="flex border-r px-2">
                <SettingsPopover />
              </div>
              <StoragePlugin storage={storage} />
              <ToolbarPlugin />
              <FindAndReplacePlugin />
              <ShowHtmlPlugin />
            </div>
          </IconContext.Provider>
        </div>
        <div className="relative bg-gray-700">
          <RichTextPlugin
            contentEditable={
              <div
                className="relative z-0 flex w-full resize-y overflow-auto"
                id="editor"
              >
                <ContentEditable
                  className="w-full px-8 py-8 text-gray-100 focus:outline-none "
                  spellCheck={spellcheck}
                />
              </div>
            }
            placeholder={
              <div className="pointer-events-none absolute left-8 top-8 select-none text-gray-300">
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
        <CodeHighlightPlugin />
        <TabIndentationPlugin />
      </LexicalComposer>
    </div>
  );
}
