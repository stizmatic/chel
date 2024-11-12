import { NextResponse } from 'next/server';
import { StatHistory, PlayerStats } from '@/types';
import fs from 'fs/promises';
import path from 'path';

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

// Update the data directory path to be inside src
const DATA_DIR = path.join(process.cwd(), 'src', 'data', 'hockey-stats');

// Function to get the initial stats file path
const getInitialStatsPath = () => {
  return path.join(process.cwd(), 'src', 'data', 'hockey-stats', 'initial-stats.json');
};

// Modified getStatFiles to handle initial stats
async function getStatFiles(): Promise<StatHistory[]> {
  try {
    // Try to read the directory
    let files: string[] = [];
    try {
      files = await fs.readdir(DATA_DIR);
    } catch {
      // If directory doesn't exist or is empty, fall back to initial stats
      const initialStats = await fs.readFile(getInitialStatsPath(), 'utf-8');
      const parsed = JSON.parse(initialStats) as StatsFile;
      const today = new Date().toISOString().split('T')[0];
      
      return [{
        date: today,
        stats: parsed.members
      }];
    }

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

    // Filter out null results and sort by date
    const validFiles = statFiles
      .filter((file): file is StatHistory => file !== null)
      .sort((a, b) => b.date.localeCompare(a.date));

    // If no valid files found, fall back to initial stats
    if (validFiles.length === 0) {
      const initialStats = await fs.readFile(getInitialStatsPath(), 'utf-8');
      const parsed = JSON.parse(initialStats) as StatsFile;
      const today = new Date().toISOString().split('T')[0];
      
      return [{
        date: today,
        stats: parsed.members
      }];
    }

    return validFiles;
  } catch (error) {
    console.error('Error reading stat files:', error);
    // Final fallback to initial stats
    try {
      const initialStats = await fs.readFile(getInitialStatsPath(), 'utf-8');
      const parsed = JSON.parse(initialStats) as StatsFile;
      const today = new Date().toISOString().split('T')[0];
      
      return [{
        date: today,
        stats: parsed.members
      }];
    } catch (finalError) {
      console.error('Critical error: Could not read initial stats:', finalError);
      return [];
    }
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

// Ensure the data directory exists
async function ensureDataDir(): Promise<void> {
  try {
    await fs.access(DATA_DIR);
  } catch {
    await fs.mkdir(DATA_DIR, { recursive: true });
    
    // Copy initial stats file to the new directory if it doesn't exist
    try {
      const initialStats = await fs.readFile(getInitialStatsPath(), 'utf-8');
      const today = new Date().toISOString().split('T')[0];
      await fs.writeFile(
        path.join(DATA_DIR, `${today}.json`),
        initialStats,
        'utf-8'
      );
    } catch (error) {
      console.error('Error copying initial stats:', error);
    }
  }
}

export async function GET(): Promise<NextResponse<ApiResponse>> {
  try {
    await ensureDataDir();
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