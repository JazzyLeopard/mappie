'use client';

import { useUser } from "@clerk/nextjs";
import { useEffect } from "react";

declare global {
  interface Window {
    Canny?: any;
  }
}

export function CannySso() {
  const { user } = useUser();

  useEffect(() => {
    if (!user) return;

    // Load Canny script
    const script = document.createElement('script');
    script.src = "https://canny.io/sdk.js";
    script.async = true;
    document.body.appendChild(script);

    script.onload = () => {
      if (window.Canny) {
        window.Canny('identify', {
          appID: '67649bdb365fe12f7497ef96',
          user: {
            email: user.emailAddresses[0].emailAddress,
            name: user.fullName || user.username || '',
            id: user.id,
            avatarURL: user.imageUrl,
            created: user.createdAt
          }
        });
      }
    };

    return () => {
      // Cleanup script on unmount
      document.body.removeChild(script);
    };
  }, [user]);

  return null;
} 