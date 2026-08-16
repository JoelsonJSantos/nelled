"use client";

import type {
  Editor,
} from "@tiptap/react";

import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Bold,
  Code2,
  Heading2,
  Heading3,
  Highlighter,
  ImageIcon,
  Italic,
  Link2,
  List,
  ListOrdered,
  Minus,
  Pilcrow,
  Quote,
  Redo2,
  Strikethrough,
  Table2,
  Underline,
  Undo2,
  Unlink,
} from "lucide-react";

import {
  useState,
} from "react";

import { MediaPicker } from "@/components/admin/media-picker";

import type {
  MediaContext,
  MediaItem,
} from "@/lib/media";

import styles from "./blog-editor-toolbar.module.css";

type Props = {
  editor: Editor;

  media: MediaItem[];

  context?: MediaContext;

  onMediaUploaded?: (
    media: MediaItem[],
  ) => void;
};

export function BlogEditorToolbar({
  editor,
  media,
  context,
  onMediaUploaded,
}: Props) {
  const [
    imagePickerOpen,
    setImagePickerOpen,
  ] = useState(false);

  const [
    selectedImage,
    setSelectedImage,
  ] = useState("");

  function setLink() {
    const previous =
      editor.getAttributes(
        "link",
      ).href ?? "";

    const url =
      window.prompt(
        "URL do link:",
        previous,
      );

    if (url === null) {
      return;
    }

    const next =
      url.trim();

    if (!next) {
      editor
        .chain()
        .focus()
        .extendMarkRange("link")
        .unsetLink()
        .run();

      return;
    }

    editor
      .chain()
      .focus()
      .extendMarkRange("link")
      .setLink({
        href: next,
        target: "_blank",
        rel:
          "noopener noreferrer",
      })
      .run();
  }

  function insertImage(
    value: string | string[],
  ) {
    const url =
      typeof value === "string"
        ? value
        : value[0] ?? "";

    setSelectedImage(url);

    if (!url) {
      return;
    }

    editor
      .chain()
      .focus()
      .setImage({
        src: url,
      })
      .run();

    setImagePickerOpen(false);

    /*
     * Limpa a seleção depois
     * para permitir inserir a mesma
     * imagem novamente futuramente.
     */
    window.setTimeout(
      () => {
        setSelectedImage("");
      },
      0,
    );
  }

  return (
    <>
      <div
        className={styles.toolbar}
        role="toolbar"
        aria-label="Editor do artigo"
      >
        <button
          type="button"
          title="Parágrafo"
          className={
            editor.isActive(
              "paragraph",
            )
              ? styles.active
              : undefined
          }
          onClick={() =>
            editor
              .chain()
              .focus()
              .setParagraph()
              .run()
          }
        >
          <Pilcrow size={17} />
        </button>

        <button
          type="button"
          title="Título H2"
          className={
            editor.isActive(
              "heading",
              {
                level: 2,
              },
            )
              ? styles.active
              : undefined
          }
          onClick={() =>
            editor
              .chain()
              .focus()
              .toggleHeading({
                level: 2,
              })
              .run()
          }
        >
          <Heading2 size={17} />
        </button>

        <button
          type="button"
          title="Título H3"
          className={
            editor.isActive(
              "heading",
              {
                level: 3,
              },
            )
              ? styles.active
              : undefined
          }
          onClick={() =>
            editor
              .chain()
              .focus()
              .toggleHeading({
                level: 3,
              })
              .run()
          }
        >
          <Heading3 size={17} />
        </button>

        <span
          className={
            styles.separator
          }
        />

        <button
          type="button"
          title="Negrito"
          className={
            editor.isActive("bold")
              ? styles.active
              : undefined
          }
          onClick={() =>
            editor
              .chain()
              .focus()
              .toggleBold()
              .run()
          }
        >
          <Bold size={17} />
        </button>

        <button
          type="button"
          title="Itálico"
          className={
            editor.isActive(
              "italic",
            )
              ? styles.active
              : undefined
          }
          onClick={() =>
            editor
              .chain()
              .focus()
              .toggleItalic()
              .run()
          }
        >
          <Italic size={17} />
        </button>

        <button
          type="button"
          title="Sublinhado"
          className={
            editor.isActive(
              "underline",
            )
              ? styles.active
              : undefined
          }
          onClick={() =>
            editor
              .chain()
              .focus()
              .toggleUnderline()
              .run()
          }
        >
          <Underline
            size={17}
          />
        </button>

        <button
          type="button"
          title="Riscado"
          className={
            editor.isActive(
              "strike",
            )
              ? styles.active
              : undefined
          }
          onClick={() =>
            editor
              .chain()
              .focus()
              .toggleStrike()
              .run()
          }
        >
          <Strikethrough
            size={17}
          />
        </button>

        <button
          type="button"
          title="Destaque"
          className={
            editor.isActive(
              "highlight",
            )
              ? styles.active
              : undefined
          }
          onClick={() =>
            editor
              .chain()
              .focus()
              .toggleHighlight()
              .run()
          }
        >
          <Highlighter
            size={17}
          />
        </button>

        <span
          className={
            styles.separator
          }
        />

        <button
          type="button"
          title="Lista"
          className={
            editor.isActive(
              "bulletList",
            )
              ? styles.active
              : undefined
          }
          onClick={() =>
            editor
              .chain()
              .focus()
              .toggleBulletList()
              .run()
          }
        >
          <List size={17} />
        </button>

        <button
          type="button"
          title="Lista numerada"
          className={
            editor.isActive(
              "orderedList",
            )
              ? styles.active
              : undefined
          }
          onClick={() =>
            editor
              .chain()
              .focus()
              .toggleOrderedList()
              .run()
          }
        >
          <ListOrdered
            size={17}
          />
        </button>

        <button
          type="button"
          title="Citação"
          className={
            editor.isActive(
              "blockquote",
            )
              ? styles.active
              : undefined
          }
          onClick={() =>
            editor
              .chain()
              .focus()
              .toggleBlockquote()
              .run()
          }
        >
          <Quote size={17} />
        </button>

        <button
          type="button"
          title="Bloco de código"
          className={
            editor.isActive(
              "codeBlock",
            )
              ? styles.active
              : undefined
          }
          onClick={() =>
            editor
              .chain()
              .focus()
              .toggleCodeBlock()
              .run()
          }
        >
          <Code2 size={17} />
        </button>

        <button
          type="button"
          title="Separador"
          onClick={() =>
            editor
              .chain()
              .focus()
              .setHorizontalRule()
              .run()
          }
        >
          <Minus size={17} />
        </button>

        <span
          className={
            styles.separator
          }
        />

        <button
          type="button"
          title="Inserir link"
          className={
            editor.isActive("link")
              ? styles.active
              : undefined
          }
          onClick={setLink}
        >
          <Link2 size={17} />
        </button>

        <button
          type="button"
          title="Remover link"
          disabled={
            !editor.isActive("link")
          }
          onClick={() =>
            editor
              .chain()
              .focus()
              .unsetLink()
              .run()
          }
        >
          <Unlink size={17} />
        </button>

        {context && (
          <button
            type="button"
            title="Inserir imagem"
            onClick={() =>
              setImagePickerOpen(
                true,
              )
            }
          >
            <ImageIcon
              size={17}
            />
          </button>
        )}

        <button
          type="button"
          title="Inserir tabela"
          onClick={() =>
            editor
              .chain()
              .focus()
              .insertTable({
                rows: 3,
                cols: 3,
                withHeaderRow:
                  true,
              })
              .run()
          }
        >
          <Table2 size={17} />
        </button>

        <span
          className={
            styles.separator
          }
        />

        <button
          type="button"
          title="Alinhar à esquerda"
          onClick={() =>
            editor
              .chain()
              .focus()
              .setTextAlign(
                "left",
              )
              .run()
          }
        >
          <AlignLeft
            size={17}
          />
        </button>

        <button
          type="button"
          title="Centralizar"
          onClick={() =>
            editor
              .chain()
              .focus()
              .setTextAlign(
                "center",
              )
              .run()
          }
        >
          <AlignCenter
            size={17}
          />
        </button>

        <button
          type="button"
          title="Alinhar à direita"
          onClick={() =>
            editor
              .chain()
              .focus()
              .setTextAlign(
                "right",
              )
              .run()
          }
        >
          <AlignRight
            size={17}
          />
        </button>

        <span
          className={
            styles.separator
          }
        />

        <button
          type="button"
          title="Desfazer"
          disabled={
            !editor.can().undo()
          }
          onClick={() =>
            editor
              .chain()
              .focus()
              .undo()
              .run()
          }
        >
          <Undo2 size={17} />
        </button>

        <button
          type="button"
          title="Refazer"
          disabled={
            !editor.can().redo()
          }
          onClick={() =>
            editor
              .chain()
              .focus()
              .redo()
              .run()
          }
        >
          <Redo2 size={17} />
        </button>
      </div>

      {imagePickerOpen && context && (
        <div
          className={
            styles.mediaInsert
          }
        >
          <div
            className={
              styles.mediaInsertHeader
            }
          >
            <strong>
              Inserir imagem
            </strong>

            <button
              type="button"
              onClick={() =>
                setImagePickerOpen(
                  false,
                )
              }
            >
              Fechar
            </button>
          </div>

          <MediaPicker
            name="editorImage"
            label="Imagem do artigo"
            media={media}
            context={context}
            multiple={false}
            value={selectedImage}
            onChange={
              insertImage
            }
            onMediaUploaded={
              onMediaUploaded
            }
          />
        </div>
      )}
    </>
  );
}
