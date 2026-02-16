'use client';

import ReactMarkdown from 'react-markdown';
import type { Components } from 'react-markdown';

const components: Components = {
  strong: ({ children }) => (
    <strong className="font-semibold text-[var(--text-primary)]">{children}</strong>
  ),
  ul: ({ children }) => (
    <ul className="list-disc pl-5 my-2 space-y-1">{children}</ul>
  ),
  ol: ({ children }) => (
    <ol className="list-decimal pl-5 my-2 space-y-1">{children}</ol>
  ),
  li: ({ children }) => (
    <li className="text-[var(--text-primary)]">{children}</li>
  ),
  a: ({ href, children }) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-[var(--accent)] hover:underline"
    >
      {children}
    </a>
  ),
  p: ({ children }) => (
    <p className="mb-3 last:mb-0">{children}</p>
  ),
};

interface MarkdownBodyProps {
  content: string;
}

export default function MarkdownBody({ content }: MarkdownBodyProps) {
  // Convert single newlines to markdown hard line breaks (two trailing spaces)
  // so pressing Enter in the editor creates a visible line break in the preview.
  // Double newlines (\n\n) still produce paragraph breaks as expected.
  const processed = content.replace(/\n/g, '  \n');

  return (
    <div className="text-sm text-[var(--text-primary)] markdown-body">
      <ReactMarkdown components={components}>{processed}</ReactMarkdown>
    </div>
  );
}
