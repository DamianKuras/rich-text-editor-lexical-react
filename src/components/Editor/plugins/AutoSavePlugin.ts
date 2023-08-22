import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { LexicalCommand } from "lexical";
import { useCallback, useEffect, useRef } from "react";

export function AutoSavePlugin({
  SaveCommand,
  AutoSaveEnabled,
  AutoSaveInterval,
}: {
  SaveCommand: LexicalCommand<void>;
  AutoSaveEnabled: boolean;
  AutoSaveInterval: number;
}) {
  const [editor] = useLexicalComposerContext();
  const dirtyElementsRef = useRef<boolean>(false);
  const dirtyLeavesRef = useRef<boolean>(false);
  const saveTimerRef = useRef<number | undefined>(undefined);

  const handleSave = useCallback(() => {
    if (dirtyElementsRef.current || dirtyLeavesRef.current) {
      editor.dispatchCommand(SaveCommand, undefined);
      dirtyElementsRef.current = false;
      dirtyLeavesRef.current = false;
    }
  }, [editor, SaveCommand]);

  useEffect(() => {
    if (AutoSaveEnabled) {
      saveTimerRef.current = setInterval(handleSave, 1000 * AutoSaveInterval);
    }
    return () => {
      if (saveTimerRef.current) {
        clearInterval(saveTimerRef.current);
      }
    };
  }, [editor, handleSave, AutoSaveEnabled, AutoSaveInterval]);

  useEffect(() => {
    return editor.registerUpdateListener(({ dirtyElements, dirtyLeaves }) => {
      dirtyElementsRef.current = dirtyElements.size > 0;
      dirtyLeavesRef.current = dirtyLeaves.size > 0;
    });
  }, [editor]);

  return null;
}
