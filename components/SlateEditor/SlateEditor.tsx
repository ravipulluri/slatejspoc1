import React, { useMemo, useState, useCallback } from 'react';
import { createEditor, Descendant, Editor, Range, Transforms, Text } from 'slate';
import { Slate, Editable, withReact, ReactEditor } from 'slate-react';
import { withHistory } from 'slate-history';
import { Element, Leaf } from './Elements';
import Toolbar from './Toolbar';
import { CustomEditor, CustomText } from '../../types';
import { Eye, MousePointer2, Search, MessageSquare, X, Trash2 } from 'lucide-react';

interface SlateEditorProps {
  initialValue: Descendant[];
}

interface CommentInfo {
  text: string;
  comment: string;
  path: number[];
}

const SlateEditor: React.FC<SlateEditorProps> = ({ initialValue }) => {
  const editor = useMemo(() => withHistory(withReact(createEditor() as CustomEditor)), []);
  
  // Track the editor's value in state to ensure we always have the latest content
  const [value, setValue] = useState<Descendant[]>(initialValue);
  const [readOnly, setReadOnly] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showComments, setShowComments] = useState(false);
  const [commentInput, setCommentInput] = useState('');
  const [selectionInfo, setSelectionInfo] = useState<{ text: string; range: Range | null }>({
    text: '',
    range: null,
  });

  const renderElement = useCallback((props: any) => <Element {...props} />, []);
  const renderLeaf = useCallback((props: any) => <Leaf {...props} />, []);

  const handleShowData = () => {
    // Directly alert the current state value.
    // This outputs the Slate Node tree, matching the structure passed in 'initialValue'.
    const jsonString = JSON.stringify(value, null, 2);
    alert(jsonString);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    // Search through all text nodes
    for (const [node, path] of Editor.nodes(editor, {
      at: [],
      match: n => Text.isText(n),
    })) {
      const textNode = node as Text;
      const index = textNode.text.toLowerCase().indexOf(searchQuery.toLowerCase());
      
      if (index !== -1) {
        const range = {
          anchor: { path, offset: index },
          focus: { path, offset: index + searchQuery.length },
        };
        
        // Select the found text
        Transforms.select(editor, range);
        
        // Focus the editor to show the selection
        ReactEditor.focus(editor);
        
        // Scroll to the selection
        const domRange = ReactEditor.toDOMRange(editor, range);
        domRange.startContainer.parentElement?.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        });
        
        return; // Stop at first match
      }
    }
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentInput.trim() || !selectionInfo.range) return;

    // Add comment mark to the selection
    Editor.addMark(editor, 'comment', commentInput);
    setCommentInput('');
    
    // Refresh value state
    setValue([...editor.children]);
  };

  const removeComment = (path: number[]) => {
    Transforms.unsetNodes(editor, 'comment', {
      at: path,
      match: n => Text.isText(n),
    });
    setValue([...editor.children]);
  };

  const getAllComments = (): CommentInfo[] => {
    const comments: CommentInfo[] = [];
    for (const [node, path] of Editor.nodes(editor, {
      at: [],
      match: n => Text.isText(n) && !!(n as CustomText).comment,
    })) {
      const textNode = node as CustomText;
      comments.push({
        text: textNode.text,
        comment: textNode.comment!,
        path: path as number[],
      });
    }
    return comments;
  };

  const handleEditorChange = (val: Descendant[]) => {
    setValue(val);
    
    // Update selection info
    const { selection } = editor;
    if (selection && Range.isExpanded(selection)) {
      const text = Editor.string(editor, selection);
      setSelectionInfo({ text, range: selection });
    } else {
      setSelectionInfo({ text: '', range: null });
    }
  };

  const comments = getAllComments();

  return (
    <div className="flex flex-col h-full gap-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
         {/* Search Form */}
         <form onSubmit={handleSearch} className="flex-1 max-w-md flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
              <input 
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Find text in document..."
                className="w-full pl-9 pr-4 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white shadow-sm"
              />
            </div>
            <button 
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-all shadow-sm shadow-blue-600/20"
            >
              Find
            </button>
         </form>

         <div className="flex items-center gap-3">
            <button 
                onClick={() => setShowComments(!showComments)}
                className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border rounded-lg transition-all shadow-sm cursor-pointer ${
                  showComments 
                    ? 'bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100' 
                    : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                }`}
            >
                <MessageSquare size={16} />
                Comments ({comments.length})
            </button>
            <button 
                onClick={() => setReadOnly(!readOnly)}
                className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border rounded-lg transition-all shadow-sm cursor-pointer ${
                  readOnly 
                    ? 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100' 
                    : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                }`}
            >
                {readOnly ? <Eye size={16} /> : <Eye size={16} className="text-slate-400" />}
                {readOnly ? 'Read Only Mode' : 'Editing Mode'}
            </button>
            <button 
                onClick={handleShowData}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-all shadow-sm cursor-pointer"
            >
                <Eye size={16} />
                Show Data
            </button>
         </div>
      </div>

      <div className="flex-1 flex gap-4 min-h-0">
        <div className="border border-slate-300 rounded-lg shadow-sm bg-white overflow-hidden flex flex-col flex-1">
          <Slate 
            editor={editor} 
            initialValue={initialValue} 
            onChange={handleEditorChange}
          >
            {!readOnly && <Toolbar />}
            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                <Editable
                  readOnly={readOnly}
                  renderElement={renderElement}
                  renderLeaf={renderLeaf}
                  placeholder="Start typing..."
                  className="outline-none min-h-[500px]"
                  spellCheck
                  autoFocus={!readOnly}
                />
            </div>
            
            {/* Selection Info Footer */}
            <div className="bg-slate-50 border-t border-slate-200 p-3 px-6 flex items-center justify-between text-xs font-mono text-slate-500">
              <div className="flex items-center gap-2">
                <MousePointer2 size={14} className="text-slate-400" />
                <span>Selection:</span>
                {selectionInfo.range ? (
                  <span className="text-blue-600 font-medium">
                    [{selectionInfo.range.anchor.path.join(',')}:{selectionInfo.range.anchor.offset}] to [{selectionInfo.range.focus.path.join(',')}:{selectionInfo.range.focus.offset}]
                  </span>
                ) : (
                  <span className="italic">None</span>
                )}
              </div>
              {selectionInfo.text && (
                <div className="flex items-center gap-2 max-w-[50%]">
                  <span className="shrink-0">Selected Text:</span>
                  <span className="truncate bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded border border-blue-200">
                    "{selectionInfo.text}"
                  </span>
                </div>
              )}
            </div>
          </Slate>
        </div>

        {/* Comments Sidebar */}
        {showComments && (
          <div className="w-80 bg-white border border-slate-300 rounded-lg shadow-sm flex flex-col overflow-hidden">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                <MessageSquare size={16} className="text-indigo-600" />
                Comments
              </h3>
              <button onClick={() => setShowComments(false)} className="text-slate-400 hover:text-slate-600">
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
              {/* Add Comment Form */}
              {selectionInfo.range ? (
                <form onSubmit={handleAddComment} className="bg-indigo-50 p-3 rounded-lg border border-indigo-100 space-y-3">
                  <p className="text-xs text-indigo-700 font-medium">Add comment to selection:</p>
                  <p className="text-xs text-slate-500 italic truncate">"{selectionInfo.text}"</p>
                  <textarea 
                    value={commentInput}
                    onChange={(e) => setCommentInput(e.target.value)}
                    placeholder="Type your comment..."
                    className="w-full p-2 text-sm border border-indigo-200 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white min-h-[80px]"
                  />
                  <button 
                    type="submit"
                    className="w-full py-2 text-xs font-semibold text-white bg-indigo-600 rounded hover:bg-indigo-700 transition-colors"
                  >
                    Post Comment
                  </button>
                </form>
              ) : (
                <div className="text-center py-4 px-2 bg-slate-50 rounded-lg border border-dashed border-slate-300">
                  <p className="text-xs text-slate-500">Select text in the editor to add a comment.</p>
                </div>
              )}

              {/* Comments List */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">All Comments</h4>
                {comments.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">No comments yet.</p>
                ) : (
                  comments.map((c, i) => (
                    <div key={i} className="group p-3 rounded-lg border border-slate-200 hover:border-indigo-300 transition-colors relative">
                      <button 
                        onClick={() => removeComment(c.path)}
                        className="absolute top-2 right-2 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Delete comment"
                      >
                        <Trash2 size={14} />
                      </button>
                      <p className="text-xs font-medium text-slate-400 mb-1">On: "{c.text}"</p>
                      <p className="text-sm text-slate-700 leading-relaxed">{c.comment}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SlateEditor;