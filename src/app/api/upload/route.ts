import { NextResponse } from "next/server";
import { writeFile } from "fs/promises";
import path from "path";
import sharp from "sharp";
import { createClient } from "@supabase/supabase-js";

// Optional Supabase client (only initialized if env vars are present)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = (supabaseUrl && supabaseKey) ? createClient(supabaseUrl, supabaseKey) : null;

export async function POST(req: Request) {
  try {
    const url = new URL(req.url);
    const shouldCrop = url.searchParams.get("crop") === "true";
    
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    let buffer = Buffer.from(bytes);
    let extension = path.extname(file.name) || (file.type === "application/pdf" ? ".pdf" : ".bin");
    let contentType = file.type || "application/octet-stream";

    // Only apply sharp if it's an image and we requested a crop
    if (file.type.startsWith("image/") && shouldCrop) {
      try {
        buffer = await sharp(buffer)
          .resize(800, 533, {
            fit: "cover",
            position: "top",
          })
          .jpeg({ quality: 85 })
          .toBuffer();
        extension = ".jpg";
        contentType = "image/jpeg";
      } catch (sharpError) {
        console.error("Error processing image with sharp:", sharpError);
      }
    }

    // Create a unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const basename = path.basename(file.name, path.extname(file.name)).replace(/[^a-zA-Z0-9]/g, "_");
    const filename = `${basename}-${uniqueSuffix}${extension}`;
    
    // Upload to Supabase Storage if configured
    if (supabase) {
      const { data, error } = await supabase
        .storage
        .from('uploads') // Ensure this bucket exists and is public in Supabase!
        .upload(filename, buffer, {
          contentType: contentType,
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        throw new Error("Supabase Storage error: " + error.message);
      }
      
      const { data: publicUrlData } = supabase.storage.from('uploads').getPublicUrl(filename);
      return NextResponse.json({ url: publicUrlData.publicUrl });
    } else {
      // Fallback to local storage (will not work on Vercel)
      const uploadPath = path.join(process.cwd(), "public/uploads", filename);
      await writeFile(uploadPath, buffer);
      return NextResponse.json({ url: `/uploads/${filename}` });
    }
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Failed to upload file" }, { status: 500 });
  }
}
