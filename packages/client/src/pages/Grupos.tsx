import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { authApi } from "../api/auth.js";
import { groupsApi } from "../api/groups.js";
import { useAuthStore } from "../store/auth.js";

export default function Grupos() {
  const navigate = useNavigate();
  const { user, setUser } = useAuthStore();
  const qc = useQueryClient();
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");

  const { data: groups = [], isLoading } = useQuery({
    queryKey: ["groups"],
    queryFn: groupsApi.list,
  });

  const logout = useMutation({
    mutationFn: authApi.logout,
    onSuccess: () => { setUser(null); navigate("/iniciar-sesion"); },
  });

  const createGroup = useMutation({
    mutationFn: (name: string) => groupsApi.create(name),
    onSuccess: (group) => {
      qc.invalidateQueries({ queryKey: ["groups"] });
      setCreating(false);
      setNewName("");
      navigate(`/grupos/${group.id}`);
    },
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <span className="font-bold text-gray-900">Quiniela Mundial 2026</span>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-600">{user?.displayName}</span>
          <button onClick={() => logout.mutate()} className="text-sm text-gray-500 hover:text-gray-700">
            Salir
          </button>
        </div>
      </nav>

      <main className="max-w-2xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">Mis grupos</h2>
          <button
            onClick={() => setCreating(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
          >
            + Crear grupo
          </button>
        </div>

        {creating && (
          <form
            onSubmit={(e) => { e.preventDefault(); if (newName.trim()) createGroup.mutate(newName.trim()); }}
            className="bg-white rounded-xl border border-gray-200 p-4 mb-4 flex gap-2"
          >
            <input
              autoFocus
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Nombre del grupo"
              className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              disabled={createGroup.isPending || !newName.trim()}
              className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
            >
              {createGroup.isPending ? "Creando…" : "Crear"}
            </button>
            <button
              type="button"
              onClick={() => { setCreating(false); setNewName(""); }}
              className="text-sm text-gray-500 hover:text-gray-700 px-2"
            >
              Cancelar
            </button>
          </form>
        )}

        {createGroup.error && (
          <p className="text-red-500 text-sm mb-4">{createGroup.error.message}</p>
        )}

        {isLoading ? (
          <p className="text-gray-400 text-sm">Cargando…</p>
        ) : groups.length === 0 ? (
          <p className="text-gray-400 text-sm">Aún no perteneces a ningún grupo.</p>
        ) : (
          <ul className="space-y-3">
            {groups.map((g) => (
              <li key={g.id} className="bg-white rounded-xl border border-gray-200 p-4 flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">{g.name}</p>
                </div>
                <div className="flex gap-2">
                  <Link
                    to={`/grupos/${g.id}/partidos`}
                    className="text-sm bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg transition-colors"
                  >
                    Partidos
                  </Link>
                  <Link
                    to={`/grupos/${g.id}`}
                    className="text-sm border border-gray-300 hover:bg-gray-50 text-gray-700 px-3 py-1.5 rounded-lg transition-colors"
                  >
                    Gestionar
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}
