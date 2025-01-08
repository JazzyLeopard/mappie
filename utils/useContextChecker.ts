import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import axios from "axios";
import { ConvexHttpClient } from "convex/browser";

interface contextCheckerProps {
    projectId: Id<"projects">;
    token?: string;
}

export const useContextChecker = async ({ projectId, token }: contextCheckerProps) => {
    try {
        const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);
        
        if (!token) {
            throw new Error("Authentication token is required");
        }
        
        convex.setAuth(token);

        console.log('Checking context for project:', projectId);

        const project = await convex.query(api.projects.getProjectById, { 
            projectId 
        }).catch(error => {
            console.error('Project fetch error:', error);
            if (error.message?.includes('Not authenticated')) {
                throw new Error('Authentication failed - please log in again');
            }
            if (error.message?.includes('Project not found')) {
                throw new Error('Project not found or access denied');
            }
            throw new Error(`Failed to fetch project: ${error.message}`);
        });

        let prompt = `Project Overview:\n${project?.overview || ''}\n\n`;

        const summaryDocuments = await convex.query(api.documents.getSummaryByProjectId, { 
            projectId 
        }).catch(() => []);

        if (summaryDocuments?.length > 0) {
            prompt += `Reference Documents:\n`;
            await Promise.all(summaryDocuments.map(async (doc) => {
                if (doc.url) {
                    try {
                        const fileResponse = await axios.get(doc.url, {
                            responseType: 'text',
                            timeout: 5000 // 5 second timeout
                        });
                        prompt += `\nDocument: ${doc.filename}\n${fileResponse.data}\n`;
                    } catch (error) {
                        console.warn(`Failed to fetch document ${doc.filename}:`, error);
                    }
                }
            }));
        }

        return prompt;

    } catch (error) {
        console.error('Error in useContextChecker:', error);
        throw error;
    }
}
