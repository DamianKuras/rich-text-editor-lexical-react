import { $isCodeNode, CODE_LANGUAGE_MAP } from "@lexical/code";
import { $isLinkNode, TOGGLE_LINK_COMMAND } from "@lexical/link";
import { $isListNode, ListNode } from "@lexical/list";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { INSERT_HORIZONTAL_RULE_COMMAND } from "@lexical/react/LexicalHorizontalRuleNode";
import { $isHeadingNode } from "@lexical/rich-text";
import {
  $findMatchingParent,
  $getNearestNodeOfType,
  mergeRegister,
} from "@lexical/utils";
import {
  $getNodeByKey,
  $getSelection,
  $isRangeSelection,
  $isRootOrShadowRoot,
  CAN_REDO_COMMAND,
  CAN_UNDO_COMMAND,
  COMMAND_PRIORITY_CRITICAL,
  ElementFormatType,
  FORMAT_ELEMENT_COMMAND,
  FORMAT_TEXT_COMMAND,
  INDENT_CONTENT_COMMAND,
  NodeKey,
  OUTDENT_CONTENT_COMMAND,
  REDO_COMMAND,
  SELECTION_CHANGE_COMMAND,
  TextFormatType,
  UNDO_COMMAND,
} from "lexical";
import { useCallback, useEffect, useState } from "react";
import {
  FaAlignCenter,
  FaAlignJustify,
  FaAlignLeft,
  FaAlignRight,
  FaBold,
  FaIndent,
  FaItalic,
  FaLevelDownAlt,
  FaLevelUpAlt,
  FaLink,
  FaOutdent,
  FaRedo,
  FaStrikethrough,
  FaSubscript,
  FaSuperscript,
  FaUnderline,
  FaUndo,
} from "react-icons/fa";
import { MdInsertPageBreak } from "react-icons/md";
import { BlockType } from "../index";
import { TooltipButton } from "../ui/TooltipButton";
import { TooltipToggleButton } from "../ui/TooltipToggleButton";
import {
  InsertParagraphAfterElement,
  InsertParagraphBeforeElement,
} from "../utils/InsertParagraph";
import { getSelectedNode } from "../utils/getSelectedNode";
import { sanitizeUrl } from "../utils/url";
import { BlockFormatSelect } from "./BlockFormatSelect";
import { CodeLanguageSelect } from "./CodeLanguageSelect";

export function ToolbarPlugin(): JSX.Element {
  const [editor] = useLexicalComposerContext();
  const [activeEditor, setActiveEditor] = useState(editor);
  // const [saveStatus, setSaveStatus] = useState({
  //   style: "bg-green-500",
  //   message: "Saved to local storage",
  // });
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const [selectedElementKey, setSelectedElementKey] = useState<NodeKey | null>(
    null
  );
  const [isLink, setIsLink] = useState(false);
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [isStrikethrough, setIsStrikethrough] = useState(false);
  const [isSubscript, setIsSubscript] = useState(false);
  const [isSuperscript, setIsSuperscript] = useState(false);
  const [codeLanguage, setCodeLanguage] = useState<string>("");
  const [selectedBlockType, setSelectedBlockType] =
    useState<BlockType>("paragraph");

  const updateToolbarSelections = useCallback(() => {
    const selection = $getSelection();
    if ($isRangeSelection(selection)) {
      const anchorNode = selection.anchor.getNode();
      let element =
        anchorNode.getKey() === "root"
          ? anchorNode
          : $findMatchingParent(anchorNode, (e) => {
              const parent = e.getParent();
              return parent !== null && $isRootOrShadowRoot(parent);
            });

      if (element === null) {
        element = anchorNode.getTopLevelElementOrThrow();
      }

      const elementKey = element.getKey();
      const elementDOM = activeEditor.getElementByKey(elementKey);
      if (elementDOM !== null) {
        setSelectedElementKey(elementKey);
        if ($isListNode(element)) {
          const parentList = $getNearestNodeOfType<ListNode>(
            anchorNode,
            ListNode
          );
          const type = parentList
            ? parentList.getListType()
            : element.getListType();
          setSelectedBlockType(type as BlockType);
        } else {
          const type = $isHeadingNode(element)
            ? element.getTag()
            : element.getType();
          if (type) {
            setSelectedBlockType(type);
          }
        }
        if ($isCodeNode(element)) {
          const language =
            element.getLanguage() as keyof typeof CODE_LANGUAGE_MAP;
          setCodeLanguage(
            language ? CODE_LANGUAGE_MAP[language] || language : ""
          );
          return;
        }
      }
      setIsBold(selection.hasFormat("bold"));
      setIsItalic(selection.hasFormat("italic"));
      setIsUnderline(selection.hasFormat("underline"));
      setIsStrikethrough(selection.hasFormat("strikethrough"));
      setIsSubscript(selection.hasFormat("subscript"));
      setIsSuperscript(selection.hasFormat("superscript"));

      const node = getSelectedNode(selection);
      const parent = node.getParent();
      if ($isLinkNode(parent) || $isLinkNode(node)) {
        setIsLink(true);
      } else {
        setIsLink(false);
      }
    }
  }, [activeEditor]);

  useEffect(() => {
    return editor.registerCommand(
      SELECTION_CHANGE_COMMAND,
      (_payload, newEditor) => {
        updateToolbarSelections();
        if (activeEditor !== newEditor) {
          setActiveEditor(newEditor);
        }
        return false;
      },
      COMMAND_PRIORITY_CRITICAL
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editor, updateToolbarSelections]);

  useEffect(() => {
    return mergeRegister(
      activeEditor.registerCommand<boolean>(
        CAN_UNDO_COMMAND,
        (payload) => {
          setCanUndo(payload);
          return false;
        },
        COMMAND_PRIORITY_CRITICAL
      ),
      activeEditor.registerCommand<boolean>(
        CAN_REDO_COMMAND,
        (payload) => {
          setCanRedo(payload);
          return false;
        },
        COMMAND_PRIORITY_CRITICAL
      )
    );
  }, [activeEditor]);

  useEffect(() => {
    activeEditor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => {
        updateToolbarSelections();
      });
    });
  }, [activeEditor, updateToolbarSelections]);

  const handleUndo = () => {
    activeEditor.dispatchCommand(UNDO_COMMAND, undefined);
  };

  const handleRedo = () => {
    activeEditor.dispatchCommand(REDO_COMMAND, undefined);
  };

  const handleFormatElement = (element: ElementFormatType) => {
    activeEditor.dispatchCommand(FORMAT_ELEMENT_COMMAND, element);
  };

  const handleCodeLangugeChange = useCallback(
    (value: string) => {
      editor.update(() => {
        if (selectedElementKey !== null) {
          const node = $getNodeByKey(selectedElementKey);
          if ($isCodeNode(node)) {
            node.setLanguage(value);
          }
        }
      });
    },
    [editor, selectedElementKey]
  );

  const handleIndent = () => {
    activeEditor.dispatchCommand(INDENT_CONTENT_COMMAND, undefined);
  };

  const handleOutdent = () => {
    activeEditor.dispatchCommand(OUTDENT_CONTENT_COMMAND, undefined);
  };

  const handleFormatText = (format: TextFormatType) => {
    activeEditor.dispatchCommand(FORMAT_TEXT_COMMAND, format);
  };

  const handleInsertHorizontalRule = () => {
    activeEditor.dispatchCommand(INSERT_HORIZONTAL_RULE_COMMAND, undefined);
  };

  const handleToggleLink = useCallback(() => {
    if (!isLink) {
      activeEditor.dispatchCommand(
        TOGGLE_LINK_COMMAND,
        sanitizeUrl("https://")
      );
    } else {
      activeEditor.dispatchCommand(TOGGLE_LINK_COMMAND, null);
    }
  }, [activeEditor, isLink]);

  return (
      <div className="flex">
        <div className="flex border-r px-2">
          <TooltipButton
            tooltipMessage="Undo (Ctrl+z)"
            disabled={!canUndo}
            onPress={handleUndo}
          >
            <FaUndo />
          </TooltipButton>

          <TooltipButton
            tooltipMessage="Redo (Ctrl+y)"
            disabled={!canRedo}
            onPress={handleRedo}
          >
            <FaRedo />
          </TooltipButton>
        </div>
        {activeEditor === editor && (
          <div className="flex min-w-[8em] justify-center border-r px-1">
            <div className="my-auto">
              <BlockFormatSelect
                activeEditor={activeEditor}
                selectedBlockType={selectedBlockType}
                setSelectedBlockType={setSelectedBlockType}
              />
            </div>
          </div>
        )}

        {selectedBlockType === "code" && (
          <div className="flex min-w-[8em] justify-center border-r px-1">
            <div className="my-auto">
              <CodeLanguageSelect
                onCodeLanguageChange={handleCodeLangugeChange}
                selectedCodeLanguage={codeLanguage}
              />
            </div>
          </div>
        )}

        <div className="flex border-r px-2">
          <TooltipButton
            tooltipMessage="Align left"
            onPress={() => handleFormatElement("left")}
          >
            <FaAlignLeft />
          </TooltipButton>

          <TooltipButton
            tooltipMessage="Align center"
            onPress={() => handleFormatElement("center")}
          >
            <FaAlignCenter />
          </TooltipButton>

          <TooltipButton
            tooltipMessage="Align right"
            onPress={() => handleFormatElement("right")}
          >
            <FaAlignRight />
          </TooltipButton>

          <TooltipButton
            tooltipMessage="Align justify"
            onPress={() => handleFormatElement("justify")}
          >
            <FaAlignJustify />
          </TooltipButton>

          <TooltipButton
            tooltipMessage="Indent"
            onPress={() => handleIndent()}
          >
            <FaIndent />
          </TooltipButton>

          <TooltipButton
            tooltipMessage="Outdent"
            onPress={() => handleOutdent()}
          >
            <FaOutdent />
          </TooltipButton>
        </div>
        {(selectedBlockType === "paragraph" ||
          selectedBlockType === "h1" ||
          selectedBlockType === "h2" ||
          selectedBlockType === "h3" ||
          selectedBlockType === "bullet" ||
          selectedBlockType === "number" ||
          selectedBlockType === "quote") && (
          <>
            <div className="flex border-r px-2">
              <TooltipToggleButton
                tooltipMessage="Bold"
                selected={isBold}
                onPress={() => {
                  handleFormatText("bold");
                }}
              >
                <FaBold />
              </TooltipToggleButton>

              <TooltipToggleButton
                tooltipMessage="Italic"
                selected={isItalic}
                onPress={() => handleFormatText("italic")}
              >
                <FaItalic />
              </TooltipToggleButton>

              <TooltipToggleButton
                tooltipMessage="Underline"
                selected={isUnderline}
                onPress={() => handleFormatText("underline")}
              >
                <FaUnderline />
              </TooltipToggleButton>

              <TooltipToggleButton
                tooltipMessage="Link"
                selected={isLink}
                onPress={() => handleToggleLink()}
              >
                <FaLink />
              </TooltipToggleButton>

              <TooltipToggleButton
                tooltipMessage="striketrough"
                selected={isStrikethrough}
                onPress={() => handleFormatText("strikethrough")}
              >
                <FaStrikethrough />
              </TooltipToggleButton>

              <TooltipToggleButton
                tooltipMessage="Subscript"
                selected={isSubscript}
                onPress={() => handleFormatText("subscript")}
              >
                <FaSubscript />
              </TooltipToggleButton>

              <TooltipToggleButton
                tooltipMessage="Superscript"
                selected={isSuperscript}
                onPress={() => handleFormatText("superscript")}
              >
                <FaSuperscript />
              </TooltipToggleButton>
            </div>
            <div className="flex pl-2">
              <TooltipButton
                tooltipMessage="Insert horizontal rule"
                onPress={() => handleInsertHorizontalRule()}
              >
                <MdInsertPageBreak />
              </TooltipButton>
              <TooltipButton
                tooltipMessage="Insert paragraph before"
                onPress={() => {
                  InsertParagraphBeforeElement(editor);
                }}
              >
                <FaLevelUpAlt />
              </TooltipButton>
              <TooltipButton
                tooltipMessage="Insert paragraph after"
                onPress={() => {
                  InsertParagraphAfterElement(editor);
                }}
              >
                <FaLevelDownAlt />
              </TooltipButton>
            </div>
          </>
        )}
      </div>
  );
}
