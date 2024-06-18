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

interface Player {
  player: HTMLAudioElement;
  playlist: Playlist;
  history: number[]; // song ids
  autoQueue: number[]; // song ids, songs that are added to the queue automatically
  userQueue: number[]; // song ids, songs that are added to the queue by the user
  currentb64SongAudio: string;
  nextb64SongAudio: string;

  // settings
  masterVolume: number;
  sliderVolume: number;
  loop: boolean;
  shuffle: boolean;
  paused: boolean;
  muted: boolean;
}

const initialState: Player = {
  player: new Audio(),
  history: localStorage.getItem("history")
    ? JSON.parse(localStorage.getItem("history"))
    : [],
  autoQueue: localStorage.getItem("autoQueue")
    ? JSON.parse(localStorage.getItem("autoQueue"))
    : [],
  userQueue: localStorage.getItem("userQueue")
    ? JSON.parse(localStorage.getItem("userQueue"))
    : [],
  playlist: null,
  currentb64SongAudio: "",
  nextb64SongAudio: "",

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

const actionTypes = {
  PUSH_TO_HISTORY: "PUSH_TO_HISTORY",
  SET_PLAYLIST: "SET_PLAYLIST",
  USER_ENQUEUE: "USER_ENQUEUE",
  AUTO_ENQUEUE: "AUTO_ENQUEUE",
  PLAY_SONG: "PLAY_SONG",
  SKIP: "SKIP",
  PREVIOUS: "PREVIOUS",

  TOGGLE_PLAY: "TOGGLE_PLAY",
  TOGGLE_LOOP: "TOGGLE_LOOP",
  TOGGLE_SHUFFLE: "TOGGLE_SHUFFLE",
  TOGGLE_MUTE: "TOGGLE_MUTE",

  SET_MASTER_VOLUME: "SET_MASTER_VOLUME",
  SET_SLIDER_VOLUME: "SET_SLIDER_VOLUME",
};

function calcTotalVolume(sliderVolume: number, masterVolume: number) {
  return (sliderVolume * masterVolume) / 100;
}

async function fetchPlaylist(playlistName: string) {
  try {
    const playlist = await window.playlists.getPlaylist(playlistName);
    return playlist;
  } catch (error) {
    console.error(error);
  }
}

async function fetchSongs(playlistName: string) {
  try {
    const songs = await window.songs.getSongsInPlaylist(playlistName);
    return songs;
  } catch (error) {
    console.error(error);
  }
}

async function fetchSongAudio(songId: number) {
  try {
    const songAudio = await window.songs.getSongAudio(songId);
    return songAudio;
  } catch (error) {
    console.error(error);
  }
}

function playerReducer(state: Player, action) {
  switch (action.type) {
    case actionTypes.PUSH_TO_HISTORY:
      return { ...state, history: [...state.history, action.songs] };

    case actionTypes.SET_PLAYLIST:
      if (!action.playlistName) {
        var playlistName = localStorage.getItem("playlistName") || "All songs";
      } else {
        var playlistName = action.playlistName as string;
      }
      return { ...state };

    case actionTypes.USER_ENQUEUE:
      return { ...state, userQueue: [...state.userQueue, action.songs] };

    case actionTypes.AUTO_ENQUEUE:
      return { ...state, autoQueue: [...state.autoQueue, action.songs] };

    case actionTypes.PLAY_SONG:
      state.player.pause();
      state.currentb64SongAudio = await fetchSongAudio(action.songId);
      state.player.src = `data:audio/mp3;base64,${state.currentb64SongAudio}`;
      state.player.play().then(() => {
        return { ...state };
      });
      return { ...state };

    case actionTypes.SKIP:
      state.player.pause();
      if (state.userQueue.length > 0) {
        let songId = state.userQueue.shift();
        state.currentb64SongAudio = await fetchSongAudio(songId);
        state.player.src = `data:audio/mp3;base64,${state.currentb64SongAudio}`;
        state.player.play();
        return { ...state };
      }
      if (state.autoQueue.length > 0) {
        let songId = state.autoQueue.shift();
        state.currentb64SongAudio = await fetchSongAudio(songId);
        state.player.src = `data:audio/mp3;base64,${state.currentb64SongAudio}`;
        state.player.play();
        return { ...state };
      }

    case actionTypes.PREVIOUS:
      if (state.player.currentTime > 3) {
        state.player.currentTime = 0;
        return { ...state };
      }
      if (state.history.length > 0) {
        state.player.pause();
        let songId = state.history.pop();
        state.currentb64SongAudio = await fetchSongAudio(songId);
        state.player.src = `data:audio/mp3;base64,${state.currentb64SongAudio}`;
        state.player.play();
      } else {
        state.player.currentTime = 0;
      }
      return { ...state };

    case actionTypes.TOGGLE_LOOP:
      return { ...state, loop: !state.loop };

    case actionTypes.TOGGLE_SHUFFLE:
      return { ...state, shuffle: !state.shuffle };

    case actionTypes.TOGGLE_MUTE:
      return { ...state, muted: !state.muted };

    case actionTypes.SET_MASTER_VOLUME:
      return { ...state, masterVolume: action.volume };

    case actionTypes.SET_SLIDER_VOLUME:
      if (action.volume === 0) {
        return { ...state, sliderVolume: action.volume, muted: true };
      } else {
        return { ...state, sliderVolume: action.volume, muted: false };
      }

    default:
      return state;
  }
}
export const PlayerContext = createContext(initialState);

export const PlayerProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(playerReducer, initialState);

  console.log(state);

  useEffect(() => {
    localStorage.setItem("playlistName", state.playlist?.name || "All songs");
    localStorage.setItem("loop", state.loop);
    localStorage.setItem("shuffle", state.shuffle);
    localStorage.setItem("masterVolume", state.masterVolume);
    localStorage.setItem("sliderVolume", state.sliderVolume);
    localStorage.setItem("history", JSON.stringify(state.history));
    localStorage.setItem("userQueue", JSON.stringify(state.userQueue));
    localStorage.setItem("autoQueue", JSON.stringify(state.autoQueue));
  }, [state]);

  useEffect(() => {
    state.player.volume = calcTotalVolume(
      state.sliderVolume,
      state.masterVolume
    );
  }, [state.sliderVolume, state.masterVolume]);

  useEffect(() => {
    dispatch();
  }, []);

  useEffect(() => {
    dispatch({ type: actionTypes.SET_PLAYLIST });
  }, []);

  return (
    <PlayerContext.Provider value={{ ...state, dispatch }}>
      {children}
    </PlayerContext.Provider>
  );
};

export const usePlayer = () => {
  return useContext(PlayerContext);
};
