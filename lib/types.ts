import { Id } from "@/convex/_generated/dataModel";

export type MenuItemType = {
  key: string;
  icon?: React.JSX.Element;
  description?: string
  active?: boolean
  data?: any
  required?: boolean
}

export type Project = {
  _id: Id<"projects">; // Unique identifier for the project
  userId: string; // ID of the user who owns the project
  onboarding: number; // Onboarding step number
  title: string; // Title of the project
  overview: string;
  isArchived: boolean; // Indicates if the project is archived
  isPublished?: boolean; // Indicates if the project is published
  createdAt: bigint; // Timestamp for when the project was created (as number)
  updatedAt: bigint; // Timestamp for when the project was last updated (as number)
  [key: string]: any;
};

export type Epic = {
  _id: string; // Unique identifier for the epic
  projectId: string; // ID of the project the epic belongs to
  name: string; // Title of the project
  description: string; // Description of the epic
  acceptanceCriteria: string;
  businessValue: string;
  dependencies?: string;
  risks?: string;
  createdAt: bigint; // Timestamp for when the epic was created
  updatedAt: bigint; // Timestamp for when the epic was last updated
  startDate?: bigint; // Optional start date of the epic
  endDate?: bigint; // Optional end date of the epic
  [key: string]: any;
};

export type UseCase = {
  _id: string; // Unique identifier for the use case
  projectId: string; // ID of the project the use case belongs to
  title: string; // Title of the use case
  description: string; // Description of the use case
  createdAt: bigint; // Timestamp for when the use case was created
  updatedAt: bigint; // Timestamp for when the use case was last updated
  [key: string]: any;
};

export interface FunctionalRequirement {
  _id: Id<"functionalRequirements">;
  projectId: Id<"projects">;
  title: string;
  description: string;
  createdAt: number;
  updatedAt: number;
}

export type ToolState = 'call' | 'result';
export interface ToolInvocation {
  toolName: string;
  toolCallId: string;
  state: ToolState;
  args?: any;
  result?: {
    content: string;
    metadata?: {
      title?: string;
      type?: string;
    };
  };
}