"use client";

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
			<div className="md:max-w-3xl lg:max-w-4xl mx-auto"></div>
		</div>
	);
};

export default ProjectIdPage;
