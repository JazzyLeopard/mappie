import { api } from '@/convex/_generated/api';
import { getAuth } from "@clerk/nextjs/server";
import { ConvexHttpClient } from 'convex/browser';
import { NextApiRequest, NextApiResponse } from 'next';

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

function generateRandomString(): string {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 10; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    try {
        const { userId, getToken } = getAuth(req);
        const token = await getToken({ template: "convex" });

        if (!token || !userId) {
            throw new Error('Authentication failed');
        }

        convex.setAuth(token);
        const { projectId } = req.body;

        // Handle DELETE request
        if (req.method === 'DELETE') {
            const existingShare = await convex.query(api.shareLink.getShareIdByProjectId, {
                projectId
            });

            if (!existingShare) {
                return res.status(404).json({ error: 'Share link not found' });
            }

            // Update the share status to false
            await convex.mutation(api.shareLink.create, {
                projectId,
                shareId: existingShare.shareId,
                userId,
                status: false
            });

            return res.json({ success: true });
        }

        // Handle POST request
        if (req.method === 'POST') {
            // First check if a share id already exists for this project
            const existingShareId = await convex.query(api.shareLink.getShareIdByProjectId, {
                projectId
            });

            if (existingShareId) {
                // Return existing shareId if found
                return res.json({ shareId: existingShareId.shareId });
            }

            // If no existing share found, create new one
            const shareId = generateRandomString();

            // Save to Convex database
            const shareLink = await convex.mutation(api.shareLink.create, {
                projectId,
                shareId,
                userId,
                status: true
            });

            return res.json({ shareId });
        }

        throw new Error('Method not allowed');
    } catch (error) {
        console.error('Share link operation error:', error);
        return res.status(500).json({ error: 'Failed to process share link operation' });
    }
}