'use client';

import { useCallback } from 'react';
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin';
import { ListPlugin } from '@lexical/react/LexicalListPlugin';
import { LinkPlugin } from '@lexical/react/LexicalLinkPlugin';
import { MarkdownShortcutPlugin } from '@lexical/react/LexicalMarkdownShortcutPlugin';
import { AutoFocusPlugin } from '@lexical/react/LexicalAutoFocusPlugin';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { ListItemNode, ListNode } from '@lexical/list';
import { LinkNode, AutoLinkNode } from '@lexical/link';
import {
  $convertFromMarkdownString,
  $convertToMarkdownString,
  BOLD_ITALIC_STAR,
  BOLD_STAR,
  ITALIC_STAR,
  ORDERED_LIST,
  UNORDERED_LIST,
  LINK,
  type Transformer,
} from '@lexical/markdown';

// Only the transformers whose node dependencies we've registered.
// Excludes HEADING, QUOTE, CODE which require HeadingNode, QuoteNode, CodeNode.
const DRAFT_TRANSFORMERS: Transformer[] = [
  BOLD_ITALIC_STAR,
  BOLD_STAR,
  ITALIC_STAR,
  ORDERED_LIST,
  UNORDERED_LIST,
  LINK,
];
import {
  FORMAT_TEXT_COMMAND,
  $getSelection,
  $isRangeSelection,
  EditorState,
} from 'lexical';
import {
  INSERT_UNORDERED_LIST_COMMAND,
  INSERT_ORDERED_LIST_COMMAND,
} from '@lexical/list';

// ── Toolbar ──
function ToolbarPlugin() {
  const [editor] = useLexicalComposerContext();

  const formatBold = useCallback(() => {
    editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'bold');
  }, [editor]);

  const insertBulletList = useCallback(() => {
    editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined);
  }, [editor]);

  const insertOrderedList = useCallback(() => {
    editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined);
  }, [editor]);

  const insertLink = useCallback(() => {
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        const text = selection.getTextContent() || 'link text';
        selection.insertRawText(text);
      }
    });
  }, [editor]);

  return (
    <div className="flex items-center gap-1 px-4 py-2 border-b border-[var(--border)] bg-[var(--bg-secondary)]">
      <button
        onMouseDown={(e) => e.preventDefault()}
        onClick={formatBold}
        className="px-2 py-1 text-xs font-bold rounded hover:bg-[var(--bg-hover)] text-[var(--text-secondary)] transition-colors"
        title="Bold (Ctrl+B)"
        type="button"
      >
        B
      </button>
      <button
        onMouseDown={(e) => e.preventDefault()}
        onClick={insertBulletList}
        className="px-2 py-1 text-xs rounded hover:bg-[var(--bg-hover)] text-[var(--text-secondary)] transition-colors"
        title="Bullet list"
        type="button"
      >
        &bull;
      </button>
      <button
        onMouseDown={(e) => e.preventDefault()}
        onClick={insertOrderedList}
        className="px-2 py-1 text-xs rounded hover:bg-[var(--bg-hover)] text-[var(--text-secondary)] transition-colors"
        title="Numbered list"
        type="button"
      >
        1.
      </button>
      <button
        onMouseDown={(e) => e.preventDefault()}
        onClick={insertLink}
        className="px-2 py-1 text-xs rounded hover:bg-[var(--bg-hover)] text-[var(--text-secondary)] transition-colors"
        title="Insert link"
        type="button"
      >
        &#128279;
      </button>
    </div>
  );
}

// ── Main component ──
interface LexicalEditorProps {
  initialMarkdown: string;
  onChange: (markdown: string) => void;
}

const theme = {
  paragraph: 'mb-3 last:mb-0',
  text: {
    bold: 'font-semibold text-[var(--text-primary)]',
    italic: 'italic',
    underline: 'underline',
  },
  list: {
    ul: 'list-disc pl-5 my-2 space-y-1',
    ol: 'list-decimal pl-5 my-2 space-y-1',
    listitem: 'text-[var(--text-primary)]',
  },
  link: 'text-[var(--accent)] hover:underline cursor-pointer',
};

export default function LexicalEditor({ initialMarkdown, onChange }: LexicalEditorProps) {
  const initialConfig = {
    namespace: 'DraftEditor',
    theme,
    nodes: [ListNode, ListItemNode, LinkNode, AutoLinkNode],
    onError: (error: Error) => console.error('Lexical error:', error),
    editorState: () => {
      $convertFromMarkdownString(initialMarkdown, DRAFT_TRANSFORMERS);
    },
  };

  const handleChange = useCallback(
    (editorState: EditorState) => {
      editorState.read(() => {
        const md = $convertToMarkdownString(DRAFT_TRANSFORMERS);
        onChange(md);
      });
    },
    [onChange],
  );

  return (
    <LexicalComposer initialConfig={initialConfig}>
      <ToolbarPlugin />
      <div className="flex-1 overflow-y-auto relative min-h-0">
        <RichTextPlugin
          contentEditable={
            <ContentEditable className="flex-1 w-full text-sm text-[var(--text-primary)] p-4 focus:outline-none min-h-full" />
          }
          placeholder={
            <div className="absolute top-4 left-4 text-sm text-[var(--text-muted)] pointer-events-none">
              Write your email body here...
            </div>
          }
          ErrorBoundary={LexicalErrorBoundary}
        />
      </div>
      <HistoryPlugin />
      <ListPlugin />
      <LinkPlugin />
      <MarkdownShortcutPlugin transformers={DRAFT_TRANSFORMERS} />
      <OnChangePlugin onChange={handleChange} />
      <AutoFocusPlugin />
    </LexicalComposer>
  );
}
