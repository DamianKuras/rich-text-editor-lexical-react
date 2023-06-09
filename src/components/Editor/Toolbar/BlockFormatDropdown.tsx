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
import { DropdownItem, SelectDropdown } from "../ui/SelectDropdown";

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

interface BlockFormatDropdownItem extends DropdownItem<BlockType> {
  formatHandler: (editor: LexicalEditor) => void;
}

const dropDownItems: Map<BlockType, BlockFormatDropdownItem> = new Map([
  [
    "paragraph",
    {
      selectedLabel: "Paragraph",
      dropDownLabel: "Paragraph",
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
      dropDownLabel: <span className="bold text-2xl">Heading 1</span>,
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
      dropDownLabel: <h2 className="text-xl">Heading 2</h2>,
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
      dropDownLabel: <h3 className="text-lg">Heading 3</h3>,
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
      dropDownLabel: <span>&bull; Bullet list</span>,
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
      dropDownLabel: "1. Ordered list",
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
      dropDownLabel: <span>&ldquo;Quote&rdquo;</span>,
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
      dropDownLabel: <span>&lt;code&gt;</span>,
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

interface BlockLevelFormatDropdownProps {
  editor: LexicalEditor;
  selectedBlockType: BlockType;
}

export function BlockFormatDropdown({
  editor,
  selectedBlockType,
}: BlockLevelFormatDropdownProps): JSX.Element {
  const handleBlockFormatDropdownItemSelection = (type: BlockType) => {
    if (selectedBlockType === type) {
      return;
    }
    dropDownItems.get(type)?.formatHandler(editor);
  };
  return (
    <SelectDropdown
      dropDownItems={dropDownItems}
      selectedItemKey={selectedBlockType}
      defaultItemKey={"paragraph"}
      onSelect={
        handleBlockFormatDropdownItemSelection as (key: BlockType) => void
      }
    />
  );
}
