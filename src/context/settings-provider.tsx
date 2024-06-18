import { createContext, useContext, useEffect, useState, useRef } from "react";

type SettingsContextType = {
  reflection?: boolean;
  setReflection?: React.Dispatch<React.SetStateAction<boolean>>;
};

const initialSettingsContext: SettingsContextType = {
  reflection: true,
  setReflection: () => {},
};

type SettingsProviderState = {
  reflection?: boolean;
  setReflection?: (reflection: boolean) => void;
};

type SettingsProviderProps = {
  children: React.ReactNode;
};

export const SettingsContext = createContext(initialSettingsContext);

export const SettingsProvider = ({
  children,
  ...props
}: SettingsProviderProps) => {
  const [reflection, setReflection] = useState(
    localStorage.getItem("reflection")
      ? JSON.parse(localStorage.getItem("reflection")!)
      : true
  );

  const value: SettingsProviderState = {
    reflection,
    setReflection,
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
