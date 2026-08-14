"use client";

import {
  EditorContent,
  useEditor,
} from "@tiptap/react";

import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Highlight from "@tiptap/extension-highlight";
import TextAlign from "@tiptap/extension-text-align";
import { TableKit } from "@tiptap/extension-table";

import type {
  MediaContext,
  MediaItem,
} from "@/lib/media";

import { BlogEditorToolbar } from "./blog-editor-toolbar";

import styles from "./blog-editor.module.css";

export type BlogEditorValue = {
  html: string;
  json: Record<string, unknown>;
};

type BlogEditorProps = {
  initialHtml?: string;

  media: MediaItem[];
  context: MediaContext;

  onMediaUploaded?: (
    media: MediaItem[],
  ) => void;

  onChange: (
    value: BlogEditorValue,
  ) => void;
};

export function BlogEditor({
  initialHtml = "",
  media,
  context,
  onMediaUploaded,
  onChange,
}: BlogEditorProps) {
  const editor = useEditor({
    immediatelyRender: false,

    extensions: [
      StarterKit.configure({
        heading: {
          levels: [2, 3, 4],
        },
      }),

      Highlight,

      TextAlign.configure({
        types: [
          "heading",
          "paragraph",
        ],
      }),

      Image.configure({
        allowBase64: false,
        HTMLAttributes: {
          class:
            "blog-content-image",
        },
      }),

      TableKit.configure({
        table: {
          resizable: true,
        },
      }),
    ],

    content: initialHtml || "",

    editorProps: {
      attributes: {
        class: styles.editorContent,
      },
    },

    onUpdate: ({ editor }) => {
      onChange({
        html: editor.getHTML(),

        json:
          editor.getJSON() as Record<
            string,
            unknown
          >,
      });
    },
  });

  if (!editor) {
    return (
      <div className={styles.loading}>
        Carregando editor...
      </div>
    );
  }

  const wordCount =
    editor
      .getText()
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .length;

  const readingTime =
    Math.max(
      1,
      Math.ceil(wordCount / 200),
    );

  return (
    <div className={styles.editor}>
      <BlogEditorToolbar
        editor={editor}
        media={media}
        context={context}
        onMediaUploaded={
          onMediaUploaded
        }
      />

      <EditorContent
        editor={editor}
      />

      <footer
        className={styles.footer}
      >
        <span>
          {wordCount}{" "}
          {wordCount === 1
            ? "palavra"
            : "palavras"}
        </span>

        <span>
          {readingTime} min de leitura
        </span>
      </footer>
    </div>
  );
}