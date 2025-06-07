import { safeInvoke } from './tauri-utils';

export interface CreateBookmarkRequest {
  target_id: number;
  target_type: string;
  title: string;
  note?: string;
}

export interface UpdateBookmarkRequest {
  title: string;
  note?: string;
}

export interface BookmarkResponse {
  id: number;
  user_id: number;
  target_id: number;
  target_type: string;
  title: string;
  note?: string;
  created_at: string;
  updated_at: string;
}

export interface BookmarkWithContentResponse {
  id: number;
  user_id: number;
  target_id: number;
  target_type: string;
  title: string;
  note?: string;
  content: string;
  created_at: string;
  updated_at: string;
}

export const bookmarkApi = {
  createBookmark: async (userId: number, request: CreateBookmarkRequest): Promise<BookmarkResponse> => {
    const result = await safeInvoke<BookmarkResponse>('create_bookmark', { user_id: userId, request });
    if (!result) throw new Error('Failed to create bookmark');
    return result;
  },

  listBookmarks: async (userId: number): Promise<BookmarkResponse[]> => {
    const result = await safeInvoke<BookmarkResponse[]>('list_bookmarks', { user_id: userId });
    if (!result) throw new Error('Failed to list bookmarks');
    return result;
  },

  getBookmark: async (bookmarkId: number, userId: number): Promise<BookmarkWithContentResponse> => {
    const result = await safeInvoke<BookmarkWithContentResponse>('get_bookmark', { bookmark_id: bookmarkId, user_id: userId });
    if (!result) throw new Error('Failed to get bookmark');
    return result;
  },

  updateBookmark: async (bookmarkId: number, userId: number, request: UpdateBookmarkRequest): Promise<BookmarkResponse> => {
    const result = await safeInvoke<BookmarkResponse>('update_bookmark', { bookmark_id: bookmarkId, user_id: userId, request });
    if (!result) throw new Error('Failed to update bookmark');
    return result;
  },

  deleteBookmark: async (bookmarkId: number, userId: number): Promise<void> => {
    const result = await safeInvoke<void>('delete_bookmark', { bookmark_id: bookmarkId, user_id: userId });
    if (result === null) throw new Error('Failed to delete bookmark');
  },
};