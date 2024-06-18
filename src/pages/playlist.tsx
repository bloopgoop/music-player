import { useState, useEffect } from "react";
import {
  TimerIcon,
  ShuffleIcon,
  LoopIcon,
  DotsHorizontalIcon,
} from "@radix-ui/react-icons";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { OverlayScrollbarsComponent } from "overlayscrollbars-react";
import { formatTime } from "@/lib/utils";
import { Playlist, Song } from "@/db/models";
import { useLocation, useNavigate } from "react-router-dom";
import { DialogClose } from "@radix-ui/react-dialog";
import EditPlaylist from "@/components/editPlaylistModal";
import Image from "@/components/image";
import { PlayIcon, PauseIcon } from "@radix-ui/react-icons";
import { Button, ButtonProps } from "@/components/ui/button";
import { usePlayer } from "@/context/player-provider";
import { DataTable } from "@/components/playlist/dataTable";
import { columns } from "@/components/playlist/columns";
import { Skeleton } from "@/components/ui/skeleton";
import { AspectRatio } from "@radix-ui/react-aspect-ratio";

interface PlaylistPlayButtonProps extends ButtonProps {
  playlist: string;
  firstSongId: number;
  width?: number;
  height?: number;
}

const PlaylistPlayButton: React.FC<PlaylistPlayButtonProps> = ({
  playlist,
  firstSongId,
  ...props
}) => {
  const {
    paused,
    togglePlay,
    currentPlaylistName,
    setCurrentPlaylistName,
    playSong,
    clearHistory
  } = usePlayer();

  const playPlaylist = () => {
    if (playlist === currentPlaylistName) {
      togglePlay();
      return;
    } else {
      setCurrentPlaylistName(playlist);
      clearHistory();
      playSong(firstSongId);
    }
  };

  return (
    <Button onClick={() => playPlaylist()} {...props}>
      {playlist === currentPlaylistName && !paused ? (
        <PauseIcon width={20} height={20} className="text-primary" />
      ) : (
        <PlayIcon width={20} height={20} className="text-primary" />
      )}
    </Button>
  );
};

const Playlist = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [playlist, setPlaylist] = useState<Playlist>();
  const [songs, setSongs] = useState<Song[]>([]);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function getPlaylist() {
      const playlist = await window.playlists.getPlaylist(
        location.state.playlistName
      );
      setPlaylist(playlist);
      const songs = await window.songs.getSongsInPlaylist(
        location.state.playlistName
      );
      setSongs(songs);
    }
    getPlaylist().then(() => setIsLoading(false));
  }, [location.state]);

    // webhook to update playlists
    useEffect(() => {
      window.playlists.recievePlaylistUpdate((data: Song[]) =>
        setSongs(data)
      );
      console.log("Songs updated");
    }, [songs]);

  async function deletePlaylist() {
    const id = await window.playlists.deletePlaylist(playlist?.id);
    navigate("/");
  }

  if (isLoading) {
    return <LoadingPlaylist />;
  }
  return (
    <div className="h-full flex flex-col">
      <header
        className="p-3 flex flex-row text-2xl font-bold gap-6 pb-6"
        style={{
          boxShadow: "inset 0px -33px 54px -67px rgba(0,0,0,1)",
        }}
      >
        <div className="min-w-24 max-w-64 w-1/4 flex-shrink-0 shadow-xl">
          <Image
            mime={playlist?.image_mime}
            buffer={playlist?.image_buffer}
            alt="playlist cover"
          />
        </div>
        <div className="my-3 flex-1">
          {playlist?.name}
          <div className="text-muted-foreground text-sm">
            {playlist?.description}
          </div>
        </div>
      </header>
      <div className="p-3 flex-1 flex flex-col overflow-hidden" style={{}}>
        <div className="flex flex-row gap-6 py-3 items-center border-b">
          <PlaylistPlayButton
            playlist={playlist?.name}
            firstSongId={songs[0]?.id}
            className="p-3.5 bg-accent hover:bg-accent-foreground"
            variant="default"
            size="icon"
          />
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger className="flex items-center justify-center w-10 h-10 p-2.5 rounded-full hover:bg-muted/50 active:translate-y-[1px] active:scale-95">
                <ShuffleIcon />
              </TooltipTrigger>
              <TooltipContent>Shuffle</TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger className="flex items-center justify-center w-10 h-10 p-2.5 rounded-full hover:bg-muted/50 active:translate-y-[1px] active:scale-95">
                <LoopIcon />
              </TooltipTrigger>
              <TooltipContent>Loop</TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <DropdownMenu>
            <DropdownMenuTrigger>
              <div className="hover:bg-muted/50 p-2.5 rounded-full">
                <DotsHorizontalIcon />
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent sideOffset={4} align="start">
              <DropdownMenuLabel>Options</DropdownMenuLabel>
              <DropdownMenuItem>Add to queue</DropdownMenuItem>
              {playlist?.name !== "All songs" && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setIsEditDialogOpen(true)}>
                    Edit
                  </DropdownMenuItem>

                  <DropdownMenuItem onClick={() => setIsDeleteDialogOpen(true)}>
                    Delete
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
          <Dialog
            open={isDeleteDialogOpen}
            onOpenChange={setIsDeleteDialogOpen}
          >
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Are you absolutely sure?</DialogTitle>
                <DialogDescription>
                  This action cannot be undone. This will remove{" "}
                  <div className="text-bold text-primary inline">
                    {location.state.playlistName}
                  </div>{" "}
                  from your library.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <DialogClose className="px-4 rounded-lg">Close</DialogClose>
                <Button onClick={deletePlaylist} variant="destructive">
                  Confirm
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <EditPlaylist
            isEditDialogOpen={isEditDialogOpen}
            setIsEditDialogOpen={setIsEditDialogOpen}
            playlist={playlist}
            key={playlist?.id}
          />
        </div>
        <OverlayScrollbarsComponent
          options={{ scrollbars: { autoHide: "leave" } }}
          defer
        >
          <DataTable
            columns={columns}
            data={songs}
            playlist={location.state.playlistName}
          />
        </OverlayScrollbarsComponent>
      </div>
    </div>
  );
};
export default Playlist;

const LoadingPlaylist = () => {
  return (
    <div className="h-full flex flex-col">
      <header
        className="p-3 flex flex-row text-2xl font-bold gap-6 pb-6"
        style={{
          boxShadow: "inset 0px -33px 54px -67px rgba(0,0,0,1)",
        }}
      >
        <div className="min-w-24 max-w-64 w-1/4 flex-shrink-0 shadow-xl">
          <AspectRatio ratio={1 / 1}>
            <Skeleton className="h-full w-full" />
          </AspectRatio>
        </div>
        <Skeleton />
        <div className="my-3 flex-1">
          <Skeleton className="h-4 w-40"/>
          <div className="text-muted-foreground text-sm">
            <Skeleton className="h-2 w-20 mt-2"/>
          </div>
        </div>
      </header>
      <div className="p-3 flex-1 flex flex-col overflow-hidden" style={{}}>
        <div className="flex flex-row gap-6 py-3 items-center border-b">
          <Skeleton className="h-10 w-10 rounded-full"/>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger className="flex items-center justify-center w-10 h-10 p-2.5 rounded-full hover:bg-muted/50 active:translate-y-[1px] active:scale-95">
                <ShuffleIcon />
              </TooltipTrigger>
              <TooltipContent>Shuffle</TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger className="flex items-center justify-center w-10 h-10 p-2.5 rounded-full hover:bg-muted/50 active:translate-y-[1px] active:scale-95">
                <LoopIcon />
              </TooltipTrigger>
              <TooltipContent>Loop</TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <Skeleton />
        </div>
      </div>
    </div>
  );
};
