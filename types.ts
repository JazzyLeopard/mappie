export type SpokenLanguage = 
  | "english"
  | "spanish"
  | "french"
  | "german"
  | "dutch"
  | "turkish"

export interface Attachment {
  id: string;
  file: File;
  previewUrl: string;
}

export interface ProjectDetails {
  description: string;
  language: SpokenLanguage;
  attachments: Attachment[];
}

