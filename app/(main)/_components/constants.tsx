import AlertIcon from "@/icons/AlertIcon";
import AudienceIcon from "@/icons/AudienceIcon";
import DependenciesIcon from "@/icons/DependenciesIcon";
import DollarIcon from "@/icons/DollarIcon";
import PeopleIcon from "@/icons/PeopleIcon";
import PrioritiesIcon from "@/icons/PrioritiesIcon";
import RisksIcon from "@/icons/RisksIcon";
import ScopeIcon from "@/icons/ScopeIcon";
import { MenuItemType } from "@/lib/types";

export const steps = [
    {
        title: 'What is the name of your project?',
        key: 'title',
        placeholder: 'Project Name',
        stepNumber: 1
    },
    {
        title: 'Can you describe your project in a few sentences?',
        key: 'description',
        placeholder: 'Describe the specific, measurable objectives of your project. Make sure they align with the goals of the larger project, if applicable.',
        stepNumber: 2
    },
    {
        title: 'What are the main objectives of this project?',
        key: "objectives",
        placeholder: 'Describe the specific, measurable objectives of your project. Make sure they align with the goals of the larger project, if applicable.',
        stepNumber: 3
    },
    {
        title: 'What are the core functional and non-functional requirements for your project?',
        key: "requirements",
        placeholder: 'List the core functional requirements for your project. Include any specific user interactions and non-functional requirements such as performance, security, or usability standards',
        stepNumber: 4
    },
    {
        title: 'Who are the main stakeholders? Who is involved in this project?',
        key: "stakeholders",
        placeholder: 'Identify the primary stakeholders for this project, including their roles and main concerns. Also, describe the target audience, including their key characteristics, needs, and pain points',
        stepNumber: 5
    },
    {
        key: 'additional steps',
        stepNumber: 6
    }
];

export const menuItems: MenuItemType[] = [
    {
        key: "description",
        icon: <PeopleIcon />,
        description: "Add regular paragraphs to convey your main content. This will enhance the scope of your project.",
        active: true,
        required: true
    },
    {
        key: "objectives",
        icon: <PeopleIcon />,
        description: "Add regular paragraphs to convey your main content. This will enhance the scope of your project.",
        active: true,
        required: true
    },
    {
        key: "requirements",
        icon: <PeopleIcon />,
        description: "Add regular paragraphs to convey your main content. This will enhance the scope of your project.",
        required: true
    },
    {
        key: "stakeholders",
        icon: <PeopleIcon />,
        description: "Add regular paragraphs to convey your main content. This will enhance the scope of your project.",
        required: true
    },
    {
        key: "scope",
        icon: <ScopeIcon />,
        description: "Add regular paragraphs to convey your main content. This will enhance the scope of your project.",
        active: false,
    },
    {
        key: "targetAudience",
        icon: <AudienceIcon />,
        description: "Add regular paragraphs to convey your main content. This will enhance the scope of your project.",
        active: false,
    },
    {
        key: "constraints",
        icon: <AlertIcon />,
        description: "Add regular paragraphs to convey your main content. This will enhance the scope of your project.",
        active: false,
    },
    {
        key: "budget",
        icon: <DollarIcon />,
        description: "Add regular paragraphs to convey your main content. This will enhance the scope of your project.",
        active: false,
    },
    {
        key: "dependencies",
        icon: <DependenciesIcon />,
        description: "Add regular paragraphs to convey your main content. This will enhance the scope of your project.",
        active: false,
    },
    {
        key: "priorities",
        icon: <PrioritiesIcon />,
        description: "Add regular paragraphs to convey your main content. This will enhance the scope of your project.",
        active: false,
    },
    {
        key: "risks",
        icon: <RisksIcon />,
        description: "Add regular paragraphs to convey your main content. This will enhance the scope of your project.",
        active: false,
    },
]

export const epicMenuItems: MenuItemType[] = [
    {
        key: "description",
        icon: <PeopleIcon />,
        description: "Add regular paragraphs to convey your main content. This will enhance the scope of your project.",
        active: true,
        required: true
    },
    {
        key: "objectives",
        icon: <PeopleIcon />,
        description: "Add regular paragraphs to convey your main content. This will enhance the scope of your project.",
        active: true,
        required: true
    },
    {
        key: "requirements",
        icon: <PeopleIcon />,
        description: "Add regular paragraphs to convey your main content. This will enhance the scope of your project.",
        active: false,
        required: true
    },
    {
        key: "stakeholders",
        icon: <PeopleIcon />,
        description: "Add regular paragraphs to convey your main content. This will enhance the scope of your project.",
        active: false,
        required: true
    },
    {
        key: "timeline",
        icon: <PeopleIcon />,
        description: "Add regular paragraphs to convey your main content. This will enhance the scope of your project.",
        active: false,
    },
    {
        key: "successMetrics",
        icon: <AudienceIcon />,
        description: "Add regular paragraphs to convey your main content. This will enhance the scope of your project.",
        active: false,
    },
]

export const propertyPrompts: { [key: string]: string } = {
    title: "Generate a concise and catchy title for the project based on the given information.",
    description: "Take the provided summary of the project and make it clear and easy to understand. Include the project's name, main goal, and the problem it aims to solve. If it's part of a larger project, explain how it fits in. Use simple language that anyone can understand. Give the response in complete MARKDOWN format only without any explanation and also remove the headings or headers or titles if any and don't add extra information or fields.",
    objectives: "Refine the provided objectives to make sure they are clear and easy to track. Each objective should be specific and show how it helps reach the project's main goal. Use simple and straightforward language. Give the response in complete MARKDOWN format only without any explanation and also remove the headings or headers or titles if any and don't add extra information or fields.",
    requirements: "Enhance the list of requirements by organizing them into functional and non-functional categories. Use 'The system shall...' to start each requirement. Make sure they are detailed and clear. If the input is too short or missing key points, add suggestions to make a complete list. Use plain language that anyone can understand. Give the response in complete MARKDOWN format only without any explanation and also remove the headings. Don't add extra information or fields.",
    stakeholders: "Improve the provided information on stakeholders and the target audience. Clearly define each stakeholder's role and concerns. Describe the target audience with details about their needs and challenges. Use simple, easy-to-understand language. Give the response in complete MARKDOWN format only without any explanation and also remove the headings or headers or titles if any and don't add extra information or fields.",
    // Add more prompts for other properties as needed
  };