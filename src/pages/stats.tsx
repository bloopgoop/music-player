import { useState, useEffect } from "react";
import { Playlist, Song } from "@/db/models";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableCaption,
} from "@/components/ui/table";
import Image from "@/components/image";
import { OverlayScrollbarsComponent } from "overlayscrollbars-react";

const Stats = () => {
  const [songs, setSongs] = useState<Song[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  console.log(songs);

  useEffect(() => {
    async function getPlaylist() {
      const songs = await window.songs.getSongsInPlaylist("All songs");
      songs.sort((a, b) => b.listens - a.listens);
      setSongs(songs);
    }
    getPlaylist().then(() => setIsLoading(false));
  }, []);

  if (isLoading) {
    return <Skeleton />;
  }
  return (
    <div className="flex flex-col p-3 h-full overflow-hidden">
      <OverlayScrollbarsComponent
        options={{ scrollbars: { autoHide: "leave" } }}
        defer
      >
        <h1 className="text-center text-2xl font-bold mb-3">Stats</h1>

        <Table className="overflow-auto">
          <TableCaption>Ranking based on listens</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">Title</TableHead>
              <TableHead className="w-[100px]">Album</TableHead>
              <TableHead className="text-right">Listens</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {songs.map((song) => (
              <TableRow key={song.id}>
                <TableCell>
                  {" "}
                  <div className="flex items-center gap-2 w-full h-full truncate">
                    <div className="w-12">
                      <Image
                        mime={song.image_mime}
                        buffer={song.image_buffer}
                        alt="cover"
                      />
                    </div>
                    <div className="flex flex-col">
                      <div className="font-bold">
                        {song.title ? song.title : song.path}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {song.artist && song.artist}
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>{song.album || "Unkown"}</TableCell>
                <TableCell className="text-right">{song.listens}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </OverlayScrollbarsComponent>
    </div>
  );
};
export default Stats;
