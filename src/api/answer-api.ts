import { safeInvoke } from './tauri-utils';

export interface CreateAnswerRequest {
  question_id: number;
  content: string;
}

export interface AnswerResponse {
  id: number;
  question_id: number;
  user_id: number;
  username: string;
  content: string;
  is_accepted: boolean;
  created_at: string;
  updated_at: string;
  vote_score: number;
}

export const answerApi = {
  createAnswer: async (userId: number, request: CreateAnswerRequest): Promise<AnswerResponse> => {
    const result = await safeInvoke<AnswerResponse>('create_answer', { user_id: userId, request });
    if (!result) throw new Error('Failed to create answer');
    return result;
  },

  getQuestionAnswers: async (questionId: number): Promise<AnswerResponse[]> => {
    const result = await safeInvoke<AnswerResponse[]>('get_question_answers', { question_id: questionId });
    if (!result) throw new Error('Failed to get question answe  rs');
    return result;
  },

  acceptAnswer: async (answerId: number): Promise<void> => {
    const result = await safeInvoke<void>('accept_answer', { answer_id: answerId });
    if (result === null) throw new Error('Failed to accept answer');
  },
};