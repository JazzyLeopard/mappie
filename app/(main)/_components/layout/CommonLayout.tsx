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

interface CommonLayoutProps {
    data: Project | Epic;
    menu: MenuItemType[];
    onEditorBlur: () => Promise<void>;
    updateLabel: (val: string) => void;
    handleEditorChange: (attribute: string, value: any) => void
}

const CommonLayout = ({ data, menu, onEditorBlur, updateLabel, handleEditorChange }: CommonLayoutProps) => {

    const [components, setComponents] = useState<MenuItemType[]>(() => {
        return menu.map(item => ({
            ...item,
            active: ['description', 'objectives', 'requirements', 'stakeholders'].includes(item.key.toLowerCase()),
            data: data[item.key]
        }));
    });

    const [isModalOpen, setIsModalOpen] = useState(false); // State to control modal visibility

    // Toggle modal visibility
    const toggleModal = () => {
        setIsModalOpen(!isModalOpen);
    };

    useEffect(() => {
        // Retrieve active components from sessionStorage
        const storedActiveComponents = sessionStorage.getItem("activeComponents");
        if (storedActiveComponents) {
            const activeComponents = JSON.parse(storedActiveComponents);
            setComponents(prevComponents =>
                prevComponents.map(component => ({
                    ...component,
                    active: activeComponents.some((active: { key: string; }) => active.key === component.key) // Set active based on stored data
                }))
            );
        }
    }, []); // Run once on mount

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

    const handleItemClick = (index: number) => {
        const newComponents = components.map((component, i) => {
            if (i === index) {
                return { ...component, active: !component.active };
            }
            return component;
        });
        setComponents(newComponents);
    };

    return (
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
                                    {components.map((component, index) => {
                                        return (
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
                                        )
                                    })}
                                </ul>
                                <DialogFooter>
                                    <DialogClose asChild>
                                        <Button>Close</Button>
                                    </DialogClose>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                        <Button>Generate Epics</Button>
                    </div>
                </div>

                <div className="flex items-start space-x-8">
                    <FieldList components={components} />
                    <EditorList components={components} data={data} onEditorBlur={onEditorBlur} handleEditorChange={handleEditorChange} />
                </div>
            </main>
        </div>
    );
};

export default CommonLayout;