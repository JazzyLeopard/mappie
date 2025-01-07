import { clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const client = await clerkClient();
    const totalCount = await client.users.getCount();
    return NextResponse.json({ count: totalCount });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ count: 0 }, { status: 500 });
  }
} 