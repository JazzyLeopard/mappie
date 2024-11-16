import type {EditorThemeClasses} from 'lexical';

import './StickyEditorTheme.css';

import baseTheme from './PlayGroundEditorTheme';

const theme: EditorThemeClasses = {
  ...baseTheme,
  paragraph: 'StickyEditorTheme__paragraph',
};

export default theme;