import { $generateHtmlFromNodes } from "@lexical/html";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
  COMMAND_PRIORITY_NORMAL,
  EditorState,
  LexicalCommand,
  createCommand,
} from "lexical";
import { useCallback, useEffect, useRef, useState } from "react";
import { BiCheck, BiClipboard, BiHide, BiRefresh } from "react-icons/bi";
import { TooltipButton } from "../ui/TooltipButton";

export const TOGGLE_HTML_VISIBILITY_COMMAND: LexicalCommand<void> =
  createCommand();

function printPrettyHTML(str: string) {
  const div = document.createElement("div");
  div.innerHTML = str.trim();
  return prettifyHTML(div, 0).innerHTML;
}

function prettifyHTML(node: Element, level: number) {
  const indentBefore = new Array(level + 1).join("  ");
  const indentAfter = new Array(level).join("  ");
  let textNode;

  for (let i = 0; i < node.children.length; i++) {
    textNode = document.createTextNode("\n" + indentBefore);
    node.insertBefore(textNode, node.children[i]);
    prettifyHTML(node.children[i], level + 1);
    if (node.lastElementChild === node.children[i]) {
      textNode = document.createTextNode("\n" + indentAfter);
      node.appendChild(textNode);
    }
  }

  return node;
}

function ScrollIntoViewIfNeeded({
  isVisible,
  children,
}: {
  isVisible: boolean;
  children: React.ReactNode;
}) {
  const returnElementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (returnElementRef.current && isVisible) {
      returnElementRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [isVisible]);

  return <div ref={returnElementRef}>{children}</div>;
}

export function ShowHtml() {
  const [editor] = useLexicalComposerContext();
  const [htmlContent, setHtmlContent] = useState("");
  const [isVisible, setIsVisible] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  const updateHTML = useCallback(
    (editorState: EditorState) => {
      editorState.read(() => {
        const htmlContent = $generateHtmlFromNodes(editor, null);
        setHtmlContent(printPrettyHTML(htmlContent).trim());
      });
    },
    [editor]
  );

  useEffect(() => {
    const toggleVisibility = () => {
      if (isVisible === true) {
        setIsVisible(false);
      } else {
        updateHTML(editor.getEditorState());
        setIsVisible(true);
      }
      return true;
    };

    return editor.registerCommand(
      TOGGLE_HTML_VISIBILITY_COMMAND,
      toggleVisibility,
      COMMAND_PRIORITY_NORMAL
    );
  }, [editor, isVisible, updateHTML]);

  const handleHideClick = () => {
    setIsVisible(false);
  };

  const handleUpdateClick = () => {
    updateHTML(editor.getEditorState());
  };

  const handleCopyClick = () => {
    navigator.clipboard.writeText(htmlContent).then(() => {
      setIsCopied(true);
      setTimeout(() => {
        setIsCopied(false);
      }, 1500);
    });
  };

  return (
    <div className="relative mt-4 bg-editor-background">
      {isVisible && (
        <ScrollIntoViewIfNeeded isVisible={isVisible}>
          <div className="absolute right-0 top-0 flex bg-toolbar-background px-2 py-1">
            <TooltipButton
              tooltipMessage="Hide html"
              onPress={handleHideClick}
              className="text-toolbar-text"
            >
              <span className="mr-2 flex items-center gap-1">
                <BiHide /> Hide
              </span>
            </TooltipButton>
            <TooltipButton
              tooltipMessage="Update html"
              onPress={handleUpdateClick}
              className="text-toolbar-text"
            >
              <span className="mr-2 flex items-center gap-1">
                <BiRefresh /> Update
              </span>
            </TooltipButton>
            <TooltipButton
              tooltipMessage="Copy html"
              onPress={handleCopyClick}
              className="text-toolbar-text"
            >
              <span className="flex items-center gap-1">
                {isCopied ? <BiCheck /> : <BiClipboard />} Copy to clipboard
              </span>
            </TooltipButton>
          </div>
          <div className="mb-4 max-h-96 overflow-y-scroll">
            <pre className="whitespace-pre-wrap p-4 text-editor-text">
              {htmlContent}
            </pre>
          </div>
        </ScrollIntoViewIfNeeded>
      )}
    </div>
  );
}
