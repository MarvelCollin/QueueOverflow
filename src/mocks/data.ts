import { User, Question, Answer, Comment } from '../types';

export const mockUsers: User[] = [
  {
    userId: 1,
    username: "RustMaster",
    email: "rust@example.com"
  },
  {
    userId: 2,
    username: "CodeWizard",
    email: "code@example.com"
  }
];

export const mockQuestions: Question[] = [
  {
    id: 1,
    title: "How to handle async/await in Rust?",
    description: "I'm building a web server and need to understand the best practices for handling async operations in Rust. Specifically with Tokio...",
    languages: ["rust", "async", "tokio"],
    isSolved: true,
    userId: 1,
    viewedCounter: 156,
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    user: mockUsers[0]
  },
  {
    id: 2,
    title: "Understanding Rust's ownership model",
    description: "Coming from Python, I'm struggling to understand borrowing and ownership in Rust. Can someone explain with practical examples?",
    languages: ["rust", "basics"],
    isSolved: false,
    userId: 2,
    viewedCounter: 89,
    createdAt: new Date().toISOString(),
    user: mockUsers[1]
  }
];

export const mockAnswers: Answer[] = [
  {
    id: 1,
    description: "Here's a complete example of async/await in Rust...",
    isCorrect: true,
    userId: 2,
    createdAt: new Date().toISOString(),
    user: mockUsers[1]
  }
];

export const mockComments: Comment[] = [
  {
    id: 1,
    answerId: 1,
    comment: "This helped a lot, thanks!",
    userId: 1,
    createdAt: new Date().toISOString(),
    user: mockUsers[0]
  }
];

export const mockVotes = {
  questions: {
    1: { upvotes: 42, downvotes: 3 },
    2: { upvotes: 15, downvotes: 1 },
    3: { upvotes: 7, downvotes: 0 }
  },
  answers: {
    1: { upvotes: 31, downvotes: 2 }
  }
};
