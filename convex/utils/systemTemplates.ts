export const SYSTEM_TEMPLATES = {
  prd: {
    title: "Product Requirements Document",
    type: "prd",
    content: `# [Project Name]

## Change History
| Date | Author | Description |
|------|---------|------------|
| [Date] | [Name] | Initial draft |

## Overview
[Brief description of what this project is about and its core purpose]

## Success Metrics
- [Metric 1]: [Target and measurement method]
- [Metric 2]: [Target and measurement method]
- [Business KPIs being targeted]

## Product Messaging
### Value Proposition
[Core value proposition in 1-2 sentences]

### Key Messages
- [Message 1]
- [Message 2]
- [Message 3]

## Timeline & Release Planning
### Milestones
- Phase 1: [Date] - [Deliverables]
- Phase 2: [Date] - [Deliverables]
- Launch: [Target Date]

## Target Personas
### Primary Persona
- Name: [Persona name]
- Role: [Role/position]
- Goals: [Key goals]
- Pain Points: [Current challenges]

### Secondary Personas
- [List other relevant personas]

## User Scenarios
### Scenario 1: [Title]
[Detailed story about how the primary persona will use the product]

### Scenario 2: [Title]
[Additional usage scenario]

## Features & Requirements
### Must Have (P0)
1. [Feature name]
   - Description: [Details]
   - Why: [Justification]
   - Success criteria: [Measurable outcomes]

### Should Have (P1)
1. [Feature name]
   - Description: [Details]
   - Why: [Justification]

### Nice to Have (P2)
1. [Feature name]
   - Description: [Details]
   - Why: [Justification]

## Features Out of Scope
| Feature | Reason |
|---------|---------|
| [Feature 1] | [Explanation] |
| [Feature 2] | [Explanation] |

## Design
### Wireframes & Mockups
[Links to design files, early sketches, or embedded images]

### User Flow
[Description or link to user flow diagrams]

## Open Issues & Dependencies
### Open Issues
- [ ] [Issue 1]
- [ ] [Issue 2]

### Dependencies
- [Internal/external dependencies]
- [System requirements]
- [Integration points]

## Q&A
### [Question 1]
[Answer and context]

### [Question 2]
[Answer and context]

## Other Considerations
### Technical Considerations
- [Technical requirement 1]
- [Technical requirement 2]

### Security & Privacy
- [Security requirement 1]
- [Privacy consideration 1]

### Future Expansion
- [Potential future features]
- [Scalability considerations]`,
    aiPrompt: "Help create a comprehensive PRD that includes project overview, success metrics, features, requirements, and technical considerations. Focus on clarity, completeness, and measurable outcomes.",
    metadata: {
      description: "Comprehensive document outlining product features, requirements, and specifications",
      category: "product",
      tags: ["prd", "requirements", "documentation"],
      version: "1.0.0",
      useCount: 0
    }
  },
  epic: {
    title: "Epic Template",
    type: "epic",
    content: `# [Epic Name]

## Epic Summary ✨
- Problem Statement: [Describe the current problem or opportunity]
- Target Audience: [Who will benefit from this epic]
- Type of Epic: [Feature/Enhancement/Security/Performance/etc.]
- Key Benefits: [List main benefits and value delivered]
- Competitive Edge: [What makes this solution unique or better]
- Unique Value Proposition: [Core value proposition in one sentence]

### Problem 💭
[Describe the current situation and why it needs fixing. Be specific about pain points and challenges.]

### Objectives (SMART) 🎯
1. [First specific, measurable, achievable, relevant, time-bound goal]
2. [Second SMART goal]
3. [Third SMART goal]

### Constraints 🚧
1. [Time/budget/technical limitation]
2. [Resource/skill limitation]
3. [Other key constraints]

### Personas 👥
#### Key Persona:
- Role: [Primary user role]
- Goals: [What they want to achieve]
- Pain Points: [Current challenges]

#### Secondary Personas:
1. [Second user type and their needs]
2. [Third user type and their needs]

### User Scenarios 📱
1. [First detailed user scenario - describe how the user will interact with the solution]
2. [Second user scenario - another key usage pattern]
3. [Optional third scenario - edge cases or alternative flows]

### Features In ✅
1. [Must-have feature] - [Why this is essential]
2. [Second key feature] - [Business justification]
3. [Third key feature] - [Expected impact]

### Features Out ❌
1. [Excluded feature] - [Why it's out of scope]
2. [Second excluded feature] - [Reasoning]
3. [Third excluded feature] - [Justification]

### Technical Considerations ⚙️
- Architecture Impact: [Any architectural changes needed]
- Dependencies: [External systems or services required]
- Technical Debt: [Any technical debt to be addressed]
- Security Considerations: [Security requirements or concerns]

### Success Metrics 📊
1. [Primary KPI] - [Target and measurement method]
2. [Secondary metric] - [How it will be tracked]
3. [User satisfaction metric] - [How it will be measured]

---
Last Updated: [Date]
Status: [Draft/In Review/Approved]`,
    aiPrompt: "Help create an epic that clearly defines the problem, objectives (SMART goals), features, and success metrics. Focus on business value and measurable outcomes.",
    metadata: {
      category: "agile",
      tags: ["epic", "planning", "strategy"],
      version: "1.0.0",
      useCount: 0,
      description: "Comprehensive document outlining Epic details, objectives, and success metrics",
    }
  },
  feature: {
    title: "Feature Specification",
    type: "feature",
    content: `# [Feature Name]

## Why we are building this
[1-2 sentences explaining the core problem this feature solves and why it matters to users]

## Description
[2-3 sentences describing what the feature is and its main functionality]

## Scope
- [Key functionality item 1]
- [Key functionality item 2]
- [Key functionality item 3]

## Out of scope
- [Item explicitly not included 1]
- [Item explicitly not included 2]

## Success Metrics
- [Specific, measurable metric 1]
- [Specific, measurable metric 2]

## Dependencies
- [Required system/integration/component 1]
- [Required system/integration/component 2]

---
Status: [Draft/In Review/Approved]
Parent Epic: [Epic Name]
Priority: [P0/P1/P2]`,
    aiPrompt: "Help create a feature specification that clearly outlines the functionality, scope, success metrics, and dependencies. Focus on implementation details and technical requirements.",
    metadata: {
      category: "agile",
      tags: ["feature", "specification", "requirements"],
      version: "1.0.0",
      useCount: 0,
      description: "Straightforward template for outlining feature details, scope, success metrics, and dependencies",
    }
  },
  userStory: {
    title: "User Story Template",
    type: "userStory",
    content: `# User Story

## Story Description
As a [role],
I want [capability/action],
so that [benefit/value].

## Acceptance Criteria

### Scenario 1
Given [initial context/setup]
When [action/trigger]
Then [expected outcome]

### Scenario 2
Given [initial context/setup]
When [action/trigger]
Then [expected outcome]

## Additional Considerations

### Technical Requirements
- [Technical requirement 1]
- [Technical requirement 2]

### Performance Criteria
- [Performance requirement 1]
- [Performance requirement 2]

### Security Considerations
- [Security requirement 1]
- [Security requirement 2]

### Integration Points
- [Integration point 1]
- [Integration point 2]

### Error Scenarios
- [Error scenario 1]
- [Error scenario 2]

### Accessibility Requirements
- [Accessibility requirement 1]
- [Accessibility requirement 2]

---
Status: [Draft/In Review/Approved]
Parent Feature: [Feature Name]
Story Points: [Number]
Priority: [P0/P1/P2]`,
    aiPrompt: "Help create a user story following the template structure. Focus on user value, acceptance criteria using Gherkin scenarios, and technical considerations.",
    metadata: {
      category: "agile",
      tags: ["user-story", "agile", "requirements"],
      version: "1.0.0",
      useCount: 0,
      description: "Easy to use user story template for documenting user interactions and system behaviors",
    }
  },
  srs: {
    title: "Software Requirements Specification",
    type: "funcReq",
    content: `# Software Requirements Specification

## 📋 Requirement Brief

### Purpose
[Describe the purpose and intended use of the software system]

### Project Scope
[Define what's in and out of scope for this software project]

### Document Convention
[Explain any conventions, terms, or special notations used in this document]

### Audience / Target Market
[Identify the intended users and stakeholders of the system]

## 📙 Overall Description

### Product Context
| Item | Status | Notes |
|------|--------|-------|
| System Position | | [How this system fits into the larger ecosystem] |
| Business Rules | | [Key business rules and constraints] |
| System Interfaces | | [External system interactions] |

### Product Features
| Feature | Status | Description |
|---------|--------|-------------|
| Core Feature 1 | | [Description] |
| Core Feature 2 | | [Description] |

### User Classes and Characteristics
| User Type | Characteristics | Usage Patterns |
|-----------|----------------|----------------|
| Primary Users | | [Description] |
| Secondary Users | | [Description] |

### Operating Environment
- Hardware Requirements
- Software Requirements
- Network Requirements
- External Dependencies

### Design Constraints
- Technical Limitations
- Business Rules
- Regulatory Requirements
- Security Requirements

### Assumptions and Dependencies
- [Assumption 1]
- [Assumption 2]
- [Risk Factors]

## ⚙️ System Features and Requirements

### Functional Requirements
| ID | Requirement | Priority | Status | Notes |
|----|------------|----------|--------|-------|
| FR1 | | | | |
| FR2 | | | | |

### External Interface Requirements
| Type | Description | Protocol | Data Format |
|------|-------------|----------|-------------|
| UI | | | |
| API | | | |
| Hardware | | | |

### Non-Functional Requirements
| Category | Requirement | Metric | Target |
|----------|------------|--------|--------|
| Performance | | | |
| Security | | | |
| Reliability | | | |
| Scalability | | | |

## ✍️ Document Conventions
[Document version control, terminology, and references]

## 🌐 References
- [Reference 1]
- [Reference 2]
- [Related Documents]`,
    aiPrompt: "Help create a comprehensive software requirements specification that covers functional and non-functional requirements, system features, and technical constraints. Focus on clarity and completeness.",
    metadata: {
      category: "technical",
      tags: ["srs", "requirements", "specification", "technical"],
      version: "1.0.0",
      useCount: 0,
      description: "Template for documenting all software needs, features, and technical constraints",
    }
  },
  techSpec: {
    title: "Technical Specification Document",
    type: "funcReq",
    content: `# Technical Specification Document

## 💫 Overview
[Provide a brief overview of the technology project, highlighting its key components and objectives]

## 🎯 Objectives
- [Primary objective 1]
- [Primary objective 2]
- [Primary objective 3]

## 🏆 Proposed Solution
### Architecture Overview
[High-level description of the solution architecture]

### System Components
| Component | Purpose | Technology Stack |
|-----------|---------|-----------------|
| [Component 1] | [Purpose] | [Technologies] |
| [Component 2] | [Purpose] | [Technologies] |

## 💎 Technical Details
### Data Model
\`\`\`typescript
// Add your data models here
interface Example {
  id: string;
  name: string;
  // ...
}
\`\`\`

### API Endpoints
| Endpoint | Method | Purpose | Request/Response |
|----------|--------|---------|------------------|
| \`/api/v1/....\` | GET | [Purpose] | [Schema] |

### Security Considerations
- Authentication method
- Authorization rules
- Data encryption
- Security protocols

## 🎯 KPIs & Performance Metrics
| Metric | Target | Measurement Method |
|--------|--------|-------------------|
| Latency | [Target] | [Method] |
| Throughput | [Target] | [Method] |
| Availability | [Target] | [Method] |

## 🔳 Implementation Examples
### Sample Code
\`\`\`typescript
// Add implementation examples here
function example() {
  // ...
}
\`\`\`

### Configuration
\`\`\`yaml
# Add configuration examples here
config:
  key: value
\`\`\`

## 📝 Research Insights
### Proof of Concept Results
[Summary of any POC or prototype findings]

### Performance Testing
[Summary of performance test results]

## 🧪 Technical Feasibility
### Infrastructure Requirements
- [Requirement 1]
- [Requirement 2]

### Dependencies
- [External dependency 1]
- [External dependency 2]

### Scalability Considerations
- [Scalability aspect 1]
- [Scalability aspect 2]

## 🤔 Alternatives Considered
| Alternative | Pros | Cons | Why Not Chosen |
|-------------|------|------|----------------|
| [Option 1] | [Pros] | [Cons] | [Reason] |
| [Option 2] | [Pros] | [Cons] | [Reason] |

## 🔗 References & Resources
### Documentation
- [Link to relevant documentation]
- [Link to API references]

### Related Projects
- [Link to related project 1]
- [Link to related project 2]

### Tools & Libraries
- [Tool/Library 1]: [Purpose]
- [Tool/Library 2]: [Purpose]`,
    aiPrompt: "Help create a detailed technical specification document that includes architecture overview, implementation details, and performance considerations. Focus on technical accuracy and completeness.",
    metadata: {
      category: "technical",
      tags: ["tech-spec", "architecture", "implementation", "technical"],
      version: "1.0.0",
      useCount: 0,
      description: "Template for documenting technical specifications, architecture, and implementation details",
    }
  },
  testPlan: {
    title: "Test Plan Document",
    type: "testPlan",
    content: `# Test Plan Document

## 📋 Overview
### Scope
[Define what features/components will be tested]

### Test Objectives
- [Objective 1]
- [Objective 2]

### Test Strategy
[High-level description of testing approach]

## 🎯 Test Cases

### Functional Testing
| ID | Test Case | Steps | Expected Result | Priority | Status |
|----|-----------|-------|-----------------|----------|--------|
| TC1 | | | | | |
| TC2 | | | | | |

### Integration Testing
| ID | Systems Involved | Test Scenario | Expected Result | Status |
|----|-----------------|---------------|-----------------|--------|
| IT1 | | | | |
| IT2 | | | | |

### Performance Testing
| Test Type | Metrics | Success Criteria | Tools |
|-----------|---------|------------------|-------|
| Load Test | | | |
| Stress Test | | | |

### Security Testing
- Authentication Tests
- Authorization Tests
- Data Protection Tests
- Vulnerability Scans

## 🛠️ Test Environment
### Requirements
- Hardware
- Software
- Network
- Test Data

### Test Tools
| Tool | Purpose | Version |
|------|---------|---------|
| [Tool 1] | | |
| [Tool 2] | | |

## 📊 Reporting
### Metrics
- Test Coverage
- Pass/Fail Ratio
- Bug Severity Distribution

### Defect Management
| Priority | Response Time | Resolution Time |
|----------|--------------|-----------------|
| P0 (Critical) | | |
| P1 (High) | | |
| P2 (Medium) | | |

## ✅ Exit Criteria
- [Criterion 1]
- [Criterion 2]

## 📝 Sign-off
| Role | Name | Date | Signature |
|------|------|------|-----------|
| QA Lead | | | |
| Dev Lead | | | |
| Product Owner | | | |`,
    aiPrompt: "Help create a comprehensive test plan that covers all testing aspects including functional, integration, performance, and security testing. Focus on clear test cases and measurable criteria.",
    metadata: {
      description: "Structured plan for testing features, functionality, and performance",
      category: "testing",
      tags: ["testing", "qa", "quality"],
      version: "1.0.0",
      useCount: 0,
    }
  },
  releaseNotes: {
    title: "Release Notes",
    type: "releaseNotes",
    content: `# Release Notes - [Version Number]

## 🚀 Release Overview
[Brief description of this release and its significance]

Release Date: [Date]
Version: [x.x.x]

## ✨ New Features
### Feature 1
- Detailed description
- User impact
- Configuration requirements

### Feature 2
- Detailed description
- User impact
- Configuration requirements

## 🔧 Improvements
- [Improvement 1]
- [Improvement 2]
- [Improvement 3]

## 🐛 Bug Fixes
| Issue ID | Description | Impact |
|----------|-------------|---------|
| #123 | [Bug description] | [Impact] |
| #124 | [Bug description] | [Impact] |

## ⚠️ Known Issues
| Issue | Workaround | Planned Fix |
|-------|------------|-------------|
| [Issue 1] | [Workaround] | [Version] |
| [Issue 2] | [Workaround] | [Version] |

## 📦 Dependencies
### Updated
- [Dependency 1] - v1.2.3
- [Dependency 2] - v2.3.4

### Required
- [Requirement 1]
- [Requirement 2]

## 🔄 Migration Steps
1. [Step 1]
2. [Step 2]
3. [Step 3]

## 📝 Documentation Updates
- [Link to updated documentation]
- [Link to new guides]

## 🎯 Performance Impact
- [Metric 1]: [Impact]
- [Metric 2]: [Impact]

## 🔒 Security Notes
- [Security update 1]
- [Security update 2]

## 👥 Contributors
- [Name 1] - [Role]
- [Name 2] - [Role]

## 📞 Support
For support queries:
- Email: [support email]
- Documentation: [link]
- Support Portal: [link]`,
    aiPrompt: "Help create detailed release notes that clearly communicate new features, improvements, bug fixes, and important changes. Focus on user impact and clear upgrade instructions.",
    metadata: {
      description: "Template for documenting changes, updates, and improvements in releases",
      category: "product",
      tags: ["release", "changelog", "documentation"],
      version: "1.0.0",
      useCount: 0
      
    }
  },
  useCase: {
    title: "Use Case Specification",
    type: "useCase",
    content: `# [Use Case Title]

## 👥 Actors
### Primary Actor
- [Main actor and their role]

### Secondary Actors
- [Supporting actor 1 and their role]
- [Supporting actor 2 and their role]

## ⚡ Overview
[Brief description of the use case and its purpose]

## 📋 Preconditions
1. [Required condition 1]
2. [Required condition 2]
3. [Required condition 3]

## 🔄 Main Success Scenario
1. [Step 1 - Actor action or system response]
2. [Step 2 - Actor action or system response]
3. [Step 3 - Actor action or system response]
4. [Step 4 - Actor action or system response]

## 🔀 Alternative Scenarios
### [Alternative Path 1 Name]
- **Start Point**: Step [X] of main scenario
- **Steps**:
  1. [Alternative step 1]
  2. [Alternative step 2]
- **Return Point**: Step [Y] of main scenario

### [Alternative Path 2 Name]
- **Start Point**: Step [X] of main scenario
- **Steps**:
  1. [Alternative step 1]
  2. [Alternative step 2]
- **Return Point**: Step [Y] of main scenario

## ⚠️ Error Scenarios
### [Error Scenario 1 Name]
- **Start Point**: Step [X] of main scenario
- **Steps**:
  1. [Error handling step 1]
  2. [Error handling step 2]
  3. [Resolution or recovery step]

### [Error Scenario 2 Name]
- **Start Point**: Step [X] of main scenario
- **Steps**:
  1. [Error handling step 1]
  2. [Error handling step 2]
  3. [Resolution or recovery step]

## ✅ Postconditions
1. [Result 1 - What should be true after successful completion]
2. [Result 2 - System state changes]
3. [Result 3 - Data changes]

## 🎨 UI Requirements
### Required Interface Elements
1. [UI element 1 - Description and purpose]
2. [UI element 2 - Description and purpose]
3. [UI element 3 - Description and purpose]

### Mockups & Wireframes
[Links or embedded images of relevant UI designs]

## 📝 Additional Notes
- [Business rule considerations]
- [Technical constraints]
- [Security requirements]
- [Performance requirements]

## 🔗 Related Use Cases
- [Related use case 1]
- [Related use case 2]`,
    aiPrompt: "Help create a detailed use case specification that clearly defines actors, scenarios, and requirements. Focus on user interactions and system responses.",
    metadata: {
      description: "Template for documenting user interactions and system behaviors",
      category: "requirements",
      tags: ["use-case", "requirements", "user-interaction"],
      version: "1.0.0",
      useCount: 0
    }
  },
  funcReq: {
    title: "Functional Requirements Specification",
    type: "funcReq",
    content: `# Functional Requirements Specification

## 📝 Document Information
- **Version**: [1.0.0]
- **Last Updated**: [Date]
- **Status**: [Draft/In Review/Approved]

## 🎯 Overview
[Brief description of the system and its main functionalities]

## ⚡ Functional Requirements

### 1. [System Component Name]

#### FR-001: [Requirement Title]
| Requirement ID | Priority | Description | Comments |
|---------------|----------|-------------|-----------|
| FR_001 | Must Have | [Main requirement description] | [Additional context] |
| FR_001.1 | Must Have | [Sub-requirement description] | [Implementation notes] |
| FR_001.2 | Should Have | [Sub-requirement description] | [Technical constraints] |

#### FR-002: [Requirement Title]
| Requirement ID | Priority | Description | Comments |
|---------------|----------|-------------|-----------|
| FR_002 | Must Have | [Main requirement description] | [Additional context] |
| FR_002.1 | Must Have | [Sub-requirement description] | [Implementation notes] |
| FR_002.2 | Could Have | [Sub-requirement description] | [Technical constraints] |

### 2. [System Component Name]

#### FR-003: [Requirement Title]
| Requirement ID | Priority | Description | Comments |
|---------------|----------|-------------|-----------|
| FR_003 | Should Have | [Main requirement description] | [Additional context] |
| FR_003.1 | Should Have | [Sub-requirement description] | [Implementation notes] |

## 📊 Priority Levels
- **Must Have**: Critical for system functionality
- **Should Have**: Important but not critical
- **Could Have**: Desired but not necessary
- **Won't Have**: Out of scope for current release

## 🔄 Dependencies
| Requirement ID | Depends On | Description |
|---------------|------------|-------------|
| FR_001.1 | FR_001 | [Dependency description] |
| FR_002.2 | FR_002 | [Dependency description] |

## ⚠️ Constraints
- [Technical constraint 1]
- [Business constraint 1]
- [Resource constraint 1]

## 📋 Assumptions
- [Assumption 1]
- [Assumption 2]

## ✅ Validation Criteria
| Requirement ID | Test Method | Success Criteria |
|---------------|-------------|------------------|
| FR_001 | [Test method] | [Success criteria] |
| FR_002 | [Test method] | [Success criteria] |

## 👥 Stakeholder Sign-off
| Role | Name | Date | Signature |
|------|------|------|-----------|
| Product Owner | | | |
| Technical Lead | | | |
| QA Lead | | | |`,
    aiPrompt: "Help create a detailed functional requirements specification that clearly defines system requirements, priorities, and validation criteria. Focus on clarity and traceability.",
    metadata: {
      description: "Detailed specification of system functionality and technical requirements",
      category: "requirements",
      tags: ["functional-requirements", "specifications", "requirements"],
      version: "1.0.0",
      useCount: 0
    }
  }
} as const;

export type SystemTemplateType = keyof typeof SYSTEM_TEMPLATES; 