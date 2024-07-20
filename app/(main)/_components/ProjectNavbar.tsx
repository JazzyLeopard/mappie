import ThreeDotMenuIcon from "@/icons/ThreeDotMenuIcon";
import { Slash } from "lucide-react";
import React, { useState } from "react";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

const ProjectNavbar = ({
  projectId,
  projectTitle,
}: {
  projectId: string;
  projectTitle: string;
}) => {
  return (
    <div
      className={`fixed top-0 flex pt-4 justify-between px-8 z-50 bg-white transition-all duration-30 ${"w-[calc(100vw-15rem)]"}`}
    >
      {/* <div className="flex flex-row w-full justify-between space-x-96">
            <h1>Project1 /  </h1>
            <div className="flex justify-center items-center space-x-6">
                <p>Share</p>
                <div>
                    <ThreeDotMenuIcon/>
                </div>
            </div>
            
        </div> */}

      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href={`/projects/${projectId}`}>
              {projectTitle}
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator>/</BreadcrumbSeparator>
          <BreadcrumbItem>
            <BreadcrumbLink href={`/projects/${projectId}/overview`}>
              Overview
            </BreadcrumbLink>
          </BreadcrumbItem>
          {/* <BreadcrumbSeparator>
          <Slash />
        </BreadcrumbSeparator> */}
        </BreadcrumbList>
      </Breadcrumb>

    </div>
  );
};

export default ProjectNavbar;
