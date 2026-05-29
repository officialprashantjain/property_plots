"use client";

import React, { useRef, useEffect } from 'react';
import { Bold, Italic, Underline, Strikethrough, List, ListOrdered, Link as LinkIcon, AlignLeft, AlignCenter, AlignRight } from 'lucide-react';

const ToolbarButton = ({ icon, cmd, arg = null, title, execCmd }) => (
  <button
    type="button"
    title={title}
    onMouseDown={(e) => execCmd(cmd, arg, e)}
    className="p-1.5 text-muted hover:text-foreground hover:bg-border/50 rounded transition-colors"
  >
    {icon}
  </button>
);

export default function RichTextEditor({ value, onChange, placeholder }) {
  const editorRef = useRef(null);

  // Initialize content on the first mount if there's an initial value
  useEffect(() => {
    if (editorRef.current && value && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value;
    }
  }, [value]);

  const handleInput = () => {
    if (editorRef.current) {
      let content = editorRef.current.innerHTML;
      if (content === '<br>') content = ''; // Clean up empty content artifacts from contentEditable
      onChange(content);
    }
  };

  const execCmd = (cmd, arg, e) => {
    e.preventDefault();
    document.execCommand(cmd, false, arg);
    editorRef.current.focus();
    handleInput();
  };

  return (
    <div className="bg-surface border border-border rounded-lg overflow-hidden flex flex-col focus-within:border-primary/50 focus-within:ring-1 focus-within:ring-primary/50 transition-all">
      {/* Toolbar */}
      <div className="bg-background border-b border-border px-2 py-2 flex items-center gap-1 flex-wrap">
        <ToolbarButton icon={<Bold size={16} />} cmd="bold" title="Bold" execCmd={execCmd} />
        <ToolbarButton icon={<Italic size={16} />} cmd="italic" title="Italic" execCmd={execCmd} />
        <ToolbarButton icon={<Underline size={16} />} cmd="underline" title="Underline" execCmd={execCmd} />
        <ToolbarButton icon={<Strikethrough size={16} />} cmd="strikeThrough" title="Strikethrough" execCmd={execCmd} />
        
        <div className="w-px h-4 bg-border mx-1" />
        
        <ToolbarButton icon={<ListOrdered size={16} />} cmd="insertOrderedList" title="Numbered List" execCmd={execCmd} />
        <ToolbarButton icon={<List size={16} />} cmd="insertUnorderedList" title="Bullet List" execCmd={execCmd} />
        
        <div className="w-px h-4 bg-border mx-1" />
        
        <ToolbarButton icon={<AlignLeft size={16} />} cmd="justifyLeft" title="Align Left" execCmd={execCmd} />
        <ToolbarButton icon={<AlignCenter size={16} />} cmd="justifyCenter" title="Align Center" execCmd={execCmd} />
        <ToolbarButton icon={<AlignRight size={16} />} cmd="justifyRight" title="Align Right" execCmd={execCmd} />
        
        <div className="w-px h-4 bg-border mx-1" />
        
        <button
          type="button"
          title="Insert Link"
          onMouseDown={(e) => {
            e.preventDefault();
            const url = prompt("Enter link URL (e.g. https://example.com):");
            if (url) {
              document.execCommand("createLink", false, url);
              handleInput();
            }
          }}
          className="p-1.5 text-muted hover:text-foreground hover:bg-border/50 rounded transition-colors"
        >
          <LinkIcon size={16} />
        </button>
        
        <select 
          className="ml-auto bg-transparent border border-border text-xs rounded px-2 py-1.5 text-muted outline-none focus:border-primary focus:ring-1 focus:ring-primary"
          onChange={(e) => {
            if (!e.target.value) return;
            document.execCommand("formatBlock", false, e.target.value);
            editorRef.current.focus();
            handleInput();
            e.target.value = "";
          }}
        >
          <option value="">Format Text...</option>
          <option value="H1">Heading 1</option>
          <option value="H2">Heading 2</option>
          <option value="H3">Heading 3</option>
          <option value="P">Normal Text</option>
        </select>
      </div>

      {/* Editable Area */}
      <div 
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        onBlur={handleInput}
        data-placeholder={placeholder}
        className="w-full min-h-[250px] max-h-[500px] overflow-y-auto p-4 text-sm outline-none text-foreground
          [&_h1]:text-3xl [&_h1]:font-bold [&_h1]:mb-4
          [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:mb-3
          [&_h3]:text-xl [&_h3]:font-bold [&_h3]:mb-2
          [&_p]:mb-3 [&_p]:leading-relaxed
          [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:mb-3
          [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:mb-3
          [&_li]:mb-1
          [&_a]:text-primary [&_a]:underline
          empty:before:content-[attr(data-placeholder)] empty:before:text-muted/60 empty:before:pointer-events-none"
      />
    </div>
  );
}
