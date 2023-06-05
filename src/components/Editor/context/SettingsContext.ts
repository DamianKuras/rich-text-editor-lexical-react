import { createContext } from "react";

interface SettingsContextProps {
  AutoSaveEnabled: boolean;
  AutoSaveInterval: number;
  setAutoSaveEnabled: (enabled: boolean) => void;
  setAutoSaveInterval: (interval: number) => void;
}
const defaultValues: SettingsContextProps = {
  AutoSaveEnabled: false,
  AutoSaveInterval: 3,
  setAutoSaveEnabled: () => undefined,
  setAutoSaveInterval: () => undefined,
};
export const SettingsContext = createContext<SettingsContextProps>(
    defaultValues
);
