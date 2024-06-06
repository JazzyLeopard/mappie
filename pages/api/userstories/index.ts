import { NextApiRequest, NextApiResponse } from "next";
import { api } from "@/convex/_generated/api"; // Ensure this import path is correct
import { createUserStory } from "@/convex/epics";

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {
	if (req.method === "POST") {
		// const userStoryId = await createUserStory({
		// 	epicId: "123",
		// 	title: "Test User Story",
		// 	description: "This is a test user story",
		// 	acceptanceCriteria:
		// 		"The user story should be completed",
		// 	interfaceElements:
		// 		"The user story should be completed",
		// 	inScope: "The user story should be completed",
		// 	outOfScope: "The user story should be completed",
		// 	accessibilityInfo:
		// 		"The user story should be completed",
		// 	functionalFlow: "The user story should be completed",
		// });
		// res.status(200).json({ userStoryId });
	} else {
		res.status(405).end(); // Method Not Allowed
	}
}
