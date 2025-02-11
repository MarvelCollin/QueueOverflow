import { useEffect, useState } from 'react';
import { Question } from '../types';
import { api } from '../services/api';
import QuestionCard from '../components/QuestionCard';

export default function Questions() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.questions.getAll()
      .then(data => {
        setQuestions(data);
        setLoading(false);
      });
  }, []);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl">All Questions</h1>
        <button className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded">
          Ask Question
        </button>
      </div>

      {loading ? (
        <div className="text-center py-8">Loading...</div>
      ) : (
        <div className="space-y-4">
          {questions.map(question => (
            <QuestionCard key={question.id} question={question} />
          ))}
        </div>
      )}
    </div>
  );
}
