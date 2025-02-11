import { Question } from '../types';

interface QuestionCardProps {
  question: Question;
}

export default function QuestionCard({ question }: QuestionCardProps) {
  return (
    <div className="border-b border-gray-200 py-4">
      <div className="flex gap-4">
        <div className="flex flex-col items-center text-gray-500 text-sm">
          <span className="font-bold">{question.viewedCounter}</span>
          <span>views</span>
        </div>
        <div className="flex-1">
          <h2 className="text-xl text-blue-600 hover:text-blue-800">
            <a href={`/questions/${question.id}`}>{question.title}</a>
          </h2>
          <p className="text-gray-600 text-sm mt-2 line-clamp-2">{question.description}</p>
          <div className="flex gap-2 mt-2">
            {question.languages.map(lang => (
              <span key={lang} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                {lang}
              </span>
            ))}
          </div>
          <div className="flex justify-between items-center mt-4">
            <div className="flex gap-2 text-sm text-gray-500">
              {question.isSolved && (
                <span className="text-green-600">✓ Solved</span>
              )}
              <span>Asked {new Date(question.createdAt).toLocaleDateString()}</span>
            </div>
            <div className="text-sm">
              <span className="text-blue-600">{question.user?.username}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
