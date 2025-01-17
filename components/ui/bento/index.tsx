import {
  RocketIcon,
  LayersIcon,
  PersonIcon,
  ChatBubbleIcon,
  Share1Icon,
} from "@radix-ui/react-icons";
import { BentoCard, BentoGrid } from "@/components/ui/bento/bento-grid";

const features = [
  {
    Icon: RocketIcon,
    name: "Epic Generation",
    description: "Transform big ideas into well-structured epics. Break down complex projects into manageable pieces with AI assistance.",
    cta: "See how it works",
    background: <img className="absolute -right-20 -top-20 opacity-60" />,
    className: "lg:row-start-1 lg:row-end-4 lg:col-start-2 lg:col-end-3",
  },
  {
    Icon: LayersIcon,
    name: "Feature Management",
    description: "Turn product ideas into actionable features. Organize and structure your product backlog efficiently.",
    cta: "Learn more",
    background: <img className="absolute -right-20 -top-20 opacity-60" />,
    className: "lg:col-start-1 lg:col-end-2 lg:row-start-1 lg:row-end-3",
  },
  {
    Icon: PersonIcon,
    name: "User Story Generation",
    description: "Write awesome user stories in seconds, not hours. Generate clear, dev-ready user stories automatically.",
    cta: "Explore stories",
    background: <img className="absolute -right-20 -top-20 opacity-60" />,
    className: "lg:col-start-1 lg:col-end-2 lg:row-start-3 lg:row-end-4",
  },
  {
    Icon: ChatBubbleIcon,
    name: "AI Assistant",
    description: "Get intelligent help when you need it. Our context-aware AI helps refine and improve your product documentation.",
    cta: "Meet your assistant",
    background: <img className="absolute -right-20 -top-20 opacity-60" />,
    className: "lg:col-start-3 lg:col-end-3 lg:row-start-1 lg:row-end-2",
  },
  {
    Icon: Share1Icon,
    name: "Public Link Sharing",
    description: "Share your product vision effortlessly. Collaborate with stakeholders through beautiful, shareable documentation.",
    cta: "Try sharing",
    background: <img className="absolute -right-20 -top-20 opacity-60" />,
    className: "lg:col-start-3 lg:col-end-3 lg:row-start-2 lg:row-end-4",
  },
];

export function BentoDemo() {
  return (
    <BentoGrid className="lg:grid-rows-3 max-w-7xl mx-auto">
      {features.map((feature) => (
        <BentoCard 
          key={feature.name} 
          {...feature} 
          href="#"
        />
      ))}
    </BentoGrid>
  );
}