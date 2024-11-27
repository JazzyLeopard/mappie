"use client";

import { useRef, useState, Fragment } from "react";
import Image from "next/image";
import { Tab, TabGroup, TabList, TabPanel, TabPanels } from "@headlessui/react";
import { Transition } from "@headlessui/react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChartBar, faClock, faFileLines, faCode } from '@fortawesome/free-solid-svg-icons';

export default function BusinessCategories() {
  const tabsRef = useRef<HTMLDivElement>(null);
  const [selectedTab, setSelectedTab] = useState<number>(0);

  const categories = [
    {
      name: "Business Analysts",
      icon: faChartBar,
      description: "Generate detailed user stories and functional requirements that accurately reflect user needs and drive product development.",
      features: [
        {
          title: "Requirements Documentation",
          description: "Create comprehensive business requirements documents with AI assistance"
        },
        {
          title: "User Story Generation",
          description: "Automatically generate detailed user stories from high-level requirements"
        },
        {
          title: "Use Case Analysis",
          description: "Map out user interactions and system behaviors with intelligent suggestions"
        },
        {
          title: "Process Mapping",
          description: "Visualize and document business processes with automated flow generation"
        }
      ]
    },
    {
      name: "Product Managers",
      icon: faFileLines, 
      description: "Scope, ideate and document product requirements with AI assistance to generate comprehensive user stories.",
      features: [
        {
          title: "Requirements Scoping",
          description: "Quickly scope and define product requirements with AI guidance"
        },
        {
          title: "Story Generation",
          description: "Automatically generate detailed user stories from requirements"
        },
        {
          title: "Documentation",
          description: "Create comprehensive product documentation and specifications"
        },
        {
          title: "Ideation Support",
          description: "Get AI-powered suggestions to help ideate and refine features"
        }
      ]
    },
    {
      name: "Development Teams",
      icon: faCode,
      description: "Get clear insights into user stories and requirements to build the right features.",
      features: [
        {
          title: "Story Overview",
          description: "See all user stories and requirements in one organized view"
        },
        {
          title: "Requirement Details",
          description: "Access detailed acceptance criteria and edge cases"
        },
        {
          title: "Story Dependencies",
          description: "Understand relationships between different stories"
        },
        {
          title: "Implementation Context",
          description: "Get the full context needed to implement each story correctly"
        }
      ]
    },
    {
      name: "Start-up Owners",
      icon: faClock,
      description: "Transform your software ideas into comprehensive project plans instantly with AI assistance, making stakeholder communication effortless.",
      features: [
        {
          title: "Resource Planning",
          description: "Get AI suggestions for features, requirements and workflows."
        },
        {
          title: "Instant Project Outline",
          description: "Turn your high-level ideas into detailed project specifications in minutes"
        },
        {
          title: "Stakeholder Documentation",
          description: "Generate professional documentation to effectively communicate with investors and teams"
        },
        {
          title: "Vision Translation",
          description: "Convert your business vision into concrete technical requirements effortlessly"
        }
      ]
    }
  ];

  return (
    <section className="py-12 md:py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="relative">
          <TabGroup selectedIndex={selectedTab} onChange={setSelectedTab}>
            <div className="flex justify-center">
              <TabList className="relative mb-8 inline-flex flex-wrap justify-center rounded-xl bg-white p-2 shadow-lg shadow-black/[0.03] before:pointer-events-none before:absolute before:inset-0 before:rounded-[inherit] before:border before:border-transparent before:[background:linear-gradient(theme(colors.gray.100),theme(colors.gray.200))_border-box] before:[mask-composite:exclude_!important] before:[mask:linear-gradient(white_0_0)_padding-box,_linear-gradient(white_0_0)] max-[480px]:max-w-[180px] min-[480px]:mb-12">
                {categories.map((category, index) => (
                  <Tab key={category.name} as={Fragment}>
                    <button className={`ui-focus-visible:outline-none ui-focus-visible:ring ui-focus-visible:ring-blue-300 flex h-8 flex-1 items-center gap-2.5 whitespace-nowrap rounded-lg px-3 text-sm font-medium transition-colors duration-150 focus-visible:outline-none ${selectedTab === index ? "bg-gray-800 text-gray-200" : "text-gray-700 hover:text-gray-900"}`}>
                      <FontAwesomeIcon icon={category.icon} className={`h-4 w-4 ${selectedTab === index ? "text-gray-400" : "text-gray-500"}`} />
                      <span>{category.name}</span>
                    </button>
                  </Tab>
                ))}
              </TabList>
            </div>

            <TabPanels className="relative">
              {categories.map((category, index) => (
                <TabPanel key={category.name} className="focus:outline-none">
                  <Transition
                    show={selectedTab === index}
                    enter="transition ease-[cubic-bezier(0.68,-0.3,0.32,1)] duration-700 transform order-first"
                    enterFrom="opacity-0 -translate-y-8"
                    enterTo="opacity-100 translate-y-0"
                    leave="transition ease-[cubic-bezier(0.68,-0.3,0.32,1)] duration-300 transform absolute"
                    leaveFrom="opacity-100 translate-y-0"
                    leaveTo="opacity-0 translate-y-12"
                  >
                    <div className="relative flex flex-col items-center">
                      <div className="mb-8 text-center">
                        <p className="text-lg text-gray-600">{category.description}</p>
                      </div>
                      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                        {category.features.map((feature, featureIndex) => (
                          <div
                            key={feature.title}
                            className="rounded-lg bg-white p-5 shadow-lg"
                            data-aos="fade-up"
                            data-aos-delay={featureIndex * 100}
                          >
                            <h4 className="mb-2 font-medium text-gray-900">{feature.title}</h4>
                            <p className="text-sm text-gray-600">{feature.description}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </Transition>
                </TabPanel>
              ))}
            </TabPanels>
          </TabGroup>
        </div>
      </div>
    </section>
  );
}
