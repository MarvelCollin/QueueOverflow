import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import RichTextEditor from './rich-text-editor';

interface AnswerEditorProps {
  onSubmit: (answer: string) => void;
  isSubmitting?: boolean;
}

export default function AnswerEditor({ onSubmit, isSubmitting = false }: AnswerEditorProps) {
  const [answer, setAnswer] = useState('');
  const [isPreview, setIsPreview] = useState(false);
  const editorRef = useRef<HTMLDivElement>(null);

  const handleSubmit = () => {
    if (answer.trim()) {
      onSubmit(answer);
      setAnswer('');
    }
  };

  return (
    <div className="bg-indigo-50/50 rounded-xl p-6">
      <h3 className="text-lg font-semibold text-slate-900 mb-4">Your Answer</h3>
      
      <div className="relative">
        {isPreview ? (
          <div className="min-h-[200px] p-4 prose prose-indigo max-w-none bg-white rounded-xl border border-indigo-200"
               dangerouslySetInnerHTML={{ __html: answer }} />
        ) : (
          <RichTextEditor
            value={answer}
            onChange={setAnswer}
            placeholder="Write your answer here... You can use bold, italic, code blocks, and more!"
          />
        )}
      </div>

      <div className="mt-4 flex items-center gap-4">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleSubmit}
          disabled={isSubmitting}
          className={`bg-gradient-to-r from-indigo-500 to-purple-500 
                   text-white px-6 py-2 rounded-xl font-medium
                   hover:opacity-90 transition-all duration-300
                   shadow-md hover:shadow-xl hover:shadow-indigo-500/20
                   ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
        >
          {isSubmitting ? 'Posting...' : 'Post Your Answer'}
        </motion.button>
        <button
          onClick={() => setIsPreview(!isPreview)}
          disabled={isSubmitting}
          className={`text-slate-500 hover:text-indigo-600 
                   px-4 py-2 rounded-xl transition-colors
                   ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
        >
          {isPreview ? 'Edit' : 'Preview'}
        </button>
      </div>
    </div>
  );
}
