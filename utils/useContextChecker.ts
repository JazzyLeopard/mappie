import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { ConvexHttpClient } from "convex/browser";

interface contextCheckerProps {
    projectId: Id<"projects">
}
const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export const useContextChecker = async ({ projectId }: contextCheckerProps) => {

    console.log(projectId);

    const documents = await convex.query(api.documents.getDocuments, { projectId })
    console.log("Reference Docs", documents);

    let prompt = "";

    if (!documents || documents.length === 0) {
        return prompt;
    }
    else {

        prompt = `To help provide more accurate and contextually relevant content, the following reference documents have been uploaded for this project. These documents contain important information that can be used to guide and improve the content generation process for any section of the project. Please ensure that the content generated is aligned with the summarized information from these documents:\n\n`;

        const summaries = documents.map((doc: { summarizedContent: any; }) => {
            return doc.summarizedContent
        })

        for (let i = 0; i < summaries.length; i++) {
            prompt += `Document No ${i + 1} \r\n
                        ${summaries[i]}`

        }

        console.log(prompt)
        return prompt
    }

}
