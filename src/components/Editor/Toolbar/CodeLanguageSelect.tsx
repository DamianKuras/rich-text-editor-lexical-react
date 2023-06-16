import { CODE_LANGUAGE_FRIENDLY_NAME_MAP } from "@lexical/code";
import { Select, SelectItem } from "../ui/Select";

type CodeLanguageSelectProps = {
  onCodeLanguageChange: (language: string) => void;
  selectedCodeLanguage: string;
};
const selectItems: Map<string, SelectItem<string>> = Object.entries(
  CODE_LANGUAGE_FRIENDLY_NAME_MAP
).reduce((map, [lang, friendlyName]) => {
  map.set(lang, {
    key: lang,
    selectedLabel: <span>{friendlyName}</span>,
    label: <span className="text-sm">{friendlyName}</span>,
  });
  return map;
}, new Map<string, SelectItem<string>>());

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
    <Select
      selectItems={selectItems}
      selectedItemKey={selectedCodeLanguage}
      defaultItemKey={"js"}
      onSelect={
        handleCodeLanguageSelection as (language: string) => void
      }
    />
  );
}
