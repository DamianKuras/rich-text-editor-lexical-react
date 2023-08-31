import {
  ElementFormatType,
  FORMAT_ELEMENT_COMMAND,
  INDENT_CONTENT_COMMAND,
  LexicalEditor,
  OUTDENT_CONTENT_COMMAND,
} from "lexical";
import {
  FaAlignCenter,
  FaAlignJustify,
  FaAlignLeft,
  FaAlignRight,
  FaIndent,
  FaOutdent,
} from "react-icons/fa";
import { SelectItem, ToolbarSelect } from "../ui/ToolbarSelect";

type AlignmentSelectProps = {
  value: ElementFormatType;
  activeEditor: LexicalEditor;
};

export function AlignmentSelect({
  value,
  activeEditor,
}: AlignmentSelectProps): JSX.Element {
  type Option = {
    id: string;
    formatHandler?: (editor: LexicalEditor) => void;
  };
  const options: Option[] = [
    {
      id: "left",
      formatHandler: (editor: LexicalEditor) => {
        editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "left");
      },
    },
    {
      id: "center",
      formatHandler: (editor: LexicalEditor) => {
        editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "center");
      },
    },
    {
      id: "right",
      formatHandler: (editor: LexicalEditor) => {
        editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "right");
      },
    },
    {
      id: "justify",
      formatHandler: (editor: LexicalEditor) => {
        editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "justify");
      },
    },
    {
      id: "indent",
      formatHandler: (editor: LexicalEditor) => {
        editor.dispatchCommand(INDENT_CONTENT_COMMAND, undefined);
      },
    },
    {
      id: "outdent",
      formatHandler: (editor: LexicalEditor) => {
        editor.dispatchCommand(OUTDENT_CONTENT_COMMAND, undefined);
      },
    },
  ];

  // Create a lookup object to map ids to options
  const lookup: { [id: React.Key]: Option } = {};
  for (let i = 0, len = options.length; i < len; i++) {
    lookup[options[i].id] = options[i];
  }

  return (
    <div className="flex border-r px-2">
      <ToolbarSelect
        aria-label="Alignment Select"
        items={options}
        selectedKey={value}
        defaultSelectedKey={"left"}
        key={"alignment-select"}
        minWidth="[4em]"
        onSelectionChange={(selected) => {
          const selectedOption = lookup[selected];
          if (selectedOption?.formatHandler) {
            selectedOption.formatHandler(activeEditor);
          }
        }}
      >
        <SelectItem id="left">
          <FaAlignLeft />
        </SelectItem>
        <SelectItem id="center">
          <FaAlignCenter />
        </SelectItem>
        <SelectItem id="right">
          <FaAlignRight />
        </SelectItem>
        <SelectItem id="justify">
          <FaAlignJustify />
        </SelectItem>

        <SelectItem id="indent">
          <FaIndent />
        </SelectItem>
        <SelectItem id="outdent">
          <FaOutdent />
        </SelectItem>
      </ToolbarSelect>
    </div>
  );
}
