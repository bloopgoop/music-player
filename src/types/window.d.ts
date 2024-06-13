import { deleteSongFromPlaylist } from "@/db/crud";
import { Song } from "@/db/models";
import { Playlist } from "@/db/models";

declare global {
    interface Window {
        songs: {
            registerSongs: (args: any) => void;
            getSongAudio: (id: number) => Promise<string>;
            getSongsInPlaylist: (playlistName: string) => Promise<Song[]>;
        };
        playlists: {
            createPlaylist: () => Promise<Playlist>;
            getAllPlaylists: () => Promise<Playlist[]>;
            recieveAllPlaylists: (callback: Function) => void;
            getPlaylist: (playlistName: string) => Promise<Playlist>;
            deletePlaylist: (id: number) => Promise<number>;
            editPlaylist: (args: any) => Promise<Playlist>;
            addSongToPlaylist: (playlistName: string, songId: number) => Promise<void>;
            deleteSongFromPlaylist: (playlistName: string, songId: number) => Promise<void>;
        };
    }
}

export {};