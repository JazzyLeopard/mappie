'use client';
import React, { useEffect, useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardFooter,
  CardContent
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import SparklesLight from "@/icons/SparklesLight";
import { toTitleCase } from "@/utils/helper";
import BoldRoundCheckmark from "@/icons/BoldRoundCheckmark";
import RoundCheckmark from "@/icons/RoundCheckmark";
import { MenuItemType } from "@/lib/types";
import { menuItems } from "./constants";
import { Underdog } from "next/font/google";

const AdditionalSteps = ({ project, onBackClick, onContinueClick }: { project: any, onBackClick: () => void, onContinueClick: (activeComponents: MenuItemType[]) => void }) => {

  const [components, setComponents] = useState<MenuItemType[]>([]);

  useEffect(() => {
    if (project) {
      const menu = menuItems.filter(item => ['targetAudience', 'constraints', 'budget', 'dependencies', 'priorities', 'risks'].includes(item.key));
      Object.keys(project).forEach(ok => {
        if (project[ok] && project[ok].length > 0) {
          menu.forEach(m => {
            if (m.key == ok) {
              m.active = true;
              m.required = true;
            }
          })
        }
      })
      setComponents(menu)
    }
  }, [project])
  // Use a timeout to debounce the input changes

  function handleItemClick(index: number): void {
    const newComponents = components.map((component, i) => {
      if (i === index) {
        return { ...component, active: !component.active };
      }
      return component;
    });
    setComponents(newComponents);
  }

  const handleOnBackClick = () => {
    onBackClick()
  }

  const handleOnContinue = () => {
    const activeComponents = components.filter(component => component.active)
    console.log("active:", activeComponents);
    sessionStorage.setItem("activeComponents", JSON.stringify(activeComponents));
    onContinueClick(activeComponents)
  }

  const handleAICompletion = async () => {
    // Collect pre-filled fields

    const preFilled = [
      { key: "description", value: project.description || "" },
      { key: "objectives", value: project.objectives || "" },
      { key: "requirements", value: project.requirements || "" },
      { key: "stakeholders", value: project.stakeholders || "" },
    ];

    // Define required fields
    const required = components
      .filter(component => component.active)
      .map(component => ({
        key: component.key,
        value: project[component.key] // Assuming project contains the necessary fields
      }));

    // Prepare payload
    const payload = {
      preFilled,
      required
    };

    console.log("Payload", payload)

    try {
      const response = await fetch('/api/complete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (response.ok) {
        console.log('AI Response:', result.response);
        // Handle the AI response as needed
      } else {
        console.error('Error from AI:', result.error);
      }
    } catch (error) {
      console.error('Error calling AI API:', error);
    }
  };

  return (
    <>
      <Card className="mt-16 mx-24">
        <CardHeader>
          <CardTitle className="mb-4">Which other elements do you want to add to your project overview?</CardTitle>
          <div className="h-12 flex items-center rounded-xl p-4 text-sm font-medium bg-[#f1f5f9]"><Sparkles stroke="#FB8C00" />
            &nbsp;&nbsp;Select elements and complete with AI</div>
        </CardHeader>
        <CardContent className="flex justify-center items-center flex-col p-0">
          <div className="grid grid-cols-2 gap-6 w-[calc(100%-60px)]">
            {components.map((component, index) => (
              <div
                key={toTitleCase(component.key)}
                className={`flex justify-center items-center gap-8 ${component.active === true ? "border border-black" : "border"} p-3 rounded cursor-pointer select-none`}
                onClick={() => !component.required && handleItemClick(index)}
              >
                <div>{component.icon}</div>
                <div>
                  <p className="text-sm font-bold">{toTitleCase(component.key)}</p>
                  <p className="text-sm mt-1">{component.description}</p>
                </div>
                <div>
                  {component.active === true ? (
                    <BoldRoundCheckmark />
                  ) : (
                    <RoundCheckmark />
                  )}
                </div>
              </div>
            ))}
          </div>
          <Button className="my-6" onClick={handleAICompletion}>
            <SparklesLight />&nbsp;&nbsp;Complete selected elements with AI
          </Button>
        </CardContent>
        <CardFooter className="mt-5 flex justify-between">
          <Button variant="outline" onClick={handleOnBackClick}>
            <ChevronLeft className="h-4 w-4 ml-1" />
            Back
          </Button>
          <Button variant="outline" onClick={handleOnContinue}>
            Continue without AI completion
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </CardFooter>
      </Card>
    </>
  );
};

export default AdditionalSteps;