import { useContext } from "react";
import { IoSettingsSharp } from "react-icons/io5";
import { SettingsContext } from "../context/SettingsContext";
import { Dropdown } from "../ui/Dropdown";
import { FloatingLabelInput } from "../ui/FloatingLabelInput";
import { ToolbarSwitch } from "../ui/ToolbarSwitch";

const minAutoSaveInterval = 300;
const defaultAutoSaveInterval = 3000;
const maxAutoSaveInterval = 30000;
export function SettingsDropdown() {
  const {
    autoSaveEnabled,
    setAutoSaveEnabled,
    autoSaveInterval,
    setAutoSaveInterval,
  } = useContext(SettingsContext);
  const handleAutoSaveEnabledChange = () => {
    setAutoSaveEnabled(!autoSaveEnabled);
  };
  const handleAutoSaveIntervalChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const inputValue = parseFloat(event.target.value);
    if (isNaN(inputValue)) {
      setAutoSaveInterval(defaultAutoSaveInterval);
    } else {
      let parsedMiliseconds = Math.round(inputValue);
      parsedMiliseconds = Math.min(parsedMiliseconds, maxAutoSaveInterval);
      parsedMiliseconds = Math.max(parsedMiliseconds, minAutoSaveInterval);
      setAutoSaveInterval(parsedMiliseconds);
    }
  };
  return (
    <Dropdown
      dropdownTitle="Settings"
      buttonContent={<IoSettingsSharp />}
    >
      <div className="px-8 py-8">
        <div className="mb-4 flex justify-between">
          <span className="mr-2 text-toolbar-text">Auto Save enabled</span>
          <ToolbarSwitch
            id="autoSaveEnabled"
            checked={autoSaveEnabled}
            onChange={handleAutoSaveEnabledChange}
          />
        </div>
        <div className="mb-4">
          <FloatingLabelInput
            type="number"
            id="autoSaveInterval"
            label="Interval(miliseconds):"
            minValue={minAutoSaveInterval}
            maxValue={maxAutoSaveInterval}
            value={autoSaveInterval}
            onChange={handleAutoSaveIntervalChange}
          />
        </div>
      </div>
    </Dropdown>
  );
}
