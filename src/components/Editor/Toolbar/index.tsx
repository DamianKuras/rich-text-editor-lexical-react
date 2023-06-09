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
import { IconContext } from "react-icons";
import { BsFileEarmarkCode } from "react-icons/bs";
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
import { TOGGLE_HTML_VISIBILITY_COMMAND } from "../plugins/ShowHtml";
import { ToolbarButton } from "../ui/ToolbarButton";
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
        setActiveEditor(newEditor);
        return false;
      },
      COMMAND_PRIORITY_CRITICAL
    );
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
    editor.dispatchCommand(INDENT_CONTENT_COMMAND, undefined);
  };

  const handleOutdent = () => {
    editor.dispatchCommand(OUTDENT_CONTENT_COMMAND, undefined);
  };

  const handleFormatText = (format: TextFormatType) => {
    activeEditor.dispatchCommand(FORMAT_TEXT_COMMAND, format);
  };

  const handleInsertHorizontalRule = () => {
    editor.dispatchCommand(INSERT_HORIZONTAL_RULE_COMMAND, undefined);
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
    <div className="sticky top-0 z-10 flex justify-between bg-toolbar-background p-1">
      <IconContext.Provider
        value={{
          className: "text-toolbar-text w-4 h-4 inline-block",
        }}
      >
        <div className="flex">
          <div className="border-r px-2">
            <SettingsDropdown />
          </div>

          <div className="border-r px-2">
            <ToolbarButton
              title="Undo (Ctrl+z)"
              disabled={!canUndo}
              onClick={handleUndo}
            >
              <FaUndo />
            </ToolbarButton>
            <ToolbarButton
              title="Redo (Ctrl+y)"
              disabled={!canRedo}
              onClick={handleRedo}
            >
              <FaRedo />
            </ToolbarButton>
          </div>
          {activeEditor === editor && (
            <div className="flex min-w-[8em] justify-center border-r px-1">
              <div className="my-auto">
                <BlockFormatSelect
                  editor={editor}
                  selectedBlockType={selectedBlockType}
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

          <div className="border-r px-2">
            <ToolbarButton
              title="Align left"
              className="mr-1"
              onClick={() => handleFormatElement("left")}
            >
              <FaAlignLeft />
            </ToolbarButton>
            <ToolbarButton
              title="Align center"
              className="mr-1"
              onClick={() => handleFormatElement("center")}
            >
              <FaAlignCenter />
            </ToolbarButton>
            <ToolbarButton
              title="Align right"
              className="mr-1"
              onClick={() => handleFormatElement("right")}
            >
              <FaAlignRight />
            </ToolbarButton>
            <ToolbarButton
              title="Align justify"
              onClick={() => handleFormatElement("justify")}
            >
              <FaAlignJustify />
            </ToolbarButton>
            <ToolbarButton
              title="Indent"
              onClick={() => handleIndent()}
            >
              <FaIndent />
            </ToolbarButton>
            <ToolbarButton
              title="Outdent"
              onClick={() => handleOutdent()}
            >
              <FaOutdent />
            </ToolbarButton>
          </div>
          {(selectedBlockType === "paragraph" ||
            selectedBlockType === "h1" ||
            selectedBlockType === "h2" ||
            selectedBlockType === "h3" ||
            selectedBlockType === "bullet" ||
            selectedBlockType === "number" ||
            selectedBlockType === "quote") && (
            <>
              <div className="border-r px-2">
                <ToolbarButton
                  title="Bold"
                  clicked={isBold}
                  onClick={() => handleFormatText("bold")}
                >
                  <FaBold />
                </ToolbarButton>
                <ToolbarButton
                  title="Italic"
                  clicked={isItalic}
                  onClick={() => handleFormatText("italic")}
                >
                  <FaItalic />
                </ToolbarButton>
                <ToolbarButton
                  title="Underline"
                  clicked={isUnderline}
                  onClick={() => handleFormatText("underline")}
                >
                  <FaUnderline />
                </ToolbarButton>
                <ToolbarButton
                  title="Link"
                  clicked={isLink}
                  onClick={() => handleToggleLink()}
                >
                  <FaLink />
                </ToolbarButton>
                <ToolbarButton
                  title="striketrough"
                  clicked={isStrikethrough}
                  onClick={() => handleFormatText("strikethrough")}
                >
                  <FaStrikethrough />
                </ToolbarButton>
                <ToolbarButton
                  title="Subscript"
                  clicked={isSubscript}
                  onClick={() => handleFormatText("subscript")}
                >
                  <FaSubscript />
                </ToolbarButton>
                <ToolbarButton
                  title="Superscript"
                  clicked={isSuperscript}
                  onClick={() => handleFormatText("superscript")}
                >
                  <FaSuperscript />
                </ToolbarButton>
              </div>
              <div className="flex px-2">
                <ToolbarButton
                  title="Insert horizontal rule"
                  onClick={() => handleInsertHorizontalRule()}
                >
                  <MdInsertPageBreak />
                </ToolbarButton>
                <ToolbarButton
                  title="show/hide html"
                  onClick={() => {
                    editor.dispatchCommand(
                      TOGGLE_HTML_VISIBILITY_COMMAND,
                      undefined
                    );
                  }}
                >
                  <BsFileEarmarkCode />
                </ToolbarButton>
              </div>
            </>
          )}
        </div>

        <div className="inline-flex items-center justify-center">
          <ToolbarButton
            onClick={() => handleSaveToLocalStorage()}
            title="Save to local storage"
          >
            <FaSave />
          </ToolbarButton>
          <div
            className={saveStatus.style + " h-2 w-2 rounded-full"}
            title={saveStatus.message}
          ></div>
        </div>
      </IconContext.Provider>
    </div>
  );
}
