import { createContext, useContext, useEffect, useState, useRef } from "react";

type SettingsContextType = {
  masterVolume: number;
  setMasterVolume: React.Dispatch<React.SetStateAction<number>>;
};

const initialSettingsContext: SettingsContextType = {
  masterVolume: 0.5,
  setMasterVolume: () => {},
};

type SettingsProviderState = {
  masterVolume: number;
  setMasterVolume: (volume: number) => void;
};

type SettingsProviderProps = {
  children: React.ReactNode;
};

export const SettingsContext = createContext(initialSettingsContext);

export const SettingsProvider = ({
  children,
  ...props
}: SettingsProviderProps) => {
  const [masterVolume, setMasterVolume] = useState(0.5);

  const value: SettingsProviderState = {
    masterVolume,
    setMasterVolume,
  };

  return (
    <SettingsContext.Provider {...props} value={value}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);

  if (context === undefined)
    throw new Error("useTheme must be used within a ThemeProvider");

  return context;
};
