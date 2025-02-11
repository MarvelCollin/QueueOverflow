import { Question, Answer, Comment } from '../types';

const API_URL = 'http://localhost:3000/api'; // Change this to your actual API URL

export const api = {
  questions: {
    getAll: async (): Promise<Question[]> => {
      // Placeholder until backend is ready
      return Promise.resolve([]);
    },
    
    getById: async (id: number): Promise<Question> => {
      // Placeholder
      return Promise.resolve({} as Question);
    },
    
    create: async (question: Partial<Question>): Promise<Question> => {
      // Placeholder
      return Promise.resolve({} as Question);
    }
  },
  
  answers: {
    getByQuestionId: async (questionId: number): Promise<Answer[]> => {
      // Placeholder
      return Promise.resolve([]);
    },
    
    create: async (questionId: number, answer: Partial<Answer>): Promise<Answer> => {
      // Placeholder
      return Promise.resolve({} as Answer);
    }
  },
  
  comments: {
    getByAnswerId: async (answerId: number): Promise<Comment[]> => {
      // Placeholder
      return Promise.resolve([]);
    }
  }
};
