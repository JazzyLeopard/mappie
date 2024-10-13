// Import necessary modules
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { ConvexHttpClient } from "convex/browser";
import formidable from "formidable";
import fs from "fs";
import mammoth from "mammoth";
import { NextApiRequest, NextApiResponse } from "next";
import OpenAI from "openai";
import pdfParse from "pdf-parse";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
})

// Disable body parsing so formidable can handle the file
export const config = {
    api: {
        bodyParser: false,
    },
};

// Helper function to parse form data using Formidable
const parseForm = (req: NextApiRequest): Promise<{ fields: any; files: any }> => {
    return new Promise((resolve, reject) => {
        const form = formidable({ multiples: true });
        form.parse(req, (err: any, fields: any, files: any) => {
            if (err) {
                console.error("Formidable parsing error:", err);
                reject(err);
            }
            resolve({ fields, files });
        });
    });
};


// Define the POST handler for the file upload
export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse,
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
        convex.setAuth(authToken);

        // Parse the incoming form data
        const { fields, files } = await parseForm(req);
        console.log("Parsed files:", files);
        console.log("Parsed fields:", fields);

        const projectId = Array.isArray(fields.projectId) ? fields.projectId[0] : fields.projectId;
        const convexProjectId = projectId as Id<"projects">

        const file = Array.isArray(files.file) ? files.file[0] : files.file;

        // Check if a file was uploaded
        if (!file || !file.filepath) {
            return res.status(400).json({ message: "No files received or file is invalid." });
        }

        // Convert the uploaded file into a Buffer
        const buffer = await fs.promises.readFile(file.filepath); // Read the file from the temporary location
        console.log("Buffer data:", buffer);

        // Store the file in Convex's file storage
        const storageId = await convex.action(api.documents.storeFile, {
            fileBuffer: buffer.toString('base64'),
        });
        console.log("File uploaded to Convex storage, storageId:", storageId);

        // Process the file based on its type
        let fileContent;
        if (file.originalFilename.endsWith(".pdf")) {
            // Extract text from the PDF file
            const pdfData = await pdfParse(buffer);
            fileContent = pdfData.text;
        } else if (file.originalFilename.endsWith(".doc") || file.originalFilename.endsWith(".docx")) {
            // Extract text from the Word (DOC/DOCX) file
            const docResult = await mammoth.extractRawText({ buffer });
            fileContent = docResult.value;
        } else {
            return res.status(400).json({ message: "Unsupported file type." });
        }

        // Log the extracted content to the console
        // console.log("Extracted content:", fileContent);

        console.log("Calling OpenAI Api...")
        const response = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [{ role: "user", content: `Please summarize the following content: ${fileContent}` }],
            temperature: 0.7,
        })

        const summarizedContent = response.choices[0].message.content;
        console.log("Summarized content:-", summarizedContent);

        if (!summarizedContent) {
            throw new Error("No content generated from OpenAI")
        }

        let document = await convex.mutation(api.documents.saveDocument, {
            projectId: convexProjectId,
            storageId: storageId,
            summarizedContent: summarizedContent,
            filename: file.originalFilename,
        })

        console.log("document saved", document)

        // Return a success response with the extracted content
        return res.status(200).json({
            message: "File processed successfully",
            // extractedContent: summarizedContent,
        });

    } catch (error) {
        console.error("Error processing file:", error);
        if (error instanceof Error) {
            console.error('Error message:', error.message);
            console.error('Error stack:', error.stack);
        }
        return res.status(500).json({ message: "File processing failed", error: error instanceof Error ? error.message : String(error) });
    }
}
