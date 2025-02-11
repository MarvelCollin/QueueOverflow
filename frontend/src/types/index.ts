export interface User {
  userId: number;
  username: string;
  email: string;
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
}

export interface Answer {
  id: number;
  description: string;
  isCorrect: boolean;
  userId: number;
  createdAt: string;
  user?: User;
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
