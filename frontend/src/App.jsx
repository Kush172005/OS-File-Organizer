import { Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import FeaturesPage from "./pages/FeaturesPage";
import FileManagerPage from "./pages/FileManagerPage";

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/features" element={<FeaturesPage />} />
      <Route path="/app" element={<FileManagerPage />} />
    </Routes>
  );
}

export default App;
