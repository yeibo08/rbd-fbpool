export interface ScoringRules {
  ptsCorrectResult: number;
  ptsCorrectHome: number;
  ptsCorrectAway: number;
  ptsCorrectTotal: number;
}

export interface MatchResult {
  homeGoals: number;
  awayGoals: number;
  wentToPenalties: boolean;
  penaltyWinnerCode: string | null;
  homeTeamCode?: string | null;
  awayTeamCode?: string | null;
}

export function computePoints(
  prediction: { homeGoals: number; awayGoals: number },
  result: MatchResult,
  rules: ScoringRules
): number {
  let pts = 0;

  const actualWinner = result.wentToPenalties
    ? result.penaltyWinnerCode === result.homeTeamCode
      ? "home"
      : "away"
    : result.homeGoals > result.awayGoals
    ? "home"
    : result.homeGoals < result.awayGoals
    ? "away"
    : "draw";

  const predictedWinner =
    prediction.homeGoals > prediction.awayGoals
      ? "home"
      : prediction.homeGoals < prediction.awayGoals
      ? "away"
      : "draw";

  if (predictedWinner === actualWinner) pts += rules.ptsCorrectResult;
  if (prediction.homeGoals === result.homeGoals) pts += rules.ptsCorrectHome;
  if (prediction.awayGoals === result.awayGoals) pts += rules.ptsCorrectAway;
  if (prediction.homeGoals + prediction.awayGoals === result.homeGoals + result.awayGoals)
    pts += rules.ptsCorrectTotal;

  return pts;
}
