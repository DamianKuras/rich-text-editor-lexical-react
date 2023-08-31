import { CODE_LANGUAGE_FRIENDLY_NAME_MAP } from "@lexical/code";
import { SelectItem, ToolbarSelect } from "../ui/ToolbarSelect";

type CodeLanguageSelectProps = {
  onCodeLanguageChange: (language: string) => void;
  selectedCodeLanguage: string;
};
type Option = {
  id: string;
  name: string;
};

const selectItems: Option[] = Object.entries(
  CODE_LANGUAGE_FRIENDLY_NAME_MAP
).map(([lang, friendlyName]) => ({
  id: lang,
  name: friendlyName,
}));

export function CodeLanguageSelect({
  onCodeLanguageChange,
  selectedCodeLanguage,
}: CodeLanguageSelectProps): JSX.Element {
  const handleCodeLanguageSelection = (language: string) => {
    if (selectedCodeLanguage === language) {
      return;
    }
    onCodeLanguageChange(language);
  };
  return (
    <ToolbarSelect
      aria-label="code language select"
      items={selectItems}
      selectedKey={selectedCodeLanguage}
      defaultSelectedKey={"js"}
      key={"code-language-select"}
      minWidth="[8em]"
      onSelectionChange={(selected) => {
        handleCodeLanguageSelection(selected as string);
      }}
    >
      {(item) => <SelectItem>{item.name}</SelectItem>}
    </ToolbarSelect>
  );
}
