import { NextApiRequest, NextApiResponse } from "next";
// import { createEpic } from "@/convex/epics"; // Ensure correct path

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {
	if (req.method === "POST") {
		const {
			projectId,
			name,
			description,
			status,
			startDate,
			endDate,
			owner,
			priority,
			labels,
			dependencies,
		} = req.body;

		// Call the mutation with the correct context
		// const epicId = await createEpic({
		// 	projectId,
		// 	name,
		// 	description,
		// 	status,
		// 	startDate: startDate
		// 		? new Date(startDate).getTime()
		// 		: undefined,
		// 	endDate: endDate
		// 		? new Date(endDate).getTime()
		// 		: undefined,
		// 	owner,
		// 	priority,
		// 	labels,
		// 	dependencies,
		// });

		res.status(200).json({
			// epicId
		});
	} else {
		res.status(405).end(); // Method Not Allowed
	}
}
