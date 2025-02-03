import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import Song from "./pages/Song.jsx";
import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  RouterProvider,
} from "react-router-dom";
import Home from "./pages/Home.jsx";
import React, { useState } from "react";

function Root() {
  const [album, setAlbum] = useState([]);

  const router = createBrowserRouter(
    createRoutesFromElements(
      <Route path="" element={<App/>}>
        <Route path="" element={<Home setalbum={setAlbum} />} />
        <Route path="song" element={<Song homeAlbum={album} />} />
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
