import { contextBridge, ipcRenderer } from "electron";
import { get } from "react-hook-form";
import { addSongToPlaylist, deleteSongFromPlaylist } from "./db/crud";

// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

contextBridge.exposeInMainWorld("songs", {
  registerSongs: (args: any) => ipcRenderer.send("register songs", args),
  getSongAudio: (id: number) => ipcRenderer.invoke("get song audio", id),
  getSongsInPlaylist: (playlistName: string) => ipcRenderer.invoke("get songs in playlist", playlistName),
  getSongMetadata: (id: number) => ipcRenderer.invoke("get song metadata", id),
  editSong(id: number, args: any) {
    ipcRenderer.invoke("edit song", id, args);
  }
});

contextBridge.exposeInMainWorld("playlists", {
  createPlaylist: () => ipcRenderer.invoke("create playlist"),
  getAllPlaylists: () => ipcRenderer.invoke("get all playlists"),
  recieveAllPlaylists: (callback: Function) => {
    ipcRenderer.on("recieve all playlists", (event, data) => callback(data));
  },

  getPlaylist: (playlistName: string) =>
    ipcRenderer.invoke("get playlist", playlistName),
  deletePlaylist: (id: number) => ipcRenderer.invoke("delete playlist", id),
  editPlaylist: (args: any) => ipcRenderer.invoke("edit playlist", args),

  addSongToPlaylist: (playlistName: string, songId: number) => ipcRenderer.invoke("add song to playlist", playlistName, songId),
  deleteSongFromPlaylist: (playlistName: string, songId: number) => ipcRenderer.invoke("delete song from playlist", playlistName, songId),
  recievePlaylistUpdate: (callback: Function) => {
    ipcRenderer.on("recieve playlist update", (event, data) => callback(data));
  }
});
