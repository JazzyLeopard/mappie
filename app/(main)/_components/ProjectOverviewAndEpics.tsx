"use client";
import Link from "next/link";

interface WriteProjectInfoProps {
  projectId: string;
  projectTitle: string;
}

const ProjectOverviewAndEpics: React.FC<WriteProjectInfoProps> = ({
  projectTitle,
  projectId,
}) => {
  return (
    <div className="grid gap-4">
      <h1 className="text-slate-900 text-5xl font-semibold leading-[48px] mt-10">
        {projectTitle}
      </h1>

      <div className="grid">
        <Link
          href={`/projects/${projectId}`}
          className=" w-full text-slate-900 text-2xl font-semibold leading-loose rounded py-3 px-3 hover:bg-slate-400/10"
        >
          Project Overview
        </Link>
        <Link
          href={`/projects/${projectId}/epics`}
          className=" w-full text-slate-900 text-2xl font-semibold leading-loose rounded py-3 px-3 hover:bg-slate-400/10"
        >
          Epics
        </Link>
      </div>
    </div>
  );
};

export default ProjectOverviewAndEpics;
