import DependenciesIcon from "@/icons/DependenciesIcon";
import PeopleIcon from "@/icons/PeopleIcon";
import RisksIcon from "@/icons/RisksIcon";
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
        key: "overview",
        icon: <PeopleIcon />,
        description: "Add regular paragraphs to convey your main content. This will enhance the scope of your project.",
        active: true,
        required: true
    }
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
    overview: "Review the existing Project Overview. Refine the project name for better memorability and relevance. Enhance the project description by incorporating recent market insights or technological advancements. Ensure goals are SMART (Specific, Measurable, Achievable, Relevant, Time-bound). Expand the stakeholder list by considering indirect stakeholders or potential partners. How can we make this overview more compelling and aligned with current industry standards?",
    problemStatement: "Analyze the existing Problem Statement. Can we make the current situation description more vivid or relatable? Are there any emerging trends or recent studies that could add depth to our understanding of the pain points? Refine the opportunity statement to make it more compelling and unique. How can we better connect the pain points to the specific features or solutions our project will offer?",
    userPersonas: "Review the existing User Personas. How can we make them more three-dimensional and relatable? Are there any user segments we've overlooked? Update the personas to reflect any new insights from market research or user feedback. Can we add any specific behavioral patterns or preferences that would influence product design? Consider adding quotes or mini-scenarios to bring these personas to life. Ensure that the personas align well with the problem statement and project goals.",
    featuresInOut: "Review the existing Features list. Can we clarify or enhance any feature descriptions to better highlight their value to users? Are there any new features we should consider adding based on user feedback, competitive analysis, or technological advancements? For Features Out, reassess if any should now be included or if new exclusions are necessary. How can we better prioritize or categorize the Features In to reflect their importance or development sequence? Consider grouping features by user type, product area, or development phase. Ensure that each feature directly contributes to addressing the identified problem and achieving the project's goals. Add any potential dependencies or technical considerations for key features.",
    successMetrics: "Evaluate the current Success Metrics. Are our KPIs still aligned with industry standards and project goals? Can we make them more specific or ambitious? Add any new metrics that might have become relevant due to project evolution or market changes. Refine the success criteria to be more precise and actionable. How can we better tie these metrics to user satisfaction and business impact? Consider adding both short-term and long-term metrics to track progress over time. Ensure that each metric has a clear method of measurement and reporting.",
    userScenarios: `Review the existing scenario stories. How can we make them more vivid, engaging, and true to the personas we've created? Consider the following: 

Are we effectively showing the emotional journey of the persona as they use the product? 

Can we add more sensory details or specific examples of how the product integrates into their life? 

Are there opportunities to showcase multiple features of the product within the story? 

Does the story effectively demonstrate the unique value proposition of our product? 

Can we include any challenges or obstacles that the persona overcomes with the help of the product? 

Is the persona's voice authentic and consistent with their profile? 

Refine the stories to ensure they not only showcase the product's features but also create an emotional connection with the reader. Consider adding brief "before and after" reflections from the persona to highlight the impact of the product on their life or work. `,
    featurePrioritization: `Review the current Feature Prioritization. Given any new insights, market changes, or technical considerations, should any features be moved between categories? Consider the following: 

Are the justifications for prioritization still valid and compelling? 

Have we received any user feedback that might influence our prioritization? 

Have there been any technological advancements that might make certain features easier or harder to implement? 

Are there any new features that have been identified since the initial prioritization? 

How well does our current prioritization align with our project goals and success metrics? 

Can we add any quantitative measures (e.g., estimated impact vs. effort) to support our prioritization decisions? 

Refine the categorization and justifications to ensure they reflect the most current understanding of user needs, technical constraints, and business goals. Consider adding a brief explanation of the prioritization methodology used, if any specific framework (e.g., MoSCoW, Kano model) was applied. `,
    risksDependencies: `Review the current Dependencies and Risks section. Consider the following questions to refine and improve it: 

Are all critical dependencies and significant risks captured? Are there any new ones that have emerged as the project has evolved? 

Are the descriptions clear and specific enough for stakeholders to understand their implications? 

Are the impact assessments and likelihood ratings still accurate? Do they need updating based on new information or changed circumstances? 

Are the mitigation strategies practical and sufficient? Can we add more specific actions or contingency plans? 

Have we considered interdependencies between different risks or dependencies? 

Are there any positive dependencies or opportunities we should highlight alongside the risks? 

How well do these dependencies and risks align with the project goals and success metrics we defined earlier? 

Consider adding a visual representation, such as a risk matrix or dependency map, to make the information more digestible. 

Refine the mitigation strategies to be more specific and actionable. Where possible, assign ownership for managing each dependency or risk. 

Consider adding a section on how these dependencies and risks will be monitored and reviewed throughout the project lifecycle. This could include defining triggers for when mitigation plans need to be activated. 

Finally, ensure that this section provides a balanced view that acknowledges challenges while maintaining a constructive, solution-oriented approach to addressing them. 

 `,

    useCases: "Enhance the provided use case by following industry-standard practices. Structure the use case as follows: Title A clear, concise title for the use case. ### Actors Identify the primary and secondary actors involved. ### Preconditions List any conditions that must be true before the use case begins. ### Main Success Scenario Describe the step-by-step flow of events for the successful path. ### Alternative Scenarios Include any alternative paths or variations from the main scenario. For each, specify: - Name - Start point (step number in the main scenario) - Steps - Return point (step number in the main scenario or 'end') ### Error Scenarios Describe potential error conditions and how they are handled. For each, specify: - Name - Start point (step number in the main scenario) - Steps ### Postconditions State the system's condition after the use case is completed. ### UI Requirements List any specific user interface requirements for this use case. Ensure the use case is detailed, specific, and provides clear value to the development team. Use simple, easy-to-understand language. Maintain the language and language style of the input data. Don't give any explanations. Use H3 for subheadings.Remove the top headings if any",
    functionalRequirements: "Enhance the provided functional requirements based on the following project details. Each requirement should include: Requirement ID: A unique identifier for the requirement.Title: A brief, descriptive title summarizing the requirement. Requirement: A detailed description of the functionalities that the system should provide. Create a list of sub-requirements that each start with The system shall ... Ensure the sub-requirements are clear, concise, and free of ambiguity. Priority: Indicate the importance of this requirement (e.g., Must have, Should have, Could have). Traceability: Link the requirement to a specific business goal or objective that it supports. Make sure all of these properties are written on separate lines. Use the language of the project details to write the functional requirements. Order them from most important to least important. Make sure they are detailed and clear. If the input is too short or missing key points, add suggestions to make a complete list. If the requirements can be made more granular by splitting them up, please do so. Use plain language that anyone can understand. Format the output as a complete MARKDOWN format. Use only H3 for subheadings. Use the project language.Remove the top headings if any",
    epics: "Enhance the provided epic based on the following project details. Each epic should include: Epic ID: A unique identifier for the epic. Title: A brief, descriptive title summarizing the epic. Description: A detailed description of the epic. Use the language of the project details to enhance the epic. Make sure they are detailed and clear. If the input is too short or missing key points, add suggestions to make a complete epic description. If the epics can be made more granular by splitting them up, please do so. Use plain language that anyone can understand.Format the output as a complete MARKDOWN format, with each epic as a separate item. Maintain the structure and format of the inputted data.Remove the top headings if any",
    userStories: "Enhance the provided userStory based on the following project details. Each userStory should include: userStoryId: A unique identifier for the userStory. Title: A brief, descriptive title summarizing the uerStory. Description: A detailed description of the epic. Use the language of the project details to enhance the userStory. Make sure they are detailed and clear. If the input is too short or missing key points, add suggestions to make a complete userStory description. If the userStory can be made more granular by splitting them up, please do so. Use plain language that anyone can understand.Format the output as a complete MARKDOWN format, with each epic as a separate item. Maintain the structure and format of the inputted data.Remove the top headings if any",
};

export const placeholders = {
    description: `- What to write:
      - Imagine you're pitching your project to a friend at a coffee shop ☕. Give a brief summary of your project or product, focusing on the main purpose, the problem you're solving, and the overall goal. Think of it as your project's elevator pitch 🚀.
  - How the tool helps**:
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

export const ideatePrompts: { [key: string]: string } = {
    overview: `Create a comprehensive project overview that includes all essential aspects of the project. Follow this exact template structure, maintaining the formatting with appropriate sections and bullet points:

    **Project Description**
    [Provide a concise yet comprehensive description of the project, explaining what it is, its main purpose, and its unique value proposition. Include the target market and the core problem it solves.]\n

    **Current Situation & Problem**
    [Describe the current market situation and key challenges that exist. Include relevant statistics or market data if applicable.]\n

    **Key Pain Points**:
    1. [First major pain point]
    2. [Second major pain point]
    3. [Third major pain point]\n

    **Solution & Opportunity**
    [Explain how your project addresses these pain points and what opportunity it captures in the market.]\n

    **Core Features**:
    1. [Primary feature with brief description]
    2. [Secondary feature with brief description]
    3. [Third feature with brief description]
    Future Considerations: [Brief mention of planned future features]\n

    **Goals and Objectives**:
    1. [Specific, measurable goal with timeline]
    2. [Specific, measurable goal with timeline]
    3. [Specific, measurable goal with timeline]\n

    **Key Stakeholders**:
    1. [Primary stakeholder group and their role]
    2. [Secondary stakeholder group and their role]
    3. [Additional stakeholder group and their role]\n

    **Primary User Persona**:
    - Demographics: [Key demographic information]
    - Goals: [Main user goals]
    - Pain Points: [User's main challenges]
    - Usage Patterns: [How they will use the product]\n

    Example of good formatting:
    **Project Description**
    TaskFlow Pro is a comprehensive project management platform designed specifically for remote development teams. It combines real-time collaboration tools, automated workflow management, and AI-powered productivity insights into a single, intuitive interface. The platform addresses the unique challenges of distributed teams while maintaining high productivity and team cohesion.\n

    **Current Situation & Problem**
    Remote work has become the norm for many development teams, with 67% of tech companies adopting hybrid or fully remote models. Traditional project management tools lack the specific features needed for effective remote collaboration and often result in fragmented communication and reduced productivity.\n

    **Key Pain Points**:
    1. Lack of seamless integration between communication and task management tools
    2. Difficulty in tracking real-time progress across different time zones
    3. Limited visibility into team member workload and availability\n

    [Continue with the same level of detail and formatting for each section...]`
};


