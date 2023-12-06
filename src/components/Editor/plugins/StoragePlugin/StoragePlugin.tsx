import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { COMMAND_PRIORITY_CRITICAL, SELECTION_CHANGE_COMMAND } from "lexical";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useState,
} from "react";
import { FaSave } from "react-icons/fa";
import { useSettingsContext } from "../../context/SettingsContext";
import { TooltipButton } from "../../ui/TooltipButton";
import delayedExecution from "../../utils/delayedExecution";
import StorageInterface from "./StorageInterface";

type SavePluginProps = {
  storage: StorageInterface;
  fallbackStorage?: StorageInterface;
};

type StorageSaveStatus = {
  status: "saving" | "saved" | "unsaved" | "saved-to-fallback" | "error";
  message: string;
};

export default function StoragePlugin({
  storage,
  fallbackStorage,
}: Readonly<SavePluginProps>) {
  const [editor] = useLexicalComposerContext();
  const { autoSaveEnabled, autoSaveInterval } = useSettingsContext();
  const [activeEditor, setActiveEditor] = useState(editor);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [saveStatus, setSaveStatus] = useState<StorageSaveStatus>({
    status: "saved",
    message: "No changes that needs saving",
  });

  useEffect(() => {
    const fetchSavedEditorState = async () => {
      const storageLoadOperationResult = await storage.getSavedEditorState();
      let editorState = storageLoadOperationResult.payload;

      if (storageLoadOperationResult.status !== "success" && fallbackStorage) {
        const falbackstorageLoadOperationResult =
          await fallbackStorage.getSavedEditorState();
        editorState = falbackstorageLoadOperationResult.payload;
      }
      if (editorState !== undefined) {
        const parsedEditorState = editor.parseEditorState(editorState);
        editor.update(() => {
          editor.setEditorState(parsedEditorState, {
            tag: "loaded-content",
          });
        });
      }
    };
    fetchSavedEditorState();
    // fetch only on load
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSave = useCallback(async () => {
    const editorStateJson = editor.getEditorState().toJSON();
    setSaveStatus({ status: "saving", message: "Saving..." });
    const result = await storage.saveEditorState(editorStateJson);
    if (result.status === "error" && fallbackStorage) {
      const fallbackResult = await fallbackStorage.saveEditorState(
        editorStateJson
      );
      setSaveStatus({
        status: fallbackResult.status,
        message: result.message + " " + fallbackResult.message,
      });
      if (fallbackResult.status === "saved") {
        setHasUnsavedChanges(false);
      }
    } else {
      setSaveStatus({ status: "saved", message: result.message });
      setHasUnsavedChanges(false);
    }
  }, [storage, editor, fallbackStorage]);

  const delayedSave = useMemo(
    () =>
      delayedExecution(async () => {
        handleSave();
      }, autoSaveInterval * 1000),
    [autoSaveInterval, handleSave]
  );

  useEffect(() => {
    return editor.registerCommand(
      SELECTION_CHANGE_COMMAND,
      (_payload, newEditor) => {
        setActiveEditor(newEditor);
        return false;
      },
      COMMAND_PRIORITY_CRITICAL
    );
  }, [editor]);

  useLayoutEffect(() => {
    return activeEditor.registerUpdateListener(
      ({ dirtyElements, dirtyLeaves, prevEditorState, tags }) => {
        if (
          (dirtyElements.size === 0 && dirtyLeaves.size === 0) ||
          prevEditorState.isEmpty() ||
          tags.has("history-merge") ||
          tags.has("loaded-content")
        ) {
          return;
        }
        setHasUnsavedChanges(true);
        if (saveStatus.status === "saved")
          setSaveStatus({
            status: "unsaved",
            message: "You have unsaved changes",
          });
        if (autoSaveEnabled) delayedSave();
      }
    );
  }, [autoSaveEnabled, activeEditor, delayedSave, saveStatus.status]);

  useEffect(() => {
    if (!autoSaveEnabled) {
      delayedSave.cancel();
    }
    if (autoSaveEnabled && hasUnsavedChanges) {
      handleSave();
    }
    return () => {
      delayedSave.cancel();
    };
    // omit hasUnsavedChanges from dependency to prevent immediate save on enabling autosave
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoSaveEnabled, delayedSave, handleSave]);

  const getStatusBackgroundColorClass = () => {
    switch (saveStatus.status) {
      case "saved":
        return "bg-green-500";
      case "unsaved":
        return "bg-yellow-500";
      case "error":
        return "bg-red-500";
      case "saving":
        return "bg-yellow-300";
      default:
        return "";
    }
  };

  return (
    <div className="flex border-r px-2">
      <TooltipButton
        onPress={() => handleSave()}
        tooltipMessage="Save to local storage"
      >
        <FaSave size="18" />
      </TooltipButton>
      <div
        className={`${getStatusBackgroundColorClass()} my-auto h-2 w-2 rounded-full`}
        title={saveStatus.message}
      ></div>
    </div>
  );
}
