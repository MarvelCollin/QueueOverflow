import { useState, useRef, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import * as Prism from "prismjs";
import "prismjs/components/prism-javascript";
import "prismjs/components/prism-typescript";
import "prismjs/components/prism-css";
import "prismjs/components/prism-rust";
import "prismjs/components/prism-sql";
import "prismjs/components/prism-python";
import "prismjs/components/prism-java";
import "prismjs/components/prism-jsx";
import "prismjs/components/prism-tsx";
import "prismjs/components/prism-markup";
import "prismjs/themes/prism-tomorrow.css";
import "./rich-text-editor.css";

declare global {
  interface Window {
    Prism: typeof Prism;
  }
}

window.Prism = Prism;

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

const SUPPORTED_LANGUAGES = [
  { label: "JavaScript", value: "javascript" },
  { label: "TypeScript", value: "typescript" },
  { label: "Python", value: "python" },
  { label: "Java", value: "java" },
  { label: "JSX", value: "jsx" },
  { label: "TSX", value: "tsx" },
  { label: "HTML", value: "html" },
  { label: "CSS", value: "css" },
];

export default function RichTextEditor({
  value,
  onChange,
  placeholder,
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [lastSelection, setLastSelection] = useState<number>(0);
  const [initialRender, setInitialRender] = useState(true);

  useEffect(() => {
    if (
      editorRef.current &&
      (initialRender || editorRef.current.innerHTML !== value)
    ) {
      editorRef.current.innerHTML = value;
      setInitialRender(false);

      const codeBlocks = editorRef.current.querySelectorAll(".code-block");
      codeBlocks.forEach((block) => {
        const codeContent = block.querySelector(".code-content");
        if (codeContent) {
          codeContent.removeEventListener("input", highlightCodeListener);
          codeContent.addEventListener("input", highlightCodeListener);
        }

        Prism.highlightAllUnder(block);
      });
    }
  }, [value, initialRender]);

  const highlightCodeListener = (event: Event) => {
    const codeContent = event.currentTarget as Element;
    const codeElement = codeContent.querySelector("code");
    if (codeElement) {
      Prism.highlightElement(codeElement);
    }
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const updateContent = useCallback(
    (newContent: string) => {
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
    },
    [lastSelection],
  );

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
        <div class="code-header">
          <div class="custom-dropdown">
            <button type="button" class="custom-dropdown-button" onclick="this.nextElementSibling.style.display = this.nextElementSibling.style.display === 'block' ? 'none' : 'block';">JavaScript</button>
            <div class="custom-dropdown-menu">
              ${SUPPORTED_LANGUAGES.map(
                (lang) =>
                  `<div class="custom-dropdown-item" data-value="${lang.value}" onclick="(function(e) { 
                const button = e.target.closest('.custom-dropdown').querySelector('.custom-dropdown-button');
                const menu = e.target.closest('.custom-dropdown-menu');
                const code = e.target.closest('.code-block').querySelector('code');
                if (code) {
                  code.className = 'language-' + e.target.dataset.value;
                  button.textContent = e.target.textContent;
                  if (window.Prism) {
                    window.Prism.highlightElement(code);
                  }
                  menu.style.display = 'none';
                }
                e.stopPropagation();
              })(event)">${lang.label}</div>`,
              ).join("")}
            </div>
          </div>
          <div class="code-actions">
            <span class="code-label">Code</span>
            <button type="button" class="exit-code-btn" title="Exit Code Block" onclick="(function(e) {
              const codeBlock = e.target.closest('.code-block');
              const range = document.createRange();
              const selection = window.getSelection();
              const paragraph = document.createElement('p');
              paragraph.innerHTML = '<br>';
              codeBlock.parentNode.insertBefore(paragraph, codeBlock.nextSibling);
              range.setStart(paragraph, 0);
              range.collapse(true);
              selection.removeAllRanges();
              selection.addRange(range);
              paragraph.focus();
            })(event)">
              <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">
                <path d="M18 6L6 18M6 6l12 12"></path>
              </svg>
            </button>
          </div>
        </div>
        <div class="code-content" contenteditable="true">
                    <code class="language-javascript">const myFunction = () => {  console.log("Hello world!");  return "Welcome to coding!";};</code>
        </div>
        <div class="code-footer">
          <div class="paste-instructions">Paste code with Ctrl+V or ⌘+V</div>
          <button type="button" class="paste-btn" onclick="(function(e) {
            navigator.clipboard.readText().then(text => {
              const codeElement = e.target.closest('.code-block').querySelector('code');
              if (codeElement) {
                codeElement.textContent = text;
                if (window.Prism) {
                  window.Prism.highlightElement(codeElement);
                }
              }
                        }).catch(() => {});
          })(event)">Paste from Clipboard</button>
        </div>
      </div>
      <p></p>
    `;

    document.execCommand("insertHTML", false, codeBlock);

    if (editorRef.current) {
      const codeBlocks = editorRef.current.querySelectorAll(".code-block");
      const lastCodeBlock = codeBlocks[codeBlocks.length - 1];
      if (lastCodeBlock) {
        const codeContent = lastCodeBlock.querySelector(".code-content");
        if (codeContent) {
          codeContent.removeEventListener("input", highlightCodeListener);
          codeContent.addEventListener("input", highlightCodeListener);

          codeContent.addEventListener("paste", (e: Event) => {
            const pasteEvent = e as ClipboardEvent;
            pasteEvent.preventDefault();

            const text = pasteEvent.clipboardData?.getData("text/plain");
            if (text && text.length > 0) {
              const codeElement = codeContent.querySelector("code");
              if (codeElement) {
                if (codeElement.textContent === "") {
                  codeElement.textContent = text;
                } else {
                  document.execCommand("insertText", false, text);
                }

                Prism.highlightElement(codeElement);
                onChange(editorRef.current!.innerHTML);
              }
            }
          });

          codeContent.addEventListener("keydown", (e: Event) => {
            const keyEvent = e as KeyboardEvent;
            if (keyEvent.key === "Tab") {
              keyEvent.preventDefault();
              document.execCommand("insertText", false, "  ");
            }
          });

          setTimeout(() => {
            const range = document.createRange();
            const selection = window.getSelection();
            const codeElement = codeContent.querySelector("code");

            if (codeElement && codeElement.firstChild) {
              range.selectNodeContents(codeElement);
              selection?.removeAllRanges();
              selection?.addRange(range);

              if (codeContent instanceof HTMLElement) {
                codeContent.focus();
              }
            }
          }, 0);
        }

        Prism.highlightAllUnder(lastCodeBlock);
      }

      onChange(editorRef.current.innerHTML);
    }
  };

  useEffect(() => {
    const handleDocumentClick = (event: MouseEvent) => {
      const dropdowns = document.querySelectorAll(".custom-dropdown-menu");
      dropdowns.forEach((dropdown) => {
        if (
          dropdown.parentElement &&
          !dropdown.parentElement.contains(event.target as Node)
        ) {
          (dropdown as HTMLElement).style.display = "none";
        }
      });
    };

    document.addEventListener("click", handleDocumentClick);

    return () => {
      document.removeEventListener("click", handleDocumentClick);
    };
  }, []);

  return (
    <div className="w-full rounded-xl border border-indigo-200 overflow-hidden">
      <motion.div className="flex gap-2 p-2 bg-indigo-50/50 border-b border-indigo-200">
        <button
          onClick={() => insertFormat("bold")}
          className="p-2 hover:bg-indigo-100 rounded transition-colors text-indigo-700 font-medium"
        >
          <b>B</b>
        </button>
        <button
          onClick={() => insertFormat("italic")}
          className="p-2 hover:bg-indigo-100 rounded transition-colors text-indigo-700 font-medium"
        >
          <i>I</i>
        </button>
        <button
          onClick={() => insertFormat("underline")}
          className="p-2 hover:bg-indigo-100 rounded transition-colors text-indigo-700 font-medium"
        >
          <u>U</u>
        </button>
        <button
          onClick={insertCodeBlock}
          className="p-2 hover:bg-indigo-100 rounded transition-colors text-indigo-700 flex items-center gap-1 font-medium"
        >
          <svg
            className="w-4 h-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="16 18 22 12 16 6"></polyline>
            <polyline points="8 6 2 12 8 18"></polyline>
          </svg>
          Code
        </button>
      </motion.div>

      <div
        ref={editorRef}
        contentEditable
        className="min-h-[200px] p-4 focus:outline-none relative empty:before:content-[attr(data-placeholder)] empty:before:text-gray-400 empty:before:absolute empty:before:top-4 empty:before:left-4"
        onInput={handleInput}
        onKeyDown={(e) => {
          if (e.key === "Tab") {
            e.preventDefault();
            document.execCommand("insertText", false, "  ");
          }
        }}
        data-placeholder={placeholder}
      />
    </div>
  );
}
