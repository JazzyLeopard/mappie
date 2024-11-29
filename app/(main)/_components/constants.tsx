import AlertIcon from "@/icons/AlertIcon";
import AudienceIcon from "@/icons/AudienceIcon";
import DependenciesIcon from "@/icons/DependenciesIcon";
import DollarIcon from "@/icons/DollarIcon";
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
    },
    {
        key: "problemStatement",
        icon: <PeopleIcon />,
        description: "Add regular paragraphs to convey your main content. This will enhance the scope of your project.",
        active: true,
        required: true
    },
    {
        key: "userPersonas",
        icon: <PeopleIcon />,
        description: "Add regular paragraphs to convey your main content. This will enhance the scope of your project.",
        required: true
    },
    {
        key: "featuresInOut",
        icon: <PeopleIcon />,
        description: "Add regular paragraphs to convey your main content. This will enhance the scope of your project.",
        required: true
    },
    {
        key: "successMetrics",
        icon: <AudienceIcon />,
        description: "Add regular paragraphs to convey your main content. This will enhance the scope of your project.",
        active: false,
    },
    {
        key: "userScenarios",
        icon: <AlertIcon />,
        description: "Add regular paragraphs to convey your main content. This will enhance the scope of your project.",
        active: false,
    },
    {
        key: "featurePrioritization",
        icon: <DollarIcon />,
        description: "Add regular paragraphs to convey your main content. This will enhance the scope of your project.",
        active: false,
    },
    {
        key: "risksDependencies",
        icon: <DependenciesIcon />,
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
    overview: `Based on the project idea, create a comprehensive project overview. Include this important points- a concise yet informative project description, 3-5 specific and measurable project goals and objectives, and key stakeholders. Consider industry trends, potential impact, and unique value propositions in your overview and don't use heading 1 and 2   
    
    Follow this exact example template:
    **Description**: MindMap is a comprehensive mobile application designed to support individuals in managing their mental health and practicing mindfulness. With tailored resources, community support, and interactive tools, users can track their emotions, access guided meditations, and cultivate emotional resilience in a time-efficient manner.\n

    **Goals and Objectives**:
        1.Achieve a user base of 10,000 active users within the first year.
        2.Facilitate at least 100 community interactions per week through our support groups.
        3.Collect and analyze user feedback to improve features quarterly, aiming for a 90% user satisfaction rate.\n
    
    **Key Stakeholders**: 
    1.Development Team (responsible for creating the app and its features)
    2.Mental Health Professionals: Provide insights to ensure the content is effective and reliable.
    3.User Community (providing feedback and suggestions for improvements).
    `,

    problemStatement: `For the project, articulate a clear problem statement. Describe the current situation in the target market or user base. Identify and explain 3-5 significant pain points that potential users or customers are experiencing. Then, highlight the opportunity this problem presents for your project. Use data or statistics where possible to support your statements and don't use heading 1 and 2.

    Follow this exact example template: 
    **Current Situation**
    In today’s fast-paced world, many individuals are struggling with stress, anxiety, and mental health issues. The demand for accessible mental wellness tools is growing as more people seek ways to manage their mental well-being. Existing resources, while helpful, often fall short in providing holistic support tailored to the diverse needs of different user groups.\n

   **Pain Points**
    1.Many users feel overwhelmed and don’t know where to start when it comes to managing their mental health.
    2.Existing tools lack personalization, making it hard for users to find resources that fit their specific situations and goals.
    3.There is a significant gap in community support, where users could benefit from shared experiences and encouragement.\n

    **Opportunity**
    MindMap offers an innovative solution by combining personalized wellness plans, mood tracking, and community support into one platform. By addressing the unique needs of various user personas, MindMap stands to fill a vital gap in the market, providing accessible, flexible, and effective mental wellness resources.
 `,

    userPersonas: `Create detailed user personas for the primary and secondary users of the project. For each persona, include demographic information, goals, frustrations, and motivations. Describe their typical day, tech-savviness, and how they might interact with your product. Ensure these personas are diverse and representative of your target user base. Create at least one primary user persona and 1-2 secondary user personas 

    Follow this exact example template:

    ### Primary User: 
    Alex, the Busy Professional\n

    **Demographics**: 30, Marketing Manager, lives in a metropolitan city.\n

    **Goals**: Alex wants to incorporate mindfulness into his daily routine and manage his stress more effectively to improve work-life balance.\n

    **Frustrations**: Often feels overwhelmed by work, has difficulty finding time for self-care, and isn’t sure which mindfulness techniques will work best.\n

    **Motivations**: Alex wants to stay productive without burning out and seeks ways to enhance his mental resilience.\n

    **Tech-savviness**: Moderate to high; uses productivity and fitness apps regularly but is not a tech expert.\n

    **Typical Day**: Alex spends most of his day in meetings, juggling work deadlines, and interacting with clients. In his free time, he tries to stay active with workouts but struggles to maintain a mindfulness routine.\n
    
    **Interaction with Product**: Alex will use MindMap to track his mood and receive personalized wellness tips. He will benefit from guided meditations during work breaks and the daily reminders to focus on mindfulness.\n

    [Repeat this structure for secondary users] `,

    featuresInOut: `For the project, create a comprehensive feature list. Divide this into "Features In" (included in this version) and "Features Out" (explicitly not included). For Features In, describe each feature concisely but clearly, focusing on user benefits. Aim for 3-5 key features that directly address the pain points identified in the Problem Statement and align with the project goals. For Features Out, briefly explain the rationale for exclusion. This could include features that are out of scope, technically challenging, or planned for future versions. Ensure the feature set aligns with project goals, user needs, and the defined success metrics. 

    Here is the example template:
    ### Features In-\n
    **1. Mood Tracker**: A simple tool allowing users to log their daily emotions and mental state, helping them identify patterns and triggers.\n
    **User benefit**: Helps users become more self-aware and track their mental health over time.\n

    **2. Guided Meditations**: A library of audio-guided mindfulness exercises, categorized by goals like stress relief, sleep, and focus.\n
    **User benefit**: Provides easy access to mindfulness exercises for specific needs and helps users integrate meditation into their routine.\n

    **3. Personalized Wellness Plans**: Tailored plans based on the user’s mood tracker and mental wellness goals.\n
    **User benefit**: Offers a customized roadmap for mental health improvement, making it easier for users to start and stick with a wellness routine.\n

    **4. Community Support Groups**: Virtual spaces where users can connect with like-minded individuals, share their experiences, and support each other.\n
    **User benefit**: Builds a sense of community and reduces feelings of isolation, especially for those seeking peer support.\n

    **5. Daily Mindfulness Reminders**: Push notifications encouraging users to take mindful breaks or engage in wellness activities throughout the day.\n
    **User benefit**: Keeps mindfulness practices top of mind and integrates them into daily life.\n

    ### Features Out-\n
    **1. In-Person Therapy Booking**: Not included in the initial version to focus on self-guided resources.\n
    **Rationale for exclusion**: Adding therapy services would require significant additional resources and partnerships, which can be considered for future versions.\n

    **2. Extensive Customization Options**: Simplified user interface without overwhelming customization options.\n
    **Rationale for exclusion**: Keeping the app user-friendly and streamlined is essential for the target demographic.\n

    **3. Social Media Integration**: Direct sharing on social media is not included to prioritize privacy.\n
    **Rationale for exclusion**: Focusing on personal mental wellness rather than public sharing supports user privacy and reduces external pressure.\n

    **4. Complex Analytics**: Detailed insights and analytics are not included at launch.\n
    **Rationale for exclusion**: Initially, the focus is on encouraging engagement with basic tracking, with more complex features to be developed later.\n

    **5. Multilingual Support**: The app will launch only in English.\n
    **Rationale for exclusion**: Resources for translation and support across multiple languages will be developed based on user demand in future iterations.
`,

}


