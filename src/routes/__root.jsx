import "../index.css";
import MusicPlayer from "../music-player";
import { Outlet, createRootRoute } from "@tanstack/react-router";

export const Route = createRootRoute({
  component: () => (
    <>
      <Outlet />
      <MusicPlayer />
    </>
  ),
});
