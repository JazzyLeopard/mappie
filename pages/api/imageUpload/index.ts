import { Id } from "@/convex/_generated/dataModel";
import { ConvexHttpClient } from "convex/browser";
import { NextApiRequest, NextApiResponse } from "next";
import { api } from "@/convex/_generated/api";
import axios from "axios";
import { createWorker } from "tesseract.js";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method !== "POST") {
        res.status(405).json({ message: "Method not allowed" });
        return;
    }

    const authHeader = req.headers.authorization;
    const authToken = authHeader && authHeader.split(' ')[1];

    if (!authToken) {
        res.status(401).json({ message: 'No authentication token provided' });
        return;
    }

    try {
        convex.setAuth(authToken)

        const { projectId, storageId, filename, itemId, itemType } = req.body
        const convexProjectId = projectId as Id<"projects">

        console.log("projectId", projectId, filename, itemId, itemType)

        const getImageStorageURL = await convex.query(api.imageUpload.getStorageURL, { storageId })
        console.log("getImageStorageURL", getImageStorageURL)

        const getImageStorageById = await convex.query(api.imageUpload.getStorageById, { storageId })
        console.log("getImageStorageById", getImageStorageById)

        if (getImageStorageURL && getImageStorageById) {
            const fileResponse = await axios.get(getImageStorageURL, {
                responseType: 'arraybuffer'
            });
            const fileContent = fileResponse?.data;
            console.log("File Content", fileContent);

            let extractedText = '';
            if (getImageStorageById?.contentType?.startsWith('image/')) {
                // Initialize Tesseract worker
                const worker = await createWorker('eng');
                const ret = await worker.recognize(fileContent);
                console.log("ret", ret)

                // Process different image types
                switch (getImageStorageById.contentType) {
                    case 'image/png':
                    case 'image/jpeg':
                    case 'image/jpg':
                        const { data: { text } } = await worker.recognize(fileContent);
                        extractedText = text;
                        break;

                    case 'image/svg+xml':
                        // For SVG, we might need to convert it to PNG first
                        // You can use sharp or other libraries for this
                        extractedText = "SVG content extraction not supported yet";
                        break;

                    default:
                        throw new Error(`Unsupported image type: ${getImageStorageById.contentType}`);
                }

                // Terminate the worker
                await worker.terminate();
            }

            console.log("Extracted Text:", extractedText);

            let storeContent = await convex.mutation(api.imageUpload.saveContent, {
                projectId: convexProjectId,
                imageStorageId: storageId,
                content: extractedText,
                itemId: itemId,
                itemType: itemType,
                filename: filename
            })

            console.log("storeContent", storeContent)

            return res.status(200).json({
                message: "File processed successfully",
                storeContent: storeContent
            });
        }
    }
    catch (error) {
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