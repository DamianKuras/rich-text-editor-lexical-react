/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */
import {
  $isAutoLinkNode,
  $isLinkNode,
  TOGGLE_LINK_COMMAND,
} from "@lexical/link";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $findMatchingParent, mergeRegister } from "@lexical/utils";
import {
  $getSelection,
  $isRangeSelection,
  COMMAND_PRIORITY_CRITICAL,
  COMMAND_PRIORITY_HIGH,
  COMMAND_PRIORITY_LOW,
  GridSelection,
  KEY_ESCAPE_COMMAND,
  LexicalEditor,
  NodeSelection,
  RangeSelection,
  SELECTION_CHANGE_COMMAND,
} from "lexical";
import * as React from "react";
import { Dispatch, useCallback, useEffect, useRef, useState } from "react";
import { Input, TextField } from "react-aria-components";
import { createPortal } from "react-dom";
import { IconContext } from "react-icons";
import { FaEdit, FaTrash } from "react-icons/fa";
import { VscCheck, VscChromeClose } from "react-icons/vsc";
import { TooltipButton } from "../ui/TooltipButton";
import { getSelectedNode } from "../utils/getSelectedNode";
import { setFloatingElemPositionForLinkEditor } from "../utils/setFloatingElemPositionForLinkEditor";
import { sanitizeUrl } from "../utils/url";

function FloatingLinkEditor({
  editor,
  isLink,
  setIsLink,
  anchorElem,
}: {
  editor: LexicalEditor;
  isLink: boolean;
  setIsLink: Dispatch<boolean>;
  anchorElem: HTMLElement;
}): JSX.Element {
  const editorRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [linkUrl, setLinkUrl] = useState("");
  const [editedLinkUrl, setEditedLinkUrl] = useState("");
  const [isEditMode, setEditMode] = useState(false);
  const [lastSelection, setLastSelection] = useState<
    RangeSelection | GridSelection | NodeSelection | null
  >(null);

  const updateLinkEditor = useCallback(() => {
    const selection = $getSelection();
    if ($isRangeSelection(selection)) {
      const node = getSelectedNode(selection);
      const parent = node.getParent();
      if ($isLinkNode(parent)) {
        setLinkUrl(parent.getURL());
      } else if ($isLinkNode(node)) {
        setLinkUrl(node.getURL());
      } else {
        setLinkUrl("");
      }
    }
    const editorElem = editorRef.current;
    const nativeSelection = window.getSelection();
    const activeElement = document.activeElement;

    if (editorElem === null) {
      return;
    }

    const rootElement = editor.getRootElement();

    if (
      selection !== null &&
      nativeSelection !== null &&
      rootElement !== null &&
      rootElement.contains(nativeSelection.anchorNode) &&
      editor.isEditable()
    ) {
      const domRect: DOMRect | undefined =
        nativeSelection.focusNode?.parentElement?.getBoundingClientRect();
      if (domRect) {
        domRect.y += 40;
        setFloatingElemPositionForLinkEditor(domRect, editorElem, anchorElem);
      }
      setLastSelection(selection);
    } else if (!activeElement || activeElement.className !== "link-input") {
      if (rootElement !== null) {
        setFloatingElemPositionForLinkEditor(null, editorElem, anchorElem);
      }
      setLastSelection(null);
      setEditMode(false);
      setLinkUrl("");
    }

    return true;
  }, [anchorElem, editor]);

  useEffect(() => {
    const scrollerElem = anchorElem.parentElement;

    const update = () => {
      editor.getEditorState().read(() => {
        updateLinkEditor();
      });
    };

    window.addEventListener("resize", update);

    if (scrollerElem) {
      scrollerElem.addEventListener("scroll", update);
    }

    return () => {
      window.removeEventListener("resize", update);

      if (scrollerElem) {
        scrollerElem.removeEventListener("scroll", update);
      }
    };
  }, [anchorElem.parentElement, editor, updateLinkEditor]);

  useEffect(() => {
    return mergeRegister(
      editor.registerUpdateListener(({ editorState }) => {
        editorState.read(() => {
          updateLinkEditor();
        });
      }),

      editor.registerCommand(
        SELECTION_CHANGE_COMMAND,
        () => {
          updateLinkEditor();
          return true;
        },
        COMMAND_PRIORITY_LOW
      ),
      editor.registerCommand(
        KEY_ESCAPE_COMMAND,
        () => {
          if (isLink) {
            setIsLink(false);
            return true;
          }
          return false;
        },
        COMMAND_PRIORITY_HIGH
      )
    );
  }, [editor, updateLinkEditor, setIsLink, isLink]);

  useEffect(() => {
    editor.getEditorState().read(() => {
      updateLinkEditor();
    });
  }, [editor, updateLinkEditor]);

  useEffect(() => {
    if (isEditMode && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditMode]);

  const monitorInputInteraction = (
    event: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (event.key === "Enter") {
      event.preventDefault();
      handleLinkSubmission();
    } else if (event.key === "Escape") {
      event.preventDefault();
      setEditMode(false);
    }
  };

  const handleLinkSubmission = () => {
    if (lastSelection !== null) {
      if (linkUrl !== "") {
        editor.dispatchCommand(TOGGLE_LINK_COMMAND, sanitizeUrl(editedLinkUrl));
      }
      setEditMode(false);
    }
  };

  return (
    <IconContext.Provider
      value={{
        className: "text-white-600 w-4 h-4 inline-block",
      }}
    >
      <div
        ref={editorRef}
        className="absolute left-0 top-0 z-10 flex w-full max-w-[400px] translate-y-0 transform overflow-auto bg-gray-500 opacity-0 shadow-md transition-opacity duration-500"
      >
        {!isLink ? null : isEditMode ? (
          <div className="block flex w-full justify-between p-2">
            <TextField className="flex w-full text-white-600 ">
              <Input
                className="mr-2 w-full bg-gray-800 p-2 text-white-600 outline-none"
                aria-label="Link URL:"
                value={editedLinkUrl}
                onKeyDown={monitorInputInteraction}
                onChange={(event) => {
                  setEditedLinkUrl(event.target.value);
                }}
              />
            </TextField>
            <div className="flex">
              <TooltipButton
                tooltipMessage="confirm link"
                className="mr-2 bg-green-500 hover:bg-green-300"
                onPress={handleLinkSubmission}
              >
                <VscCheck />
              </TooltipButton>
              <TooltipButton
                tooltipMessage="Cancel link"
                className="bg-red-500 hover:bg-red-300"
                onPress={() => setEditMode(false)}
              >
                <VscChromeClose />
              </TooltipButton>
            </div>
          </div>
        ) : (
          <div className="relative block flex w-full justify-between p-2">
            <a
              href={sanitizeUrl(linkUrl)}
              target="_blank"
              rel="noopener noreferrer"
              className="my-auto p-2 text-blue-500"
            >
              {linkUrl}
            </a>
            <div className="flex">
              <TooltipButton
                tooltipMessage="Edit link"
                className="mr-2 bg-green-500 hover:bg-green-300"
                onPress={() => {
                  setEditedLinkUrl(linkUrl);
                  setEditMode(true);
                }}
              >
                <FaEdit />
              </TooltipButton>
              <TooltipButton
                tooltipMessage="Remove link"
                className="bg-red-500 hover:bg-red-300"
                onPress={() => {
                  editor.dispatchCommand(TOGGLE_LINK_COMMAND, null);
                }}
              >
                <FaTrash />
              </TooltipButton>
            </div>
          </div>
        )}
      </div>
    </IconContext.Provider>
  );
}

function useFloatingLinkEditorToolbar(
  editor: LexicalEditor,
  anchorElem: HTMLElement
): JSX.Element | null {
  const [activeEditor, setActiveEditor] = useState(editor);
  const [isLink, setIsLink] = useState(false);

  const updateToolbar = useCallback(() => {
    const selection = $getSelection();
    if ($isRangeSelection(selection)) {
      const node = getSelectedNode(selection);
      const linkParent = $findMatchingParent(node, $isLinkNode);
      const autoLinkParent = $findMatchingParent(node, $isAutoLinkNode);

      // We don't want this menu to open for auto links.
      if (linkParent != null && autoLinkParent == null) {
        setIsLink(true);
      } else {
        setIsLink(false);
      }
    }
  }, []);

  useEffect(() => {
    return mergeRegister(
      editor.registerUpdateListener(({ editorState }) => {
        editorState.read(() => {
          updateToolbar();
        });
      }),
      editor.registerCommand(
        SELECTION_CHANGE_COMMAND,
        (_payload, newEditor) => {
          updateToolbar();
          setActiveEditor(newEditor);
          return false;
        },
        COMMAND_PRIORITY_CRITICAL
      )
    );
  }, [editor, updateToolbar]);

  return createPortal(
    <FloatingLinkEditor
      editor={activeEditor}
      isLink={isLink}
      anchorElem={anchorElem}
      setIsLink={setIsLink}
    />,
    anchorElem
  );
}

export default function FloatingLinkEditorPlugin({
  anchorElem = document.body,
}: {
  anchorElem?: HTMLElement;
}): JSX.Element | null {
  const [editor] = useLexicalComposerContext();
  return useFloatingLinkEditorToolbar(editor, anchorElem);
}
