import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { leaderboardApi } from "../api/leaderboard.js";
import { useAuthStore } from "../store/auth.js";
import AppNav from "../components/layout/AppNav.js";

const MEDAL: Record<number, string> = { 1: "🥇", 2: "🥈", 3: "🥉" };

export default function Leaderboard() {
  const { id: groupId } = useParams<{ id: string }>();
  const { user } = useAuthStore();

  const { data: entries = [], isLoading } = useQuery({
    queryKey: ["leaderboard", groupId],
    queryFn: () => leaderboardApi.get(groupId!),
    enabled: !!groupId,
    staleTime: 2 * 60 * 1000,
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <AppNav breadcrumbs={[
        { label: "Grupo", href: `/grupos/${groupId}` },
        { label: "Tabla de posiciones" },
      ]} groupId={groupId} />

      <main className="max-w-2xl mx-auto px-4 py-8">
        {isLoading ? (
          <p className="text-gray-400 text-sm">Cargando…</p>
        ) : entries.length === 0 ? (
          <p className="text-gray-400 text-sm">Aún no hay partidos finalizados.</p>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-left text-xs text-gray-400 uppercase tracking-wide">
                  <th className="px-4 py-3 w-12">#</th>
                  <th className="px-4 py-3">Jugador</th>
                  <th className="px-4 py-3 text-right">Puntos</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {entries.map((entry) => {
                  const isMe = entry.userId === user?.id;
                  return (
                    <tr
                      key={entry.userId}
                      className={isMe ? "bg-blue-50" : "hover:bg-gray-50"}
                    >
                      <td className="px-4 py-3 text-center text-base">
                        {MEDAL[entry.rank] ?? entry.rank}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`font-medium ${isMe ? "text-blue-700" : "text-gray-900"}`}>
                          {entry.displayName}
                        </span>
                        {isMe && (
                          <span className="ml-2 text-xs text-blue-400">(tú)</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right font-bold text-gray-900">
                        {entry.points}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}
