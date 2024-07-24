import { ElementNode, NodeKey, SerializedElementNode } from "lexical";
import { addClassNamesToElement } from "@lexical/utils";

export type SerializedColumnNode = SerializedElementNode;
export class ColumnNode extends ElementNode {
  static getType(): string {
    return "column";
  }

  static clone(node: ColumnNode): ColumnNode {
    return new ColumnNode(node.__key);
  }

  constructor(key?: NodeKey) {
    super(key);
  }

  createDOM(): HTMLElement {
    const dom = document.createElement("div");
    addClassNamesToElement(dom, "border border-dashed w-full");
    return dom;
  }

  isShadowRoot(): boolean {
    return true;
  }

  updateDOM(): boolean {
    return false;
  }

  exportJSON(): SerializedColumnNode {
    return {
      ...super.exportJSON(),
      type: "column",
      version: 1,
    };
  }
  static importJSON(): ColumnNode {
    return $createColumnNode();
  }
}

export function $createColumnNode() {
  return new ColumnNode();
}
