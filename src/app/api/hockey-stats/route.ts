// /app/api/data/route.ts
import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const DATA_FILE_PATH = path.join(process.cwd(), 'public', 'data.json');

export async function GET() {
  try {
    const data = await fs.readFile(DATA_FILE_PATH, 'utf-8');
    return NextResponse.json(JSON.parse(data));
  } catch (error) {
    console.error('Error reading JSON file:', error);
    return NextResponse.json({ error: 'Failed to load data' }, { status: 500 });
  }
}
export async function POST(request: Request) {
  try {
    const newData = await request.json();
    await fs.writeFile(DATA_FILE_PATH, JSON.stringify(newData, null, 2), 'utf-8');
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error writing JSON file:', error);
    return NextResponse.json({ error: 'Failed to save data' }, { status: 500 });
  }
}
