import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import axios from "axios";
import { ConvexHttpClient } from "convex/browser";

interface contextCheckerProps {
    projectId: Id<"projects">
}
const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export const useContextChecker = async ({ projectId }: contextCheckerProps) => {
    console.log(projectId);

    const summaryDocuments = await convex.query(api.documents.getSummaryByProjectId, { projectId })
    console.log("Reference Docs", summaryDocuments);

    let prompt = "";

    if (!summaryDocuments || summaryDocuments.length === 0) {
        return prompt;
    }
    else {

        prompt = `To help provide more accurate and contextually relevant content, the following reference documents have been uploaded for this project. These documents contain important information that can be used to guide and improve the content generation process for any section of the project. Please ensure that the content generated is aligned with the summarized information from these documents:\n\n`;

        await Promise.all(summaryDocuments.map(async (doc) => {
            if (doc.url) {
                try {
                    const fileResponse = await axios.get(doc.url, {
                        responseType: 'text'
                    });

                    const extractedText = fileResponse.data;

                    prompt += `Reference Document - ${doc.filename} \r\n
                                ${extractedText}`

                } catch (error) {
                    console.error("Error fetching document", error);
                    throw new Error("Error fetching document");
                }
            }
        }));
    }

    console.log(prompt);
    return prompt;
}
