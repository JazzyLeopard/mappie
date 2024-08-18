/**
 * v0 by Vercel.
 * @see https://v0.dev/t/39pYKzqyX3o
 * Documentation: https://v0.dev/docs#integrating-generated-code-into-your-nextjs-app
 */
"use client"

import RoundCheckmark from "@/icons/RoundCheckmark";
import BoldRoundCheckmark from "@/icons/BoldRoundCheckmark";
import { toTitleCase } from "@/utils/helper";
import LabelToInput from "../LabelToInput";
import '@/app/custom.css';
import React, { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogDescription,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from "@/components/ui/dialog";
import { DialogClose } from "@radix-ui/react-dialog";
import FieldList from "./FieldList";
import type { Epic, MenuItemType, Project } from "@/lib/types";
import EditorList from "./EditorList";
import { MessageSquare, Presentation } from "lucide-react";
import PresentationMode from '../PresentationMode';
import { useRouter, usePathname } from "next/navigation"
import { debounce } from "lodash";

interface CommonLayoutProps {
    data: Project | Epic ;
    menu: MenuItemType[];
    onEditorBlur: () => Promise<void>;
    updateLabel: (val: string) => void;
    handleEditorChange: (attribute: string, value: any) => void,
    showTitle?: boolean;
}

const CommonLayout = ({ data, menu, onEditorBlur, updateLabel, handleEditorChange, showTitle = true }: CommonLayoutProps) => {

    const [components, setComponents] = useState<MenuItemType[]>(new Array(0))

    const router = useRouter()
    const pathname = usePathname()

    const [activeSection, setActiveSection] = useState<string>('');
    const [isModalOpen, setIsModalOpen] = useState(false); // State to control modal visibility
    const [isPresentationMode, setIsPresentationMode] = useState(false);
    const [isBrainstormChatOpen, setIsBrainstormChatOpen] = useState(false);

    useEffect(() => {
        if ('useCase' in data) {
            setComponents(menu)
            if (!activeSection) {
                setActiveSection(menu[0].key)
            }
        }
        else {
            const toBeAdded: MenuItemType[] = menu.map(item =>
            ({
                ...item,
                active: ['description', 'objectives', 'requirements', 'stakeholders'].includes(item.key.toLowerCase()),
                data: data[item.key]
            }));

            const activeComponents = JSON.parse(sessionStorage.getItem("activeComponents") as string) as MenuItemType[] || [];

            activeComponents.forEach((ac) => {
                const index = toBeAdded.findIndex(tba => tba.key === ac.key);
                if (index != -1) {
                    toBeAdded[index] = ac
                }
                else {
                    toBeAdded.push(ac)
                }
            });

            setComponents(toBeAdded);
            if (!activeSection) {
                setActiveSection(toBeAdded[0].key)
            }
            activeComponents.forEach((ac) => {
                if (ac.data?.length > 0) {
                    handleEditorChange(ac.key, ac.data)
                }
            })
        }

    }, [data, menu])


    // Toggle modal visibility
    const toggleModal = () => {
        setIsModalOpen(!isModalOpen);
    };

    const togglePresentationMode = () => {
        setIsPresentationMode(!isPresentationMode);
    };

    const handleOpenBrainstormChat = () => {
        setIsBrainstormChatOpen(true);
    };

    useEffect(() => {
        if (data) {
            setComponents(prevComponents => prevComponents.map(component => {
                if (data[component.key] && data[component.key].length > 0) {
                    return { ...component, active: true, required: true };
                }
                return component;
            }));
        }
    }, [data]);

    const handleRouteAnalysis = () => {
        router.push(`/projects/${data._id}/functional-requirements`)
    }

    const handleRouteUseCase = () => {
        router.push(`/projects/${data._id}/use-cases`)
    }

    if (isPresentationMode) {
        return <PresentationMode data={data} onClose={() => setIsPresentationMode(false)} />;
    }

    return (
        <div className="h-screen flex flex-col z-top">
            <div className="bg-white sticky top-10 z-999 flex items-center justify-between p-8">
                {showTitle &&
                    (
                        <div className="flex-1">
                            <LabelToInput
                                value={'title' in data ? data.title : data.name}
                                setValue={updateLabel}
                                onBlur={onEditorBlur}
                            />
                        </div>
                    )
                }

                <div className="flex items-center gap-4 ml-auto">
                    <Dialog>
                        <DialogTrigger asChild>
                            <Button variant="outline">
                                {'title' in data && "Project Elements"}
                                {'useCase' in data && "Analysis Elements"}
                                {'name' in data && "Epics Elements"}
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-[800px] max-h-[85vh] overflow-y-auto">
                            <DialogHeader>
                                <DialogTitle>Select Additional Project Elements</DialogTitle>
                            </DialogHeader>
                            <DialogDescription></DialogDescription>
                            <ul className="grid gap-3 p-4">
                                {components.map((component) => (
                                    <li key={toTitleCase(component.key)}
                                        className={`flex justify-center items-center p-4 gap-4 ${component.active ? "border border-black" : "border"} p-2 rounded cursor-pointer select-none`}
                                        onClick={() => {
                                            if (!component.required) {
                                                setComponents(prevComponents =>
                                                    prevComponents.map(c =>
                                                        c.key === component.key ? { ...c, active: !c.active } : c
                                                    )
                                                );
                                            }
                                        }}>
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
                                <DialogClose asChild>
                                    <Button>Close</Button>
                                </DialogClose>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                    <Button
                        className="bg-gradient-to-r from-gray-400 to-gray-60 text-white"
                        onClick={togglePresentationMode}
                    >
                        <Presentation className="pr-2" />
                        Presentation Mode
                    </Button>
                    {pathname === `/projects/${data._id}` &&
                        <Button onClick={handleRouteAnalysis}>
                            Generate Functional Requirements
                        </Button>
                    }
                    {pathname !== `/projects/${data._id}` && (
                        <Button>
                            Generate Epics
                        </Button>
                    )}
                    <Button onClick={handleRouteUseCase}>
                        Generate Use Cases
                    </Button>
                </div>
            </div>

            <div className="overflow-hidden grid grid-cols-[250px,1fr] gap-8 px-8 pt-10">
                <div className="align-top">
                    <FieldList
                        components={components}
                        activeSection={activeSection}
                        setActiveSection={setActiveSection}
                    />
                </div>
                <div className="overflow-hidden">
                    <EditorList 
                        components={components.filter(c => c.key === activeSection)} 
                        data={data}  
                        handleEditorChange={handleEditorChange}
                        onOpenBrainstormChat={handleOpenBrainstormChat}
                    />
                </div>
            </div>
        </div>
    );
};

export default CommonLayout;
