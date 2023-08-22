import { useContext } from "react";
import {
  Dialog,
  DialogTrigger,
  Label,
  Popover,
  Slider,
  SliderOutput,
  SliderThumb,
  SliderTrack,
} from "react-aria-components";
import { IoSettingsSharp } from "react-icons/io5";
import { SettingsContext } from "../context/SettingsContext";
import { ToolbarSwitch } from "../ui/ToolbarSwitch";
import { TooltipButton } from "../ui/TooltipButton";

export function SettingsPopover() {
  const {
    autoSaveEnabled,
    setAutoSaveEnabled,
    autoSaveInterval,
    setAutoSaveInterval,
    spellcheck,
    setSpellcheck,
  } = useContext(SettingsContext);

  const handleAutoSaveEnabledChange = () => {
    setAutoSaveEnabled(!autoSaveEnabled);
  };

  const handleSpellCheckChange = () => {
    setSpellcheck(!spellcheck);
  };
  return (
    <div className="b-2 flex border-toolbar-disabled">
      <DialogTrigger>
        <TooltipButton tooltipMessage="Settings">
          <IoSettingsSharp />
        </TooltipButton>
        <Popover
          crossOffset={130}
          className="react-aria-Popover bg-gray-900"
        >
          <Dialog className="outline-none">
            <div className="bg-gray-900 px-8 py-8 shadow-lg">
              <div className="mb-12">
                <div className="mb-4 flex justify-between">
                  <ToolbarSwitch
                    id="autoSaveEnabled"
                    isSelected={autoSaveEnabled}
                    onChange={handleAutoSaveEnabledChange}
                  >
                    Auto Save
                  </ToolbarSwitch>
                </div>
                <Slider
                  className="relative"
                  value={autoSaveInterval}
                  onChange={setAutoSaveInterval}
                  minValue={1}
                  maxValue={30}
                  step={1}
                >
                  <div className="flex justify-between">
                    <div className="mr-4 text-white-600">
                      <Label className="text-white-600">
                        Auto Save Delay(seconds):
                      </Label>
                    </div>
                    <SliderOutput className="min-w-[2em] text-white-600" />
                  </div>
                  <SliderTrack className="relative mt-2 h-1 border-2 border-gray-500 bg-blue-500">
                    <SliderThumb className="block h-5 w-5 rounded-full bg-blue-500 " />
                  </SliderTrack>
                </Slider>
              </div>

              <div className="flex justify-between">
                <ToolbarSwitch
                  id="spellcheckEnabled"
                  isSelected={spellcheck}
                  onChange={handleSpellCheckChange}
                >
                  Browser Spell Check
                </ToolbarSwitch>
              </div>
            </div>
          </Dialog>
        </Popover>
      </DialogTrigger>
    </div>
  );
}
