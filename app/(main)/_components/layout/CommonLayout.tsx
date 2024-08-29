/**
 * v0 by Vercel.
 * @see https://v0.dev/t/39pYKzqyX3o
 * Documentation: https://v0.dev/docs#integrating-generated-code-into-your-nextjs-app
 */
"use client"

import '@/app/custom.css';
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import BoldRoundCheckmark from "@/icons/BoldRoundCheckmark";
import RoundCheckmark from "@/icons/RoundCheckmark";
import type { Epic, MenuItemType, Project } from "@/lib/types";
import { toTitleCase } from "@/utils/helper";
import { DialogClose } from "@radix-ui/react-dialog";
import { Presentation } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from 'react';
import LabelToInput from "../LabelToInput";
import PresentationMode from '../PresentationMode';
import EditorList from "./EditorList";
import FieldList from "./FieldList";


interface CommonLayoutProps {
    data: Project | Epic;
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
        if ('name' in data) {
            setComponents(menu);

            if (!activeSection) {
                setActiveSection(menu[0].key);
            }
        } else {
            const activeComponents = JSON.parse(sessionStorage.getItem('activeComponents') as string) as MenuItemType[] || [];

            const toBeAdded: MenuItemType[] = menu.map(item => {

                const aiComponent = activeComponents.find(ac => ac.key === item.key);

                return {
                    ...item,
                    active: aiComponent ? true : ['description', 'objectives', 'requirements', 'stakeholders'].includes(item.key.toLowerCase()),
                    data: aiComponent ? aiComponent?.data : data[item.key],
                    key: item.key
                };
            });

            // Update components only if they have changed
            if (JSON.stringify(toBeAdded) !== JSON.stringify(components)) {
                setComponents(toBeAdded);
                if (!activeSection && toBeAdded.length > 0) {
                    setActiveSection(toBeAdded[0].key);
                }
            }
        }
    }, [data, menu]);


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
            setComponents(prevComponents => {
                const newComponents = prevComponents.map(component => {
                    if (data[component.key] && data[component.key].length > 0) {
                        return { ...component, active: true, required: true };
                    }
                    return component;
                });

                // Only update state if components have changed
                if (JSON.stringify(newComponents) !== JSON.stringify(prevComponents)) {
                    return newComponents;
                }
                return prevComponents;
            });
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
        <div className="h-screen flex flex-col z-top ">
            <div className="bg-white sticky top-10 z-999 flex items-center justify-between p-8 lg:w-full laptop-1024:flex-wrap laptop-1024:gap-4">
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

                <div className="flex items-center gap-4 ml-auto laptop-1024:flex-wrap">
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

            <div className="overflow-hidden grid grid-cols-[250px,1fr] gap-8 px-8 pt-10 laptop-1024:overflow-auto">
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
                        onEditorBlur={onEditorBlur}
                        handleEditorChange={handleEditorChange}
                        onOpenBrainstormChat={handleOpenBrainstormChat}
                    />
                </div>
            </div>
        </div>
    );
};

export default CommonLayout;
