import { useState } from 'react';
import { motion } from 'framer-motion';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export default function RichTextEditor({ value, onChange, placeholder }: RichTextEditorProps) {
  const [showToolbar, setShowToolbar] = useState(false);

  const formatText = (command: string, value?: string) => {
    document.execCommand(command, false, value);
  };

  const handleCodeBlock = () => {
    const selection = window.getSelection()?.toString();
    if (selection) {
      const codeBlock = `\`\`\`\n${selection}\n\`\`\``;
      document.execCommand('insertText', false, codeBlock);
    }
  };

  return (
    <div className="w-full rounded-xl border border-indigo-200 overflow-hidden">
      {/* Toolbar */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-2 p-2 bg-indigo-50/50 border-b border-indigo-200"
      >
        <button onClick={() => formatText('bold')} 
                className="p-2 hover:bg-indigo-100 rounded-lg transition-colors">
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M6 4h8a4 4 0 014 4 4 4 0 01-4 4H6z"></path>
            <path d="M6 12h9a4 4 0 014 4 4 4 0 01-4 4H6z"></path>
          </svg>
        </button>
        <button onClick={() => formatText('italic')}
                className="p-2 hover:bg-indigo-100 rounded-lg transition-colors">
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M10 4v2h2.21l-3.42 12H6v2h8v-2h-2.21l3.42-12H18V4z"></path>
          </svg>
        </button>
        <button onClick={() => formatText('underline')}
                className="p-2 hover:bg-indigo-100 rounded-lg transition-colors">
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M6 21h12v-2H6zM12 17a6 6 0 006-6V3h-2.5v8a3.5 3.5 0 01-7 0V3H6v8a6 6 0 006 6z"></path>
          </svg>
        </button>
        <div className="w-px h-6 bg-indigo-200"></div>
        <button onClick={handleCodeBlock}
                className="p-2 hover:bg-indigo-100 rounded-lg transition-colors">
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M8 3H6v2h2V3zm0 16H6v2h2v-2zm8-16h-2v2h2V3zm0 16h-2v2h2v-2zm2-6h2v-2h-2v2zm0 6h2v-2h-2v2zM4 7h2V5H4v2zm0 4h2V9H4v2zm0 4h2v-2H4v2zm0 4h2v-2H4v2z"></path>
          </svg>
        </button>
      </motion.div>

      {/* Editor */}
      <div
        contentEditable
        className="min-h-[200px] p-4 focus:outline-none prose prose-indigo max-w-none
                   prose-pre:bg-indigo-50 prose-pre:p-4 prose-pre:rounded-lg
                   prose-code:text-indigo-600 prose-code:bg-indigo-50 prose-code:px-2 prose-code:py-0.5 prose-code:rounded
                   prose-a:text-indigo-600 hover:prose-a:text-indigo-700"
        placeholder={placeholder}
        onInput={(e) => onChange(e.currentTarget.innerHTML)}
        dangerouslySetInnerHTML={{ __html: value }}
      />
    </div>
  );
}
