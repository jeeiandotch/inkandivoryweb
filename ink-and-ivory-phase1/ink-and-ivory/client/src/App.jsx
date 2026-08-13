import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import ComingSoon from "./components/ComingSoon.jsx";
import { ProtectedRoute } from "./components/ProtectedRoute.jsx";
import Home from "./pages/Home.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
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

          {/* Placeholders — built out in Phase 2+ */}
          <Route path="/stories" element={<ComingSoon title="Stories" />} />
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
