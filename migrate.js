const Database = require('better-sqlite3');
const { PrismaClient } = require('@prisma/client');
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();
const db = new Database('prisma/dev.db');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function uploadFile(localPath) {
  if (!localPath.startsWith('/uploads/')) return localPath;

  const absolutePath = path.join(__dirname, 'public', localPath);
  if (!fs.existsSync(absolutePath)) {
    console.log('File not found:', absolutePath);
    return localPath;
  }

  const ext = path.extname(localPath);
  const sanitizedFilename = Date.now() + '_' + Math.random().toString(36).substring(7) + ext;

  const fileBuffer = fs.readFileSync(absolutePath);
  
  // infer content type
  let contentType = 'application/octet-stream';
  if (ext === '.jpg' || ext === '.jpeg') contentType = 'image/jpeg';
  if (ext === '.png') contentType = 'image/png';
  if (ext === '.pdf') contentType = 'application/pdf';

  console.log(`Uploading ${sanitizedFilename}...`);
  const { data, error } = await supabase.storage
    .from('uploads')
    .upload(sanitizedFilename, fileBuffer, {
      contentType,
      upsert: true
    });

  if (error) {
    console.error('Upload error:', error);
    return localPath;
  }

  const { data: publicUrlData } = supabase.storage.from('uploads').getPublicUrl(sanitizedFilename);
  return publicUrlData.publicUrl;
}

async function run() {
  console.log('Starting migration...');
  
  // Read from SQLite
  const topics = db.prepare('SELECT * FROM Topic').all();
  const contents = db.prepare('SELECT * FROM Content').all();

  // Delete all existing data in Postgres first to avoid conflicts (if any)
  await prisma.content.deleteMany();
  await prisma.topic.deleteMany();

  for (const topic of topics) {
    if (topic.imageUrl) {
      topic.imageUrl = await uploadFile(topic.imageUrl);
    }
    
    // Insert topic
    await prisma.topic.create({
      data: {
        id: topic.id,
        title: topic.title,
        description: topic.description,
        imageUrl: topic.imageUrl,
        order: topic.order,
        isHidden: topic.isHidden === 1,
        createdAt: new Date(topic.createdAt),
        updatedAt: new Date(topic.updatedAt),
      }
    });
    console.log(`Inserted topic: ${topic.title}`);
  }

  for (const content of contents) {
    if (content.linkUrl) {
      content.linkUrl = await uploadFile(content.linkUrl);
    }
    
    // Insert content
    await prisma.content.create({
      data: {
        id: content.id,
        topicId: content.topicId,
        text: content.text,
        linkUrl: content.linkUrl,
        order: content.order,
        isHidden: content.isHidden === 1,
        createdAt: new Date(content.createdAt),
        updatedAt: new Date(content.updatedAt),
      }
    });
    console.log(`Inserted content: ${content.text}`);
  }

  // Update sequences for PostgreSQL so future inserts don't fail
  await prisma.$executeRawUnsafe(`SELECT setval(pg_get_serial_sequence('"Topic"', 'id'), coalesce(max(id), 0) + 1, false) FROM "Topic";`);
  await prisma.$executeRawUnsafe(`SELECT setval(pg_get_serial_sequence('"Content"', 'id'), coalesce(max(id), 0) + 1, false) FROM "Content";`);

  console.log('Migration completed successfully!');
}

run()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
