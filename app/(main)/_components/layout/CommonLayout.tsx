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

interface CommonLayoutProps {
    data: Project | Epic;
    menu: MenuItemType[];
    onEditorBlur: () => Promise<void>;
    updateLabel: (val: string) => void;
    handleEditorChange: (attribute: string, value: any) => void
}

const CommonLayout = ({ data, menu, onEditorBlur, updateLabel, handleEditorChange }: CommonLayoutProps) => {

    const [components, setComponents] = useState<MenuItemType[]>(new Array(0))

    useEffect(() => {
        const toBeAdded: MenuItemType[] = menu.map(item => ({
            ...item,
            active: ['description', 'objectives', 'requirements', 'stakeholders'].includes(item.key.toLowerCase()),
            data: data[item.key]
        }));

        const activeComponents = JSON.parse(sessionStorage.getItem("activeComponents") as string) as MenuItemType[] | null;

        if (activeComponents) {
            activeComponents.forEach((ac) => {
                const index = toBeAdded.findIndex(tba => tba.key === ac.key);
                if (index != -1) {
                    toBeAdded[index] = ac;
                }
            });
        } else {
            console.log("No active components found in session storage");
        }

        setComponents(toBeAdded);

        if (activeComponents) {
            activeComponents.forEach((ac) => {
                if (ac.data?.length > 0) {
                    handleEditorChange(ac.key, ac.data)
                }
            })
        }

    }, [])



    const [activeSection, setActiveSection] = useState<string>("description");
    const [isModalOpen, setIsModalOpen] = useState(false); // State to control modal visibility
    const [isPresentationMode, setIsPresentationMode] = useState(false);
    const [isBrainstormChatOpen, setIsBrainstormChatOpen] = useState(false);

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

    if (isPresentationMode) {
        return <PresentationMode data={data} onClose={() => setIsPresentationMode(false)} />;
    }

    return (
        <>
            <div className="flex h-screen w-full px-0 mt-0">
                <main className="flex-1 w-full pr-8 pl-8 pt-8 overflow-auto">
                    <div className="bg-white sticky top-0 z-10 flex items-center justify-between pt-8 pb-8 justify-items-center gap-4">
                        <LabelToInput
                            value={'title' in data ? data.title : data.name}
                            setValue={updateLabel}
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
                                    <DialogDescription></DialogDescription>
                                    <ul className="grid gap-3 p-4">
                                        {components.map((component) => (
                                            <li key={toTitleCase(component.key)}
                                                className={`flex justify-center items-center p-4 gap-4 ${component.active ? "border border-black" : "border"} p-2 rounded cursor-pointer select-none`}
                                                onClick={() => {
                                                    if (!component.required) {
                                                        setComponents(prevComponents => 
                                                            prevComponents.map(c => 
                                                                c.key === component.key ? {...c, active: !c.active} : c
                                                            )
                                                        );
                                                    }
                                                }}>
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
                                        <DialogClose asChild>
                                            <Button>Close</Button>
                                        </DialogClose>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
                            <Button 
                                className="bg-gradient-to-r from-blue-400 to-pink-400 text-white"
                                onClick={togglePresentationMode}
                            >
                                <Presentation className="pr-2" />
                                Presentation Mode
                            </Button>
                            <Button>Start Analysis</Button>
                        </div>
                    </div>

                    <div className="flex items-start space-x-8">
                        <FieldList 
                            components={components} 
                            activeSection={activeSection}
                            setActiveSection={setActiveSection}
                        />
                        <div className="flex-1">
                            <EditorList 
                                components={components.filter(c => c.key === activeSection)} 
                                data={data} 
                                onEditorBlur={onEditorBlur} 
                                handleEditorChange={handleEditorChange}
                                onOpenBrainstormChat={handleOpenBrainstormChat}
                            />
                        </div>
                    </div>
                </main>
            </div>
            {isPresentationMode && (
                <PresentationMode data={data} onClose={() => setIsPresentationMode(false)} />
            )}
        </>
    );
};

export default CommonLayout;

