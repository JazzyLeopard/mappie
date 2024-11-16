import * as Y from 'yjs';

// Export a singleton instance
export const getYjsInstance = () => {
  if (typeof window === 'undefined') {
    return null; // Return null during SSR
  }
  
  // @ts-ignore
  if (!window.__YJS_INSTANCE) {
    // @ts-ignore
    window.__YJS_INSTANCE = new Y.Doc();
  }
  // @ts-ignore
  return window.__YJS_INSTANCE;
}; 