import { SerializedEditorState, SerializedLexicalNode } from "lexical";
import StorageInterface, {
  OperationResult,
  SaveOperationResult,
} from "./StorageInterface";

const LOCAL_STORAGE_KEY = "editor-saved-state";

export default class LocalStorage implements StorageInterface {
  async saveEditorState(
    editorSerializedContent: SerializedEditorState<SerializedLexicalNode>
  ): Promise<SaveOperationResult> {
    try {
      localStorage.setItem(
        LOCAL_STORAGE_KEY,
        JSON.stringify(editorSerializedContent)
      );
      return { status: "saved", message: "Saved to local storage" };
    } catch (error) {
      return {
        status: "error",
        message:
          "Failed to save to local storage. Check if browser has local storage enabled.",
      };
    }
  }
  async getSavedEditorState(): Promise<OperationResult> {
    const editorState = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (editorState === null) {
      return {
        status: "not-found",
        message: "Editor state not found in local storage",
      };
    }
    return {
      status: "success",
      message: "Loaded from local storage",
      payload: editorState,
    };
  }
}
