import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export async function POST(req: Request) {
  try {
    const { filename, contentType } = await req.json();
    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({ error: "Supabase not configured" }, { status: 500 });
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    const { data, error } = await supabase.storage.from('uploads').createSignedUploadUrl(filename);
    
    if (error || !data) {
      console.error("Signed URL error:", error);
      return NextResponse.json({ error: "Failed to create signed URL" }, { status: 500 });
    }
    
    const { data: publicUrlData } = supabase.storage.from('uploads').getPublicUrl(filename);
    
    return NextResponse.json({ 
      signedUrl: data.signedUrl,
      publicUrl: publicUrlData.publicUrl 
    });
  } catch (error) {
    console.error("Presign error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
