import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const { topicId, text, linkUrl } = await req.json();
    const count = await prisma.content.count({ where: { topicId } });
    const content = await prisma.content.create({
      data: {
        topicId,
        text,
        linkUrl,
        order: count
      }
    });
    return NextResponse.json(content);
  } catch (error) {
    return NextResponse.json({ error: "Failed to create content" }, { status: 500 });
  }
}
