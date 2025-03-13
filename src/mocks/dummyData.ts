

export interface DummyUser {
  userId: number;
  username: string;
  email: string;
  password: string;
}

export const dummyUsers: DummyUser[] = [
  {
    userId: 1,
    username: "johnDoe",
    email: "johndoe@example.com",
    password: "password123"
  },
  {
    userId: 2,
    username: "janeSmith",
    email: "jane@example.com",
    password: "securePass!"
  }
];

export interface DummyQuestion {
  title: string;
  description: string;
  comment: string;
  languages: string[];
  isSolved: boolean;
  userId: number;
  viewedCounter: number;
  createdAt: string;
}

export const dummyQuestions: DummyQuestion[] = [
  {
    title: "How to implement traits in Rust?",
    description: "I am new to Rust and need help understanding traits.",
    comment: "Great explanation provided below.",
    languages: ["rust"],
    isSolved: true,
    userId: 1,
    viewedCounter: 153,
    createdAt: "2024-01-15T08:00:00Z"
  },
  {
    title: "Understanding ownership in Rust",
    description: "Can someone explain the ownership model?",
    comment: "I struggled with it too.",
    languages: ["rust"],
    isSolved: false,
    userId: 2,
    viewedCounter: 99,
    createdAt: "2024-01-16T10:30:00Z"
  }
];


export interface DummyAnswer {
  description: string;
  isCorrect: boolean;
  user: DummyUser;
  createdAt: string;
}

export const dummyAnswers: DummyAnswer[] = [
  {
    description: "Traits in Rust are similar to interfaces.",
    isCorrect: true,
    user: dummyUsers[1],
    createdAt: "2024-01-15T09:30:00Z"
  },
  {
    description: "Ownership means each value has a single owner.",
    isCorrect: false,
    user: dummyUsers[0],
    createdAt: "2024-01-16T11:00:00Z"
  }
];


export interface DummyAnswerDetail {
  answerDetailID: number;
  answerID: number;
  userID: number;
  isApprove: boolean;
  createdAt: string;
}

export const dummyAnswerDetails: DummyAnswerDetail[] = [
  {
    answerDetailID: 1,
    answerID: 1,
    userID: 1,
    isApprove: true,
    createdAt: "2024-01-15T10:00:00Z"
  },
  {
    answerDetailID: 2,
    answerID: 2,
    userID: 2,
    isApprove: false,
    createdAt: "2024-01-16T11:30:00Z"
  }
];


export interface DummyComment {
  commentID: number;
  answerID: number;
  comment: string;
  userID: number;
  createdAt: string;
}

export const dummyComments: DummyComment[] = [
  {
    commentID: 1,
    answerID: 1,
    comment: "This explanation helped me a lot!",
    userID: 1,
    createdAt: "2024-01-15T10:05:00Z"
  },
  {
    commentID: 2,
    answerID: 2,
    comment: "I disagree with this explanation.",
    userID: 2,
    createdAt: "2024-01-16T11:45:00Z"
  }
];


export const dummyData = {
  users: dummyUsers,
  questions: dummyQuestions,
  answers: dummyAnswers,
  answerDetails: dummyAnswerDetails,
  comments: dummyComments,
};
