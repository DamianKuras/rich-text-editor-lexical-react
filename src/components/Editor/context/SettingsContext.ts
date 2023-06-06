import { createContext } from "react";

interface SettingsContextProps {
  autoSaveEnabled: boolean;
  autoSaveInterval: number;
  setAutoSaveEnabled: (enabled: boolean) => void;
  setAutoSaveInterval: (interval: number) => void;
}
const defaultValues: SettingsContextProps = {
  autoSaveEnabled: false,
  autoSaveInterval: 3000,
  setAutoSaveEnabled: () => undefined,
  setAutoSaveInterval: () => undefined,
};
export const SettingsContext =
  createContext<SettingsContextProps>(defaultValues);
