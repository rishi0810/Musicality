import { Outlet } from "react-router-dom";
import { PlayerProvider } from "./context/PlayerContext";
import Footer from "./layout/Footer";

function App() {
  return (
    <PlayerProvider>
      <div className="min-h-screen pb-24">
        <Outlet />
      </div>
      <FooterContainer />
    </PlayerProvider>
  );
}

function FooterContainer() {
  return <Footer />;
}

export default App;
