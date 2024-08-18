export type MenuItemType = {
  key: string;
  icon?: React.JSX.Element;
  description?: string
  active?: boolean
  data?: any
  required?: boolean
}

export type Project = {
  _id: string; // Unique identifier for the project
  userId: string; // ID of the user who owns the project
  'title': string; // Title of the project
  description: string; // Description of the project
  objectives: string; // Objectives of the project
  onboarding: number; // Onboarding step number
  stakeholders?: string; // Optional stakeholders
  scope?: string; // Optional scope
  targetAudience?: string; // Optional target audience
  constraints?: string; // Optional constraints
  budget?: string; // Optional budget
  dependencies?: string; // Optional dependencies
  priorities?: string; // Optional priorities
  risks?: string; // Optional risks
  isArchived: boolean; // Indicates if the project is archived
  isPublished?: boolean; // Indicates if the project is published
  createdAt: bigint; // Timestamp for when the project was created
  updatedAt: bigint; // Timestamp for when the project was last updated
  [key: string]: any;
};

export type Epic = {
  _id: string; // Unique identifier for the epic
  projectId: string; // ID of the project the epic belongs to
  'name': string; //Title of the project
  description: string; // Description of the epic
  status: string; // Status of the epic (e.g., 'Not Started', 'In Progress', 'Completed')
  createdAt: bigint; // Timestamp for when the epic was created
  updatedAt: bigint; // Timestamp for when the epic was last updated
  startDate?: bigint; // Optional start date of the epic
  endDate?: bigint; // Optional end date of the epic
  owner?: string; // Optional owner of the epic
  priority?: string; // Optional priority of the epic (e.g., 'Low', 'Medium', 'High')
  labels?: string[]; // Optional array of labels for the epic
  dependencies?: string[]; // Optional array of IDs of dependent epics
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

export type FunctionalRequirement = {
  _id: string;
  projectId: string;
  title: string;
  description: string;
  createdAt: bigint;
  updatedAt: bigint;
  [key: string]: any;
};