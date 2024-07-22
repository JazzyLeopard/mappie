'use client';
import React, { useEffect, useState } from "react";
import RisksIcon from "@/icons/RisksIcon";
import {
  Card,
  CardHeader,
  CardTitle,
  CardFooter,
  CardContent
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, ChevronsUp, DollarSign, Sparkles, UserCheck } from "lucide-react";
import UnLinkIcon from "@/icons/UnLinkIcon";
import SparklesLight from "@/icons/SparklesLight";
import { toTitleCase } from "@/utils/helper";
import BoldRoundCheckmark from "@/icons/BoldRoundCheckmark";
import RoundCheckmark from "@/icons/RoundCheckmark";

type MenuItemType = {
  key: string;
  icon: React.JSX.Element;
  description: string
  active: boolean
  required?: boolean
}

const menuItems: MenuItemType[] = [
  {
    key: "Project Target Audience",
    icon: <UserCheck />,
    description: "Add regular paragraphs to convey your main content.",
    active: false,
  },
  {
    key: "Project Budget",
    icon: <DollarSign />,
    description: "Add regular paragraphs to convey your main content.",
    active: false,
  },
  {
    key: "Project Constraints",
    icon: <UnLinkIcon />,
    description: "Add regular paragraphs to convey your main content.",
    active: false,
  },
  {
    key: "Project Risks",
    icon: <RisksIcon />,
    description: "Add regular paragraphs to convey your main content.",
    active: false,
  },
  {
    key: "Project Dependencies",
    icon: <ChevronsUp />,
    description: "Add regular paragraphs to convey your main content.",
    active: false,
  },
  {
    key: "Project Priorites",
    icon: <ChevronsUp />,
    description: "Add regular paragraphs to convey your main content.",
    active: false,
  },
]

const AdditionalSteps = ({ project, onBackClick, onContinueClick }: { project: any, onBackClick: () => void, onContinueClick: () => void }) => {

  const [components, setComponents] = useState<MenuItemType[]>([]);


  useEffect(() => {
    if (project) {
      const menu = menuItems;
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
    console.log('clicked back in child');
    onBackClick()
  }

  const handleOnContinue = () => {
    onContinueClick()
  }

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
          <Button className="my-6"><SparklesLight />&nbsp;&nbsp;Complete selected elements with AI</Button>
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