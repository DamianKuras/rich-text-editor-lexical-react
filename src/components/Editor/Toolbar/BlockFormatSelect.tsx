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
import { SelectItem, ToolbarSelect } from "../ui/ToolbarSelect";

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

type BlockFormatSelectProps = {
  activeEditor: LexicalEditor;
  selectedBlockType: BlockType;
  setSelectedBlockType: (type: BlockType) => void;
};

type Option = {
  id: BlockType;
  name: string;
  formatHandler?: (editor: LexicalEditor) => void;
};

const options: Option[] = [
  {
    id: "paragraph",
    name: "Paragraph",
    formatHandler: (editor: LexicalEditor) => {
      editor.update(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          $setBlocksType(selection, () => $createParagraphNode());
        }
      });
    },
  },
  {
    id: "h1",
    name: "Heading 1",
    formatHandler: (editor: LexicalEditor) => {
      formatHeading(editor, "h1");
    },
  },
  {
    id: "h2",
    name: "Heading 2",
    formatHandler: (editor: LexicalEditor) => {
      formatHeading(editor, "h2");
    },
  },
  {
    id: "h3",
    name: "Heading 3",
    formatHandler: (editor: LexicalEditor) => {
      formatHeading(editor, "h3");
    },
  },
  {
    id: "bullet",
    name: "Bullet list",
    formatHandler: (editor: LexicalEditor) => {
      editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined);
    },
  },
  {
    id: "number",
    name: "Ordered list",
    formatHandler: (editor: LexicalEditor) => {
      editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined);
    },
  },
  {
    id: "quote",
    name: "Quote",
    formatHandler: (editor: LexicalEditor) => {
      editor.update(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          $setBlocksType(selection, () => $createQuoteNode());
        }
      });
    },
  },
  {
    id: "code",
    name: "Code",
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
];

// Create a lookup object to map ids to options
const lookup: { [id: React.Key]: Option } = {};
for (let i = 0, len = options.length; i < len; i++) {
  lookup[options[i].id] = options[i];
}

export function BlockFormatSelect({
  activeEditor,
  selectedBlockType,
}: Readonly<BlockFormatSelectProps>): JSX.Element {
  return (
    <ToolbarSelect
      aria-label="block format select"
      items={options}
      selectedKey={selectedBlockType}
      key={"block-format-select"}
      onSelectionChange={(selected) => {
        const selectedOption = lookup[selected];
        if (selectedOption?.formatHandler) {
          selectedOption.formatHandler(activeEditor);
        }
      }}
    >
      {(item) => <SelectItem>{item.name}</SelectItem>}
    </ToolbarSelect>
  );
}
