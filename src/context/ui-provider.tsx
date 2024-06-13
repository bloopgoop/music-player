import { createContext, useContext, useEffect, useState, useRef } from "react";

type Theme = "dark" | "light" | "system";

type UiContextType = {
  autoResize: boolean;
  setAutoResize: React.Dispatch<React.SetStateAction<boolean>>;
  sidebarCollapsed: boolean;
  setSidebarCollapsed: React.Dispatch<React.SetStateAction<boolean>>;
  theme: Theme;
  setTheme: React.Dispatch<React.SetStateAction<Theme>>;
};

const initialUiContext: UiContextType = {
  autoResize: true,
  setAutoResize: () => {},
  sidebarCollapsed: window.innerHeight < 1024,
  setSidebarCollapsed: () => {},
  theme: "system",
  setTheme: () => {},
};

type ThemeProviderState = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
};

type UiProviderProps = {
  children: React.ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
};

export const UiContext = createContext(initialUiContext);

export const UiProvider = ({
  children,
  defaultTheme = "system",
  storageKey = "theme",
  ...props
}: UiProviderProps) => {
  const [autoResize, setAutoResize] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(
    window.innerWidth < 1024
  );
  const [theme, setTheme] = useState<Theme>(
    () => (localStorage.getItem(storageKey) as Theme) || defaultTheme
  );

  useEffect(() => {
    const root = window.document.documentElement;

    root.classList.remove("light", "dark");

    if (theme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
        .matches
        ? "dark"
        : "light";

      root.classList.add(systemTheme);
      return;
    }

    root.classList.add(theme);
  }, [theme]);

  const value = {
    autoResize,
    setAutoResize,
    sidebarCollapsed,
    setSidebarCollapsed,
    theme,
    setTheme: (theme: Theme) => {
      localStorage.setItem(storageKey, theme);
      setTheme(theme);
    },
  };

  return (
    <UiContext.Provider {...props} value={value}>
      {children}
    </UiContext.Provider>
  );
};

export const useUi = () => {
  const context = useContext(UiContext);

  if (context === undefined)
    throw new Error("useTheme must be used within a ThemeProvider");

  return context;
};
