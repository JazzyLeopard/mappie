'use client';
import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import RisksIcon from "@/icons/RisksIcon";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, ChevronsUp, DollarSign, Sparkles, UserCheck } from "lucide-react";
import UnLinkIcon from "@/icons/UnLinkIcon";
import SparklesLight from "@/icons/SparklesLight";
import { toTitleCase } from "@/utils/helper";
import BoldRoundCheckmark from "@/icons/BoldRoundCheckmark";
import RoundCheckmark from "@/icons/RoundCheckmark";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import InlineEditor from "@ckeditor/ckeditor5-build-inline";
import LabelToInput from "@/app/(main)/_components/LabelToInput";

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

const AdditionalSteps = ({ project, onAdditionalBackClick }: { project: any, onAdditionalBackClick: () => void }) => {
  const [projectDetails, setProjectDetails] = useState(project)
 
  const [components, setComponents] = useState<MenuItemType[]>([]);

  const updateProjectMutation = useMutation(api.projects.updateProject);

  useEffect(() => {
    if (project) {
      const menu = menuItems;
      Object.keys(project).forEach(ok => {
        if (project[ok] && project[ok].length > 0) {
          menu.forEach(m => {
            if (m.key == ok) {
              m.active = true;
              m.required= true;
            }
          })
        }
      })
      setComponents(menu)
    }
  }, [project])
  // Use a timeout to debounce the input changes

  const handleEditorChange = (event: any, editor: InlineEditor, attribute: string) => {
    const data = editor.getData();
    setProjectDetails({ ...projectDetails, [attribute]: data });
  };

  onAdditionalBackClick() //calling previous question

  function handleItemClick(index: number): void {
    const newComponents = components.map((component, i) => {
      if (i === index) {
        return { ...component, active: !component.active };
      }
      return component;
    });
    setComponents(newComponents);
  }

  const onEditorBlur = async () => {
    try {
      console.log('time for API call', projectDetails);
      const { _creationTime, createdAt, updatedAt, userId, ...payload } = projectDetails
      // payload.onboarding = const step
      await updateProjectMutation(payload)
    } catch (error) {
      console.log('error updating project', error);
    }
  };

  return (
    <>
        <Card>
        <LabelToInput value={projectDetails.title}
          setValue={(val) => setProjectDetails({ ...projectDetails, title: val })}
          onBlur={onEditorBlur} />
            <CardHeader>
                <CardTitle className="mb-4">Which other elements do you want to add to your project overview?</CardTitle>
                <CardTitle className="w-full h-12 flex items-center rounded-xl p-4 text-sm font-medium bg-[#f1f5f9]"><Sparkles stroke="#FB8C00"/>
                  &nbsp;&nbsp;Select elements and complete with AI</CardTitle>
            </CardHeader>
            <CardDescription className="flex justify-center items-center flex-col m-6">
            <ul className="grid grid-cols-2 gap-4">
            {components.map((component, index) => (
                    <div
                      key={toTitleCase(component.key)}
                      className={`flex justify-center items-center gap-3 ${component.active === true ? "border border-black" : "border"} p-2 rounded cursor-pointer select-none`}
                      onClick={() => !component.required && handleItemClick(index)}
                    >
                      <div>{component.icon}</div>
                      <div>
                        <p className="text-sm font-bold">{toTitleCase(component.key)}</p>
                        <p className="text-sm">{component.description}</p>
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
            </ul>

            <div className="grid grid-cols-6 gap-6 mt-10">
                {components.map(c => {
                  if (c.active) {
                    return (
                      <div key={c.key} className="border p-3 col-span-6">
                        <h1 className="text-slate-900 text-4xl font-semibold leading-[44.16px]">
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
                            }}
                          // className="ck-editor__editable_inline ck-focused"
                          />
                        </div>
                      </div>
                    )
                  }
                })}
            </div>
                <Button className="my-5"><SparklesLight/>&nbsp;&nbsp;Complete selected elements with AI</Button>
            </CardDescription>
            {/* <CardFooter className="mt-5 flex justify-between">
                <Button variant="outline">
                    <ChevronLeft className="h-4 w-4 ml-1" onClick={handleBack} />
                    Back
                </Button>
                <Button variant="outline">
                    Continue without AI completion
                    <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
            </CardFooter> */}
        </Card>
    </>
  );
};

export default AdditionalSteps;
