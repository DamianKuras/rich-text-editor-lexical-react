import { $generateHtmlFromNodes } from "@lexical/html";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { EditorState } from "lexical";
import { useCallback, useState } from "react";
import {
  Dialog,
  DialogTrigger,
  Heading,
  Modal,
  ModalOverlay,
} from "react-aria-components";
import { BiCheck } from "react-icons/bi";
import { FaCopy, FaFileCode } from "react-icons/fa";
import { VscChromeClose } from "react-icons/vsc";
import { TooltipButton } from "../ui/TooltipButton";

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

export function ShowHtmlPlugin() {
  const [editor] = useLexicalComposerContext();
  const [htmlContent, setHtmlContent] = useState("");
  const [isCopied, setIsCopied] = useState(false);
  const [isOpen, setOpen] = useState(false);
  const updateHTML = useCallback(
    (editorState: EditorState) => {
      editorState.read(() => {
        const htmlContent = $generateHtmlFromNodes(editor, null);
        setHtmlContent(printPrettyHTML(htmlContent).trim());
      });
    },
    [editor]
  );

  const handleCopyClick = () => {
    navigator.clipboard.writeText(htmlContent).then(() => {
      setIsCopied(true);
      setTimeout(() => {
        setIsCopied(false);
      }, 1500);
    });
  };

  function handleOpen() {
    updateHTML(editor.getEditorState());
    setOpen(true);
  }

  return (
    <DialogTrigger>
      <TooltipButton
        tooltipMessage="Show HTML"
        onPress={handleOpen}
        className="mr-2"
      >
        <FaFileCode />
      </TooltipButton>
      <ModalOverlay
        isDismissable={true}
        className="react-aria-ModalOverlay fixed left-0 top-0 z-50 flex h-screen w-screen items-center justify-center bg-slate-500 bg-opacity-80"
      >
        <Modal
          isOpen={isOpen}
          onOpenChange={setOpen}
          className="react-aria-Modal "
        >
          <Dialog className="z-50 mx-auto my-auto max-h-[80vh] min-w-[30em] max-w-[80vw] overflow-auto bg-page-background">
            {({ close }) => (
              <>
                <div className="sticky top-0 z-10 flex justify-between bg-toolbar-background p-2">
                  <Heading className="text-3xl text-toolbar-text">Html</Heading>
                  <div className="flex gap-2">
                    {isCopied ? (
                      <div className="flex items-center bg-primary px-2 py-1">
                        <BiCheck />
                      </div>
                    ) : (
                      <TooltipButton
                        tooltipMessage="Copy to clipboard"
                        onPress={handleCopyClick}
                        className="hover:bg-primary-hover bg-primary text-toolbar-text"
                        disabled={isCopied}
                      >
                        <FaCopy />
                      </TooltipButton>
                    )}
                    <TooltipButton
                      tooltipMessage="Close overlay"
                      onPress={close}
                      className="bg-error  text-toolbar-text"
                    >
                      <VscChromeClose />
                    </TooltipButton>
                  </div>
                </div>

                <div className="bg-editor-background ">
                  <pre className="whitespace-pre-wrap break-all p-4 text-editor-text">
                    {htmlContent}
                  </pre>
                </div>
              </>
            )}
          </Dialog>
        </Modal>
      </ModalOverlay>
    </DialogTrigger>
  );
}
