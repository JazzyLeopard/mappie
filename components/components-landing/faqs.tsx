import Accordion from "./accordion";

export default function Faqs() {
  const faqs = [
    {
      question: "How does Mappie's AI help with project documentation?",
      answer:
        "Mappie's AI assistant acts as your intelligent copilot, understanding your project context to help create comprehensive documentation in minutes. It provides smart suggestions for requirements, epics, and user stories while maintaining consistency across your documentation.",
    },
    {
      question: "Can I mix AI-generated content with my own writing?",
      answer:
        "Yes! Mappie is designed to be flexible - you can freely combine AI-generated content with your own writing. The AI adapts to your style and you maintain full control over the final documentation.",
      active: true,
    },
    {
      question: "What types of projects is Mappie best suited for?",
      answer:
        "Mappie works great for any software or product development project that requires structured documentation. It's especially valuable for product managers and business analysts who need to create requirements, epics, and user stories efficiently.",
    },
    {
      question: "How does the 14-day free trial work?",
      answer:
        "You get full access to all of Mappie's features for 14 days, including AI-powered assistance and premium templates. No credit card is required to start your trial.",
    },
    {
      question: "What kind of support does Mappie provide?",
      answer:
        "We offer comprehensive support through multiple channels. Our AI assistant is available 24/7 for contextual help throughout your documentation process. Enterprise customers also get priority support from our team.",
    },
    {
      question: "Can I collaborate with my team on Mappie?",
      answer:
        "Yes! Mappie is built for collaboration. You can share professional documentation with stakeholders, work together with team members, and keep everyone aligned on project requirements and progress.",
    },
    {
      question: "How secure is my project data with Mappie?",
      answer:
        "Security is a top priority. Enterprise customers get advanced security features, and all users benefit from our robust data protection measures to keep your project documentation safe and confidential.",
    },
  ];

  return (
    <section>
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="pb-12 md:pb-20">
          <div className="mx-auto max-w-3xl pb-12 text-center md:pb-20">
            <h2 className="text-3xl font-bold md:text-4xl">
              Questions we often get
            </h2>
          </div>
          <div className="mx-auto max-w-3xl">
            <div className="space-y-2">
              {faqs.map((faq, index) => (
                <Accordion
                  key={index}
                  title={faq.question}
                  id={`faqs-${index}`}
                  active={faq.active}
                >
                  {faq.answer}
                </Accordion>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
