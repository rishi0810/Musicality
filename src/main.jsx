import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import PlayerView from "./components/PlayerView.jsx";
import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  RouterProvider,
} from "react-router-dom";
import Home from "./pages/Home.jsx";

export function Root() {
  const router = createBrowserRouter(
    createRoutesFromElements(
      <Route path="" element={<App />}> 
        <Route path="" element={<Home />} />
        <Route path="song" element={<PlayerView />} />
      </Route>
    )
  );

  return <RouterProvider router={router} />;
}
createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Root />
  </StrictMode>
);
