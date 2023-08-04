import { $findMatchingParent } from "@lexical/utils";
import {
  $createParagraphNode,
  $getSelection,
  $isRootOrShadowRoot,
  LexicalEditor,
  LexicalNode,
} from "lexical";

function findElementForInsertion(node: LexicalNode) {
  if (node.getKey() === "root") {
    return node;
  }

  return $findMatchingParent(node, (e) => {
    const parent = e.getParent();
    return parent !== null && $isRootOrShadowRoot(parent);
  });
}

export function InsertParagraphBeforeElement(editor: LexicalEditor) {
  editor.update(() => {
    const selection = $getSelection();
    if (selection == null) {
      return;
    }
    const node = selection.getNodes()[0];
    const element = findElementForInsertion(node);
    const paragraphNode = $createParagraphNode();
    element?.insertBefore(paragraphNode);
    paragraphNode.select();
  });
}

export function InsertParagraphAfterElement(editor: LexicalEditor) {
  editor.update(() => {
    const selection = $getSelection();
    if (selection == null) {
      return;
    }
    const selectionNode = selection.getNodes();
    const node = selectionNode[selectionNode.length - 1];
    const element = findElementForInsertion(node);
    const paragraphNode = $createParagraphNode();
    element?.insertAfter(paragraphNode);
    paragraphNode.select();
  });
}
