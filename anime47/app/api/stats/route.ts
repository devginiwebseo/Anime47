import { NextResponse } from 'next/server'
import { storyRepository } from '@/modules/story/story.repository'
import { chapterRepository } from '@/modules/chapter/chapter.repository'
import { logger } from '@/lib/logger'

export async function GET() {
  try {
    const [storyCount, chapterCount] = await Promise.all([
      storyRepository.count(),
      chapterRepository.count(),
    ])

    return NextResponse.json({
      success: true,
      data: {
        stories: storyCount,
        chapters: chapterCount,
      },
    })
  } catch (error: any) {
    logger.error('API Error: Failed to get stats', error)
    
    return NextResponse.json(
      { 
        success: false,
        error: error.message || 'Failed to get stats' 
      },
      { status: 500 }
    )
  }
}
