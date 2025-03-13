import { useState, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import Prism from 'prismjs';

interface RichTextEditorProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
}

const SUPPORTED_LANGUAGES = [
    { label: 'JavaScript', value: 'javascript' },
    { label: 'TypeScript', value: 'typescript' },
    { label: 'Python', value: 'python' },
    { label: 'Java', value: 'java' },
    { label: 'JSX', value: 'jsx' },
    { label: 'TSX', value: 'tsx' },
    { label: 'HTML', value: 'html' },
    { label: 'CSS', value: 'css' },
];

export default function RichTextEditor({ value, onChange, placeholder }: RichTextEditorProps) {
    const editorRef = useRef<HTMLDivElement>(null);
    const [lastSelection, setLastSelection] = useState<number>(0);

    const updateContent = useCallback((newContent: string) => {
        if (editorRef.current) {

            editorRef.current.innerHTML = newContent;


            const selection = window.getSelection();
            const range = document.createRange();

            let currentNode = editorRef.current;
            let currentPos = 0;


            const findPosition = (node: Node): boolean => {
                if (node.nodeType === Node.TEXT_NODE) {
                    const length = node.textContent?.length || 0;
                    if (currentPos + length >= lastSelection) {
                        range.setStart(node, lastSelection - currentPos);
                        range.collapse(true);
                        selection?.removeAllRanges();
                        selection?.addRange(range);
                        return true;
                    }
                    currentPos += length;
                }

                for (const child of Array.from(node.childNodes)) {
                    if (findPosition(child)) return true;
                }
                return false;
            };

            findPosition(editorRef.current);
        }
    }, [lastSelection]);

    const handleInput = (event: React.FormEvent<HTMLDivElement>) => {
        const newContent = event.currentTarget.innerHTML;
        const selection = window.getSelection();

        if (selection) {

            const range = selection.getRangeAt(0);
            const preCaretRange = range.cloneRange();
            preCaretRange.selectNodeContents(event.currentTarget);
            preCaretRange.setEnd(range.endContainer, range.endOffset);
            setLastSelection(preCaretRange.toString().length);
        }

        onChange(newContent);
    };

    const insertFormat = (format: string) => {
        document.execCommand(format, false);
        if (editorRef.current) {
            onChange(editorRef.current.innerHTML);
        }
    };

    const insertCodeBlock = () => {
        const codeBlock = `
      <div class="code-block" contenteditable="false">
        <div class="code-header bg-gray-800 text-gray-300 px-4 py-2 flex justify-between">
          <select class="bg-transparent border-0">
            ${SUPPORTED_LANGUAGES.map(lang =>
            `<option value="${lang.value}">${lang.label}</option>`
        ).join('')}
          </select>
        </div>
        <div class="code-content p-4 bg-gray-900" contenteditable="true">
          <code class="text-gray-100"></code>
        </div>
      </div>
      <p></p>
    `;

        document.execCommand('insertHTML', false, codeBlock);
        if (editorRef.current) {
            onChange(editorRef.current.innerHTML);
            Prism.highlightAll();
        }
    };

    return (
        <div className="w-full rounded-xl border border-indigo-200 overflow-hidden">
            <motion.div className="flex gap-2 p-2 bg-indigo-50/50 border-b border-indigo-200">
                <button onClick={() => insertFormat('bold')} className="p-2 hover:bg-indigo-100 rounded">
                    <b>B</b>
                </button>
                <button onClick={() => insertFormat('italic')} className="p-2 hover:bg-indigo-100 rounded">
                    <i>I</i>
                </button>
                <button onClick={() => insertFormat('underline')} className="p-2 hover:bg-indigo-100 rounded">
                    <u>U</u>
                </button>
                <button onClick={insertCodeBlock} className="p-2 hover:bg-indigo-100 rounded">
                    Code
                </button>
            </motion.div>

            <div
                ref={editorRef}
                contentEditable
                className="min-h-[200px] p-4 focus:outline-none"
                onInput={handleInput}
                onKeyDown={(e) => {
                    if (e.key === 'Tab') {
                        e.preventDefault();
                        document.execCommand('insertText', false, '  ');
                    }
                }}
                placeholder={placeholder}
            />
        </div>
    );
}
