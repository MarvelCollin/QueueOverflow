import { safeInvoke } from "./tauri-utils";

export interface CreateVoteRequest {
  target_id: number;
  target_type: string;
  vote_type: string;
}

export interface VoteResponse {
  id: number;
  user_id: number;
  target_id: number;
  target_type: string;
  vote_type: string;
  created_at: string;
}

export interface VoteCount {
  upvotes: number;
  downvotes: number;
  total_score: number;
}

export const voteApi = {
  createVote: async (
    userId: number,
    request: CreateVoteRequest
  ): Promise<VoteResponse> => {
    const result = await safeInvoke<VoteResponse>("create_vote", {
      user_id: userId,
      request,
    });
    if (!result) throw new Error("Failed to create vote");
    return result;
  },

  getVoteCount: async (
    targetId: number,
    targetType: string
  ): Promise<VoteCount> => {
    const result = await safeInvoke<VoteCount>("get_vote_count", {
      target_id: targetId,
      target_type: targetType,
    });
    if (!result) throw new Error("Failed to get vote count");
    return result;
  },
};
