import { safeInvoke } from './tauri-utils';


export interface CreateTagRequest {
  name: string;
  description?: string;
}

export interface TagResponse {
  id: number;
  name: string;
  description?: string;
  question_count: number;
  created_at: string;
  updated_at: string;
}


export const tagApi = {
  createTag: async (request: CreateTagRequest): Promise<TagResponse> => {
    const result = await safeInvoke<TagResponse>('create_tag', { request });
    if (!result) throw new Error('Failed to create tag');
    return result;
  },

  getTag: async (id: number): Promise<TagResponse> => {
    const result = await safeInvoke<TagResponse>('get_tag', { id });
    if (!result) throw new Error('Failed to get tag');
    return result;
  },

  listTags: async (): Promise<TagResponse[]> => {
    const result = await safeInvoke<TagResponse[]>('list_tags');
    if (!result) throw new Error('Failed to list tags');
    return result;
  },

  searchTags: async (query: string): Promise<TagResponse[]> => {
    const result = await safeInvoke<TagResponse[]>('search_tags', { query });
    if (!result) throw new Error('Failed to search tags');
    return result;
  },
};