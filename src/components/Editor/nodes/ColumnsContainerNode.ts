import {
  DOMExportOutput,
  ElementNode,
  NodeKey,
  SerializedElementNode,
  Spread,
} from "lexical";
import {
  addClassNamesToElement,
  removeClassNamesFromElement,
} from "@lexical/utils";

export type SerializedColumnContainerNode = Spread<
  {
    numberOfColumns: number;
    gap: number;
  },
  SerializedElementNode
>;

export class ColumnsContainerNode extends ElementNode {
  __numberOfColumns: number;
  __gap: number;
  static getType(): string {
    return "column-container";
  }
  static clone(node: ColumnsContainerNode): ColumnsContainerNode {
    return new ColumnsContainerNode(
      node.__numberOfColumns,
      node.__gap,
      node.__key
    );
  }
  isShadowRoot(): boolean {
    return true;
  }
  constructor(numberOfColumns: number, gap: number, key?: NodeKey) {
    super(key);
    this.__numberOfColumns = numberOfColumns;
    this.__gap = gap;
  }
  createDOM(): HTMLElement {
    const dom = document.createElement("div");
    const classNames =
      "grid grid-cols-" + this.__numberOfColumns + " gap-" + this.__gap;
    addClassNamesToElement(dom, classNames);

    return dom;
  }

  updateDOM(prevNode: ColumnsContainerNode, dom: HTMLElement): boolean {
    if (prevNode.__numberOfColumns !== this.__numberOfColumns) {
      const previousClassNames =
        "grid grid-cols-" +
        prevNode.__numberOfColumns +
        " gap-" +
        prevNode.__gap;
      removeClassNamesFromElement(dom, previousClassNames);
      const classNames =
        "grid grid-cols-" + this.__numberOfColumns + " gap-" + this.__gap;
      addClassNamesToElement(dom, classNames);
    }
    return false;
  }

  exportDOM(): DOMExportOutput {
    const element = document.createElement("div");
    const classNames =
      "grid grid-cols-" + this.__numberOfColumns + " gap-" + this.__gap;
    addClassNamesToElement(element, classNames);
    return { element };
  }
  exportJSON(): SerializedColumnContainerNode {
    return {
      ...super.exportJSON(),
      numberOfColumns: this.__numberOfColumns,
      gap: this.__gap,
      type: "column-container",
      version: 1,
    };
  }
  static importJSON(json: SerializedColumnContainerNode): ColumnsContainerNode {
    return $createColumnContainerNode(json.numberOfColumns, json.gap);
  }
}
export function $createColumnContainerNode(
  numberOfColumns: number,
  gap: number
): ColumnsContainerNode {
  return new ColumnsContainerNode(numberOfColumns, gap);
}
