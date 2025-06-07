import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import RichTextEditor from '../components/rich-text-editor';
import { questionService } from '../services/question-service';
import { userService } from '../services/user-service';
import { tagService } from '../services/tag-service';
import { useToast } from '../components/toast';

export default function AskQuestion() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const navigate = useNavigate();
  const { showToast } = useToast();

  const handleTagInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setTagInput(value);
    
    if (value.trim().length > 1) {
      try {
        const allTags = await tagService.searchTags(value);
        setSuggestions(allTags.map(tag => tag.name));
      } catch (error) {
        console.error('Error searching tags:', error);
        setSuggestions([]);
      }
    } else {
      setSuggestions([]);
    }
  };

  const addTag = (tagName: string = tagInput.trim()) => {
    if (!tagName) return;
    
    if (!tags.includes(tagName.toLowerCase())) {
      setTags([...tags, tagName.toLowerCase()]);
    }
    
    setTagInput('');
    setSuggestions([]);
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      showToast('error', 'Please enter a title for your question');
      return;
    }
    
    if (!content.trim()) {
      showToast('error', 'Please provide details for your question');
      return;
    }
    
    if (tags.length === 0) {
      showToast('error', 'Please add at least one tag');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const user = userService.getUser();
      
      if (!user) {
        showToast('error', 'You must be logged in to ask a question');
        navigate('/login');
        return;
      }
      
      for (const tag of tags) {
        await tagService.createTag(tag);
      }
      
      const newQuestion = await questionService.createQuestion(
        user.id,
        title,
        content,
        tags
      );
      
      for (const tag of tags) {
        await tagService.incrementTagQuestionCount(tag);
      }
      
      showToast('success', 'Your question has been posted!');
      navigate(`/questions/${newQuestion.id}`);
    } catch (error) {
      console.error('Failed to submit question:', error);
      showToast('error', 'Failed to submit your question. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      addTag();
    } else if (e.key === 'Backspace' && !tagInput && tags.length > 0) {
      removeTag(tags[tags.length - 1]);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="pt-20 pb-12 max-w-4xl mx-auto px-6"
    >
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-indigo-100">
        <h1 className="text-3xl font-bold text-theme-text-primary mb-6 bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">Ask a Question</h1>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="title" className="block text-theme-text-primary font-medium">
              Title
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-3 border border-indigo-200 rounded-xl bg-white/50
                       focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500
                       transition-all duration-200"
              placeholder="Be specific and imagine you're asking a question to another person"
            />
          </div>
          
          <div className="space-y-2">
            <label htmlFor="content" className="block text-theme-text-primary font-medium">
              Question Details
            </label>
            <RichTextEditor
              value={content}
              onChange={setContent}
              placeholder="Include all the information someone would need to answer your question"
            />
          </div>
          
          <div className="space-y-2">
            <label htmlFor="tags" className="block text-theme-text-primary font-medium">
              Tags
            </label>
            <div className="flex flex-wrap items-center gap-2 p-3 border border-indigo-200 rounded-xl bg-white/50 focus-within:ring-2 focus-within:ring-indigo-500/30 focus-within:border-indigo-500 transition-all duration-200">
              {tags.map(tag => (
                <span
                  key={tag}
                  className="px-3 py-1 bg-indigo-100 text-indigo-600
                           rounded-full text-sm flex items-center gap-1 font-medium"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="hover:text-red-500 transition-colors"
                  >
                    ×
                  </button>
                </span>
              ))}
              <div className="relative flex-1">
                <input
                  id="tags"
                  type="text"
                  value={tagInput}
                  onChange={handleTagInputChange}
                  onKeyDown={handleKeyDown}
                  className="w-full border-0 p-1 focus:outline-none focus:ring-0 bg-transparent"
                  placeholder={tags.length > 0 ? "" : "Add tags (e.g., javascript, react)"}
                />
                {suggestions.length > 0 && (
                  <div className="absolute left-0 right-0 top-full mt-1 bg-white/80 backdrop-blur-sm border border-indigo-200 rounded-xl shadow-lg z-10">
                    {suggestions.map(suggestion => (
                      <button
                        key={suggestion}
                        type="button"
                        onClick={() => addTag(suggestion)}
                        className="w-full text-left px-4 py-2 text-indigo-700 hover:bg-indigo-50 rounded-lg mx-1 my-0.5 transition-colors"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <p className="text-xs text-indigo-500/70">
              Add up to 5 tags to describe what your question is about
            </p>
          </div>
          
          <div className="flex justify-end gap-4 pt-4">
            <button
              type="button"
              onClick={() => navigate('/questions')}
              className="px-6 py-2.5 border border-indigo-200 rounded-xl
                       text-indigo-600 hover:bg-indigo-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`px-6 py-2.5 rounded-xl text-white font-medium 
                        bg-gradient-to-r from-indigo-600 to-purple-600
                        hover:from-indigo-700 hover:to-purple-700 shadow-md hover:shadow-indigo-500/30
                        transition-all ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {isSubmitting ? 'Posting...' : 'Post Your Question'}
            </button>
          </div>
        </form>
      </div>
    </motion.div>
  );
} 