import "../index.css";
import MusicPlayer from "../MusicPlayer";
import { Outlet, createRootRoute } from "@tanstack/react-router";

export const Route = createRootRoute({
  component: () => (
    <>
      <Outlet />
      <MusicPlayer />
    </>
  ),
});
