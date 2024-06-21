import Image from "@/components/image";
import { usePlayer } from "@/context/player-provider";
import { useUi } from "@/context/ui-provider";
import { useNavigate } from "react-router-dom";
import { Song, Playlist } from "@/db/models";
import { useState, useEffect } from "react";
import { OverlayScrollbarsComponent } from "overlayscrollbars-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
// import { useQuery } from "@tanstack/react-query";

const Queue = ({ ...props }: { [key: string]: any }) => {
  // const { isPending, isError, data, error } = useQuery({
  //   queryKey: ["playlists"],
  //   queryFn: async () => {
  //     const playlists = await window.playlists.getAllPlaylists();
  //     return playlists;
  //   },
  // });
  const navigate = useNavigate();
  const player = usePlayer();
  const ui = useUi();
  const [userQueue, setUserQueue] = useState<Song[]>([]);
  const [autoQueue, setAutoQueue] = useState<Song[]>([]);
  const [history, setHistory] = useState<Song[]>([]);

  useEffect(() => {
    async function fetchUserQueueData() {
      if (player.userQueue) {
        const songs = await window.songs.getSongsInQueue(player.userQueue);
        setUserQueue(songs);
      }
    }
    fetchUserQueueData();
  }, [player.userQueue]);

  useEffect(() => {
    async function fetchAutoQueueData() {
      if (player.autoQueue) {
        const songs = await window.songs.getSongsInQueue(player.autoQueue);
        setAutoQueue(songs);
      }
    }
    fetchAutoQueueData();
  }, [player.autoQueue]);

  useEffect(() => {
    async function fetchHistoryData() {
      const songs = await window.songs.getSongsInQueue(player.history);
      setHistory(songs);
    }
    fetchHistoryData();
  }, [player.history]);

  return (
    <div className="h-full w-full overflow-hidden" {...props}>
      <OverlayScrollbarsComponent
        options={{ scrollbars: { autoHide: "leave" } }}
        className="h-full w-full overflow-hidden"
        defer
      >
        <div>
          <Table>
            <TableHeader className="p-4 text-lg font-bold">
              <TableRow>
                <TableCell>Now playing</TableCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2 w-full h-full truncate">
                    <div className="w-12">
                      <Image
                        mime={ui.currentSong?.image_mime}
                        buffer={ui.currentSong?.image_buffer}
                        alt="cover"
                      />
                    </div>
                    <div className="flex flex-col">
                      <div className="font-bold">
                        {ui.currentSong?.title
                          ? ui.currentSong?.title
                          : ui.currentSong?.path}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {ui.currentSong?.artist && ui.currentSong?.artist}
                      </div>
                    </div>
                  </div>
                </TableCell>
              </TableRow>
            </TableBody>
            {userQueue.length > 0 && (
              <>
                <TableHeader className="p-4 text-lg font-bold">
                  <TableRow>
                    <TableCell>Next in queue</TableCell>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {userQueue.map((song, index) => (
                    <TableRow key={"user" + index}>
                      <TableCell className="font-medium">
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
                    </TableRow>
                  ))}
                </TableBody>
              </>
            )}
            {autoQueue.length > 0 && (
              <>
                <TableHeader className="p-4 text-lg font-bold">
                  <TableRow>
                    <TableCell>
                      Next from: {player.currentPlaylistName}
                    </TableCell>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {autoQueue.map((song, index) => (
                    <TableRow key={"auto" + index}>
                      <TableCell className="font-medium">
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
                    </TableRow>
                  ))}
                </TableBody>
              </>
            )}
          </Table>
        </div>
      </OverlayScrollbarsComponent>
    </div>
  );
};
export default Queue;
