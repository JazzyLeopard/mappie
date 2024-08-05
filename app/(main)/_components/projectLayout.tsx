"use client";

import PeopleIcon from "@/icons/PeopleIcon";
import RoundCheckmark from "@/icons/RoundCheckmark";
import BoldRoundCheckmark from "@/icons/BoldRoundCheckmark";
import AudienceIcon from "@/icons/AudienceIcon";
import AlertIcon from "@/icons/AlertIcon";
import RisksIcon from "@/icons/RisksIcon";
import { toTitleCase } from "@/utils/helper";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import ScopeIcon from "@/icons/ScopeIcon";
import DollarIcon from "@/icons/DollarIcon";
import PrioritiesIcon from "@/icons/PrioritiesIcon";
import DependenciesIcon from "@/icons/DependenciesIcon";
import LabelToInput from "./LabelToInput";
import { Icon } from "@iconify/react";
import listIcon from "@iconify/icons-ic/outline-list";
import "@/app/custom.css";
import AiGenerationIcon from "@/icons/AI-Generation";
import BlockEditor from "./BlockEditor";
import { Presentation } from "lucide-react";


import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import AiGenerationIconWhite from "@/icons/AI-Generation-White";

type MenuItemType = {
  key: string;
  icon: React.JSX.Element;
  description: string;
  active: boolean;
  required?: boolean;
};

const NavLink = ({
  section,
  activeSection,
  handleSectionClick,
}: {
  section: string;
  activeSection: string;
  handleSectionClick: (sectionId: string) => void;
}) => (
  <Link
    href="#"
    className={`block p-2 rounded-md ${
      activeSection === section
        ? "font-semibold bg-white text-black-500"
        : "hover:bg-gray-200"
    }`}
    onClick={() => handleSectionClick(section)}
    prefetch={false}
  >
    {toTitleCase(section)}
  </Link>
);

const menuItems: MenuItemType[] = [
  {
    key: "description",
    icon: <PeopleIcon />,
    description:
      "Add regular paragraphs to convey your main content. This will enhance the scope of your project.",
    active: true,
    required: true,
  },
  {
    key: "objectives",
    icon: <PeopleIcon />,
    description:
      "Add regular paragraphs to convey your main content. This will enhance the scope of your project.",
    active: true,
    required: false,
  },
  {
    key: "requirements",
    icon: <PeopleIcon />,
    description:
      "Add regular paragraphs to convey your main content. This will enhance the scope of your project.",
    active: true,
    required: false,
  },
  {
    key: "stakeholders",
    icon: <PeopleIcon />,
    description:
      "Add regular paragraphs to convey your main content. This will enhance the scope of your project.",
    active: true,
    required: false,
  },
  {
    key: "scope",
    icon: <ScopeIcon />,
    description:
      "Add regular paragraphs to convey your main content. This will enhance the scope of your project.",
    active: false,
    required: false,
  },
  {
    key: "targetAudience",
    icon: <AudienceIcon />,
    description:
      "Add regular paragraphs to convey your main content. This will enhance the scope of your project.",
    active: false,
    required: false,
  },
  {
    key: "constraints",
    icon: <AlertIcon />,
    description:
      "Add regular paragraphs to convey your main content. This will enhance the scope of your project.",
    active: false,
    required: false,
  },
  {
    key: "budget",
    icon: <DollarIcon />,
    description:
      "Add regular paragraphs to convey your main content. This will enhance the scope of your project.",
    active: false,
    required: false,
  },
  {
    key: "dependencies",
    icon: <DependenciesIcon />,
    description:
      "Add regular paragraphs to convey your main content. This will enhance the scope of your project.",
    active: false,
    required: false,
  },
  {
    key: "priorities",
    icon: <PrioritiesIcon />,
    description:
      "Add regular paragraphs to convey your main content. This will enhance the scope of your project.",
    active: false,
    required: false,
  },
  {
    key: "risks",
    icon: <RisksIcon />,
    description:
      "Add regular paragraphs to convey your main content. This will enhance the scope of your project.",
    active: false,
    required: false,
  },
];

const ProjectLayout = ({ project }: { project: any }) => {
  const [projectDetails, setProjectDetails] = useState(project);

  const [components, setComponents] = useState<MenuItemType[]>(() => {
    return menuItems.map((item) => ({
      ...item,
      active: [
        "description",
        "objectives",
        "requirements",
        "stakeholders",
      ].includes(item.key.toLowerCase()),
    }));
  });

  const updateProjectMutation = useMutation(api.projects.updateProject);

  const [activeSection, setActiveSection] = useState<string>("description");


  useEffect(() => {
    if (project) {
      setComponents((prevComponents) =>
        prevComponents.map((component) => {
          if (project[component.key] && project[component.key].length > 0) {
            return { ...component, active: true, required: true };
          }
          return component;
        }),
      );
    }
  }, [project]);

  const handleSectionClick = (sectionId: string) => {
    setActiveSection(sectionId);
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  };

  const onEditorBlur = async () => {
    try {
      console.log("time for API call", projectDetails);
      const { _creationTime, createdAt, updatedAt, userId, ...payload } = projectDetails;
      console.log("Payload being sent:", payload);
      await updateProjectMutation(payload);
    } catch (error) {
      console.log("error updating project", error);
    }
  };

  const handleItemClick = (index: number) => {
    const newComponents = components.map((component, i) => {
      if (i === index) {
        return { ...component, active: !component.active };
      }
      return component;
    });
    setComponents(newComponents);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      onEditorBlur();
    }, 5000); // Save every 5 seconds

    return () => clearInterval(interval);
  }, [projectDetails]);

  return (
    <div className="flex h-screen w-full">
      <main className="flex-1 w-full pr-8 pl-8 pt-8 overflow-hidden">
        <div className="bg-white sticky top-0 z-10 flex items-center justify-between pt-8 pb-8 justify-items-center gap-4">
          <LabelToInput
            value={projectDetails.title}
            setValue={(val) =>
              setProjectDetails({ ...projectDetails, title: val })
            }
            onBlur={onEditorBlur}
          />
          <div className="flex gap-4">
            <Dialog>
              <DialogTrigger asChild className="flex items-center gap-2">
                <Button variant="outline">
                  <Icon icon={listIcon} className="w-5 h-5" />
                  Project Elements
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-[800px] max-h-[85vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Select Additional Project Elements</DialogTitle>
                </DialogHeader>
                <ul className="grid gap-3 p-4">
                  {components.map((component, index) => (
                    <li
                      key={toTitleCase(component.key)}
                      className={`flex justify-center items-center p-4 gap-4 ${component.active ? "border border-black" : "border"} p-2 rounded cursor-pointer select-none`}
                      onClick={() =>
                        !component.required && handleItemClick(index)
                      }
                    >
                      <div>{component.icon}</div>
                      <div>
                        <p className="text-sm font-bold">
                          {toTitleCase(component.key)}
                        </p>
                        <p className="text-sm">{component.description}</p>
                      </div>
                      <div>
                        {component.active ? (
                          <BoldRoundCheckmark />
                        ) : (
                          <RoundCheckmark />
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
                <DialogFooter>
                  <Button onClick={() => console.log("Close modal")}>
                    Close
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            <Button variant="outline">
                  <Presentation />
                  Presentation Mode
                </Button>
            <Button className="flex items-center gap-2">
              <AiGenerationIconWhite />
              Generate Epics
            </Button>
          </div>
        </div>

        <div className="flex items-start space-x-8 h-full">
          <div className="w-60 bg-secondary p-4 rounded-md sticky top-[106px] self-start min-h-[600px] overflow-y-auto">
            <nav className="space-y-2">
              {components.map(
                (component) =>
                  component.active && (
                    <NavLink
                      key={component.key}
                      section={component.key}
                      activeSection={activeSection}
                      handleSectionClick={handleSectionClick}
                    />
                  ),
              )}
            </nav>
          </div>

          <div className="flex-1 flex-col space-y-4 w-full justify-between overflow-auto">
            {components.map((c) => {
              if (c.active && c.key === activeSection) {
                return (
                  <div
                    key={c.key}
                    id={c.key}
                    className="min-h-[calc(100vh-300px)]"
                  >
                    <h1 className="text-slate-900 pl-2 text-2xl font-semibold">
                      {toTitleCase(c.key)}
                    </h1>

                    <div className="prose max-w-none">
                      <BlockEditor
                        onBlur={onEditorBlur}
                        attribute={c.key}
                        projectDetails={projectDetails}
                        setProjectDetails={setProjectDetails}
                      />
                    </div>
                  </div>
                );
              }
            })}
          </div>
        </div>
      </main>
    </div>
  );
};

export default ProjectLayout;
