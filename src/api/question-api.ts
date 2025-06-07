import { safeInvoke } from './tauri-utils';

export interface CreateQuestionRequest {
  title: string;
  content: string;
  tags: string[];
}

export interface QuestionQuery {
  page?: number;
  per_page?: number;
  sort_by?: string;
  tag?: string;
  search?: string;
}

export interface QuestionResponse {
  id: number;
  title: string;
  content: string;
  user_id: number;
  username: string;
  tags: string[];
  created_at: string;
  updated_at: string;
  view_count: number;
  answer_count: number;
  vote_score: number;
}

export const questionApi = {
  createQuestion: async (userId: number, request: CreateQuestionRequest): Promise<QuestionResponse> => {
    const result = await safeInvoke<QuestionResponse>('create_question', { user_id: userId, request });
    if (!result) throw new Error('Failed to create question');
    return result;
  },

  getQuestion: async (id: number): Promise<QuestionResponse> => {
    const result = await safeInvoke<QuestionResponse>('get_question', { id });
    if (!result) throw new Error('Failed to get question');
    return result;
  },

  listQuestions: async (query: QuestionQuery): Promise<QuestionResponse[]> => {
    const result = await safeInvoke<QuestionResponse[]>('list_questions', { query });
    if (!result) throw new Error('Failed to list questions');
    return result;
  },
};