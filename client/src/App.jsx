import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import Footer from "./components/Footer.jsx";
import { ProtectedRoute } from "./components/ProtectedRoute.jsx";
import MessengerWidget from "./components/messenger/MessengerWidget.jsx";
import OfflineBanner from "./components/OfflineBanner.jsx";
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
import Unauthorized from "./pages/Unauthorized.jsx";
import Privacy from "./pages/Privacy.jsx";
import Terms from "./pages/Terms.jsx";
import About from "./pages/About.jsx";
import Search from "./pages/Search.jsx";
import Profile from "./pages/Profile.jsx";
import Settings from "./pages/Settings.jsx";
import NotFound from "./pages/NotFound.jsx";

export default function App() {
  return (
    <div className="flex min-h-screen flex-col">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-ink focus:px-4 focus:py-2 focus:text-sm focus:text-ivory"
      >
        Skip to content
      </a>
      <OfflineBanner />
      <Navbar />
      <main id="main-content" className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route path="/stories" element={<Stories />} />
          <Route path="/stories/:slug" element={<StoryDetail />} />
          <Route path="/stories/:slug/read/:order" element={<StoryReader />} />

          <Route path="/announcements" element={<Announcements />} />
          <Route path="/about" element={<About />} />
          <Route path="/search" element={<Search />} />
          <Route path="/unauthorized" element={<Unauthorized />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/terms" element={<Terms />} />

          <Route
            path="/library"
            element={
              <ProtectedRoute>
                <Library />
              </ProtectedRoute>
            }
          />

          {/* Final phase — real pages replacing earlier placeholders */}
          <Route path="/about" element={<About />} />
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile/:username"
            element={
              <ProtectedRoute>
                <Profile />
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
      <Footer />
      <MessengerWidget />
    </div>
  );
}
