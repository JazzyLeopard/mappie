import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import axios from "axios";
import mammoth from "mammoth";
import pdfParse from "pdf-parse";
import { ConvexHttpClient } from "convex/browser";
import { NextApiRequest, NextApiResponse } from "next";
import { openai } from '@ai-sdk/openai';
import { generateText } from 'ai';

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method !== "POST") {
        return res.status(405).json({ message: "Method not allowed" });
    }

    const authHeader = req.headers.authorization;
    const authToken = authHeader && authHeader.split(' ')[1];

    if (!authToken) {
        return res.status(401).json({ message: 'No authentication token provided' });
    }

    try {
        convex.setAuth(authToken)

        const { projectId, storageId, filename } = req.body;
        const convexProjectId = projectId as Id<"projects">

        // metadata API getStorageById(storageId) -> File
        const getFileById = await convex.query(api.documents.getStorageById, { storageId })
        console.log("Get file by storage Id", getFileById)

        // serve API getStorageURL(storageId) -> FilePath 
        const getStorageURL = await convex.query(api.documents.getStorageURL, { storageId })
        console.log("Get file by storage url", getStorageURL)

        if (getStorageURL && getFileById) {
            const fileResponse = await axios.get(getStorageURL, {
                responseType: 'arraybuffer'  // Use 'arraybuffer' to get the raw file content
            });
            const fileContent = fileResponse?.data
            console.log("File Content", fileContent);

            let extractedText = '';

            if (getFileById.contentType === "application/pdf") {
                // Extract text from PDF
                const pdfData = await pdfParse(fileContent);
                extractedText = pdfData.text;
            } else if (getFileById.contentType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
                // Extract text from DOCX
                const wordData = await mammoth.extractRawText({ buffer: fileContent });
                extractedText = wordData.value;
            } else {
                throw new Error(`Unsupported file type: ${getFileById.contentType}`);
            }

            console.log("Extracted Text:", extractedText);

            console.log("Calling OpenAI Api...")
            const response = await generateText({
                model: openai("gpt-4o-mini"),
                messages: [{ role: "user", content: `Please summarize the following content: ${extractedText}` }],
                temperature: 0.7,
            })

            const summarizedContent = response.text;
            console.log("Summarized content:-", summarizedContent);

            if (!summarizedContent) {
                throw new Error("No content generated from OpenAI")
            }

            let document = await convex.mutation(api.documents.saveDocument, {
                projectId: convexProjectId,
                storageId: storageId,
                summarizedContent: summarizedContent,
                filename: filename
            })

            console.log("document saved", document)

            return res.status(200).json({
                message: "File processed successfully",
                summarizedContent: summarizedContent
            });
        }
    } catch (error) {
        console.error("Error processing file:", error);
        if (error instanceof Error) {
            console.error('Error message:', error.message);
            console.error('Error stack:', error.stack);
        }
        return res.status(500).json({ message: "File processing failed", error: error instanceof Error ? error.message : String(error) });
    }
}