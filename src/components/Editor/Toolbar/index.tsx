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
  COMMAND_PRIORITY_LOW,
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
import { useCallback, useEffect, useLayoutEffect, useState } from "react";
import {
  FaAlignCenter,
  FaAlignJustify,
  FaAlignLeft,
  FaAlignRight,
  FaBold,
  FaIndent,
  FaItalic,
  FaLink,
  FaOutdent,
  FaRedo,
  FaSave,
  FaStrikethrough,
  FaSubscript,
  FaSuperscript,
  FaUnderline,
  FaUndo,
} from "react-icons/fa";
import { MdInsertPageBreak } from "react-icons/md";
import { BlockType } from "../index";
import {
  FAILED_TO_SAVE_TO_LOCAL_STORAGE,
  LOCAL_STORAGE_SAVE_STATUS,
  SAVED_SUCCESSFULLY_TO_LOCAL_STORAGE,
  SAVE_TO_LOCAL_STORAGE,
} from "../plugins/LocalStoragePlugin";

import { TooltipButton } from "../ui/TooltipButton";
import { TooltipToggleButton } from "../ui/TooltipToggleButton";
import { getSelectedNode } from "../utils/getSelectedNode";
import { sanitizeUrl } from "../utils/url";
import { BlockFormatSelect } from "./BlockFormatSelect";
import { CodeLanguageSelect } from "./CodeLanguageSelect";
import { SettingsDropdown } from "./SettingsDropdown";

export function ToolbarPlugin(): JSX.Element {
  const [editor] = useLexicalComposerContext();
  const [activeEditor, setActiveEditor] = useState(editor);
  const [saveStatus, setSaveStatus] = useState({
    style: "bg-success",
    message: "Saved to local storage",
  });
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
      console.log(selection.hasFormat("bold"));
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

  useLayoutEffect(() => {
    return editor.registerUpdateListener(
      ({ dirtyElements, dirtyLeaves, prevEditorState, tags }) => {
        if (
          (dirtyElements.size === 0 && dirtyLeaves.size === 0) ||
          prevEditorState.isEmpty() ||
          tags.has("history-merge")
        ) {
          return;
        }
        setSaveStatus({
          style: "bg-unsaved",
          message: "Unsaved",
        });
      }
    );
  }, [editor]);

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
    return editor.registerCommand<string>(
      LOCAL_STORAGE_SAVE_STATUS,
      (payload) => {
        if (payload === SAVED_SUCCESSFULLY_TO_LOCAL_STORAGE) {
          setSaveStatus({
            style: "bg-success",
            message: "Saved to local storage",
          });
        }
        if (payload === FAILED_TO_SAVE_TO_LOCAL_STORAGE) {
          setSaveStatus({
            style: "bg-error",
            message:
              "Failed to save to local storage. Check if browser has local storage enabled.",
          });
        }
        return true;
      },
      COMMAND_PRIORITY_LOW
    );
  }, [editor]);

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

  const handleSaveToLocalStorage = () => {
    editor.dispatchCommand(SAVE_TO_LOCAL_STORAGE, undefined);
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
    <div className="flex justify-between ">
      <div className="flex">
        <div className="my-auto border-r px-2">
          <SettingsDropdown />
        </div>

        <div className="flex border-r px-2">
          <TooltipButton
            onPress={() => handleSaveToLocalStorage()}
            tooltipMessage="Save to local storage"
          >
            <FaSave />
          </TooltipButton>
          <div
            className={saveStatus.style + " my-auto h-2 w-2 rounded-full"}
            title={saveStatus.message}
          ></div>
        </div>

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
            </div>
          </>
        )}
      </div>
    </div>
  );
}
