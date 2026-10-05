import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const topics = await prisma.topic.findMany({
      orderBy: { order: "asc" },
      include: {
        contents: {
          orderBy: { order: "asc" }
        }
      }
    });
    return NextResponse.json(topics);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch topics" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { title, description, imageUrl } = await req.json();
    
    // Shift all existing topics down by 1
    await prisma.topic.updateMany({
      data: {
        order: { increment: 1 }
      }
    });

    const topic = await prisma.topic.create({
      data: {
        title,
        description,
        imageUrl,
        order: 0
      }
    });
    return NextResponse.json(topic);
  } catch (error) {
    return NextResponse.json({ error: "Failed to create topic" }, { status: 500 });
  }
}
