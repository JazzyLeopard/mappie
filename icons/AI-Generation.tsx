import React from "react";

const AiGenerationIcon = () => {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#3B82F6" />
          <stop offset="100%" stopColor="#EC4899" />
        </linearGradient>
      </defs>
      <path
        d="M5 3V7V3ZM3 5H7H3ZM6 17V21V17ZM4 19H8H4ZM13 3L15.286 9.857L21 12L15.286 14.143L13 21L10.714 14.143L5 12L10.714 9.857L13 3Z"
        stroke="url(#gradient)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default AiGenerationIcon;
