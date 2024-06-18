import { createContext, useContext, useEffect, useState, useRef } from "react";
import { usePlayer } from "@/context/player-provider";
import { Song, Playlist } from "@/db/models";

type Theme = "dark" | "light" | "system";

type UiContextType = {
  autoResize: boolean;
  setAutoResize: React.Dispatch<React.SetStateAction<boolean>>;
  sidebarCollapsed: boolean;
  setSidebarCollapsed: React.Dispatch<React.SetStateAction<boolean>>;
  theme: Theme;
  setTheme: React.Dispatch<React.SetStateAction<Theme>>;
  currentSong: Song | null;
  currentPlaylist: Playlist | null;
  allPlaylists: Playlist[] | null;
};

const initialUiContext: UiContextType = {
  autoResize: true,
  setAutoResize: () => {},
  sidebarCollapsed: window.innerHeight < 1024,
  setSidebarCollapsed: () => {},
  theme: "system",
  setTheme: () => {},
  currentSong: null,
  currentPlaylist: null,
  allPlaylists: null,
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
  const { currentPlaylistName, currentSongId} = usePlayer();
  const [autoResize, setAutoResize] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(
    window.innerWidth < 1024
  );
  const [theme, setTheme] = useState<Theme>(
    () => (localStorage.getItem(storageKey) as Theme) || defaultTheme
  );
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [currentPlaylist, setCurrentPlaylist] = useState<Playlist | null>(null);
  const [allPlaylists, setAllPlaylists] = useState<Playlist[] | null>(null);

  useEffect(() => {
    if (autoResize) {
      const resize = () => {
        setSidebarCollapsed(window.innerWidth < 1024);
      };

      window.addEventListener("resize", resize);

      return () => { 
        window.removeEventListener("resize", resize);
      };
    }
  }, [autoResize]);

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

  useEffect(() => {
    async function fetchSongData() {
      const song = await window.songs.getSongMetadata(currentSongId);
      setCurrentSong(song);
    }
    fetchSongData();
  }, [currentSongId]);

  useEffect(() => {
    async function fetchPlaylistData() {
      const playlist = await window.playlists.getPlaylist(currentPlaylistName);
      setCurrentPlaylist(playlist);
    }
    fetchPlaylistData();
  }, [currentPlaylistName]);

  useEffect(() => {
    async function getPlaylists() {
      const playlists = await window.playlists.getAllPlaylists();
      setAllPlaylists(playlists);
    }
    getPlaylists();
  }, []);


  // webhook to update playlists
  let data;
  useEffect(() => {
    window.playlists.recieveAllPlaylists((data: Playlist[]) =>
      setAllPlaylists(data)
    );
  }, [data]);

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
    currentSong,
    currentPlaylist,
    allPlaylists,
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
