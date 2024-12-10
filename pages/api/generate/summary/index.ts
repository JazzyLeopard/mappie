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

async function uploadSummaryToConvex(content: string) {

    // Get upload URL from Convex
    const uploadUrl = await convex.mutation(api.documents.generateUploadUrl);

    // Create blob with markdown content
    const summaryBlob = new Blob([content], { type: 'text/markdown' });

    // Upload to Convex storage
    const uploadResponse = await fetch(uploadUrl, {
        method: "POST",
        headers: {
            "Content-Type": "text/markdown",
        },
        body: summaryBlob,
    });

    console.log("Upload response", uploadResponse)

    if (!uploadResponse.ok) {
        throw new Error(`Failed to upload summary file: ${uploadResponse.statusText}`);
    }

    const { storageId } = await uploadResponse.json();
    return { storageId };
}

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

        const { projectId, storageId, filename, size } = req.body;
        const convexProjectId = projectId as Id<"projects">

        // Get original file
        const getFileById = await convex.query(api.documents.getStorageById, { storageId })
        const getStorageURL = await convex.query(api.documents.getStorageURL, { storageId })

        if (getStorageURL && getFileById) {
            const fileResponse = await axios.get(getStorageURL, {
                responseType: 'arraybuffer'  // Use 'arraybuffer' to get the raw file content
            });
            const fileContent = fileResponse?.data
            console.log("File Content", fileContent);

            let extractedText = '';

            // Extract text based on file type
            if (getFileById.contentType === "application/pdf") {
                // Extract text from PDF
                const pdfData = await pdfParse(fileContent);
                extractedText = pdfData.text;
            } else if (getFileById.contentType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
                getFileById.contentType === "text/plain" ||
                getFileById.contentType === "text/markdown") {
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
                messages: [{ role: "user", content: `Act as a professional document summarizer. Summarize the following document in markdown format, highlighting key points and main ideas: ${extractedText}` }],
                temperature: 0.7,
            })

            const summarizedContent = response.text;
            console.log("Summarized content:-", summarizedContent);

            if (!summarizedContent) {
                throw new Error("No content generated from OpenAI")
            }

            // Upload summary file to Convex
            console.log("Uploading summary to Convex...");
            const { storageId: summaryId } = await uploadSummaryToConvex(
                summarizedContent,
            );
            console.log("Summary file uploaded with ID:", summaryId);

            // Save document record
            let document = await convex.mutation(api.documents.saveDocument, {
                projectId: convexProjectId,
                storageId: storageId,
                summaryId: summaryId,
                filename: filename,
                size: size
            })

            console.log("document saved", document)

            return res.status(200).json({
                message: "File processed successfully",
                summaryId: summaryId,
                document: document
            });
        }
    } catch (error) {
        console.error("Error processing file:", error);
        if (error instanceof Error) {
            console.error('Error message:', error.message);
            console.error('Error stack:', error.stack);
        }
        return res.status(500).json({
            message: "File processing failed",
            error: error instanceof Error ? error.message : String(error)
        });
    }
}