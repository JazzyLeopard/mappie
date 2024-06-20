"use client";
"use client";
import React, { useRef, useState } from "react";
import Link from "next/link";

import { cn } from "@/lib/utils";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { Textarea } from "@/components/ui/textarea";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import InlineEditor from "@ckeditor/ckeditor5-build-inline";
import StackHoldersIcon from "@/icons/StackHoldersIcon";
import RoundCheckmark from "@/icons/RoundCheckmark";
import BoldRoundCheckmark from "@/icons/BoldRoundCheckmark";
import ScopsIcon from "@/icons/ScopsIcon";
import AudienceIcon from "@/icons/AudienceIcon";
import AlertIcon from "@/icons/AlertIcon";
import DolarIcon from "@/icons/DolarIcon";
import DefendenciesIcon from "@/icons/DefendenciesIcon";
import PriritiesIcon from "@/icons/PriritiesIcon";
import RisksIcon from "@/icons/RisksIcon";

const WriteProjectInfo = () => {
  const editorRef = useRef();
  const [data, setData] = useState("");

  // const components: { title: string; icon: any; description: string, active: boolean }[] = [
  //   {
  //     title: " Project Stakeholders",
  //     icon: <StackHoldersIcon/>,
  //     description: "Add regular paragraphs to convey your main content.",
  //     active: true,
  //   },
  //   {
  //     title: "Project Scope",
  //     icon: <ScopsIcon/>,
  //     description: "Add regular paragraphs to convey your main content.",
  //     active: true,
  //   },
  //   {
  //     title: "Project Target Audience",
  //     icon: <AudienceIcon/>,
  //     description: "Add regular paragraphs to convey your main content.",
  //     active: false,
  //   },
  //   {
  //     title: "Project Constraints",
  //     icon: <AlertIcon/>,
  //     description: "Add regular paragraphs to convey your main content.",
  //     active: false,
  //   },
  //   {
  //     title: "Project Budget",
  //     icon: <DolarIcon/>,
  //     description: "Add regular paragraphs to convey your main content.",
  //     active: false,
  //   },
  //   {
  //     title: "Project Dependencies",
  //     icon: <DefendenciesIcon/>,
  //     description: "Add regular paragraphs to convey your main content.",
  //     active: false,
  //   },
  //   {
  //     title: "Project Priorities",
  //     icon: <PriritiesIcon/>,
  //     description: "Add regular paragraphs to convey your main content.",
  //     active: false,
  //   },
  //   {
  //     title: "Project Risks",
  //     icon: <RisksIcon/>,
  //     description: "Add regular paragraphs to convey your main content.",
  //     active: false,
  //   },
  // ];

  const [components, setComponents] = useState([
    {
      id: 1,
      title: " Project Stakeholders",
      icon: <StackHoldersIcon />,
      description: "Add regular paragraphs to convey your main content.",
      active: true,
    },
    {
      id: 2,
      title: "Project Scope",
      icon: <ScopsIcon />,
      description: "Add regular paragraphs to convey your main content.",
      active: true,
    },
    {
      id: 3,
      title: "Project Target Audience",
      icon: <AudienceIcon />,
      description: "Add regular paragraphs to convey your main content.",
      active: false,
    },
    {
      id: 4,
      title: "Project Constraints",
      icon: <AlertIcon />,
      description: "Add regular paragraphs to convey your main content.",
      active: false,
    },
    {
      id: 5,
      title: "Project Budget",
      icon: <DolarIcon />,
      description: "Add regular paragraphs to convey your main content.",
      active: false,
    },
    {
      id: 6,
      title: "Project Dependencies",
      icon: <DefendenciesIcon />,
      description: "Add regular paragraphs to convey your main content.",
      active: false,
    },
    {
      id: 7,
      title: "Project Priorities",
      icon: <PriritiesIcon />,
      description: "Add regular paragraphs to convey your main content.",
      active: false,
    },
    {
      id: 8,
      title: "Project Risks",
      icon: <RisksIcon />,
      description: "Add regular paragraphs to convey your main content.",
      active: false,
    },
  ]);

  const handleEditorChange = (event, editor: any) => {
    const data = editor.getData();
    setData(data);
  };

  const handleItemClick = (index: any) => {
    const newComponents = components.map((component, i) => {
      if (i === index) {
        return { ...component, active: !component.active };
      }
      return component;
    });
    setComponents(newComponents);
  };

  console.log(components[0]);

  return (
    <div>
      <div className="flex justify-between items-center">
        <h1 className="text-slate-900 text-5xl font-semibold leading-[48px] mt-10">
          Project1
        </h1>

        <NavigationMenu className="mt-10">
          <NavigationMenuList>
            <NavigationMenuItem>
              <NavigationMenuTrigger className="border">
                Project Elements
              </NavigationMenuTrigger>
              <NavigationMenuContent>
                <ul className="grid w-[300px] gap-3 p-4 md:w-[300px] md:grid-cols-1 lg:w-[400px] ">
                  <p className="text-sm font-semibold">
                    Select Additional Project Elements
                  </p>
                  {components.map((component, index) => (
                    // <ListItem
                    //   key={component.title}
                    //   title={component.title}
                    //   href={component.href}
                    // >
                    //   {component.description}
                    // </ListItem>
                    <div
                      key={component.title}
                      className={`flex justify-center items-center gap-3 ${component.active === true ? "border border-black" : "border"} p-2 rounded cursor-pointer select-none`}
                      onClick={() => handleItemClick(index)}
                    >
                      <div>{component.icon}</div>
                      <div>
                        <p className="text-sm font-bold">{component.title}</p>
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
              </NavigationMenuContent>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <Link href="/project" legacyBehavior passHref>
                <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                  Compare With AI
                </NavigationMenuLink>
              </Link>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
      </div>

      <div className="grid gap-3">
        <div className="border p-3 mt-10">
          <h1 className="text-slate-900 text-4xl font-semibold leading-[44.16px]">
            Project Description
          </h1>
          {/* <Textarea placeholder="Enter a description..."  className="border-none outline-none focus:border-none"/> */}

          <div className="prose max-w-none">
            <CKEditor
              editor={InlineEditor}
              data={data}
              onChange={handleEditorChange}
              config={{
                placeholder: "Enter a description...",
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
              attributes={{
                "data-placeholder": "Enter a description...",
              }}
              className="ck-editor__editable_inline ck-focused"
            />
          </div>
        </div>
        <div className="border p-3">
          <h1 className="text-slate-900 text-4xl font-semibold leading-[44.16px]">
            Project Objectives
          </h1>
          <Textarea
            placeholder={`
        • What is the main thing you want to achieve with this project?
        • What is another objective?
        • Any other objectives?
        `}
            className="border-none outline-none focus:border-none min-h-32"
          />
        </div>
        <div className="border p-3">
          <h1 className="text-slate-900 text-4xl font-semibold leading-[44.16px]">
            Project Requirements
          </h1>
          <Textarea
            placeholder={`
        • What is the main requirements? 
        • What is another requirement?
        • Any other requirements? 
        `}
            className="border-none outline-none focus:border-none min-h-32"
          />
        </div>
        <div className="flex flex-wrap justify-between gap-3">
          <div className="border p-3 w-[49%]">
            <h1 className="text-slate-900 text-4xl font-semibold leading-[44.16px]">
              Project Stakeholders
            </h1>
            <Textarea
              placeholder="Who are the stakeholders? "
              className="border-none outline-none focus:border-none"
            />
          </div>
          <div className="border p-3  w-[49%]">
            <h1 className="text-slate-900 text-4xl font-semibold leading-[44.16px]">
              Project Scope
            </h1>
            <Textarea
              placeholder="What is in/out of scope? "
              className="border-none outline-none focus:border-none"
            />
          </div>
          {components[2].active === true && (
            <div className="border p-3  w-[49%]">
              <h1 className="text-slate-900 text-4xl font-semibold leading-[44.16px]">
                Project Target Audience
              </h1>
              <Textarea
                placeholder="What is in/out of scope? "
                className="border-none outline-none focus:border-none"
              />
            </div>
          )}
          {components[3].active === true && (
            <div className="border p-3  w-[49%]">
              <h1 className="text-slate-900 text-4xl font-semibold leading-[44.16px]">
              Project Constraints
              </h1>
              <Textarea
                placeholder="What is in/out of scope? "
                className="border-none outline-none focus:border-none"
              />
            </div>
          )}
          {components[4].active === true && (
            <div className="border p-3  w-[49%]">
              <h1 className="text-slate-900 text-4xl font-semibold leading-[44.16px]">
              Project Budget
              </h1>
              <Textarea
                placeholder="What is in/out of scope? "
                className="border-none outline-none focus:border-none"
              />
            </div>
          )}
          {components[5].active === true && (
            <div className="border p-3  w-[49%]">
              <h1 className="text-slate-900 text-4xl font-semibold leading-[44.16px]">
              Project Dependencies
              </h1>
              <Textarea
                placeholder="What is in/out of scope? "
                className="border-none outline-none focus:border-none"
              />
            </div>
          )}
          {components[6].active === true && (
            <div className="border p-3  w-[49%]">
              <h1 className="text-slate-900 text-4xl font-semibold leading-[44.16px]">
              Project Priorities
              </h1>
              <Textarea
                placeholder="What is in/out of scope? "
                className="border-none outline-none focus:border-none"
              />
            </div>
          )}
          {components[7].active === true && (
            <div className="border p-3  w-[49%]">
              <h1 className="text-slate-900 text-4xl font-semibold leading-[44.16px]">
              Project Risks
              </h1>
              <Textarea
                placeholder="What is in/out of scope? "
                className="border-none outline-none focus:border-none"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WriteProjectInfo;
