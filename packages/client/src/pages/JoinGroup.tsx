import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { groupsApi } from "../api/groups.js";
import { useAuthStore } from "../store/auth.js";

export default function JoinGroup() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { user, initialized } = useAuthStore();
  const [status, setStatus] = useState<"pending" | "joining" | "success" | "error">("pending");
  const [error, setError] = useState("");
  const [groupId, setGroupId] = useState("");

  useEffect(() => {
    if (!initialized) return;
    if (!user) {
      navigate(`/iniciar-sesion`, { state: { from: { pathname: `/unirse/${token}` } }, replace: true });
      return;
    }
    if (!token || status !== "pending") return;

    setStatus("joining");
    groupsApi
      .join(token)
      .then((res) => { setGroupId(res.groupId); setStatus("success"); })
      .catch((err: Error) => { setError(err.message); setStatus("error"); });
  }, [initialized, user, token, status, navigate]);

  if (status === "pending" || status === "joining") {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-400 text-sm">
        Uniéndote al grupo…
      </div>
    );
  }

  if (status === "success") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="text-center">
          <p className="text-2xl mb-2">🎉</p>
          <h1 className="text-xl font-bold text-gray-900 mb-2">¡Te uniste al grupo!</h1>
          <p className="text-sm text-gray-500 mb-6">Ya puedes hacer tus predicciones.</p>
          <div className="flex gap-3 justify-center">
            <Link
              to={`/grupos/${groupId}/partidos`}
              className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-5 py-2.5 rounded-lg transition-colors"
            >
              Ver partidos
            </Link>
            <Link
              to="/grupos"
              className="border border-gray-300 hover:bg-gray-50 text-gray-700 text-sm font-medium px-5 py-2.5 rounded-lg transition-colors"
            >
              Mis grupos
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="text-center">
        <h1 className="text-xl font-bold text-gray-900 mb-2">No se pudo unir</h1>
        <p className="text-sm text-gray-500 mb-6">{error}</p>
        <Link to="/grupos" className="text-blue-600 hover:underline text-sm">
          Ir a mis grupos
        </Link>
      </div>
    </div>
  );
}
