import {
  createContext,
  useContext,
  useEffect,
  useState,
  useReducer,
} from "react";
import { Playlist, Song } from "@/db/models";

interface PlayerStateType {
  player: HTMLAudioElement;
  history: String[];
  playlistName: string;
  playlist: Playlist;
  playlistIndex: number;
  songs: Song[];
  loop: boolean;
  shuffle: boolean;
  paused: boolean;
  masterVolume: number;
  sliderVolume: number;
  muted: boolean;
  elapsed: number;
  duration: number;
  songEnded: boolean;
}

const initialState: PlayerStateType = {
  player: new Audio(),
  history: [],
  playlistName: localStorage.getItem("playlistName") || "All songs",
  playlist: null,
  playlistIndex: Number(localStorage.getItem("playlistIndex")) || 0,
  songs: [],
  loop: JSON.parse(localStorage.getItem("loop")) || false,
  shuffle: JSON.parse(localStorage.getItem("shuffle")) || false,
  paused: true,
  masterVolume: Number(localStorage.getItem("masterVolume")) || 0.5,
  sliderVolume: Number(localStorage.getItem("sliderVolume")) || 50,
  muted: false,
  elapsed: 0,
  duration: 60,
  songEnded: false,
};

const actionTypes = {
  SET_HISTORY: "SET_HISTORY",
  SET_PLAYLIST_NAME: "SET_PLAYLIST_NAME",
  SET_PLAYLIST: "SET_PLAYLIST",
  SET_PLAYLIST_INDEX: "SET_PLAYLIST_INDEX",
  SET_SONGS: "SET_SONGS",
  SET_LOOP: "SET_LOOP",
  SET_SHUFFLE: "SET_SHUFFLE",
  SET_PAUSED: "SET_PAUSED",
  SET_MASTER_VOLUME: "SET_MASTER_VOLUME",
  SET_SLIDER_VOLUME: "SET_SLIDER_VOLUME",
  SET_MUTED: "SET_MUTED",
  SET_ELAPSED: "SET_ELAPSED",
  SET_DURATION: "SET_DURATION",
  PLAY_NEXT_SONG: "PLAY_NEXT_SONG",
  PLAY_PREVIOUS_SONG: "PLAY_PREVIOUS_SONG",
  JUMP_TO_SONG: "JUMP_TO_SONG",
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

function playerReducer(state, action) {
  switch (action.type) {
    case actionTypes.SET_HISTORY:
      return { ...state, history: action.payload };
    case actionTypes.SET_PLAYLIST_NAME:
      localStorage.setItem("playlistName", action.playlistName);
      state.playlistName = action.playlistName;
      return { ...state, playlistName: action.payload };
    case actionTypes.SET_PLAYLIST:
      try {
        state.player.pause();
        return { ...state, playlist: action.payload };
      } catch (error) {
        console.error(error);
      }
      return { ...state, playlist: action.payload };
    case actionTypes.SET_PLAYLIST_INDEX:
      return { ...state, playlistIndex: action.payload };
    case actionTypes.SET_SONGS:
      return { ...state, songs: action.payload };
    case actionTypes.SET_LOOP:
      return { ...state, loop: action.payload };
    case actionTypes.SET_SHUFFLE:
      return { ...state, shuffle: action.payload };
    case actionTypes.SET_PAUSED:
      return { ...state, paused: action.payload };
    case actionTypes.SET_MASTER_VOLUME:
      return { ...state, masterVolume: action.payload };
    case actionTypes.SET_SLIDER_VOLUME:
      return { ...state, sliderVolume: action.payload };
    case actionTypes.SET_MUTED:
      return { ...state, muted: action.payload };
    case actionTypes.SET_ELAPSED:
      return { ...state, elapsed: action.payload };
    case actionTypes.SET_DURATION:
      return { ...state, duration: action.payload };
    case actionTypes.PLAY_NEXT_SONG:
      state.player.pause();
      state.history.push(state.player.src);
      const nextIndex = state.playlistIndex + 1;
      if (state.songs[nextIndex]) {
        state.playlistIndex = nextIndex;
        localStorage.setItem("playlistIndex", nextIndex.toString());
        if (state.paused === false) {
          state.player.play();
        }
      } else {
        console.log("no next song");
        state.playlistIndex = 0;
        localStorage.setItem("playlistIndex", "0");
        if (state.loop) {
          state.player.play();
        } else {
          state.paused = true;
        }
      }
      return { ...state, playNextSong: action.payload };
    case actionTypes.PLAY_PREVIOUS_SONG:
      if (state.player.currentTime > 3) {
        state.player.currentTime = 0;
        return { ...state, playPreviousSong: action.payload };
      }
      if (state.history.length > 0) {
        state.player.pause();
        const previousSong = state.history.pop();
        state.player.src = previousSong;
        state.playlistIndex = state.playlistIndex - 1;
        localStorage.setItem("playlistIndex", state.playlistIndex.toString());
        state.player.play();
      } else {
        state.player.currentTime = 0;
      }
      return { ...state, playPreviousSong: action.payload };
    case actionTypes.JUMP_TO_SONG:
      state.player.pause();
      state.history.push(state.player.src);
      state.playlistIndex = action.index;
      localStorage.setItem("playlistIndex", action.index.toString());
      state.player.play();
      return { ...state, jumpToSong: action.payload };
    default:
      return state;
  }
}
export const PlayerContext = createContext(initialState);

import { ReactNode } from "react";

export const PlayerProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(playerReducer, initialState);

  useEffect(() => {
    localStorage.setItem("playlistName", state.playlistName);
    localStorage.setItem("playlistIndex", state.playlistIndex);
    localStorage.setItem("loop", state.loop);
    localStorage.setItem("shuffle", state.shuffle);
    localStorage.setItem("masterVolume", state.masterVolume);
  }, [state]);

  useEffect(() => {
    state.player.volume = calcTotalVolume(
      state.sliderVolume,
      state.masterVolume
    );
  }, [state.sliderVolume, state.masterVolume]);

  useEffect(() => {
    dispatch({ type: actionTypes.SET_PLAYLIST, payload: state.playlistName });
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
