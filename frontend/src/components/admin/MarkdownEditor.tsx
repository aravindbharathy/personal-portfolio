import { useState } from 'react';
import MDEditor from '@uiw/react-md-editor';
import { Label } from '@/components/ui/label';

interface MarkdownEditorProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  error?: string;
  minHeight?: number;
}

export function MarkdownEditor({
  id,
  label,
  value,
  onChange,
  placeholder,
  required,
  error,
  minHeight = 200,
}: MarkdownEditorProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>
        {label} {required && '*'}
      </Label>
      <div className="markdown-editor-wrapper" data-color-mode="light">
        <MDEditor
          id={id}
          value={value}
          onChange={(val) => onChange(val || '')}
          preview="edit"
          height={minHeight}
          visibleDragbar={false}
          hideToolbar={false}
          enableScroll={true}
          textareaProps={{
            placeholder: placeholder || `Enter ${label.toLowerCase()}...`,
          }}
          previewOptions={{
            rehypePlugins: [],
          }}
        />
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
      <p className="text-xs text-muted-foreground">
        Supports markdown formatting: **bold**, *italic*, lists, links, etc.
      </p>
    </div>
  );
}
