import { NextRequest, NextResponse } from 'next/server';
import { SearchService } from '@/lib/searchService';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const type = searchParams.get('type');
    const limit = parseInt(searchParams.get('limit') || '10');

    if (!query) {
      return NextResponse.json({ suggestions: [] });
    }

    let suggestions;
    
    if (type === 'location') {
      // For location-specific suggestions, focus on address fields
      suggestions = await SearchService.getSearchSuggestions(query, limit);
      suggestions = suggestions.filter(s => 
        ['city', 'area', 'street', 'landmark', 'pinCode'].includes(s.type)
      );
    } else {
      // For general search suggestions
      suggestions = await SearchService.getSearchSuggestions(query, limit);
    }

    return NextResponse.json({ suggestions });

  } catch (error: any) {
    console.error('Suggestions error:', error);
    return NextResponse.json(
      { error: 'Failed to get suggestions', details: error.message },
      { status: 500 }
    );
  }
}