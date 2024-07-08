/**
 * v0 by Vercel.
 * @see https://v0.dev/t/39pYKzqyX3o
 * Documentation: https://v0.dev/docs#integrating-generated-code-into-your-nextjs-app
 */
"use client"

import { CKEditor } from "@ckeditor/ckeditor5-react";
import InlineEditor from "@ckeditor/ckeditor5-build-inline";
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

import '@/app/custom.css';


import React, { useEffect, useState } from 'react';
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
import { DialogClose } from "@radix-ui/react-dialog";

type MenuItemType = {
    key: string;
    icon: React.JSX.Element;
    description: string
    active: boolean
    required?: boolean
  }

  const NavLink = ({ section, activeSection, handleSectionClick }: { section: string, activeSection: string, handleSectionClick: (sectionId: string) => void }) => (
    <Link
        href="#"
        className={`block p-2 rounded-md ${
            activeSection === section ? "font-semibold bg-white text-black-500" : "hover:bg-gray-200"
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
      key: "Requirements",
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
      key: "scope",
      icon: <ScopeIcon />,
      description: "Add regular paragraphs to convey your main content. This will enhance the scope of your project.",
      active: false,
      required: true
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


const ProjectLayout = ({ project }: { project: any }) => {
    const [projectDetails, setProjectDetails] = useState(project)
  
    const [components, setComponents] = useState<MenuItemType[]>(() => {
        return menuItems.map(item => ({
            ...item,
            active: ['description', 'objectives', 'requirements', 'stakeholders','scope'].includes(item.key.toLowerCase())
        }));
    });
  
    const updateProjectMutation = useMutation(api.projects.updateProject);

    const [activeSection, setActiveSection] = useState<string>("description");

    const [isModalOpen, setIsModalOpen] = useState(false); // State to control modal visibility

    // Toggle modal visibility
    const toggleModal = () => {
        setIsModalOpen(!isModalOpen);
    };
  
    useEffect(() => {
        if (project) {
            setComponents(prevComponents => prevComponents.map(component => {
                if (project[component.key] && project[component.key].length > 0) {
                    return { ...component, active: true, required: true };
                }
                return component;
            }));
        }
    }, [project]);
    

    const handleSectionClick = (sectionId: string) => {
        setActiveSection(sectionId);
        const element = document.getElementById(sectionId);
        if (element) {
            element.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });
        }
    };

    const onEditorBlur = async () => {
        try {
          console.log('time for API call', projectDetails);
          const { _creationTime, createdAt, updatedAt, userId, ...payload } = projectDetails
          await updateProjectMutation(payload)
        } catch (error) {
          console.log('error updating project', error);
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
    
    const handleEditorChange = (event: any, editor: InlineEditor, attribute: string) => {
        const data = editor.getData();
        setProjectDetails({ ...projectDetails, [attribute]: data });
    };

    return (
        <div className="flex h-screen w-full px-0 mt-0">
            <main className="flex-1 w-full pr-8 pl-8 pt-8 overflow-auto">
                <div className="bg-white sticky top-0 z-10 flex items-center justify-between pt-8 pb-8 justify-items-center gap-4">
                    <LabelToInput value={projectDetails.title}
                    setValue={(val) => setProjectDetails({ ...projectDetails, title: val })}
                    onBlur={onEditorBlur} />
                    <div className="flex gap-4"> 
                        <Dialog>
                            <DialogTrigger asChild>
                                <Button variant="outline">Project Elements</Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-[800px] max-h-[85vh] overflow-y-auto">
                                <DialogHeader>
                                    <DialogTitle>Select Additional Project Elements</DialogTitle>
                                </DialogHeader>
                                <ul className="grid gap-3 p-4">
                                    {components.map((component, index) => (
                                        <li key={toTitleCase(component.key)}
                                            className={`flex justify-center items-center p-4 gap-4 ${component.active ? "border border-black" : "border"} p-2 rounded cursor-pointer select-none`}
                                            onClick={() => !component.required && handleItemClick(index)}>
                                            <div>{component.icon}</div>
                                            <div>
                                                <p className="text-sm font-bold">{toTitleCase(component.key)}</p>
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
                                    <DialogClose>
                                        <Button>Close</Button>
                                    </DialogClose>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                        <Button>Generate Epics</Button>
                    </div>                 
                </div>

                <div className="flex items-start space-x-8">
                <div className="w-60 bg-secondary p-4 rounded-md sticky top-[106px] self-start h-auto overflow-y-auto">
                <nav className="space-y-2">
                {components.map(component => (
                                    component.active && (
                                        <NavLink
                                            key={component.key}
                                            section={component.key}
                                            activeSection={activeSection}
                                            handleSectionClick={handleSectionClick}
                                        />
                                    )
                                ))}
                            </nav>
            </div>

                    <div className=" flex-row space-y-4 w-full justify-between pb-[420px]">
                    {components.map(c => {
                        if (c.active) {
                            return (
                            <div key={c.key} id={c.key} className="border rounded-lg scroll-mt-[140px] p-3 min-h-[600px]">
                                <h1 className="text-slate-900 pl-2 text-2xl font-semibold leading-[44.16px]">
                                {toTitleCase(c.key)}
                                </h1>

                                <div className="prose max-w-none">
                                        <CKEditor
                                        editor={InlineEditor}
                                        data={projectDetails[c.key]}
                                        onBlur={() => onEditorBlur()}
                                        onChange={(event, editor) => handleEditorChange(event, editor, c.key)}
                                        config={{
                                        placeholder: c.description,
                                        toolbar: [
                                            "bold",
                                            "italic",
                                            "link",
                                            "bulletedList",
                                            "numberedList",
                                        ],
                                        removePlugins: [
                                            "BalloonToolbar",
                                            "BalloonToolbarUI",
                                            "EasyImage",
                                            "CKFinder",
                                        ],
                                        ui: {
                                            viewportOffset: { top: 0, right: 0, bottom: 0, left: 0 }
                                        }
                                    }}
                                    />
                                </div>
                            </div>
                            )
                        }
                    })}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default ProjectLayout;