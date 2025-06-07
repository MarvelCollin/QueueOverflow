import { useEffect, useRef } from "react";
import * as Prism from "prismjs";
import "prismjs/themes/prism-tomorrow.css";
import "prismjs/components/prism-javascript";
import "prismjs/components/prism-typescript";
import "prismjs/components/prism-jsx";
import "prismjs/components/prism-tsx";
import "prismjs/components/prism-python";
import "prismjs/components/prism-java";
import "prismjs/plugins/line-numbers/prism-line-numbers.js";
import "prismjs/plugins/line-numbers/prism-line-numbers.css";
import "prismjs/plugins/toolbar/prism-toolbar.js";
import "prismjs/plugins/toolbar/prism-toolbar.css";
import "prismjs/plugins/copy-to-clipboard/prism-copy-to-clipboard.js";
import "../styles/codeblock.css";

interface CodeBlockProps {
  code: string;
  language: string;
  editable?: boolean;
  onChange?: (code: string) => void;
}

export default function CodeBlock({
  code,
  language,
  editable = false,
  onChange,
}: CodeBlockProps) {
  const codeRef = useRef<HTMLPreElement>(null);

  useEffect(() => {
    if (codeRef.current) {
      Prism.highlightElement(codeRef.current);
    }
  }, [code, language]);

  const handleInput = (e: React.FormEvent<HTMLPreElement>) => {
    e.preventDefault();
    const text = e.currentTarget.textContent || "";
    onChange?.(text);
    setTimeout(() => {
      if (codeRef.current) {
        Prism.highlightElement(codeRef.current);
      }
    }, 0);
  };

  return (
    <div className="relative group rounded-lg overflow-hidden bg-slate-900 border border-slate-700">
      <div className="flex items-center justify-between px-4 py-2 bg-slate-800 border-b border-slate-700">
        <span className="text-slate-300 text-sm font-mono">{language}</span>
        <button
          onClick={() => navigator.clipboard.writeText(code)}
          className="px-2 py-1 text-xs text-slate-300 hover:text-white hover:bg-slate-700 rounded 
                     transition-colors duration-200 opacity-0 group-hover:opacity-100"
        >
          Copy
        </button>
      </div>

      <pre
        ref={codeRef}
        contentEditable={editable}
        suppressContentEditableWarning
        spellCheck={false}
        onInput={handleInput}
        onKeyDown={(e) => {
          if (e.key === "Tab") {
            e.preventDefault();
            document.execCommand("insertText", false, "  ");
          }
        }}
        className="p-4 m-0 font-mono text-sm text-white bg-slate-900 overflow-x-auto"
      >
        <code className={`language-${language} text-white`}>{code}</code>
      </pre>

      {editable && (
        <div
          className="absolute bottom-2 right-2 px-2 py-1 text-xs text-slate-400 bg-slate-800/50 
                      rounded backdrop-blur-sm"
        >
          {language}
        </div>
      )}
    </div>
  );
}
