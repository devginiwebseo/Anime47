import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { DataAuditHelper } from '@/lib/audit.helper'
import { logger } from '@/lib/logger'

/**
 * GET /api/audit/stories
 * Check data coverage của stories trong database
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '10')
    
    // Get random stories to audit
    const stories = await prisma.stories.findMany({
      take: limit,
      orderBy: { createdAt: 'desc' },
    })

    if (stories.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No stories found in database',
        data: null,
      })
    }

    // Analyze batch
    const batchAudit = DataAuditHelper.analyzeBatch(stories)
    
    // Analyze individual stories
    const individualAudits = stories.map(story => ({
      title: story.title,
      slug: story.slug,
      audit: DataAuditHelper.analyzeStoryCoverage(story),
    }))

    return NextResponse.json({
      success: true,
      data: {
        summary: {
          totalStories: stories.length,
          avgCoverage: batchAudit.avgCoverage,
          commonMissingFields: Array.from(batchAudit.totalMissing),
          fieldsInMetaNotMapped: Array.from(batchAudit.totalUnmapped),
        },
        stories: individualAudits,
      },
    })
  } catch (error: any) {
    logger.error('Audit failed', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}
