import { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { authApi } from "./api/auth.js";
import { useAuthStore } from "./store/auth.js";
import Login from "./pages/Login.js";
import Register from "./pages/Register.js";
import ChangePassword from "./pages/ChangePassword.js";
import Grupos from "./pages/Grupos.js";
import GroupDetail from "./pages/GroupDetail.js";
import JoinGroup from "./pages/JoinGroup.js";
import MatchCenter from "./pages/MatchCenter.js";
import Leaderboard from "./pages/Leaderboard.js";
import Faq from "./pages/Faq.js";

function AuthInit({ children }: { children: React.ReactNode }) {
  const { setUser, setInitialized } = useAuthStore();

  useEffect(() => {
    authApi
      .me()
      .then((user) => setUser(user))
      .catch(() => setUser(null))
      .finally(() => setInitialized());
  }, [setUser, setInitialized]);

  return <>{children}</>;
}

function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user, initialized } = useAuthStore();
  const location = useLocation();

  if (!initialized) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-400 text-sm">
        Cargando…
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/iniciar-sesion" state={{ from: location }} replace />;
  }

  if (user.forcePasswordChange && location.pathname !== "/cambiar-contrasena") {
    return <Navigate to="/cambiar-contrasena" replace />;
  }

  return <>{children}</>;
}

function RedirectIfAuthed({ children }: { children: React.ReactNode }) {
  const { user, initialized } = useAuthStore();

  if (!initialized) return null;
  if (user) return <Navigate to={user.forcePasswordChange ? "/cambiar-contrasena" : "/grupos"} replace />;

  return <>{children}</>;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthInit>
        <Routes>
          <Route path="/" element={<Navigate to="/grupos" replace />} />

          <Route
            path="/iniciar-sesion"
            element={<RedirectIfAuthed><Login /></RedirectIfAuthed>}
          />
          <Route
            path="/registro"
            element={<RedirectIfAuthed><Register /></RedirectIfAuthed>}
          />

          <Route
            path="/cambiar-contrasena"
            element={<RequireAuth><ChangePassword /></RequireAuth>}
          />
          <Route path="/grupos" element={<RequireAuth><Grupos /></RequireAuth>} />
          <Route path="/grupos/:id" element={<RequireAuth><GroupDetail /></RequireAuth>} />
          <Route path="/grupos/:id/partidos" element={<RequireAuth><MatchCenter /></RequireAuth>} />
          <Route path="/grupos/:id/tabla" element={<RequireAuth><Leaderboard /></RequireAuth>} />
          <Route path="/faq" element={<Faq />} />
          <Route path="/unirse/:token" element={<JoinGroup />} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthInit>
    </BrowserRouter>
  );
}
