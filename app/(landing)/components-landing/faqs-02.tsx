import Accordion from "./accordion";

export default function Faqs() {
  const faqs01 = [
    {
      question: "Getting started with Mappie",
      answer:
        "Getting started with Mappie is simple - just describe your project idea and our AI will help create a complete project structure instantly. You can use natural language input, choose from smart templates, or import existing documentation to get started quickly.",
    },
    {
      question: "How does Mappie's AI assistant work?",
      answer:
        "Mappie's AI assistant acts as your intelligent copilot, understanding your entire project context to provide relevant suggestions for requirements, epics, and user stories. It helps maintain consistency across documentation while adapting to your style and preferences.",
    },
    {
      question: "What types of projects is Mappie best for?",
      answer:
        "Mappie works great for any software or product development project that requires structured documentation. It's especially valuable for product managers and business analysts who need to create comprehensive requirements, epics, and user stories efficiently.",
    },
    {
      question: "Can I collaborate with my team?",
      answer:
        "Yes! Mappie is built for collaboration. You can share professional documentation with stakeholders, work together with team members in real-time, and keep everyone aligned on project requirements and progress.",
    },
    {
      question: "How does the free trial work?",
      answer:
        "You get full access to all of Mappie's features for 14 days, including AI-powered assistance and premium templates. No credit card is required to start your trial.",
    },
  ];

  const faqs02 = [
    {
      question: "What's included in the Enterprise plan?",
      answer:
        "Enterprise customers get access to custom workflows, advanced team collaboration features, enhanced security measures, and priority support from our team. Contact us to learn more about Enterprise pricing and features.",
    },
    {
      question: "How secure is my project data?",
      answer:
        "Security is a top priority at Mappie. We implement robust data protection measures to keep your project documentation safe and confidential. Enterprise customers get additional advanced security features.",
    },
    {
      question: "Can I export my documentation?",
      answer:
        "Yes, Mappie allows you to export your documentation in multiple formats to easily share with stakeholders or integrate with other tools in your workflow.",
    },
    {
      question: "Do you offer training and support?",
      answer:
        "We offer comprehensive support through multiple channels. Our AI assistant is available 24/7 for contextual help, and Enterprise customers get priority support from our team.",
    },
    {
      question: "Can I customize templates?",
      answer:
        "Yes! While Mappie provides industry-standard templates, you can fully customize them to match your organization's needs and workflows.",
    },
  ];

  const faqs03 = [
    {
      question: "How does AI help with requirements?",
      answer:
        "Our AI helps generate SMART objectives, performs stakeholder analysis, defines clear KPIs, and suggests success metrics. It ensures your requirements are specific, measurable, and aligned with project goals.",
    },
    {
      question: "Can AI generate user stories?",
      answer:
        "Yes! Mappie's AI can automatically generate comprehensive user stories with acceptance criteria and help identify potential edge cases. You can then refine these stories with AI suggestions.",
    },
    {
      question: "How does epic creation work?",
      answer:
        "Mappie helps break down your project into manageable epics with automated generation, dependency mapping, priority suggestions, and resource planning recommendations.",
    },
    {
      question: "Can I mix AI and manual work?",
      answer:
        "Absolutely! Mappie is designed to be flexible - you can freely combine AI-generated content with your own writing. The AI adapts to your style and you maintain full control over the final documentation.",
    },
    {
      question: "What makes Mappie different?",
      answer:
        "Mappie uniquely combines AI-powered assistance with intuitive project management to help you create documentation 80% faster. Our context-aware AI understands your entire project to provide intelligent suggestions throughout the documentation process.",
    },
  ];

  return (
    <section>
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="pb-12 md:pb-20">
          <div className="mx-auto max-w-3xl space-y-12">
            {/* Getting started */}
            <div>
              <h2 className="mb-5 text-xl font-bold">Getting Started</h2>
              <div className="space-y-2">
                {faqs01.map((faq, index) => (
                  <Accordion
                    key={index}
                    title={faq.question}
                    id={`faqs-${index}`}
                  >
                    {faq.answer}
                  </Accordion>
                ))}
              </div>
            </div>
            {/* Plans & Security */}
            <div>
              <h2 className="mb-5 text-xl font-bold">Plans & Security</h2>
              <div className="space-y-2">
                {faqs02.map((faq, index) => (
                  <Accordion
                    key={index}
                    title={faq.question}
                    id={`faqs-${index}`}
                  >
                    {faq.answer}
                  </Accordion>
                ))}
              </div>
            </div>
            {/* Features & AI */}
            <div>
              <h2 className="mb-5 text-xl font-bold">Features & AI</h2>
              <div className="space-y-2">
                {faqs03.map((faq, index) => (
                  <Accordion
                    key={index}
                    title={faq.question}
                    id={`faqs-${index}`}
                  >
                    {faq.answer}
                  </Accordion>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
