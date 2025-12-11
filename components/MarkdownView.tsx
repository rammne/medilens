import React from 'react';

// A very lightweight markdown renderer for the demo to keep it fast and dependency-light
// Handles headers, bolding, and bullet points which is what Gemini mostly outputs for this prompt.
export const MarkdownView: React.FC<{ content: string }> = ({ content }) => {
  const formatText = (text: string) => {
    const lines = text.split('\n');
    return lines.map((line, index) => {
      // Headers
      if (line.startsWith('### ')) {
        return <h3 key={index} className="text-lg font-bold text-slate-800 mt-4 mb-2">{parseInline(line.replace('### ', ''))}</h3>;
      }
      if (line.startsWith('## ')) {
        return <h2 key={index} className="text-xl font-bold text-teal-700 mt-5 mb-3">{parseInline(line.replace('## ', ''))}</h2>;
      }
      if (line.startsWith('# ')) {
        return <h1 key={index} className="text-2xl font-bold text-teal-800 mt-6 mb-4">{parseInline(line.replace('# ', ''))}</h1>;
      }
      
      // Bullet points
      if (line.trim().startsWith('* ') || line.trim().startsWith('- ')) {
        return (
          <div key={index} className="flex items-start gap-2 mb-2 pl-2">
            <span className="text-teal-500 mt-1.5">•</span>
            <p className="text-slate-600 leading-relaxed flex-1">{parseInline(line.replace(/^(\*|-)\s/, ''))}</p>
          </div>
        );
      }

      // Empty lines
      if (line.trim() === '') {
        return <div key={index} className="h-2"></div>;
      }

      // Regular Paragraphs
      return <p key={index} className="text-slate-600 leading-relaxed mb-2">{parseInline(line)}</p>;
    });
  };

  const parseInline = (text: string) => {
    // Simple bold parser
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} className="font-semibold text-slate-800">{part.slice(2, -2)}</strong>;
      }
      return part;
    });
  };

  return <div className="text-sm md:text-base w-full">{formatText(content)}</div>;
};