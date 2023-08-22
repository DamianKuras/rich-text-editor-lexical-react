import { createContext } from "react";

interface SettingsContextProps {
  autoSaveEnabled: boolean;
  autoSaveInterval: number;
  spellcheck: boolean;
  setAutoSaveEnabled: (enabled: boolean) => void;
  setAutoSaveInterval: (interval: number) => void;
  setSpellcheck: (enabled: boolean) => void;
}
const defaultValues: SettingsContextProps = {
  autoSaveEnabled: false,
  autoSaveInterval: 3,
  spellcheck: true,
  setAutoSaveEnabled: () => undefined,
  setAutoSaveInterval: () => undefined,
  setSpellcheck: () => undefined,
};
export const SettingsContext =
  createContext<SettingsContextProps>(defaultValues);
