# CG Corner Web

This is a modern, responsive website built with Next.js (App Router), React, Tailwind CSS, and Prisma (SQLite).
The project includes a frontend to view content and an admin panel to manage topics and contents.

## Getting Started

1. Install dependencies
```bash
npm install
```

2. Initialize the database and push the schema
```bash
npm run db:push
```

3. Seed the initial content from the original Canva site
```bash
npm run db:seed
```

4. Run the development server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.
The admin panel is available at [http://localhost:3000/admin](http://localhost:3000/admin).
