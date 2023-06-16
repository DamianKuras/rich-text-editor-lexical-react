import { $createCodeNode } from "@lexical/code";
import {
  INSERT_ORDERED_LIST_COMMAND,
  INSERT_UNORDERED_LIST_COMMAND,
} from "@lexical/list";
import {
  $createHeadingNode,
  $createQuoteNode,
  HeadingTagType,
} from "@lexical/rich-text";
import { $setBlocksType } from "@lexical/selection";
import {
  $createParagraphNode,
  $getSelection,
  $isRangeSelection,
  LexicalEditor,
} from "lexical";
import { BlockType } from "../index";
import { Select, SelectItem } from "../ui/Select";

const formatHeading = (
  editor: LexicalEditor,
  headingSize: HeadingTagType
): void => {
  editor.update(() => {
    const selection = $getSelection();
    if ($isRangeSelection(selection)) {
      $setBlocksType(selection, () => $createHeadingNode(headingSize));
    }
  });
};

interface BlockFormatSelectItem extends SelectItem<BlockType> {
  formatHandler: (editor: LexicalEditor) => void;
}

const selectItems: Map<BlockType, BlockFormatSelectItem> = new Map([
  [
    "paragraph",
    {
      selectedLabel: "Paragraph",
      label: "Paragraph",
      key: "paragraph",
      formatHandler: (editor: LexicalEditor) => {
        editor.update(() => {
          const selection = $getSelection();
          if ($isRangeSelection(selection)) {
            $setBlocksType(selection, () => $createParagraphNode());
          }
        });
      },
    },
  ],
  [
    "h1",
    {
      selectedLabel: "Heading 1",
      label: <span className="bold text-2xl">Heading 1</span>,
      key: "h1",
      formatHandler: (editor: LexicalEditor) => {
        formatHeading(editor, "h1");
      },
    },
  ],
  [
    "h2",
    {
      selectedLabel: "Heading 2",
      label: <h2 className="text-xl">Heading 2</h2>,
      key: "h2",
      formatHandler: (editor: LexicalEditor) => {
        formatHeading(editor, "h2");
      },
    },
  ],
  [
    "h3",
    {
      selectedLabel: "Heading 3",
      label: <h3 className="text-lg">Heading 3</h3>,
      key: "h3",
      formatHandler: (editor: LexicalEditor) => {
        formatHeading(editor, "h3");
      },
    },
  ],
  [
    "bullet",
    {
      selectedLabel: "Bullet list",
      label: <span>&bull; Bullet list</span>,
      key: "bullet",
      formatHandler: (editor: LexicalEditor) => {
        editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined);
      },
    },
  ],
  [
    "number",
    {
      selectedLabel: "Ordered list",
      label: "1. Ordered list",
      key: "number",
      formatHandler: (editor: LexicalEditor) => {
        editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined);
      },
    },
  ],
  [
    "quote",
    {
      selectedLabel: "Quote",
      label: <span>&ldquo;Quote&rdquo;</span>,
      key: "quote",
      formatHandler: (editor: LexicalEditor) => {
        editor.update(() => {
          const selection = $getSelection();
          if ($isRangeSelection(selection)) {
            $setBlocksType(selection, () => $createQuoteNode());
          }
        });
      },
    },
  ],
  [
    "code",
    {
      selectedLabel: "Code",
      label: <span>&lt;code&gt;</span>,
      key: "code",
      formatHandler: (editor: LexicalEditor) => {
        editor.update(() => {
          let selection = $getSelection();
          if ($isRangeSelection(selection)) {
            if (selection.isCollapsed()) {
              $setBlocksType(selection, () => $createCodeNode());
            } else {
              const textContent = selection.getTextContent();
              const codeNode = $createCodeNode();
              selection.insertNodes([codeNode]);
              selection = $getSelection();
              if ($isRangeSelection(selection))
                selection.insertRawText(textContent);
            }
          }
        });
      },
    },
  ],
]);

interface BlockFormatSelectProps {
  editor: LexicalEditor;
  selectedBlockType: BlockType;
}

export function BlockFormatSelect({
  editor,
  selectedBlockType,
}: BlockFormatSelectProps): JSX.Element {
  const handleBlockFormatDropdownItemSelection = (type: BlockType) => {
    if (selectedBlockType === type) {
      return;
    }
    selectItems.get(type)?.formatHandler(editor);
  };
  return (
    <Select
      selectItems={selectItems}
      selectedItemKey={selectedBlockType}
      defaultItemKey={"paragraph"}
      onSelect={
        handleBlockFormatDropdownItemSelection as (key: BlockType) => void
      }
    />
  );
}
