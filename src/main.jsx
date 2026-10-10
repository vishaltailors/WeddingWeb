import { routeTree } from "./routeTree.gen";
import { applyTheme, getStoredTheme } from "./theme";
import { RouterProvider, createRouter } from "@tanstack/react-router";
import { StrictMode } from "react";
import ReactDOM from "react-dom/client";

applyTheme(getStoredTheme());

const router = createRouter({ routeTree });

const rootElement = document.getElementById("root");
if (rootElement && !rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <StrictMode>
      <RouterProvider router={router} />
    </StrictMode>,
  );
}
