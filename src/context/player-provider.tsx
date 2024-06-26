// @ts-nocheck
import {
  createContext,
  useContext,
  useEffect,
  useState,
  useReducer,
} from "react";
import { Playlist, Song } from "@/db/models";
import { ReactNode } from "react";
import { shuffleArray } from "@/lib/utils";
import { Shuffle } from "lucide-react";

const MAX_AUTO_QUEUE_LENGTH = 20;

interface Player {
  player: HTMLAudioElement;
  currentSongId: number;
  currentPlaylistName: string;
  history: number[]; // song ids
  autoQueue: number[]; // song ids, songs that are added to the queue automatically
  userQueue: number[]; // song ids, songs that are added to the queue by the user
  shuffleQueue: number[]; // song ids, shuffled songs from a playlist
  songStart: Date;

  // settings
  masterVolume: number;
  sliderVolume: number;
  loop: boolean;
  shuffle: boolean;
  paused: boolean;
  muted: boolean;

  // actions
  playSong: (songId: number) => void;
  skip: () => void;
  previous: () => void;

  pushToHistory: (songIds: number[]) => void;
  pushToAutoQueue: (songIds: number[]) => void;
  pushToUserQueue: (songIds: number[]) => void;

  clearHistory: () => void;
  clearAutoQueue: () => void;
  clearUserQueue: () => void;

  togglePlay: () => void;
  toggleMute: () => void;
  toggleLoop: () => void;
  toggleShuffle: () => void;

  setCurrentPlaylistName: (playlistName: string) => void;
  setMasterVolume: (volume: number) => void;
  setSliderVolume: (volume: number) => void;

  shuffleAutoQueue: () => void;
}

const initialState: Player = {
  player: new Audio(),
  currentSongId: localStorage.getItem("currentSongId")
    ? Number(localStorage.getItem("currentSongId"))
    : null,
  currentPlaylistName: localStorage.getItem("currentPlaylistName")
    ? localStorage.getItem("currentPlaylistName")
    : "All songs",
  history: localStorage.getItem("history")
    ? JSON.parse(localStorage.getItem("history"))
    : [],
  autoQueue: localStorage.getItem("autoQueue")
    ? JSON.parse(localStorage.getItem("autoQueue"))
    : [],
  userQueue: localStorage.getItem("userQueue")
    ? JSON.parse(localStorage.getItem("userQueue"))
    : [],
  shuffleQueue: localStorage.getItem("shuffleQueue")
    ? JSON.parse(localStorage.getItem("shuffleQueue"))
    : [],
  songStart: new Date(),

  masterVolume: localStorage.getItem("masterVolume")
    ? Number(localStorage.getItem("masterVolume"))
    : 0.5,
  sliderVolume: localStorage.getItem("sliderVolume")
    ? Number(localStorage.getItem("sliderVolume"))
    : 50,
  loop: localStorage.getItem("loop")
    ? JSON.parse(localStorage.getItem("loop"))
    : false,
  shuffle: localStorage.getItem("shuffle")
    ? JSON.parse(localStorage.getItem("shuffle"))
    : false,
  paused: true,
  muted: false,
};

export const actionTypes = {
  PLAY_SONG: "PLAY_SONG",
  SKIP: "SKIP",
  PREVIOUS: "PREVIOUS",

  PUSH_TO_HISTORY: "PUSH_TO_HISTORY",
  PUSH_TO_AUTO_QUEUE: "PUSH_TO_AUTO_QUEUE",
  PUSH_TO_USER_QUEUE: "PUSH_TO_USER_QUEUE",

  CLEAR_HISTORY: "CLEAR_HISTORY",
  CLEAR_AUTO_QUEUE: "CLEAR_AUTO_QUEUE",
  CLEAR_USER_QUEUE: "CLEAR_USER_QUEUE",

  SET_PLAYLIST_NAME: "SET_PLAYLIST_NAME",
  SET_MASTER_VOLUME: "SET_MASTER_VOLUME",
  SET_SLIDER_VOLUME: "SET_SLIDER_VOLUME",
  SET_LOOP: "SET_LOOP",
  SET_SHUFFLE: "SET_SHUFFLE",
  SET_PAUSED: "SET_PAUSED",
  SET_MUTED: "SET_MUTED",

  USE_SHUFFLE_QUEUE: "USE_SHUFFLE_QUEUE",
  SHUFFLE_AUTOQUEUE: "SHUFFLE_AUTOQUEUE",
};

function calcTotalVolume(sliderVolume: number, masterVolume: number) {
  return (sliderVolume * masterVolume) / 100;
}

function safePlay(player: HTMLAudioElement) {
  var playPromise = player.play();
  if (playPromise !== undefined) {
    playPromise
      .then((_) => {
        console.log("Audio is playing");
        return;
      })
      .catch((error) => {
        console.error("Error playing audio:", error);
      });
  }
}

function playerReducer(state: Player, action) {
  switch (action.type) {
    case actionTypes.PLAY_SONG: {
      let newHistory = state.currentSongId
        ? [...state.history, state.currentSongId]
        : [...state.history];
      localStorage.setItem("currentSongId", action.payload); // Set new currentSongId
      return {
        ...state,
        history: newHistory,
        paused: false,
        currentSongId: action.payload,
      };
    }

    case actionTypes.SKIP: {
      const updatedHistory = state.currentSongId
        ? [...state.history, state.currentSongId]
        : [...state.history];
      let nextSongId;
      let updatedUserQueue = [...state.userQueue];
      let updatedAutoQueue = [...state.autoQueue];

      if (updatedUserQueue.length > 0) {
        nextSongId = updatedUserQueue.shift();
      } else if (updatedAutoQueue.length > 0) {
        nextSongId = updatedAutoQueue.shift();
      } else {
        nextSongId = state.currentSongId;
      }

      localStorage.setItem("currentSongId", nextSongId);

      return {
        ...state,
        history: updatedHistory,
        currentSongId: nextSongId,
        userQueue: updatedUserQueue,
        autoQueue: updatedAutoQueue,
      };
    }

    case actionTypes.PREVIOUS: {
      if (state.player.currentTime > 3) {
        state.player.currentTime = 0;
        return state;
      }
      if (state.history.length === 0) {
        return state;
      }
      let newHistory = [...state.history];
      let newAutoQueue = [...state.autoQueue];
      let previousSongId = newHistory.pop();
      let newCurrentSongId = previousSongId;
      newAutoQueue.unshift(state.currentSongId);
      localStorage.setItem("currentSongId", newCurrentSongId);
      return {
        ...state,
        history: newHistory,
        autoQueue: newAutoQueue,
        currentSongId: newCurrentSongId,
      };
    }

    case actionTypes.PUSH_TO_HISTORY: {
      return { ...state, history: state.history.concat(action.payload) };
    }

    case actionTypes.PUSH_TO_AUTO_QUEUE: {
      return { ...state, autoQueue: state.autoQueue.concat(action.payload) };
    }

    case actionTypes.PUSH_TO_USER_QUEUE: {
      if (action.position === "next") {
        return { ...state, userQueue: state.userQueue.concat(action.payload) };
      } else {
        return { ...state, userQueue: state.userQueue.concat(action.payload) };
      }
    }

    case actionTypes.CLEAR_HISTORY:
      return { ...state, history: [] };

    case actionTypes.CLEAR_AUTO_QUEUE:
      return { ...state, autoQueue: [] };

    case actionTypes.CLEAR_USER_QUEUE:
      return { ...state, userQueue: [] };

    case actionTypes.SET_PLAYLIST_NAME:
      localStorage.setItem("currentPlaylistName", action.payload);
      return { ...state, currentPlaylistName: action.payload };

    case actionTypes.SET_MASTER_VOLUME:
      state.player.volume = calcTotalVolume(state.sliderVolume, action.payload);
      return { ...state, masterVolume: action.payload };

    case actionTypes.SET_SLIDER_VOLUME:
      state.player.volume = calcTotalVolume(action.payload, state.masterVolume);
      if (action.payload === 0) {
        return { ...state, sliderVolume: action.payload, muted: true };
      } else {
        return { ...state, sliderVolume: action.payload, muted: false };
      }

    case actionTypes.SET_LOOP:
      localStorage.setItem("loop", action.payload);
      return { ...state, loop: action.payload };

    case actionTypes.SET_SHUFFLE:
      localStorage.setItem("shuffle", action.shuffle);
      localStorage.setItem("shuffleQueue", JSON.stringify(action.shuffleQueue));
      return {
        ...state,
        shuffle: action.shuffle,
        shuffleQueue: action.shuffleQueue,
      };

    case actionTypes.SET_PAUSED:
      if (action.payload) {
        state.player.pause();
      } else {
        safePlay(state.player);
      }
      return { ...state, paused: action.payload };

    case actionTypes.SET_MUTED:
      return { ...state, muted: action.payload };

    case actionTypes.USE_SHUFFLE_QUEUE: {
      const amount = action.diff;
      let nextSongs = state.shuffleQueue.slice(0, amount);
      let newShuffleState = state.shuffleQueue.slice(amount) || [];
      return {
        ...state,
        autoQueue: state.autoQueue.concat(nextSongs),
        shuffleQueue: newShuffleState,
      };
    }

    case actionTypes.SHUFFLE_AUTOQUEUE: {
      let newAutoQueue = [...state.autoQueue]
      shuffleArray(newAutoQueue);
      return { ...state, autoQueue: newAutoQueue, shuffle: true };
    }

    default:
      return state;
  }
}

export const PlayerContext = createContext(initialState);
export const PlayerDispatchContext = createContext(null);

export const PlayerProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(playerReducer, initialState);

  console.log("player rerendered", state);

  // Auto queue up to 20 songs, starting from the current song
  async function autoQueueSongs() {
    const diff = MAX_AUTO_QUEUE_LENGTH - state.autoQueue.length;
    let nextSongs = [];
    if (diff > 0) {
      // If shuffle is on, push the suffled songs to autoqueue first
      if (state.shuffle && state.shuffleQueue.length > 0) {
        dispatch({ type: actionTypes.USE_SHUFFLE_QUEUE, diff: diff });
      }

      const playlistName = state.currentPlaylistName || "All songs";
      const songsIds = await window.playlists.getSongIds(playlistName);
      const currentSongIndex = songsIds.findIndex(
        (songId) => songId === state.currentSongId
      );

      // Get the next songs in the current playlist
      nextSongs = songsIds.slice(
        currentSongIndex + 1,
        currentSongIndex + 1 + diff
      );

      if (state.loop) {
        while (nextSongs.length < diff) {
          nextSongs = nextSongs.concat(
            songsIds.slice(0, diff - nextSongs.length)
          );
        }
      } else {
        // Get from all songs
        const allSongsIds = await window.playlists.getSongIds("All songs");
        const currentSongIndexInAllPlaylist = allSongsIds.findIndex(
          (songId) => songId === state.currentSongId
        );
        nextSongs = nextSongs.concat(
          allSongsIds.slice(
            currentSongIndexInAllPlaylist + 1,
            currentSongIndexInAllPlaylist + 1 + diff - nextSongs.length
          )
        );
        while (nextSongs.length < diff) {
          nextSongs = nextSongs.concat(
            allSongsIds.slice(0, diff - nextSongs.length)
          );
        }
      }
    }
    dispatch({ type: actionTypes.PUSH_TO_AUTO_QUEUE, payload: nextSongs });

    // if (state.autoQueue.length < MAX_AUTO_QUEUE_LENGTH) {
    //   let diff = MAX_AUTO_QUEUE_LENGTH - state.autoQueue.length;
    //   let playlistName;
    //   if (state.currentPlaylistName) {
    //     playlistName = state.currentPlaylistName;
    //   } else {
    //     playlistName = "All songs";
    //   }

    //   let songsIds = await window.playlists.getSongIds(playlistName);
    //   // find the index of the current song
    //   let currentSongIndex = songsIds.findIndex(
    //     (songId: number) => songId === state.currentSongId
    //   );
    //   let nextSongIndex = currentSongIndex + 1;
    //   let nextSongs = songsIds.slice(nextSongIndex, nextSongIndex + diff);

    //   if (state.loop) {
    //     while (nextSongs.length < diff) {
    //       nextSongs = nextSongs.concat(
    //         songsIds.slice(0, diff - nextSongs.length)
    //       );
    //     }
    //   } else {
    //     // get from all songs
    //     let songsIds = await window.playlists.getSongIds("All songs");
    //     let currentSongIndex = songsIds.findIndex(
    //       (songId: number) => songId === state.currentSongId
    //     );
    //     nextSongIndex = currentSongIndex + 1;
    //     nextSongs = nextSongs.concat(
    //       songsIds.slice(nextSongIndex, nextSongIndex + diff)
    //     );
    //     while (nextSongs.length < diff) {
    //       nextSongs = nextSongs.concat(
    //         songsIds.slice(0, diff - nextSongs.length)
    //       );
    //     }
    //   }
    // }
  }

  function playSong(songId: number) {
    dispatch({ type: actionTypes.PLAY_SONG, payload: songId });
  }

  function skip() {
    dispatch({ type: actionTypes.SKIP });
  }

  function previous() {
    dispatch({ type: actionTypes.PREVIOUS });
  }

  function pushToHistory(songIds: number[]) {
    dispatch({ type: actionTypes.PUSH_TO_HISTORY, payload: songIds });
  }

  function pushToAutoQueue(songIds: number[], position: string = "last") {
    dispatch({
      type: actionTypes.PUSH_TO_AUTO_QUEUE,
      payload: songIds,
      position: position,
    });
  }

  function pushToUserQueue(songIds: number[]) {
    dispatch({ type: actionTypes.PUSH_TO_USER_QUEUE, payload: songIds });
  }

  function clearHistory() {
    dispatch({ type: actionTypes.CLEAR_HISTORY });
  }

  function clearAutoQueue() {
    dispatch({ type: actionTypes.CLEAR_AUTO_QUEUE });
  }

  function clearUserQueue() {
    dispatch({ type: actionTypes.CLEAR_USER_QUEUE });
  }

  function togglePlay() {
    console.log("togglePlay called");
    if (state.paused) {
      dispatch({ type: actionTypes.SET_PAUSED, payload: false });
      safePlay(state.player);
    } else {
      dispatch({ type: actionTypes.SET_PAUSED, payload: true });
    }
  }
  function toggleMute() {
    dispatch({ type: actionTypes.SET_MUTED, payload: !state.muted });
  }
  function toggleLoop() {
    dispatch({ type: actionTypes.SET_LOOP, payload: !state.loop });
  }

  function toggleShuffle() {
    dispatch({ type: actionTypes.SET_SHUFFLE, payload: !state.shuffle });
  }

  function setCurrentPlaylistName(playlistName: string) {
    dispatch({ type: actionTypes.SET_PLAYLIST_NAME, payload: playlistName });
  }
  function setMasterVolume(volume: number) {
    dispatch({ type: actionTypes.SET_MASTER_VOLUME, payload: volume });
  }
  function setSliderVolume(volume: number) {
    dispatch({ type: actionTypes.SET_SLIDER_VOLUME, payload: volume });
  }

  function shuffleAutoQueue() {
    dispatch({ type: actionTypes.SHUFFLE_AUTOQUEUE });
  }

  useEffect(() => {
    state.player.volume = calcTotalVolume(
      state.sliderVolume,
      state.masterVolume
    );
  }, [state.sliderVolume, state.masterVolume]);

  useEffect(() => {
    localStorage.setItem("history", JSON.stringify(state.history));
    localStorage.setItem("userQueue", JSON.stringify(state.userQueue));
    localStorage.setItem("autoQueue", JSON.stringify(state.autoQueue));
    localStorage.setItem("shuffleQueue", JSON.stringify(state.shuffleQueue));
    localStorage.setItem("currentSongId", state.currentSongId);
    localStorage.setItem("currentPlaylistName", state.currentPlaylistName);
    localStorage.setItem("masterVolume", state.masterVolume);
    localStorage.setItem("sliderVolume", state.sliderVolume);
    localStorage.setItem("loop", state.loop);
    localStorage.setItem("shuffle", state.shuffle);
  }, [state]);

  useEffect(() => {
    async function getCurrentAudio() {
      if (state.currentSongId) {
        await window.songs.incrementListens(state.currentSongId);
        const songAudio = await window.songs.getSongAudio(state.currentSongId);
        state.player.src = `data:audio/mp3;base64,${songAudio}`;
      }
    }

    state.player.addEventListener("ended", () => {
      dispatch({ type: actionTypes.SKIP });
    });

    if (state.autoQueue.length < MAX_AUTO_QUEUE_LENGTH) {
      autoQueueSongs();
    }

    getCurrentAudio().then(() => {
      if (!state.paused) {
        safePlay(state.player);
      }
    });
  }, [state.currentSongId]);

  const value = {
    player: state.player,
    currentSongId: state.currentSongId,
    currentPlaylistName: state.currentPlaylistName,
    history: state.history,
    autoQueue: state.autoQueue,
    userQueue: state.userQueue,

    masterVolume: state.masterVolume,
    sliderVolume: state.sliderVolume,
    loop: state.loop,
    shuffle: state.shuffle,
    paused: state.paused,
    muted: state.muted,

    playSong: playSong,
    skip: skip,
    previous: previous,

    pushToHistory: pushToHistory,
    pushToAutoQueue: pushToAutoQueue,
    pushToUserQueue: pushToUserQueue,

    clearHistory: clearHistory,
    clearAutoQueue: clearAutoQueue,
    clearUserQueue: clearUserQueue,

    togglePlay: togglePlay,
    toggleMute: toggleMute,
    toggleLoop: toggleLoop,
    toggleShuffle: toggleShuffle,

    setCurrentPlaylistName: setCurrentPlaylistName,
    setMasterVolume: setMasterVolume,
    setSliderVolume: setSliderVolume,

    shuffleAutoQueue:shuffleAutoQueue
  };

  return (
    <PlayerContext.Provider value={value}>
      <PlayerDispatchContext.Provider value={dispatch}>
        {children}
      </PlayerDispatchContext.Provider>
    </PlayerContext.Provider>
  );
};

export const usePlayer = () => {
  return useContext(PlayerContext);
};
export const usePlayerDispatch = () => {
  return useContext(PlayerDispatchContext);
};
