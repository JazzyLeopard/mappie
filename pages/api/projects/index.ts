import { NextApiRequest, NextApiResponse } from "next";
import { createProject } from "@/convex/projects"; // Ensure correct path


export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {
	if (req.method === "POST") {
		const { title, userId, description, isPublished } =
			req.body;

		// Call the mutation with the correct context
		// const projectId = await createProject({
		// 	title,
		// 	userId,
		// 	description,
		// 	isPublished,
		// });

		res.status(200).json({
			// projectId
		});
	} else {
		res.status(405).end(); // Method Not Allowed
	}
}
