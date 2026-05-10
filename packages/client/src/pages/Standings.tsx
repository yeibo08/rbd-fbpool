import { useState } from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { standingsApi, type TeamStanding } from "../api/standings.js";
import { useAuthStore } from "../store/auth.js";
import AppNav from "../components/layout/AppNav.js";

const GROUP_LETTERS = ["A","B","C","D","E","F","G","H","I","J","K","L"];

function GroupTable({ letter, teams }: { letter: string; teams: TeamStanding[] }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
        <span className="text-sm font-bold text-gray-700">Grupo {letter}</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="text-gray-400 uppercase tracking-wide border-b border-gray-100">
              <th className="text-left px-3 py-2 w-6">#</th>
              <th className="text-left px-3 py-2">Equipo</th>
              <th className="text-center px-2 py-2">PJ</th>
              <th className="text-center px-2 py-2">G</th>
              <th className="text-center px-2 py-2">E</th>
              <th className="text-center px-2 py-2">P</th>
              <th className="text-center px-2 py-2">GF</th>
              <th className="text-center px-2 py-2">GC</th>
              <th className="text-center px-2 py-2">DG</th>
              <th className="text-center px-2 py-2 font-bold text-gray-500">Pts</th>
            </tr>
          </thead>
          <tbody>
            {teams.map((team, idx) => {
              const rowClass =
                idx < 2
                  ? "bg-green-50"
                  : idx === 2
                  ? "bg-yellow-50"
                  : "";
              return (
                <tr key={team.teamCode} className={`border-t border-gray-100 ${rowClass}`}>
                  <td className="px-3 py-2 text-gray-400">{team.position}</td>
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-1.5">
                      <span className="text-base leading-none">{team.flagEmoji}</span>
                      <span className="font-medium text-gray-900 truncate">{team.name}</span>
                    </div>
                  </td>
                  <td className="text-center px-2 py-2 text-gray-600">{team.played}</td>
                  <td className="text-center px-2 py-2 text-gray-600">{team.won}</td>
                  <td className="text-center px-2 py-2 text-gray-600">{team.drawn}</td>
                  <td className="text-center px-2 py-2 text-gray-600">{team.lost}</td>
                  <td className="text-center px-2 py-2 text-gray-600">{team.goalsFor}</td>
                  <td className="text-center px-2 py-2 text-gray-600">{team.goalsAgainst}</td>
                  <td className="text-center px-2 py-2 text-gray-600">
                    {team.goalDiff > 0 ? `+${team.goalDiff}` : team.goalDiff}
                  </td>
                  <td className="text-center px-2 py-2 font-bold text-gray-900">{team.points}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="px-3 py-1.5 flex gap-4 text-xs text-gray-400 border-t border-gray-100">
        <span className="flex items-center gap-1"><span className="inline-block w-2.5 h-2.5 rounded-sm bg-green-100 border border-green-300" /> Clasificado</span>
        <span className="flex items-center gap-1"><span className="inline-block w-2.5 h-2.5 rounded-sm bg-yellow-100 border border-yellow-300" /> Posible 3°</span>
      </div>
    </div>
  );
}

type Tab = "official" | "predicted";

interface StandingsProps {
  defaultTab?: Tab;
}

export default function Standings({ defaultTab = "official" }: StandingsProps) {
  const { id: groupId } = useParams<{ id: string }>();
  const { user } = useAuthStore();
  const [tab, setTab] = useState<Tab>(defaultTab);

  const showPredicted = tab === "predicted" && !!groupId && !!user;

  const officialQuery = useQuery({
    queryKey: ["standings", "official"],
    queryFn: () => standingsApi.official(),
    enabled: tab === "official",
  });

  const predictedQuery = useQuery({
    queryKey: ["standings", "predicted", groupId],
    queryFn: () => standingsApi.predicted(groupId!),
    enabled: showPredicted,
  });

  const activeQuery = showPredicted ? predictedQuery : officialQuery;
  const groups = activeQuery.data?.groups ?? {};

  const breadcrumbs = groupId
    ? [{ label: "Grupos", href: "/grupos" }, { label: "Tabla de grupos" }]
    : [{ label: "Tabla de grupos" }];

  return (
    <div className="min-h-screen bg-gray-50">
      <AppNav breadcrumbs={breadcrumbs} groupId={groupId} />

      <main className="max-w-2xl mx-auto px-4 py-6 space-y-4">
        <h1 className="text-lg font-bold text-gray-900">Tabla de grupos</h1>

        {/* Tabs */}
        {groupId && user && (
          <div className="flex bg-gray-100 rounded-lg p-1 gap-1">
            <button
              onClick={() => setTab("official")}
              className={`flex-1 text-sm py-1.5 rounded-md font-medium transition-colors ${
                tab === "official"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Oficial
            </button>
            <button
              onClick={() => setTab("predicted")}
              className={`flex-1 text-sm py-1.5 rounded-md font-medium transition-colors ${
                tab === "predicted"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Mis pronósticos
            </button>
          </div>
        )}

        {activeQuery.isLoading && (
          <p className="text-center text-sm text-gray-400 py-8">Cargando…</p>
        )}

        {activeQuery.isError && (
          <p className="text-center text-sm text-red-500 py-8">
            {(activeQuery.error as Error).message}
          </p>
        )}

        {!activeQuery.isLoading && GROUP_LETTERS.map((letter) =>
          groups[letter] ? (
            <GroupTable key={letter} letter={letter} teams={groups[letter]} />
          ) : null
        )}
      </main>
    </div>
  );
}
