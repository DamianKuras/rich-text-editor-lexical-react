import { CODE_LANGUAGE_FRIENDLY_NAME_MAP } from "@lexical/code";
import { DropdownItem, SelectDropdown } from "../ui/SelectDropdown";

type CodeLanguageDropdownProps = {
  onCodeLanguageChange: (language: string) => void;
  selectedCodeLanguage: string;
};
const dropdownItems: Map<string, DropdownItem<string>> = Object.entries(
  CODE_LANGUAGE_FRIENDLY_NAME_MAP
).reduce((map, [lang, friendlyName]) => {
  map.set(lang, {
    key: lang,
    selectedLabel: <span>{friendlyName}</span>,
    dropDownLabel: <span className="text-sm">{friendlyName}</span>,
  });
  return map;
}, new Map<string, DropdownItem<string>>());

export function CodeLanguageDropdown({
  onCodeLanguageChange,
  selectedCodeLanguage,
}: CodeLanguageDropdownProps): JSX.Element {
  const handleCodeLanguageDropdownItemSelection = (language: string) => {
    if (selectedCodeLanguage === language) {
      return;
    }
    onCodeLanguageChange(language);
  };
  return (
    <SelectDropdown
      dropDownItems={dropdownItems}
      selectedItemKey={selectedCodeLanguage}
      defaultItemKey={"js"}
      onSelect={
        handleCodeLanguageDropdownItemSelection as (language: string) => void
      }
    />
  );
}
