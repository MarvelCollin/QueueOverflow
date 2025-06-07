import { safeInvoke } from './tauri-utils';

export interface CreateCommentRequest {
  target_id: number;
  target_type: string;
  content: string;
}

export interface UpdateCommentRequest {
  content: string;
}

export interface CommentResponse {
  id: number;
  user_id: number;
  username: string;
  target_id: number;
  target_type: string;
  content: string;
  created_at: string;
  updated_at: string;
}

export const commentApi = {
  createComment: async (userId: number, request: CreateCommentRequest): Promise<CommentResponse> => {
    const result = await safeInvoke<CommentResponse>('create_comment', { user_id: userId, request });
    if (!result) throw new Error('Failed to create comment');
    return result;
  },

  getComments: async (targetId: number, targetType: string): Promise<CommentResponse[]> => {
    const result = await safeInvoke<CommentResponse[]>('get_comments', { target_id: targetId, target_type: targetType });
    if (!result) throw new Error('Failed to get comments');
    return result;
  },

  updateComment: async (commentId: number, userId: number, request: UpdateCommentRequest): Promise<CommentResponse> => {
    const result = await safeInvoke<CommentResponse>('update_comment', { comment_id: commentId, user_id: userId, request });
    if (!result) throw new Error('Failed to update comment');
    return result;
  },

  deleteComment: async (commentId: number, userId: number): Promise<void> => {
    const result = await safeInvoke<void>('delete_comment', { comment_id: commentId, user_id: userId });
    if (result === null) throw new Error('Failed to delete comment');
  },
};