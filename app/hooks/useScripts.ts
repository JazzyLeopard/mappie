"use client";

import { useEffect } from 'react';
import Script from 'next/script';

export function useScripts() {
  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') return;

    const loadScripts = async () => {
      // Wait for DOM to be ready
      await new Promise(resolve => {
        if (document.readyState === 'complete') {
          resolve(true);
        } else {
          window.addEventListener('load', () => resolve(true));
        }
      });
    };

    loadScripts();
  }, []);
} 