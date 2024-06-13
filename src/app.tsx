import { createRoot } from "react-dom/client";
import {
  createHashRouter,
  RouterProvider,
  Outlet,
  Link,
} from "react-router-dom";
import { useEffect, useContext } from "react";
import { UiProvider, UiContext } from "./context/ui-provider";
import { PlayerProvider } from "./context/player-provider";
import { SettingsProvider } from "./context/settings-provider";
import { HomeIcon, DownloadIcon, GearIcon } from "@radix-ui/react-icons";
import Dropbox from "./pages/dropbox";
import Player from "./components/player";
import Library from "./components/library";
import Playlist from "./pages/playlist";
import Home from "./pages/home";
import Error from "./pages/error";
import Settings from "./pages/settings";
import "./index.css";

import DemoPage from "./components/playlist";

const AppContent = () => {
  const ui = useContext(UiContext);

  useEffect(() => {
    console.log(ui);
  }, [ui]);

  return (
    <div className="bg-background w-full">
      <div
        className={
          "body-height h-full grid gap-2 p-2 " +
          (ui.autoResize
            ? "lg:grid-cols-[25fr_75fr] sm:grid-cols-[90px_1fr] "
            : " ") +
          (ui.sidebarCollapsed
            ? "grid-cols-[90px_1fr]"
            : "grid-cols-[25fr_75fr]")
        }
      >
        <div
          id="sidebar"
          className="grid grid-rows-[96px_1fr] gap-2 overflow-hidden"
        >
          <section
            id="navbox"
            className="flex flex-row items-center justify-center p-1 rounded-lg bg-card overflow-hidden"
          >
            <Link to="/">
              <HomeIcon width={30} height={30} />
            </Link>
            <Link to="/dropbox">
              <DownloadIcon width={30} height={30} />
            </Link>
            <Link to="/settings">
              <GearIcon width={30} height={30} />
            </Link>
            <Link to="/demo">
              <GearIcon width={30} height={30} />
            </Link>
          </section>
          <Library />
        </div>
        <section
          id="main"
          className="bg-card h-full rounded-lg overflow-hidden"
        >
          <Outlet />
        </section>
      </div>
      <Player />
    </div>
  );
};

const App = () => {
  return (
    <SettingsProvider>
      <PlayerProvider>
        <UiProvider>
          <AppContent />
        </UiProvider>
      </PlayerProvider>
    </SettingsProvider>
  );
};

const router = createHashRouter([
  {
    path: "/",
    element: <App />,
    errorElement: <Error />,
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        path: "dropbox",
        element: <Dropbox />,
      },
      {
        path: "playlist",
        element: <Playlist />,
      },
      {
        path: "settings",
        element: <Settings />,
      },
      {
        path: "demo",
        element: <DemoPage />,
      },
    ],
  },
]);

const root = createRoot(document.getElementById("root"));
root.render(<RouterProvider router={router} />);
