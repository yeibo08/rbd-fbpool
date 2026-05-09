import { useState, useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { matchesApi, type Match } from "../api/matches.js";
import { predictionsApi, type Prediction, type PredictionResult } from "../api/predictions.js";

const IS_DEV = import.meta.env.DEV;

// ── helpers ───────────────────────────────────────────────────────────────

function isOpen(match: Match) {
  return Date.now() < new Date(match.deadlineAt).getTime();
}

function hasResult(match: Match) {
  return match.homeGoals !== null;
}

function stageLabel(stage: string, groupLetter: string | null) {
  if (stage === "group") return `Grupo ${groupLetter}`;
  const labels: Record<string, string> = {
    round_of_32: "Ronda de 32",
    round_of_16: "Octavos de final",
    quarterfinal: "Cuartos de final",
    semifinal: "Semifinal",
    third_place: "3er y 4to lugar",
    final: "Final",
  };
  return labels[stage] ?? stage;
}

function formatKickoff(iso: string) {
  return new Date(iso).toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit", hour12: true });
}

function formatDay(iso: string) {
  return new Date(iso).toLocaleDateString("es-MX", { weekday: "long", day: "numeric", month: "long" });
}

function localDateKey(iso: string) {
  return new Date(iso).toLocaleDateString("en-CA"); // YYYY-MM-DD in local time
}

// ── ScoreInput ────────────────────────────────────────────────────────────

function ScoreInput({
  groupId,
  match,
  saved,
}: {
  groupId: string;
  match: Match;
  saved: Prediction | undefined;
}) {
  const qc = useQueryClient();
  const [home, setHome] = useState<string>(saved?.homeGoals?.toString() ?? "");
  const [away, setAway] = useState<string>(saved?.awayGoals?.toString() ?? "");
  const [flash, setFlash] = useState(false);

  const mutation = useMutation({
    mutationFn: () =>
      predictionsApi.upsert(groupId, match.id, Number(home), Number(away)),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["predictions", groupId] });
      setFlash(true);
      setTimeout(() => setFlash(false), 1500);
    },
  });

  const dirty =
    home !== "" &&
    away !== "" &&
    (Number(home) !== saved?.homeGoals || Number(away) !== saved?.awayGoals);

  return (
    <div className="flex items-center gap-2">
      <input
        type="number"
        min={0}
        max={99}
        value={home}
        onChange={(e) => setHome(e.target.value)}
        className="w-12 text-center border border-gray-300 rounded-lg py-1.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <span className="text-gray-400 text-sm font-bold">—</span>
      <input
        type="number"
        min={0}
        max={99}
        value={away}
        onChange={(e) => setAway(e.target.value)}
        className="w-12 text-center border border-gray-300 rounded-lg py-1.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      {flash ? (
        <span className="text-green-600 text-xs font-medium">✓ Guardado</span>
      ) : (
        <button
          onClick={() => mutation.mutate()}
          disabled={!dirty || mutation.isPending || home === "" || away === ""}
          className="text-xs bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white font-medium px-3 py-1.5 rounded-lg transition-colors"
        >
          {mutation.isPending ? "…" : "Guardar"}
        </button>
      )}
      {mutation.error && (
        <span className="text-red-500 text-xs">{(mutation.error as Error).message}</span>
      )}
    </div>
  );
}

// ── DevSetResult ──────────────────────────────────────────────────────────

function DevSetResult({ match }: { match: Match }) {
  const qc = useQueryClient();
  const [home, setHome] = useState("");
  const [away, setAway] = useState("");
  const [open, setOpen] = useState(false);

  const set = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/admin/matches/${match.id}/result`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ homeGoals: Number(home), awayGoals: Number(away) }),
      });
      if (!res.ok) throw new Error(await res.text());
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["matches"] });
      qc.invalidateQueries({ queryKey: ["results"] });
      setOpen(false);
    },
  });

  const clear = useMutation({
    mutationFn: async () => {
      await fetch(`/api/admin/matches/${match.id}/result`, {
        method: "DELETE",
        credentials: "include",
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["matches"] });
      qc.invalidateQueries({ queryKey: ["results"] });
    },
  });

  if (!open) {
    return (
      <div className="flex gap-1 mt-2 justify-end">
        <button
          onClick={() => setOpen(true)}
          className="text-xs text-orange-500 border border-orange-200 hover:bg-orange-50 px-2 py-1 rounded transition-colors"
        >
          [dev] fijar resultado
        </button>
        {hasResult(match) && (
          <button
            onClick={() => clear.mutate()}
            className="text-xs text-gray-400 hover:text-gray-600 px-2 py-1 rounded transition-colors"
          >
            limpiar
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="mt-2 flex items-center gap-2 p-2 bg-orange-50 border border-orange-200 rounded-lg">
      <span className="text-xs text-orange-600 font-medium">dev</span>
      <input
        type="number" min={0} max={99} value={home} onChange={(e) => setHome(e.target.value)}
        placeholder="L" className="w-10 text-center border border-orange-300 rounded px-1 py-1 text-sm"
      />
      <span className="text-gray-400 text-xs">–</span>
      <input
        type="number" min={0} max={99} value={away} onChange={(e) => setAway(e.target.value)}
        placeholder="V" className="w-10 text-center border border-orange-300 rounded px-1 py-1 text-sm"
      />
      <button
        onClick={() => set.mutate()}
        disabled={home === "" || away === "" || set.isPending}
        className="text-xs bg-orange-500 hover:bg-orange-600 disabled:opacity-40 text-white px-2 py-1 rounded transition-colors"
      >
        {set.isPending ? "…" : "OK"}
      </button>
      <button onClick={() => setOpen(false)} className="text-xs text-gray-400 hover:text-gray-600">
        ✕
      </button>
    </div>
  );
}

// ── MatchCard ─────────────────────────────────────────────────────────────

function MatchCard({
  match,
  groupId,
  prediction,
  result,
}: {
  match: Match;
  groupId: string;
  prediction: Prediction | undefined;
  result: PredictionResult | undefined;
}) {
  const open = isOpen(match);
  const finished = hasResult(match);

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs text-gray-400 uppercase tracking-wide">
          {stageLabel(match.stage, match.groupLetter)}
        </span>
        <span className="text-xs text-gray-400">{formatKickoff(match.kickoffAt)}</span>
      </div>

      <div className="flex items-center justify-between gap-4">
        {/* Teams */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 truncate">{match.homeTeamLabel}</p>
        </div>

        {/* Center: result / input / locked */}
        <div className="flex-shrink-0">
          {finished ? (
            <div className="flex flex-col items-center gap-1">
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold text-gray-900">{match.homeGoals}</span>
                <span className="text-gray-400">–</span>
                <span className="text-xl font-bold text-gray-900">{match.awayGoals}</span>
              </div>
              {result && (
                <div className="flex items-center gap-2">
                  {prediction ? (
                    <span className="text-xs text-gray-400">
                      Tu pronóstico: {prediction.homeGoals}–{prediction.awayGoals}
                    </span>
                  ) : (
                    <span className="text-xs text-gray-400">Sin pronóstico</span>
                  )}
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                    result.points > 0 ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
                  }`}>
                    {result.points} pts
                  </span>
                </div>
              )}
            </div>
          ) : open ? (
            <ScoreInput groupId={groupId} match={match} saved={prediction} />
          ) : (
            <div className="flex items-center gap-2 text-gray-400">
              {prediction ? (
                <span className="text-sm font-medium">
                  {prediction.homeGoals}–{prediction.awayGoals}
                  <span className="ml-1 text-xs">(cerrado)</span>
                </span>
              ) : (
                <span className="text-sm">Sin pronóstico</span>
              )}
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0 text-right">
          <p className="text-sm font-medium text-gray-900 truncate">{match.awayTeamLabel}</p>
        </div>
      </div>

      {IS_DEV && <DevSetResult match={match} />}
    </div>
  );
}

// ── MatchCenter ───────────────────────────────────────────────────────────

export default function MatchCenter() {
  const { id: groupId } = useParams<{ id: string }>();
  const [filterStage, setFilterStage] = useState<"all" | "open" | "finished">("all");

  const { data: matches = [], isLoading: loadingMatches } = useQuery({
    queryKey: ["matches"],
    queryFn: matchesApi.list,
    staleTime: 5 * 60 * 1000,
  });

  const { data: predictions = [] } = useQuery({
    queryKey: ["predictions", groupId],
    queryFn: () => predictionsApi.list(groupId!),
    enabled: !!groupId,
  });

  const { data: results = [] } = useQuery({
    queryKey: ["results", groupId],
    queryFn: () => predictionsApi.results(groupId!),
    enabled: !!groupId,
    staleTime: 2 * 60 * 1000,
  });

  const predByMatch = useMemo(
    () => Object.fromEntries(predictions.map((p) => [p.matchId, p])),
    [predictions]
  );

  const resultByMatch = useMemo(
    () => Object.fromEntries(results.map((r) => [r.matchId, r])),
    [results]
  );

  const filteredMatches = useMemo(() => {
    if (filterStage === "open") return matches.filter(isOpen);
    if (filterStage === "finished") return matches.filter(hasResult);
    return matches;
  }, [matches, filterStage]);

  const byDay = useMemo(() => {
    const map = new Map<string, Match[]>();
    for (const m of filteredMatches) {
      const key = localDateKey(m.kickoffAt);
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(m);
    }
    return map;
  }, [filteredMatches]);

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to={`/grupos/${groupId}`} className="text-gray-500 hover:text-gray-700 text-sm">← Grupo</Link>
          <span className="text-gray-300">/</span>
          <span className="font-medium text-gray-900 text-sm">Partidos</span>
        </div>
        <Link to={`/grupos/${groupId}/tabla`} className="text-sm text-blue-600 hover:underline">
          Tabla →
        </Link>
      </nav>

      <div className="max-w-2xl mx-auto px-4 py-4">
        {/* Filter tabs */}
        <div className="flex gap-2 mb-6">
          {(["all", "open", "finished"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilterStage(f)}
              className={`text-sm px-4 py-1.5 rounded-full font-medium transition-colors ${
                filterStage === f
                  ? "bg-blue-600 text-white"
                  : "bg-white border border-gray-300 text-gray-600 hover:bg-gray-50"
              }`}
            >
              {f === "all" ? "Todos" : f === "open" ? "Abiertos" : "Finalizados"}
            </button>
          ))}
        </div>

        {loadingMatches ? (
          <p className="text-gray-400 text-sm">Cargando partidos…</p>
        ) : (
          Array.from(byDay.entries()).map(([day, dayMatches]) => (
            <div key={day} className="mb-8">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3 capitalize">
                {formatDay(dayMatches[0].kickoffAt)}
              </h3>
              <div className="space-y-3">
                {dayMatches.map((match) => (
                  <MatchCard
                    key={match.id}
                    match={match}
                    groupId={groupId!}
                    prediction={predByMatch[match.id]}
                    result={resultByMatch[match.id]}
                  />
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
