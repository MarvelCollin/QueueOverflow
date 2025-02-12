import { Question, Answer, Comment } from '../types';
import { mockQuestions, mockAnswers, mockComments } from '../mocks/data';

export const api = {
  questions: {
    getAll: async (): Promise<Question[]> => {
      await new Promise(resolve => setTimeout(resolve, 800));
      return mockQuestions;
    },
    
    getById: async (id: number): Promise<Question> => {
      await new Promise(resolve => setTimeout(resolve, 500));
      const question = mockQuestions.find(q => q.id === id);
      if (!question) throw new Error('Question not found');
      return question;
    }
  },
  
  answers: {
    getByQuestionId: async (questionId: number): Promise<Answer[]> => {
      await new Promise(resolve => setTimeout(resolve, 500));
      return mockAnswers;
    }
  },
  
  comments: {
    getByAnswerId: async (answerId: number): Promise<Comment[]> => {
      await new Promise(resolve => setTimeout(resolve, 300));
      return mockComments.filter(c => c.answerId === answerId);
    }
  }
};
