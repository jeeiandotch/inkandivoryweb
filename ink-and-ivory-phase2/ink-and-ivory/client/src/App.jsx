import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import ComingSoon from "./components/ComingSoon.jsx";
import { ProtectedRoute } from "./components/ProtectedRoute.jsx";
import Home from "./pages/Home.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Library from "./pages/Library.jsx";
import Stories from "./pages/story/Stories.jsx";
import StoryDetail from "./pages/story/StoryDetail.jsx";
import StoryReader from "./pages/story/StoryReader.jsx";
import NotFound from "./pages/NotFound.jsx";

export default function App() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route path="/stories" element={<Stories />} />
          <Route path="/stories/:slug" element={<StoryDetail />} />
          <Route path="/stories/:slug/read/:order" element={<StoryReader />} />

          <Route
            path="/library"
            element={
              <ProtectedRoute>
                <Library />
              </ProtectedRoute>
            }
          />

          {/* Placeholders — built out in Phase 3+ */}
          <Route path="/about" element={<ComingSoon title="About the Writer" />} />
          <Route path="/announcements" element={<ComingSoon title="Announcements" />} />
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <ComingSoon title="Settings" />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile/:username"
            element={
              <ProtectedRoute>
                <ComingSoon title="Profile" />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute requireRole={["OWNER", "ADMIN"]}>
                <ComingSoon title="Writer Dashboard" />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
    </div>
  );
}
