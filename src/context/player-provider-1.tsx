import { createContext, useContext, useEffect, useState } from "react";
import { Playlist, Song } from "@/db/models";

type PlayerContextType = {
  player: HTMLAudioElement;
  currentSongId: number;
  currentPlaylistName: string;
  masterVolume: number;
  sliderVolume: number;
  loop: boolean;
  muted: boolean;
  shuffle: boolean;
  paused: boolean;
  ready: boolean;
  history: number[];
  autoQueue: number[];
  userQueue: number[];
  pushToHistory: (songIds: number[]) => void;
  clearHistory: () => void;
  pushToAutoQueue: (songIds: number[]) => void;
  clearAutoQueue: () => void;
  pushToUserQueue: (songIds: number[]) => void;
  playSong: (songId: number) => Promise<void>;
  skip: () => Promise<void>;
  previous: () => Promise<void>;
  togglePlay: () => void;
  toggleMute: () => void;
  toggleLoop: () => void;
  toggleShuffle: () => void;
  setCurrentPlaylistName: (playlistName: string) => void;
  setMasterVolume: (volume: number) => void;
  setSliderVolume: (volume: number) => void;
};

const initialPlayerContext: PlayerContextType = {  
  player: new Audio(),
  currentSongId: null,
  currentPlaylistName: "",
  masterVolume: 0.5,
  sliderVolume: 50,
  loop: false,
  muted: false,
  shuffle: false,
  paused: true,
  ready: false,
  history: [],
  autoQueue: [],
  userQueue: [],
  pushToHistory: () => {},
  clearHistory: () => {},
  pushToAutoQueue: () => {},
  clearAutoQueue: () => {},
  pushToUserQueue: () => {},
  playSong: () => new Promise(() => {}),
  skip: () => new Promise(() => {}),
  previous: () => new Promise(() => {}),
  togglePlay: () => {},
  toggleMute: () => {},
  toggleLoop: () => {},
  toggleShuffle: () => {},
  setCurrentPlaylistName: () => {},
  setMasterVolume: () => {},
  setSliderVolume: () => {},
};

function calcTotalVolume(sliderVolume: number, masterVolume: number) {
  return (sliderVolume * masterVolume) / 100;
}

export const PlayerContext = createContext(initialPlayerContext);

export const PlayerProvider = ({ children }: { children: React.ReactNode }) => {
  const [player] = useState<HTMLAudioElement>(new Audio());
  const [history, setHistory] = useState<number[]>(
    localStorage.getItem("history")
      ? JSON.parse(localStorage.getItem("history"))
      : []
  );
  const [autoQueue, setAutoQueue] = useState<number[]>(
    localStorage.getItem("autoQueue")
      ? JSON.parse(localStorage.getItem("autoQueue"))
      : []
  );
  const [userQueue, setUserQueue] = useState<number[]>(
    localStorage.getItem("userQueue")
      ? JSON.parse(localStorage.getItem("userQueue"))
      : []
  );
  const [currentSongId, setCurrentSongId] = useState<number>(
    localStorage.getItem("currentSongId")
      ? Number(localStorage.getItem("currentSongId"))
      : null
  );
  const [currentPlaylistName, setCurrentPlaylistName] = useState<string>(
    localStorage.getItem("currentPlaylistName")
      ? localStorage.getItem("currentPlaylistName")
      : "All songs"
  );
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
  const [muted, setMuted] = useState(false);
  const [ready, setReady] = useState(false);

  // console.log("provider rerendered");
  // console.log("history", history)
  // console.log("autoQueue", autoQueue)

  function safePlay() {
    setReady(false);
    var playPromise = player.play();

    // console.log("safePlay called");
    // console.log(playPromise)
    if (playPromise !== undefined) {
      playPromise
        .then((_) => {
          console.log("Audio is playing");
          setPaused(false);
          setReady(true);
          return
        })
        .catch((error) => {
          console.error("Error playing audio:", error);
          setReady(true);
        });
    }
  }

  function pushToHistory(songIds: number[]) {
    setHistory([...history, ...songIds]);
    localStorage.setItem("history", JSON.stringify([...history, ...songIds]));
  }

  function clearHistory() {
    setHistory([]);
    localStorage.setItem("history", JSON.stringify([]));
  }

  function pushToAutoQueue(songIds: number[]) {
    setAutoQueue([...autoQueue, ...songIds]);
    localStorage.setItem(
      "autoQueue",
      JSON.stringify([...autoQueue, ...songIds])
    );
  }

  function clearAutoQueue() {
    setAutoQueue([]);
    localStorage.setItem("autoQueue", JSON.stringify([]));
  }

  function pushToUserQueue(songIds: number[]) {
    setUserQueue([...userQueue, ...songIds]);
    localStorage.setItem(
      "userQueue",
      JSON.stringify([...userQueue, ...songIds])
    );
  }

  async function playSong(songId: number) {
    if (currentSongId) {
      pushToHistory([currentSongId]);
    }
    setCurrentSongId(songId);
    localStorage.setItem("currentSongId", songId.toString());
    const songAudio = await window.songs.getSongAudio(songId);
    player.src = `data:audio/mp3;base64,${songAudio}`;
    safePlay();
  }

  async function skip() {
    pushToHistory([currentSongId]);
    let nextId;
    if (userQueue.length > 0) {
      nextId = userQueue[0];
      setUserQueue(userQueue.slice(1));
    } else if (autoQueue.length > 0) {
      nextId = autoQueue[0];
      setAutoQueue(autoQueue.slice(1));
    } else {
      // Handle case where there is no song to skip to
      return;
    }
    setCurrentSongId(nextId);
    localStorage.setItem("currentSongId", nextId.toString());
    const songAudio = await window.songs.getSongAudio(nextId);
    player.src = `data:audio/mp3;base64,${songAudio}`;
    safePlay();
  }

  async function previous(): Promise<void> {
    if (player.currentTime > 3) {
      player.currentTime = 0;
      return new Promise((resolve) => resolve(undefined));
    }
    if (history.length > 0) {
      player.pause();
      let songId = history[history.length - 1];
      setHistory(history.slice(0, history.length - 1));
      setCurrentSongId(songId);
      localStorage.setItem("currentSongId", songId.toString());
      const songAudio = await window.songs.getSongAudio(songId);
      player.src = `data:audio/mp3;base64,${songAudio}`;
      safePlay();
    } else {
      player.currentTime = 0;
      return new Promise((resolve) => resolve(undefined));
    }
  }

  function togglePlay() {
    setPaused(!paused);
  }

  function toggleMute() {
    setMuted(!muted);
  }

  function toggleLoop() {
    localStorage.setItem("loop", JSON.stringify(!loop));
    setLoop(!loop);
  }

  function toggleShuffle() {
    localStorage.setItem("shuffle", JSON.stringify(!shuffle));
    setShuffle(!shuffle);
  }

  // Get playlist from main process
  useEffect(() => {
    async function getCurrentAudio() {
      if (currentSongId) {
        const songAudio = await window.songs.getSongAudio(currentSongId);
        player.src = `data:audio/mp3;base64,${songAudio}`;
      }
    }
    getCurrentAudio().then(() => {
      if (!paused) {
        safePlay();
      }
    });
    setReady(true);
  }, [currentSongId]);

  // When player is initialized, or src is changed, sync player with settings
  useEffect(() => {
    player.addEventListener("ended", async () => {
      await skip();
    });
    // enqueue next song
    async function autoQueueSongs(playlistName: string) {
      const songs = await window.songs.getSongsInPlaylist(playlistName);
      let currentSongIndex = songs.findIndex((song: Song) => song.id === currentSongId);
      let nextSongIndex = currentSongIndex + 1;
      songs.slice(nextSongIndex, nextSongIndex + 20);
      pushToAutoQueue(songs.map((song: Song) => song.id));
    }

    if (loop && (autoQueue.length < 20)) {
      console.log("autoQueueing songs")
      console.log(autoQueue)
      autoQueueSongs(currentPlaylistName);
    }
  }, [player.src]);

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
      safePlay();
    }
  }, [paused]);

  return (
    <PlayerContext.Provider
      value={{
        pushToHistory,
        clearHistory,
        pushToAutoQueue,
        clearAutoQueue,
        pushToUserQueue,
        playSong,
        skip,
        previous,
        togglePlay,
        toggleMute,
        toggleLoop,
        toggleShuffle,
        player,
        currentSongId,
        currentPlaylistName,
        setCurrentPlaylistName,
        masterVolume,
        setMasterVolume,
        sliderVolume,
        setSliderVolume,
        loop,
        muted,
        shuffle,
        paused,
        ready,
        history,
        autoQueue,
        userQueue,
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
};

export const usePlayer = () => {
  return useContext(PlayerContext);
};
