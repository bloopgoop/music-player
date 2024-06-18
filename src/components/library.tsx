import { ColumnsIcon, PlusIcon } from "@radix-ui/react-icons";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useContext } from "react";
import { UiContext } from "@/context/ui-provider";
import { OverlayScrollbarsComponent } from "overlayscrollbars-react";
import { useNavigate } from "react-router-dom";
import Image from "@/components/image";
import "@/index.css";

const Library = () => {
  const navigate = useNavigate();
  const ui = useContext(UiContext);

  const toggleSidebar = () => {
    // Remove auto resize
    ui.setAutoResize(false);
    ui.setSidebarCollapsed(!ui.sidebarCollapsed);
  };

  const createPlaylist = async () => {
    const newPlaylist = await window.playlists.createPlaylist();
  };

  return (
    <section className="bg-card rounded-lg p-1 flex flex-col gap-1 overflow-hidden">
      <div className="flex flex-row justify-between">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <div
                className="hover:bg-muted/50 p-2.5 rounded"
                onClick={toggleSidebar}
              >
                <ColumnsIcon />
              </div>
            </TooltipTrigger>
            <TooltipContent>Collapse / Expand</TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <div
                className="hover:bg-muted/50 p-2.5 rounded"
                onClick={createPlaylist}
              >
                <PlusIcon />
              </div>
            </TooltipTrigger>
            <TooltipContent>Create playlist</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      <OverlayScrollbarsComponent
        options={{ scrollbars: { autoHide: "leave" } }}
        defer
      >
        {ui.allPlaylists?.map((playlist) => (
          <div
            onClick={() =>
              navigate(`/playlist`, { state: { playlistName: playlist.name } })
            }
            key={playlist.id}
            className="flex items-center h-20 p-2 hover:bg-muted/50 rounded hover:cursor-pointer"
          >
            <div className="flex-shrink-0 w-16">
              <Image mime={playlist.image_mime} buffer={playlist.image_buffer} alt="cover" />
            </div>
            {ui.autoResize ? (
              <div className="sm:hidden lg:block float-left pl-2">
                {playlist.name}
              </div>
            ) : (
              !ui.sidebarCollapsed && (
                <div className="float-left pl-2">{playlist.name}</div>
              )
            )}
          </div>
        ))}
      </OverlayScrollbarsComponent>
    </section>
  );
};
export default Library;
