import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { COMMAND_PRIORITY_LOW, LexicalCommand, createCommand } from "lexical";
import { useEffect } from "react";

const LocalStorageKey = "editor-saved-state";
export const SAVED_SUCCESSFULLY_TO_LOCAL_STORAGE = "Success";
export const FAILED_TO_SAVE_TO_LOCAL_STORAGE = "Error";
export const SAVE_TO_LOCAL_STORAGE: LexicalCommand<void> = createCommand();
export const LOCAL_STORAGE_SAVE_STATUS: LexicalCommand<string> =
  createCommand();

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
            LOCAL_STORAGE_SAVE_STATUS,
            SAVED_SUCCESSFULLY_TO_LOCAL_STORAGE
          );
        } catch (error) {
          editor.dispatchCommand(
            LOCAL_STORAGE_SAVE_STATUS,
            FAILED_TO_SAVE_TO_LOCAL_STORAGE
          );
        }
        return true;
      },
      COMMAND_PRIORITY_LOW
    );
  }, [editor]);
  return null;
}
