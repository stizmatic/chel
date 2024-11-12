// /app/api/hockey-stats/route.ts
import { NextResponse } from 'next/server';
import { StatHistory, PlayerStats } from '@/types';
import fs from 'fs/promises';
import path from 'path';

// Define additional types needed for the API
interface StatsFile {
  members: PlayerStats[];
  positionCount?: {
    forwards: number;
    goalie: number;
    defenseMen: number;
  };
}

interface ApiResponse {
  current: StatHistory | null;
  previous: StatHistory | null;
  dates: string[];
  message?: string;
  error?: string;
}

// Define the data directory path
const DATA_DIR = path.join(process.cwd(), 'data', 'hockey-stats');

// Ensure the data directory exists
async function ensureDataDir(): Promise<void> {
  try {
    await fs.access(DATA_DIR);
  } catch {
    await fs.mkdir(DATA_DIR, { recursive: true });
  }
}

// Get all stat files sorted by date (newest first)
async function getStatFiles(): Promise<StatHistory[]> {
  await ensureDataDir();
  
  try {
    const files = await fs.readdir(DATA_DIR);
    const statFiles = await Promise.all(
      files
        .filter(file => file.endsWith('.json'))
        .map(async file => {
          try {
            const content = await fs.readFile(path.join(DATA_DIR, file), 'utf-8');
            const parsed = JSON.parse(content) as StatsFile;
            return {
              date: file.replace('.json', ''),
              stats: parsed.members
            };
          } catch (error) {
            console.error(`Error processing file ${file}:`, error);
            return null;
          }
        })
    );

    // Filter out any null results and sort by date
    return statFiles
      .filter((file): file is StatHistory => file !== null)
      .sort((a, b) => b.date.localeCompare(a.date));
  } catch (error) {
    console.error('Error reading stat files:', error);
    return [];
  }
}

// Validate JSON structure
function isValidStatsFile(content: string | StatsFile): boolean {
  try {
    const data: StatsFile = typeof content === 'string' ? JSON.parse(content) : content;
    
    const isValidPlayer = (player: Partial<PlayerStats>): boolean => {
      return (
        player !== null &&
        typeof player === 'object' &&
        typeof player.name === 'string' &&
        Object.keys(player).length > 0
      );
    };

    return (
      data !== null &&
      typeof data === 'object' &&
      Array.isArray(data.members) &&
      data.members.every(isValidPlayer)
    );
  } catch {
    return false;
  }
}

export async function GET(): Promise<NextResponse<ApiResponse>> {
  try {
    const files = await getStatFiles();
    
    return NextResponse.json({
      current: files[0] || null,
      previous: files[1] || null,
      dates: files.map(f => f.date)
    });
  } catch (error) {
    console.error('Error in GET handler:', error);
    return NextResponse.json(
      { 
        current: null,
        previous: null,
        dates: [],
        error: 'Failed to load stats'
      }, 
      { status: 500 }
    );
  }
}

export async function POST(request: Request): Promise<NextResponse<ApiResponse>> {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json(
        {
          current: null,
          previous: null,
          dates: [],
          error: 'No file provided'
        }, 
        { status: 400 }
      );
    }

    // Read and validate file content
    const content = await file.text();
    if (!isValidStatsFile(content)) {
      return NextResponse.json(
        {
          current: null,
          previous: null,
          dates: [],
          error: 'Invalid stats file format'
        }, 
        { status: 400 }
      );
    }

    // Generate filename with current date
    const date = new Date().toISOString().split('T')[0];
    const fileName = `${date}.json`;
    
    // Ensure directory exists and save file
    await ensureDataDir();
    await fs.writeFile(
      path.join(DATA_DIR, fileName),
      content,
      'utf-8'
    );
    
    // Get updated file list
    const files = await getStatFiles();
    
    return NextResponse.json({
      current: files[0] || null,
      previous: files[1] || null,
      dates: files.map(f => f.date),
      message: 'File uploaded successfully'
    });
  } catch (error) {
    console.error('Error in POST handler:', error);
    return NextResponse.json(
      {
        current: null,
        previous: null,
        dates: [],
        error: 'Failed to save stats file'
      }, 
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request): Promise<NextResponse<ApiResponse>> {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');

    if (!date) {
      return NextResponse.json(
        {
          current: null,
          previous: null,
          dates: [],
          error: 'Date parameter is required'
        }, 
        { status: 400 }
      );
    }

    const filePath = path.join(DATA_DIR, `${date}.json`);
    
    try {
      await fs.access(filePath);
    } catch {
      return NextResponse.json(
        {
          current: null,
          previous: null,
          dates: [],
          error: 'File not found'
        }, 
        { status: 404 }
      );
    }

    await fs.unlink(filePath);
    const files = await getStatFiles();

    return NextResponse.json({
      current: files[0] || null,
      previous: files[1] || null,
      dates: files.map(f => f.date),
      message: 'File deleted successfully'
    });
  } catch (error) {
    console.error('Error in DELETE handler:', error);
    return NextResponse.json(
      {
          current: null,
          previous: null,
          dates: [],
          error: 'Failed to delete stats file'
      }, 
      { status: 500 }
    );
  }
}