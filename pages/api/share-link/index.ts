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
        if (req.method !== 'POST') {
            throw new Error('Method not allowed');
        }

        const { userId, getToken } = getAuth(req);
        const token = await getToken({ template: "convex" });

        if (!token || !userId) {
            throw new Error('Authentication failed');
        }

        convex.setAuth(token);
        const { projectId } = req.body;

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

        console.log(shareLink)

        return res.json({ shareId });
    } catch (error) {
        console.error('Share link generation error:', error);
        return res.status(500).json({ error: 'Failed to generate share link' });
    }
}