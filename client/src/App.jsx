import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import ComingSoon from "./components/ComingSoon.jsx";
import { ProtectedRoute } from "./components/ProtectedRoute.jsx";
import MessengerWidget from "./components/messenger/MessengerWidget.jsx";
import Home from "./pages/Home.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Library from "./pages/Library.jsx";
import Announcements from "./pages/Announcements.jsx";
import Dashboard from "./pages/dashboard/Dashboard.jsx";
import StoryEditor from "./pages/dashboard/StoryEditor.jsx";
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

          <Route path="/announcements" element={<Announcements />} />

          <Route
            path="/library"
            element={
              <ProtectedRoute>
                <Library />
              </ProtectedRoute>
            }
          />

          {/* Placeholders — built out in Phase 4+ */}
          <Route path="/about" element={<ComingSoon title="About the Writer" />} />
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
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/stories/new"
            element={
              <ProtectedRoute requireRole={["OWNER", "ADMIN"]}>
                <StoryEditor />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/stories/:id/edit"
            element={
              <ProtectedRoute requireRole={["OWNER", "ADMIN"]}>
                <StoryEditor />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <MessengerWidget />
    </div>
  );
}
