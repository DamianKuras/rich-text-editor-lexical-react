import { SerializedEditorState, SerializedLexicalNode } from "lexical";

export type SaveOperationResult = {
  status: "saved" | "error";
  message: string;
};

export type OperationResult = {
  status: "success" | "error" | "not-found";
  message: string;
  payload?: string;
};

export default interface StorageInterface {
  saveEditorState: (
    state: SerializedEditorState<SerializedLexicalNode>
  ) => Promise<SaveOperationResult>;
  getSavedEditorState: () => Promise<OperationResult>;
}
