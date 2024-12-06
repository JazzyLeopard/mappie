import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { useEffect } from 'react';
import { $getRoot, $createParagraphNode, $createTextNode } from 'lexical';
import { $convertFromMarkdownString } from '@lexical/markdown';
import { ENHANCED_TRANSFORMERS } from '../MarkdownTransformers';
import { placeholderOverview } from '../../../constants';
import type { ElementTransformer, TextMatchTransformer, Transformer } from '@lexical/markdown';

// Add a custom class to paragraphs that are part of the template
const TEMPLATE_CLASS = 'template-content';

// Create a custom transformer for paragraphs
const templateParagraphTransformer: ElementTransformer = {
  dependencies: [],
  export: () => null,
  regExp: /^$/,
  replace: (parentNode, children, match, isImport) => {
    const paragraph = $createParagraphNode();
    children.forEach((child) => paragraph.append(child));
    parentNode.replace(paragraph);
    return true; // Indicate that the transformation was successful
  },
  type: 'element'
};

export default function TemplateContentPlugin() {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    // Only initialize once
    editor.update(() => {
      const root = $getRoot();
      if (root.getTextContent().trim() === '') {
        // Add our custom transformer to the enhanced transformers
        const templateTransformers: Transformer[] = [
          templateParagraphTransformer,
          ...ENHANCED_TRANSFORMERS
        ];

        $convertFromMarkdownString(placeholderOverview, templateTransformers);
      }
    });
  }, [editor]);

  return null;
} 