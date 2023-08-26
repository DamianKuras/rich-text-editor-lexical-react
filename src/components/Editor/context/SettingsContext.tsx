import * as React from "react";
import { ReactNode, createContext, useContext, useState } from "react";

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
export const SettingsContext: React.Context<SettingsContextProps> =
  createContext<SettingsContextProps>(defaultValues);

export function SettingContextProvider({
  children,
}: {
  children: ReactNode;
}): JSX.Element {
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);
  const [autoSaveInterval, setAutoSaveInterval] = useState(3);
  const [spellcheck, setSpellcheck] = useState(true);

  return (
    <SettingsContext.Provider
      value={{
        autoSaveEnabled: autoSaveEnabled,
        autoSaveInterval: autoSaveInterval,
        spellcheck: spellcheck,
        setAutoSaveEnabled,
        setAutoSaveInterval,
        setSpellcheck,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettingsContext() {
  return useContext(SettingsContext);
}
