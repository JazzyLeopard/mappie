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
        key: "acceptanceCriteria",
        icon: <PeopleIcon />,
        description: "Add regular paragraphs to convey your main content. This will enhance the scope of your project.",
        active: true,
        required: true
    },
    {
        key: "businessValue",
        icon: <PeopleIcon />,
        description: "Add regular paragraphs to convey your main content. This will enhance the scope of your project.",
        active: true,
        required: true
    },
    {
        key: "dependencies",
        icon: <DependenciesIcon />,
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

export const functionalRequirementsItems: MenuItemType[] = [
    {
        key: "title",
        icon: <PeopleIcon />,
        description: "The title of the functional requirement",
        active: true,
        required: true
    },
    {
        key: "description",
        icon: <PeopleIcon />,
        description: "The description including all sub-requirements",
        active: true,
        required: true
    },
];

export const useCasesItems: MenuItemType[] = [
    {
        key: "title",
        icon: <PeopleIcon />,
        description: "The title of the use case",
        active: true,
        required: true
    },
    {
        key: "summary",
        icon: <PeopleIcon />,
        description: "A brief summary of the use case",
        active: true,
        required: true
    },
    {
        key: "actors",
        icon: <PeopleIcon />,
        description: "The actors involved in the use case",
        active: true,
        required: true
    },
    {
        key: "preconditions",
        icon: <PeopleIcon />,
        description: "The preconditions for the use case",
        active: true,
        required: true
    },
    {
        key: "mainSuccessScenario",
        icon: <PeopleIcon />,
        description: "The main success scenario for the use case",
        active: true,
        required: true
    },
    {
        key: "alternativeSequences",
        icon: <PeopleIcon />,
        description: "The alternative sequences for the use case",
        active: true,
        required: true
    },
    {
        key: "errorSequences",
        icon: <PeopleIcon />,
        description: "The error sequences for the use case",
        active: true,
        required: true
    },
    {
        key: "uiRequirements",
        icon: <PeopleIcon />,
        description: "The UI requirements for the use case",
        active: true,
        required: true
    },
];

export const propertyPrompts: { [key: string]: string } = {
    description: "Take the provided summary of the project and rewrite it in the following format:\n\n**For** [target audience]\n**Who** [problem or need]\n**The** [product name] **Is** [product category]\n**That** [key benefit/reason to buy]\n**Unlike** [primary competitive alternative]\n**Our product** [statement of primary differentiation]\n\nUse simple language that anyone can understand. Give the response in complete MARKDOWN format only without any explanation. Remove any headings or titles and don't add extra information or fields. Use the language of the inputted data.",
    objectives: "Refine the provided objectives to make sure they are clear and easy to track. Each objective should be specific and show how it helps reach the project's main goal. Use simple and straightforward language. Give the response in complete MARKDOWN format only without any explanation and also remove the headings or headers or titles if any and don't add extra information or fields. Use the language of the inputted data.",
    requirements: "Enhance the list of business requirements by organizing them with an ID, a short title description, a detailed description, the rationale behind it and the MoSCoW prioritization.Each requirement should start on a new line with bold styling on ID. Order them from most important to least important. Make sure they are detailed and clear. If the input is too short or missing key points, add suggestions to make a complete list. If the business requirements can be made more granular by splitting them  up, please do so. Use plain language that anyone can understand. Do not provide any explanation and also remove the headings. Give the response in complete MARKDOWN format only without any explanation.Don't add extra information or fields. Use the language of the inputted data. ", //You always write business requirements from the client's point of view. They are broad, high-level system requirements yet detail-oriented. They are not organizational objectives but aid an organization in achieving its goals. By fulfilling these business requirements, the organization attains its broad objectives.
    stakeholders: "Enhance the provided information on users and target audience. Focus on creating detailed user personas for each type of user. For each persona, include:\n\n1. Name and role\n2. Demographics (age, occupation, etc.)\n3. Goals and motivations\n4. Pain points and challenges\n5. How they interact with the product/service\n\nAlso, identify any external dependants or key players and their relationship to the product. Describe the target audience in depth, highlighting their specific needs, preferences, and behaviors. Use simple, easy-to-understand language. Provide the response in complete MARKDOWN format without explanations, headings, or extra fields. Maintain the language of the input data.",
    constraints: "Improve the provided information on constraints. Clearly define each constraint. Use simple, easy-to-understand language. Give the response in complete MARKDOWN format only without any explanation and also remove the headings or headers or titles if any and don't add extra information or fields. Use the language of the inputted data.",
    budget: "Improve the provided information on budget. Clearly define each budget item. Use simple, easy-to-understand language. Give the response in complete MARKDOWN format only without any explanation and also remove the headings or headers or titles if any and don't add extra information or fields. Use the language of the inputted data.",
    dependencies: "Improve the provided information on dependencies. Clearly define each dependency. Use simple, easy-to-understand language. Give the response in complete MARKDOWN format only without any explanation and also remove the headings or headers or titles if any and don't add extra information or fields. Use the language of the inputted data.",
    priorities: "Improve the provided information on priorities. Clearly define each priority. Use simple, easy-to-understand language. Give the response in complete MARKDOWN format only without any explanation and also remove the headings or headers or titles if any and don't add extra information or fields. Use the language of the inputted data.",
    risks: "Improve the provided information on risks. Clearly define each risk. Use simple, easy-to-understand language. Give the response in complete MARKDOWN format only without any explanation and also remove the headings or headers or titles if any and don't add extra information or fields. Use the language of the inputted data.",
    scope: "Improve the provided information on scope. Clearly define each scope item. Use simple, easy-to-understand language. Give the response in complete MARKDOWN format only without any explanation and also remove the headings or headers or titles if any and don't add extra information or fields. Use the language of the inputted data.",
    targetAudience: "Improve the provided information on target audience. Clearly define each target audience item. Use simple, easy-to-understand language. Give the response in complete MARKDOWN format only without any explanation and also remove the headings or headers or titles if any and don't add extra information or fields. Use the language of the inputted data.",
    timeline: "Improve the provided information on timeline. Clearly define each timeline item. Use simple, easy-to-understand language. Give the response in complete MARKDOWN format only without any explanation and also remove the headings or headers or titles if any and don't add extra information or fields. Use the language of the inputted data.",
    successMetrics: "Improve the provided information on success metrics. Clearly define each success metric. Use simple, easy-to-understand language. Give the response in complete MARKDOWN format only without any explanation and also remove the headings or headers or titles if any and don't add extra information or fields. Use the language of the inputted data.",
    useCases: "Enhance the provided use case by following industry-standard practices. Structure the use case as follows: ### Title A clear, concise title for the use case. ### Actors Identify the primary and secondary actors involved. ### Preconditions List any conditions that must be true before the use case begins. ### Main Success Scenario Describe the step-by-step flow of events for the successful path. ### Alternative Scenarios Include any alternative paths or variations from the main scenario. For each, specify: - Name - Start point (step number in the main scenario) - Steps - Return point (step number in the main scenario or 'end') ### Error Scenarios Describe potential error conditions and how they are handled. For each, specify: - Name - Start point (step number in the main scenario) - Steps ### Postconditions State the system's condition after the use case is completed. ### UI Requirements List any specific user interface requirements for this use case. Ensure the use case is detailed, specific, and provides clear value to the development team. Use simple, easy-to-understand language. Maintain the language and language style of the input data. Don't give any explanations. Use H3 for headings.",
    functionalRequirements: "Enhance the provided functional requirements based on the following project details. Each requirement should include: Requirement ID: A unique identifier for the requirement.Title: A brief, descriptive title summarizing the requirement. Requirement: A detailed description of the functionalities that the system should provide. Create a list of sub-requirements that each start with The system shall ... Ensure the sub-requirements are clear, concise, and free of ambiguity. Priority: Indicate the importance of this requirement (e.g., Must have, Should have, Could have). Traceability: Link the requirement to a specific business goal or objective that it supports. Make sure all of these properties are written on separate lines. Use the language of the project details to write the functional requirements. Order them from most important to least important. Make sure they are detailed and clear. If the input is too short or missing key points, add suggestions to make a complete list. If the requirements can be made more granular by splitting them up, please do so. Use plain language that anyone can understand. Format the output as a markdown. Use only H3 for headings. Use the project language.",
    epics: "Enhance the provided epic based on the following project details. Each epic should include: Epic ID: A unique identifier for the epic. Title: A brief, descriptive title summarizing the epic. Description: A detailed description of the epic. Use the language of the project details to enhance the epic. Make sure they are detailed and clear. If the input is too short or missing key points, add suggestions to make a complete epic description. If the epics can be made more granular by splitting them up, please do so. Use plain language that anyone can understand. Format the output as a markdown list, with each epic as a separate item. Maintain the structure and format of the inputted data.",
};

export const placeholders = {
    description: `- **What to write**:
      - Imagine you're pitching your project to a friend at a coffee shop ☕. Give a brief summary of your project or product, focusing on the main purpose, the problem you're solving, and the overall goal. Think of it as your project's elevator pitch 🚀.
  - **How the tool helps**:
      - 🛠️ The tool is like your grammar-savvy buddy 🤓 who's always there to make your pitch clearer, more concise, and aligned with best practices. It might even suggest some fancy improvements or extra details you hadn't thought of. You'll sound like a pro in no time!
  - **Example**:
      - **For** busy professionals and families 
      **Who** want convenient access to restaurant-quality meals without the hassle of cooking or dining out, 
      **The** "QuickEats" **Is** a mobile food delivery app 
      **That** allows users to browse menus, place orders, and track deliveries from their favorite local restaurants in real-time. 
      **Unlike** traditional takeout or competing apps, 
      **Our product** offers personalized meal recommendations, faster delivery times, and a rewards program that enhances user loyalty and satisfaction.`,
    objectives: `- **What to write**:
      - Clearly define the objectives of the project. Each objective should be specific, measurable, achievable, relevant, and time-bound (SMART).
      - **How the tool helps**:
      - 🛠️ The tool is like your grammar-savvy buddy 🤓 who's always there to make your pitch clearer, more concise, and aligned with best practices. It might even suggest some fancy improvements or extra details you hadn't thought of. You'll sound like a pro in no time!
      - **Example**:
      - **Objective**: Increase customer satisfaction by 20%
      - **How**: By implementing a new customer feedback system and improving the delivery process.
      - **Result**: Satisfied customers will be more likely to return and recommend the product to others.`,
    requirements: `- **What to write**:
      - Clearly define the requirements of the project. Each requirement should be specific, measurable, achievable, relevant, and time-bound (SMART).
      - **How the tool helps**:
      - 🛠️ The tool is like your grammar-savvy buddy 🤓 who's always there to make your pitch clearer, more concise, and aligned with best practices. It might even suggest some fancy improvements or extra details you hadn't thought of. You'll sound like a pro in no time!
      - **Example**:
      - **Requirement**: The system should be able to handle 1000 concurrent users.
      - **How**: By implementing a new customer feedback system and improving the delivery process.
      - **Result**: Satisfied customers will be more likely to return and recommend the product to others.`,
    stakeholders: `- **What to write**:
      - Clearly define the stakeholders of the project. Each stakeholder should be specific, measurable, achievable, relevant, and time-bound (SMART).
      - **How the tool helps**:
      - 🛠️ The tool is like your grammar-savvy buddy 🤓 who's always there to make your pitch clearer, more concise, and aligned with best practices. It might even suggest some fancy improvements or extra details you hadn't thought of. You'll sound like a pro in no time!
      - **Example**:
      - **Stakeholder**: The CEO of the company.
      - **How**: By implementing a new customer feedback system and improving the delivery process.
      - **Result**: Satisfied customers will be more likely to return and recommend the product to others.`,
    timeline: `- **What to write**:
      - Clearly define the timeline of the project. Each timeline should be specific, measurable, achievable, relevant, and time-bound (SMART).
      - **How the tool helps**:
      - 🛠️ The tool is like your grammar-savvy buddy 🤓 who's always there to make your pitch clearer, more concise, and aligned with best practices. It might even suggest some fancy improvements or extra details you hadn't thought of. You'll sound like a pro in no time!
      - **Example**:
      - **Timeline**: The project should be completed in 3 months.
      - **How**: By implementing a new customer feedback system and improving the delivery process.
      - **Result**: Satisfied customers will be more likely to return and recommend the product to others.`,
    successMetrics: `- **What to write**:
      - Clearly define the success metrics of the project. Each success metric should be specific, measurable, achievable, relevant, and time-bound (SMART).
      - **How the tool helps**:
      - 🛠️ The tool is like your grammar-savvy buddy 🤓 who's always there to make your pitch clearer, more concise, and aligned with best practices. It might even suggest some fancy improvements or extra details you hadn't thought of. You'll sound like a pro in no time!
      - **Example**:
      - **Success Metric**: The project should be completed in 3 months.
      - **How**: By implementing a new customer feedback system and improving the delivery process.
      - **Result**: Satisfied customers will be more likely to return and recommend the product to others.`,
};


