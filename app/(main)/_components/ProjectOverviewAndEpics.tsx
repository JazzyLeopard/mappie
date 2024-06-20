"use client";
import Link from "next/link";

interface WriteProjectInfoProps {
  setProjectOverViewStep: React.Dispatch<React.SetStateAction<number>>;
}

const ProjectOverviewAndEpics:React.FC<WriteProjectInfoProps>  = ({setProjectOverViewStep}) => {

  const handleStep = () => {
    setProjectOverViewStep(2)
  }
  return (
    <div className="grid gap-4">
      <h1 className="text-slate-900 text-5xl font-semibold leading-[48px] mt-10">
        Project1
      </h1>

      <div className="grid">
        <div
          // href={"/oveview"}
          onClick={handleStep}
          className=" w-full text-slate-900 text-2xl font-semibold leading-loose py-3 rounded hover:bg-slate-400/10 px-3 cursor-pointer"
        >
          Project Overview
        </div>
        <Link
          href={"/oveview"}
          className=" w-full text-slate-900 text-2xl font-semibold leading-loose rounded py-3 px-3 hover:bg-slate-400/10"
        >
          Epics
        </Link>
      </div>
    </div>
  );
};

export default ProjectOverviewAndEpics;
