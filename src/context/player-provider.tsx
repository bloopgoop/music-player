import { createContext, useContext, useEffect, useState } from "react";
import { Playlist, Song } from "@/db/models";

type PlayerContextType = {
  player: HTMLAudioElement;
  setPlayer: React.Dispatch<React.SetStateAction<HTMLAudioElement>>;

  playlistName: string;
  setPlaylistName: React.Dispatch<React.SetStateAction<string>>;

  playlist: Playlist;
  setPlaylist: React.Dispatch<React.SetStateAction<Playlist>>;

  playlistIndex: number;
  setPlaylistIndex: React.Dispatch<React.SetStateAction<number>>;

  songs: Song[];
  setSongs: React.Dispatch<React.SetStateAction<Song[]>>;

  loop: boolean;
  setLoop: React.Dispatch<React.SetStateAction<boolean>>;

  shuffle: boolean;
  setShuffle: React.Dispatch<React.SetStateAction<boolean>>;

  paused: boolean;
  setPaused: React.Dispatch<React.SetStateAction<boolean>>;

  masterVolume: number;
  setMasterVolume: React.Dispatch<React.SetStateAction<number>>;

  sliderVolume: number;
  setSliderVolume: React.Dispatch<React.SetStateAction<number>>;

  muted: boolean;
  setMuted: React.Dispatch<React.SetStateAction<boolean>>;

  duration: number;
  setDuration: React.Dispatch<React.SetStateAction<number>>;

  playNextSong?: () => void;

  playPreviousSong?: () => void;

  jumpToSong?: (index: number) => void;
};

const initialPlayerContext: PlayerContextType = {
  playlistName: "",
  setPlaylistName: () => {},

  playlist: null,
  setPlaylist: () => [],

  playlistIndex: 0,
  setPlaylistIndex: () => 0,

  player: null,
  setPlayer: () => null,

  songs: [],
  setSongs: () => [],

  loop: false,
  setLoop: () => false,

  shuffle: false,
  setShuffle: () => false,

  paused: false,
  setPaused: () => false,

  masterVolume: 0.5,
  setMasterVolume: () => 0.5,

  sliderVolume: 50,
  setSliderVolume: () => 50,

  muted: false,
  setMuted: () => false,

  duration: 60,
  setDuration: () => 60,

  playNextSong: () => {},

  playPreviousSong: () => {},

  jumpToSong: () => {},
};

type PlayerProviderProps = {
  children: React.ReactNode;
};

function calcTotalVolume(sliderVolume: number, masterVolume: number) {
  return (sliderVolume * masterVolume) / 100;
}

export const PlayerContext = createContext(initialPlayerContext);

export const PlayerProvider = ({ children }: PlayerProviderProps) => {
  const [player, setPlayer] = useState<HTMLAudioElement>(new Audio());
  const [history, setHistory] = useState<string[]>([]);
  const [playlistName, setPlaylistName] = useState<string>(
    localStorage.getItem("playlistName")
      ? localStorage.getItem("playlistName")
      : "All songs"
  );
  const [playlist, setPlaylist] = useState<Playlist>(null);
  const [playlistIndex, setPlaylistIndex] = useState(
    localStorage.getItem("playlistIndex")
      ? Number(localStorage.getItem("playlistIndex"))
      : 0
  );
  const [songs, setSongs] = useState<Song[]>([]);
  const [loop, setLoop] = useState(
    localStorage.getItem("loop")
      ? JSON.parse(localStorage.getItem("loop"))
      : false
  );
  const [shuffle, setShuffle] = useState(
    localStorage.getItem("shuffle")
      ? JSON.parse(localStorage.getItem("shuffle"))
      : false
  );
  const [paused, setPaused] = useState(true);
  const [masterVolume, setMasterVolume] = useState(
    // 0-1
    localStorage.getItem("masterVolume")
      ? Number(localStorage.getItem("masterVolume"))
      : 0.5
  );
  const [sliderVolume, setSliderVolume] = useState(
    // 0-100
    localStorage.getItem("sliderVolume")
      ? Number(localStorage.getItem("sliderVolume"))
      : 50
  );
  const [muted, setMuted] = useState(false);
  const [duration, setDuration] = useState(60);
  const [songEnded, setSongEnded] = useState(false);

  console.log(
    "provider rerendered"
  )

  async function jumpToSong(index: number) {
    player.pause();
    setHistory([...history, player.src]);
    const songAudio = await window.songs.getSongAudio(songs[index].id);
    player.src = `data:audio/mp3;base64,${songAudio}`;
    setPlaylistIndex(index);
    localStorage.setItem("playlistIndex", index.toString());
    player.play();
  }

  async function playNextSong() {
    // If there is a next song, play it
    player.pause();
    setHistory([...history, player.src]);
    if (songs[playlistIndex + 1]) {
      console.log("theres a next song");
      const songAudio = await window.songs.getSongAudio(
        songs[playlistIndex + 1].id
      );
      player.src = `data:audio/mp3;base64,${songAudio}`;
      setPlaylistIndex(playlistIndex + 1);
      localStorage.setItem("playlistIndex", (playlistIndex + 1).toString());
      if (!paused) {
        player.play();
      }
    } else {
      // Playlist has ended, pause player, set player.src to first song, reset song index
      console.log("no next song");
      const songAudio = await window.songs.getSongAudio(songs[0].id);
      const firstSongInPlaylist = `data:audio/mp3;base64,${songAudio}`;
      player.src = firstSongInPlaylist;
      setPlaylistIndex(0);
      localStorage.setItem("playlistIndex", "0");
      if (loop) {
        setPaused(false);
        player.play();
      } else {
        setPaused(true);
      }
    }
  }

  function playPreviousSong() {
    // If song has been playing for more than 3 seconds, restart song
    if (player.currentTime > 3) {
      player.currentTime = 0;
      return;
    }
    // If there is a previous song, play it, else restart song
    console.log(history);
    if (history.length > 0) {
      player.pause();
      const previousSong = history[history.length - 1];
      setHistory(history.slice(0, history.length - 1));
      setPlaylistIndex(playlistIndex - 1);
      player.src = previousSong;
      if (!paused) {
        player.play();
      }
    } else {
      player.currentTime = 0;
    }
  }

  // Get playlist from main process
  useEffect(() => {
    async function getPlaylist() {
      try {
        const playlist = await window.playlists.getPlaylist(playlistName);
        setPlaylist(playlist);

        const songs = await window.songs.getSongsInPlaylist(playlistName);
        setSongs(songs);

        if (!songs || songs.length === 0) {
          // disable buttons
          return;
        }
        console.log(playlistIndex);
        const songAudio = await window.songs.getSongAudio(
          songs[playlistIndex].id
        );
        player.src = `data:audio/mp3;base64,${songAudio}`;
      } catch (error) {
        console.error(error);
      }
    }
    player.pause();
    localStorage.setItem("playlistName", playlistName);
    getPlaylist();
    if (!paused) {
      player.play();
    }
  }, [playlistName]);

  // When player is initialized, or src is changed, sync player with settings
  useEffect(() => {
    console.log(player.readyState);
    player.onloadedmetadata = () => {
      setDuration(player.duration);
    };
    player.addEventListener("ended", () => {
      console.log("ended");
      setSongEnded(true);
    });
    player.volume = calcTotalVolume(sliderVolume, masterVolume);
    player.muted = muted;
  }, []);

  // Controllers between player state and HTMLAudioElement object
  useEffect(() => {
    if (player) {
      console.log(calcTotalVolume(sliderVolume, masterVolume));
      player.volume = calcTotalVolume(sliderVolume, masterVolume);
    }
    if (sliderVolume === 0) {
      setMuted(true);
    } else {
      setMuted(false);
    }
  }, [sliderVolume, masterVolume]);

  useEffect(() => {
    if (player) {
      player.muted = muted;
    }
  }, [muted]);

  useEffect(() => {
    if (paused) {
      player.pause();
    } else {
      player.play();
    }
  }, [paused]);

  useEffect(() => {
    if (songEnded) {
      playNextSong();
      setSongEnded(false);
    }
  }, [songEnded]);

  return (
    <PlayerContext.Provider
      value={{
        playlistName,
        setPlaylistName,
        playlist,
        setPlaylist,
        playlistIndex,
        setPlaylistIndex,
        player,
        setPlayer,
        songs,
        setSongs,
        loop,
        setLoop,
        shuffle,
        setShuffle,
        paused,
        setPaused,
        masterVolume,
        setMasterVolume,
        sliderVolume,
        setSliderVolume,
        muted,
        setMuted,
        duration,
        setDuration,
        playNextSong,
        playPreviousSong,
        jumpToSong,
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
};

export const usePlayer = () => {
  return useContext(PlayerContext);
};
