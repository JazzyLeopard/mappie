/**
 * v0 by Vercel.
 * @see https://v0.dev/t/39pYKzqyX3o
 * Documentation: https://v0.dev/docs#integrating-generated-code-into-your-nextjs-app
 */
"use client"

import LabelToInput from "../LabelToInput";
import '@/app/custom.css';
import React, { useEffect, useState, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import FieldList from "./FieldList";
import type { Epic, MenuItemType, Project } from "@/lib/types";
import EditorList from "./EditorList";
import { Presentation, Rocket } from "lucide-react";
import PresentationMode from '../PresentationMode';
import { useRouter, usePathname } from "next/navigation"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { X } from "lucide-react";
import { isEqual } from 'lodash';

interface CommonLayoutProps {
    data: Project | Epic ;
    menu: MenuItemType[];
    onEditorBlur: () => Promise<void>;
    updateLabel: (val: string) => void;
    handleEditorChange: (attribute: string, value: any) => void,
    showTitle?: boolean;
}

const CommonLayout = ({ data, menu, onEditorBlur, updateLabel, handleEditorChange, showTitle = true }: CommonLayoutProps) => {
    const [activeSection, setActiveSection] = useState<string>('');
    const [isPresentationMode, setIsPresentationMode] = useState(false);
    const [isBrainstormChatOpen, setIsBrainstormChatOpen] = useState(false);
    const [showAlert, setShowAlert] = useState(false);

    useEffect(() => {
        if (!activeSection && menu.length > 0) {
            setActiveSection(menu[0].key);
        }
    }, [menu, activeSection]);

    const togglePresentationMode = () => {
        setIsPresentationMode(!isPresentationMode);
    };

    const handleOpenBrainstormChat = () => {
        setIsBrainstormChatOpen(true);
    };

    const memoizedHandleEditorChange = useCallback((attribute: string, value: any) => {
        handleEditorChange(attribute, value);
    }, [handleEditorChange]);

    if (isPresentationMode) {
        return <PresentationMode data={data} onClose={() => setIsPresentationMode(false)} />;
    }

    const handleUpdateLabel = (newValue: string) => {
        console.log("Updating label in CommonLayout:", newValue);
        updateLabel(newValue);
    };

    const handleLabelBlur = () => {
        console.log("Label blur in CommonLayout");
        onEditorBlur();
    };

    console.log("Current data in CommonLayout:", data);

    return (
        <div className="h-screen flex flex-col z-top">
            {showAlert && (
                <Alert className="mt-16 ml-8 mr-8 bg-primary/5 w-4/4 text-primary relative">
                    <Rocket className="h-5 w-5" />
                    <AlertTitle className="text-md">Welcome!</AlertTitle>
                    <AlertDescription>
                    This is your PRD, your product/project requirements document. This is where all of the business information related to your product or project lives.<br />
                    This tool uses the information you specify here to help you create all the necessary parts of your analysis to have development-ready user stories.
                    </AlertDescription>
                    <Button
                        className="absolute top-2 right-2 p-1"
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowAlert(false)}
                    >
                        <X className="h-4 w-4" />
                    </Button>
                </Alert>
            )}

            <div className="bg-white sticky z-999 flex items-center justify-between px-8 pt-8 pb-2">
                {showTitle && (
                    <div className="flex-1 mr-4">
                        <LabelToInput
                            value={'title' in data ? data.title : data.name}
                            setValue={handleUpdateLabel}
                            onBlur={handleLabelBlur}
                        />
                    </div>
                )}

                <div className="flex items-center gap-4 ml-auto">
                    <Button
                        className="bg-white text-black border border-gray-300 hover:bg-gray-200"
                        onClick={togglePresentationMode}
                    >
                        <Presentation className="pr-2" />
                        Presentation Mode
                    </Button>
                </div>
            </div>

            <div className="overflow-hidden grid grid-cols-[250px,1fr] gap-8 px-8 pt-10">
                <div className="align-top">
                    <FieldList
                        components={menu}
                        activeSection={activeSection}
                        setActiveSection={setActiveSection}
                    />
                </div>
                <div className="overflow-hidden">
                    <EditorList 
                        components={menu.filter(c => c.key === activeSection)} 
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
