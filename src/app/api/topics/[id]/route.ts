import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const id = Number(params.id);
    
    // delete related contents first
    await prisma.content.deleteMany({
      where: { topicId: id }
    });

    await prisma.topic.delete({
      where: { id }
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete topic" }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    const { title, description, imageUrl, isHidden } = body;
    
    // Create an update object, only include defined fields
    const dataToUpdate: any = {};
    if (title !== undefined) dataToUpdate.title = title;
    if (description !== undefined) dataToUpdate.description = description;
    if (imageUrl !== undefined) dataToUpdate.imageUrl = imageUrl;
    if (isHidden !== undefined) dataToUpdate.isHidden = isHidden;

    const topic = await prisma.topic.update({
      where: { id: Number(params.id) },
      data: dataToUpdate
    });
    return NextResponse.json(topic);
  } catch (error) {
    return NextResponse.json({ error: "Failed to update topic" }, { status: 500 });
  }
}
