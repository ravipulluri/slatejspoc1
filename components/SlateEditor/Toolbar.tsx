import React from 'react';
import { useSlate } from 'slate-react';
import { Editor, Transforms, Text, Element as SlateElement } from 'slate';
import { Bold, Italic, Type, Heading1, Heading2 } from 'lucide-react';

const Button = ({ active, children, onMouseDown }: any) => (
  <button
    onMouseDown={onMouseDown}
    className={`p-2 rounded hover:bg-slate-200 transition-colors ${
      active ? 'text-blue-600 bg-blue-50' : 'text-slate-600'
    }`}
  >
    {children}
  </button>
);

const Toolbar = () => {
  const editor = useSlate();

  const isMarkActive = (editor: Editor, format: string) => {
    const marks = Editor.marks(editor);
    return marks ? (marks as any)[format] === true : false;
  };

  const toggleMark = (editor: Editor, format: string) => {
    const isActive = isMarkActive(editor, format);
    if (isActive) {
      Editor.removeMark(editor, format);
    } else {
      Editor.addMark(editor, format, true);
    }
  };

  const isBlockActive = (editor: Editor, format: string) => {
    const { selection } = editor;
    if (!selection) return false;

    const [match] = Array.from(
      Editor.nodes(editor, {
        at: Editor.unhangRange(editor, selection),
        match: (n) =>
          !Editor.isEditor(n) && SlateElement.isElement(n) && (n as any).type === format,
      })
    );

    return !!match;
  };

  const toggleBlock = (editor: Editor, format: string) => {
    const isActive = isBlockActive(editor, format);
    Transforms.setNodes(
      editor,
      { type: isActive ? 'paragraph' : format } as Partial<SlateElement>,
    );
  };

  return (
    <div className="flex items-center gap-1 p-2 border-b border-slate-200 bg-slate-50 sticky top-0 z-10">
      <Button
        active={isMarkActive(editor, 'bold')}
        onMouseDown={(event: any) => {
          event.preventDefault();
          toggleMark(editor, 'bold');
        }}
      >
        <Bold size={18} />
      </Button>
      <Button
        active={isMarkActive(editor, 'italic')}
        onMouseDown={(event: any) => {
          event.preventDefault();
          toggleMark(editor, 'italic');
        }}
      >
        <Italic size={18} />
      </Button>
      <div className="w-px h-6 bg-slate-300 mx-2" />
      <Button
        active={isBlockActive(editor, 'heading-one')}
        onMouseDown={(event: any) => {
          event.preventDefault();
          toggleBlock(editor, 'heading-one');
        }}
      >
        <Heading1 size={18} />
      </Button>
      <Button
        active={isBlockActive(editor, 'heading-two')}
        onMouseDown={(event: any) => {
          event.preventDefault();
          toggleBlock(editor, 'heading-two');
        }}
      >
        <Heading2 size={18} />
      </Button>
      <Button
        active={isBlockActive(editor, 'paragraph')}
        onMouseDown={(event: any) => {
          event.preventDefault();
          toggleBlock(editor, 'paragraph');
        }}
      >
        <Type size={18} />
      </Button>
    </div>
  );
};

export default Toolbar;
