import { useState, useEffect } from "react";
import { DataTable } from "@/components/playlist/dataTable";
import { columns } from "@/components/playlist/columns";
import { Playlist, Song } from "@/db/models";
import { OverlayScrollbarsComponent } from "overlayscrollbars-react";

export default function DemoPage() {
  const [playlist, setPlaylist] = useState<Playlist>();
  const [songs, setSongs] = useState<Song[]>([]);
  const location = "All songs";

  useEffect(() => {
    async function getPlaylist() {
      const playlist = await window.playlists.getPlaylist(location);
      setPlaylist(playlist);
      const songs = await window.songs.getSongsInPlaylist(location);
      setSongs(songs);
    }
    getPlaylist();
  }, [location]);

  return (
    <div className="p-3 h-full flex flex-col overflow-hidden">
      <OverlayScrollbarsComponent
        options={{ scrollbars: { autoHide: "leave" } }}
        defer
      >
        <DataTable columns={columns} data={songs} playlist="All songs"/>
      </OverlayScrollbarsComponent>
    </div>
  );
}
