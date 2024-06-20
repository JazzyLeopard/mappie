"use client";

import ProjectNavbar from "@/app/(main)/_components/ProjectNavbar";
import ProjectOverviewAndEpics from "@/app/(main)/_components/ProjectOverviewAndEpics";
import WriteProjectInfo from "@/app/(main)/_components/WriteProjectInfo";
import ThreeDotMenuIcon from "@/icons/ThreeDotMenuIcon";
import { useState } from "react";


// import { useQuery } from "convex/react";

// import { Id } from "@/convex/_generated/dataModel";
// import { api } from "@/convex/_generated/api";

interface ProjectIdPageProps {
  // params: {
  // 	projectId: Id<"projects">;
  // };
}


const ProjectIdPage = ({}: // params
ProjectIdPageProps) => {


  const [ProjectOverViewStep, setProjectOverViewStep] = useState(1);
  // const project = useQuery(api.projects.getById, {
  // 	projectId: params.projectId,
  // });

  // if (project === undefined) {
  // 	return <div>Loading...</div>;
  // }

  // if (project === null) {
  // 	return <div>Project not found</div>;
  // }

  return (
    <div className="pb-40">
      <div className="min-w-full md:max-w-3xl lg:max-w-4xl mx-auto">
        {/* <div className="pl-3"> */}
          <ProjectNavbar />
        {/* </div> */}
        <div className="pl-[96px]">
          {
            ProjectOverViewStep === 1 &&  <ProjectOverviewAndEpics setProjectOverViewStep={setProjectOverViewStep}/>
          }
          {ProjectOverViewStep === 2 &&  <WriteProjectInfo />}

        </div>
      </div>
    </div>
  );
};

export default ProjectIdPage;
