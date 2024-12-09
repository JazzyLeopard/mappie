import { clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const client = await clerkClient();
    const users = await client.users.getUserList();
    return NextResponse.json({ count: users.totalCount });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ count: 0 }, { status: 500 });
  }
} 