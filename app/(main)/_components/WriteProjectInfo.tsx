/*"use client";
import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";

import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
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

type MenuItemType = {
  key: string;
  icon: React.JSX.Element;
  description: string
  active: boolean
  required?: boolean
}

const menuItems: MenuItemType[] = [
  {
    key: "description",
    icon: <PeopleIcon />,
    description: "Add regular paragraphs to convey your main content.",
    active: true,
    required: true
  },
  {
    key: "objectives",
    icon: <PeopleIcon />,
    description: "Add regular paragraphs to convey your main content.",
    active: true,
    required: true
  },
  {
    key: "stakeholders",
    icon: <PeopleIcon />,
    description: "Add regular paragraphs to convey your main content.",
    active: false,
  },
  {
    key: "scope",
    icon: <ScopeIcon />,
    description: "Add regular paragraphs to convey your main content.",
    active: false,
  },
  {
    key: "targetAudience",
    icon: <AudienceIcon />,
    description: "Add regular paragraphs to convey your main content.",
    active: false,
  },
  {
    key: "constraints",
    icon: <AlertIcon />,
    description: "Add regular paragraphs to convey your main content.",
    active: false,
  },
  {
    key: "budget",
    icon: <DollarIcon />,
    description: "Add regular paragraphs to convey your main content.",
    active: false,
  },
  {
    key: "dependencies",
    icon: <DependenciesIcon />,
    description: "Add regular paragraphs to convey your main content.",
    active: false,
  },
  {
    key: "priorities",
    icon: <PrioritiesIcon />,
    description: "Add regular paragraphs to convey your main content.",
    active: false,
  },
  {
    key: "risks",
    icon: <RisksIcon />,
    description: "Add regular paragraphs to convey your main content.",
    active: false,
  },
]

const WriteProjectInfo = ({ project }: { project: any }) => {
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
              m.required = true;
            }
          })
        }
      })
      setComponents(menu)
    }
  }, [project])
  // Use a timeout to debounce the input changes

  /*const handleEditorChange = (event: any, editor: InlineEditor, attribute: string) => {
    const data = editor.getData();
    setProjectDetails({ ...projectDetails, [attribute]: data });
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

  const handleItemClick = (index: any) => {
    const newComponents = components.map((component, i) => {
      if (i === index) {
        return { ...component, active: !component.active };
      }
      return component;
    });
    setComponents(newComponents);
  };


  return (
    <div>
      <div className="flex justify-between items-center">
        <LabelToInput value={projectDetails.title}
          setValue={(val) => setProjectDetails({ ...projectDetails, title: val })}
          onBlur={onEditorBlur} />

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
              </NavigationMenuContent>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <Link href="/project" legacyBehavior passHref>
                <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                  Generate Epics
                </NavigationMenuLink>
              </Link>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
      </div>

      <div className="grid grid-cols-6 gap-6 mt-10">
        {components.map(c => {
          if (c.active) {
            return (
              <div key={c.key} className="border p-3 col-span-6">
                <h1 className="text-slate-900 text-2xl font-semibold leading-[44.16px]">
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
    </div>
  );
};

export default WriteProjectInfo; */
