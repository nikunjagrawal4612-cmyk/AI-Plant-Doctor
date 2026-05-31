import React from "react";

/**
 * Parses inline formatting for stars (**bold** or *italicized bold*) and returns React nodes.
 */
export function parseInlineStyles(text: string): React.ReactNode[] {
  if (!text) return [];

  // Match:
  // 1. **something**
  // 2. *something*
  const parts = text.split(/(\*\*.*?\*\*|\*.*?\*)/g);
  
  return parts.map((part, index) => {
    // Check for double asterisks (**word**)
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={index} className="font-bold text-neutral-900 inline">
          {part.slice(2, -2)}
        </strong>
      );
    }
    // Check for single asterisks (*word*)
    if (part.startsWith("*") && part.endsWith("*")) {
      return (
        <strong key={index} className="font-bold text-neutral-900 inline">
          {part.slice(1, -1)}
        </strong>
      );
    }
    // Return regular plain text
    return <span key={index}>{part}</span>;
  });
}

interface FormattedTextProps {
  text: string;
}

export default function FormattedText({ text }: FormattedTextProps) {
  if (!text) return null;

  // Split text into lines
  const lines = text.split("\n");

  return (
    <div className="space-y-1.5 break-words">
      {lines.map((line, idx) => {
        // 1. Header rules (e.g. ### Header or ## Header)
        const headingMatch = line.match(/^(#{1,6})\s+(.*)$/);
        if (headingMatch) {
          const level = headingMatch[1].length;
          const content = headingMatch[2];
          const parsedContent = parseInlineStyles(content);

          if (level === 1) {
            return (
              <h1 key={idx} className="text-xl md:text-2xl font-extrabold text-neutral-900 mt-5 mb-3 first:mt-0 font-display">
                {parsedContent}
              </h1>
            );
          } else if (level === 2) {
            return (
              <h2 key={idx} className="text-lg font-bold text-neutral-900 mt-4 px-0 pb-1 border-b border-neutral-100 mb-2 first:mt-0 font-display">
                {parsedContent}
              </h2>
            );
          } else {
            return (
              <h3 key={idx} className="text-base font-bold text-neutral-850 mt-3.5 mb-1.5 first:mt-0 font-display">
                {parsedContent}
              </h3>
            );
          }
        }

        // 2. Unordered Bullet Lists (e.g., "- item" or "* item")
        const bulletMatch = line.match(/^([\*\-\+])\s+(.*)$/);
        if (bulletMatch) {
          const content = bulletMatch[2];
          // If it matches visual stars for list items, parse content inside
          return (
            <div key={idx} className="flex gap-2 items-start pl-3 my-1.5">
              <span className="text-emerald-600 font-extrabold select-none mt-1 shrink-0">•</span>
              <div className="flex-1 text-neutral-800 text-[15px] sm:text-base leading-relaxed">
                {parseInlineStyles(content)}
              </div>
            </div>
          );
        }

        // 3. Numbered lists (e.g., "1. item")
        const numberMatch = line.match(/^(\d+)\.\s+(.*)$/);
        if (numberMatch) {
          const num = numberMatch[1];
          const content = numberMatch[2];
          return (
            <div key={idx} className="flex gap-2 items-start pl-3 my-1.5">
              <span className="text-neutral-500 font-mono font-bold select-none shrink-0 text-sm mt-1">{num}.</span>
              <div className="flex-1 text-neutral-800 text-[15px] sm:text-base leading-relaxed">
                {parseInlineStyles(content)}
              </div>
            </div>
          );
        }

        // 4. Clean spacing for empty lines
        if (line.trim() === "") {
          return <div key={idx} className="h-2" />;
        }

        // 5. Default paragraph and text block
        return (
          <p key={idx} className="text-neutral-850 text-[15px] sm:text-base leading-relaxed font-normal">
            {parseInlineStyles(line)}
          </p>
        );
      })}
    </div>
  );
}
