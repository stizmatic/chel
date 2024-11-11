// src/app/api/hockey-stats/route.ts
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Using the exact headers from your working CURL command
    const response = await fetch(
      'https://proclubs.ea.com/api/nhl/members/stats?platform=common-gen5&clubId=56546',
      {
        method: 'GET',
        headers: {
          'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
          'accept-language': 'en-US,en;q=0.9',
          'cache-control': 'max-age=0',
          'cookie': 'ealocale=en-us; notice_behavior=implied,us; notice_location=us',
          'priority': 'u=0, i',
          'sec-ch-ua': '"Brave";v="129", "Not=A?Brand";v="8", "Chromium";v="129"',
          'sec-ch-ua-mobile': '?0',
          'sec-ch-ua-platform': '"macOS"',
          'sec-fetch-dest': 'document',
          'sec-fetch-mode': 'navigate',
          'sec-fetch-site': 'none',
          'sec-fetch-user': '?1',
          'sec-gpc': '1',
          'upgrade-insecure-requests': '1',
          'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36'
        },
        cache: 'no-store'
      }
    );

    if (!response.ok) {
      const text = await response.text();
      console.error('Error response:', {
        status: response.status,
        statusText: response.statusText,
        body: text
      });
      throw new Error(`HTTP error! status: ${response.status}, body: ${text}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching stats:', error);
    if (error instanceof Error) {
      return NextResponse.json(
        { error: 'Failed to fetch stats', details: error.message },
        { status: 500 }
      );
    } else {
      return NextResponse.json(
        { error: 'Failed to fetch stats', details: 'Unknown error occurred' },
        { status: 500 }
      );
    }
  }
}