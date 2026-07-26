import type { EntrySummary, ReactionType } from "../types";

/** Aplica curtir/não-curtir localmente antes da resposta do servidor chegar (like/dislike são mutuamente exclusivos). */
export function applyReactionOptimistically(entry: EntrySummary, type: ReactionType): EntrySummary {
  let { likeCount, dislikeCount } = entry;
  if (entry.myReaction === "like") likeCount--;
  if (entry.myReaction === "dislike") dislikeCount--;

  const next = entry.myReaction === type ? null : type;
  if (next === "like") likeCount++;
  if (next === "dislike") dislikeCount++;

  return { ...entry, likeCount, dislikeCount, myReaction: next };
}
