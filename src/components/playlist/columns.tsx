import { ColumnDef } from "@tanstack/react-table";
import { Song } from "@/db/models";
import { TimerIcon, DotsHorizontalIcon, PlayIcon } from "@radix-ui/react-icons";
import { formatTime } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import PlayButton from "./columnPlayButton";
import { usePlayer } from "@/context/player-provider";
import Image from "@/components/image";
import { useMemo, useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import EditSongModal from "@/components/editSongModal";

export const columns: ColumnDef<Song>[] = [
  {
    id: "select",
    accessorKey: "select",
    size: 40,
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected()}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: true,
  },
  {
    accessorKey: "index",
    size: 60,
    header: () => <div className="w-full text-center">#</div>,
    cell: ({ row, table }) => {
      const { currentSongId, currentPlaylistName } = usePlayer();
      const isHovered = table.options.meta.hoveredRow == row.id;
      const isActive =
        currentPlaylistName === table.options.meta.playlist &&
        row.original.id === currentSongId;

      return useMemo(() => {
        if (!isHovered && !isActive) {
          return <div className="w-full text-center">{row.index + 1}</div>;
        }
        return (
          <div className="w-full flex justify-center">
            <PlayButton
              playlist={table.options.meta.playlist}
              songId={row.original.id}
            />
          </div>
        );
      }, [isHovered, isActive, table.options.meta.playlist, row.index]);
    },
  },
  {
    accessorKey: "title",
    header: "Title",
    cell: ({ row }) => {
      const song = row.original;
      return (
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
      );
    },
  },
  {
    accessorKey: "date_added",
    header: "Date added",
    cell: ({ row }) => {
      const song = row.original;
      const date = new Date(song.date_added);
      return date.toLocaleDateString();
    },
  },
  {
    accessorKey: "duration",
    size: 60,
    header: () => <TimerIcon />,
    cell: ({ row }) => {
      const song = row.original;
      return song.duration && formatTime(song.duration);
    },
  },
  {
    accessorKey: "actions",
    header: "",
    size: 60,
    cell: ({ row, table }) => {
      const player = usePlayer();
      const [isEditSong, setIsEditDialogOpen] = useState(false);

      async function addSongToPlaylist(playlistName: string, songId: number) {
        await window.playlists.addSongToPlaylist(playlistName, songId);
      }

      async function deleteSongFromPlaylist(songId: number) {
        await window.playlists.deleteSongFromPlaylist(
          table.options.meta.playlist,
          songId
        );
      }
      return (
        <div className="flex justify-center items-center">
          <Dialog>
            <DropdownMenu>
              <DropdownMenuTrigger>
                <DotsHorizontalIcon className="text-center" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Options</DropdownMenuLabel>
                <DropdownMenuItem
                  onClick={() =>
                    player.pushToUserQueue([
                      table.options.data[Number(row.id)].id,
                    ])
                  }
                >
                  Add to queue
                </DropdownMenuItem>
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuSub>
                    <DropdownMenuSubTrigger>
                      <span>Add to playlist</span>
                    </DropdownMenuSubTrigger>
                    <DropdownMenuPortal>
                      <DropdownMenuSubContent>
                        {table.options.meta.playlists &&
                          table.options.meta.playlists.map((playlist) => {
                            if (
                              playlist.name === "All songs" ||
                              playlist.name === table.options.meta.playlist
                            )
                              return null;
                            return (
                              <DropdownMenuItem
                                key={playlist.id}
                                onClick={() =>
                                  addSongToPlaylist(
                                    playlist.name,
                                    table.options.data[Number(row.id)].id
                                  )
                                }
                              >
                                <span>{playlist.name}</span>
                              </DropdownMenuItem>
                            );
                          })}
                      </DropdownMenuSubContent>
                    </DropdownMenuPortal>
                  </DropdownMenuSub>
                  <DialogTrigger asChild>
                    <DropdownMenuItem>Edit</DropdownMenuItem>
                  </DialogTrigger>

                  <DropdownMenuItem
                    onClick={() =>
                      deleteSongFromPlaylist(
                        table.options.data[Number(row.id)].id
                      )
                    }
                  >
                    Delete
                  </DropdownMenuItem>
                </>
              </DropdownMenuContent>
            </DropdownMenu>
            <EditSongModal
              key={row.id}
              song={table.options.data[Number(row.id)]}
            />
          </Dialog>
        </div>
      );
    },
  },
];
