import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { COMMAND_PRIORITY_LOW, LexicalCommand, createCommand } from "lexical";
import { useEffect } from "react";

export const SAVE_TO_LOCAL_STORAGE: LexicalCommand<void> = createCommand();
export const SAVED_SUCCESSFULLY_TO_LOCAL_STORAGE: LexicalCommand<void> =
  createCommand();

export const FAILED_TO_SAVE_TO_LOCAL_STORAGE: LexicalCommand<void> =
  createCommand();

const LocalStorageKey = "editor-saved-state";

export function getSavedStateFromLocalStorage(): string | null {
  return localStorage.getItem(LocalStorageKey);
}
export function LocalStoragePlugin() {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    return editor.registerCommand<string>(
      SAVE_TO_LOCAL_STORAGE,
      () => {
        const editorSerializedContent = JSON.stringify(
          editor.getEditorState().toJSON()
        );

        try {
          localStorage.setItem(LocalStorageKey, editorSerializedContent);
          editor.dispatchCommand(
            SAVED_SUCCESSFULLY_TO_LOCAL_STORAGE,
            undefined
          );
          return true;
        } catch (error) {
          editor.dispatchCommand(FAILED_TO_SAVE_TO_LOCAL_STORAGE, undefined);
          return false;
        }
      },
      COMMAND_PRIORITY_LOW
    );
  }, [editor]);
  return null;
}
