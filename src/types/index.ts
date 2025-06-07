export interface User {
  userId: number;
  username: string;
  email: string;
  display_name?: string;
  reputation?: number;
  avatar_url?: string;
}

export interface Question {
  id: number;
  title: string;
  description: string;
  languages: string[];
  isSolved: boolean;
  userId: number;
  viewedCounter: number;
  createdAt: string;
  user?: User;
  votes?: Vote;
}

export interface Answer {
  id: number;
  description: string;
  isCorrect: boolean;
  userId: number;
  createdAt: string;
  user?: User;
  votes?: Vote;
}

export interface AnswerDetail {
  id: number;
  answerId: number;
  userId: number;
  isApprove: boolean;
  createdAt: string;
}

export interface Comment {
  id: number;
  answerId: number;
  comment: string;
  userId: number;
  createdAt: string;
  user?: User;
}

export interface Vote {
  upvotes: number;
  downvotes: number;
}

export interface StorageQuestion {
  id: number;
  title: string;
  content: string;
  user_id: number;
  created_at: string;
  updated_at: string;
  view_count: number;
  is_closed: boolean;
  is_answered: boolean;
  tags: string[];
  author: {
    id: number;
    username: string;
    display_name: string;
    reputation: number;
    avatar_url?: string;
  };
  answer_count: number;
  vote_count: number;
}

export interface StorageAnswer {
  id: number;
  question_id: number;
  content: string;
  user_id: number;
  created_at: string;
  updated_at: string;
  is_accepted: boolean;
  author: {
    id: number;
    username: string;
    display_name: string;
    reputation: number;
    avatar_url?: string;
  };
  vote_count: number;
}

export interface StorageVote {
  id: number;
  user_id: number;
  vote_type: "up" | "down";
  target_id: number;
  target_type: "question" | "answer";
  created_at: string;
}

export interface StorageTag {
  id: number;
  name: string;
  description?: string;
  question_count: number;
}
