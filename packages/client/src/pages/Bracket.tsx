import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { bracketApi, type BracketMatch } from "../api/bracket.js";
import AppNav from "../components/layout/AppNav.js";

function scoreLabel(m: BracketMatch): string {
  if (m.homeGoals !== null && m.awayGoals !== null) {
    return `${m.homeGoals}–${m.awayGoals}`;
  }
  if (m.predictedHomeGoals !== null && m.predictedAwayGoals !== null) {
    return `${m.predictedHomeGoals}–${m.predictedAwayGoals}*`;
  }
  return "–";
}

function TeamRow({
  flagEmoji,
  label,
  tbd,
  isWinner,
}: {
  flagEmoji: string | null;
  label: string;
  tbd: boolean;
  isWinner?: boolean;
}) {
  return (
    <div className={`flex items-center gap-1 px-2 py-1 ${isWinner ? "font-semibold" : ""}`}>
      {!tbd && flagEmoji && (
        <span className="text-sm leading-none flex-shrink-0">{flagEmoji}</span>
      )}
      <span
        className={`text-xs truncate ${tbd ? "text-gray-400 italic" : "text-gray-900"}`}
        style={{ maxWidth: 80 }}
      >
        {tbd ? "Por definir" : label}
      </span>
    </div>
  );
}

function MatchCard({
  match,
  onPress,
}: {
  match: BracketMatch;
  onPress: () => void;
}) {
  const homeTbd = !match.homeTeamCode;
  const awayTbd = !match.awayTeamCode;
  const hasResult = match.homeGoals !== null && match.awayGoals !== null;

  const homeWins =
    hasResult &&
    (match.wentToPenalties
      ? match.penaltyWinnerCode === match.homeTeamCode
      : (match.homeGoals ?? 0) > (match.awayGoals ?? 0));
  const awayWins =
    hasResult &&
    (match.wentToPenalties
      ? match.penaltyWinnerCode === match.awayTeamCode
      : (match.awayGoals ?? 0) > (match.homeGoals ?? 0));

  const score = scoreLabel(match);
  const isPredicted = score.endsWith("*");

  return (
    <button
      onClick={onPress}
      className={`w-28 border rounded-lg overflow-hidden text-left transition-colors ${
        homeTbd && awayTbd
          ? "border-gray-200 bg-gray-50 opacity-60"
          : "border-gray-300 bg-white hover:border-blue-400 hover:shadow-sm"
      }`}
    >
      <TeamRow
        flagEmoji={match.homeTeamFlagEmoji}
        label={match.homeTeamLabel}
        tbd={homeTbd}
        isWinner={homeWins}
      />
      <div className="border-t border-b border-gray-100 px-2 py-0.5 flex items-center justify-between bg-gray-50">
        <span className={`text-xs font-mono ${isPredicted ? "text-blue-500" : "text-gray-700"}`}>
          {score}
        </span>
        {match.pointsEarned !== null && (
          <span className="text-xs font-medium text-green-600">+{match.pointsEarned}</span>
        )}
      </div>
      <TeamRow
        flagEmoji={match.awayTeamFlagEmoji}
        label={match.awayTeamLabel}
        tbd={awayTbd}
        isWinner={awayWins}
      />
    </button>
  );
}

interface StageColumnProps {
  title: string;
  matches: BracketMatch[];
  onMatch: (matchId: string) => void;
}

function StageColumn({ title, matches, onMatch }: StageColumnProps) {
  return (
    <div className="flex flex-col items-center gap-2 flex-shrink-0">
      <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">
        {title}
      </span>
      <div className="flex flex-col gap-3">
        {matches.map((m) => (
          <MatchCard key={m.matchId} match={m} onPress={() => onMatch(m.matchId)} />
        ))}
      </div>
    </div>
  );
}

const STAGE_LABELS: Record<string, string> = {
  round_of_32: "R32",
  round_of_16: "Octavos",
  quarterfinal: "Cuartos",
  semifinal: "Semis",
  final: "Final",
  third_place: "3°",
};

export default function Bracket() {
  const { id: groupId } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["bracket", groupId],
    queryFn: () => bracketApi.get(groupId!),
    enabled: !!groupId,
    refetchOnWindowFocus: true,
  });

  const handleMatch = (matchId: string) => {
    navigate(`/grupos/${groupId}/partidos#${matchId}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <AppNav breadcrumbs={[
        { label: "Grupos", href: "/grupos" },
        { label: "Bracket" },
      ]} />

      <main className="py-6 px-4">
        <h1 className="text-lg font-bold text-gray-900 mb-4">Bracket</h1>

        {isLoading && (
          <p className="text-center text-sm text-gray-400 py-8">Cargando…</p>
        )}

        {isError && (
          <p className="text-center text-sm text-red-500 py-8">
            {(error as Error).message}
          </p>
        )}

        {data && (
          <div className="overflow-x-auto pb-4">
            <div className="flex gap-6 min-w-max">
              <StageColumn
                title={STAGE_LABELS.round_of_32}
                matches={data.round_of_32}
                onMatch={handleMatch}
              />
              <StageColumn
                title={STAGE_LABELS.round_of_16}
                matches={data.round_of_16}
                onMatch={handleMatch}
              />
              <StageColumn
                title={STAGE_LABELS.quarterfinal}
                matches={data.quarterfinal}
                onMatch={handleMatch}
              />
              <div className="flex flex-col gap-6">
                <StageColumn
                  title={STAGE_LABELS.semifinal}
                  matches={data.semifinal}
                  onMatch={handleMatch}
                />
                <StageColumn
                  title={STAGE_LABELS.third_place}
                  matches={data.third_place}
                  onMatch={handleMatch}
                />
              </div>
              <StageColumn
                title={STAGE_LABELS.final}
                matches={data.final}
                onMatch={handleMatch}
              />
            </div>
          </div>
        )}

        {data && (
          <p className="mt-2 text-xs text-gray-400">
            * Pronóstico pendiente de resultado oficial
          </p>
        )}
      </main>
    </div>
  );
}
