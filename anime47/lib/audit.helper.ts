import { logger } from '@/lib/logger'

/**
 * Data Audit Helper
 * So sánh metaJson vs Core Fields để phát hiện dữ liệu còn thiếu
 */
export class DataAuditHelper {
  /**
   * Analyze một story record và báo cáo data coverage
   */
  static analyzeStoryCoverage(story: any): {
    coreFieldsFilled: string[]
    coreFieldsMissing: string[]
    metaFieldsNotMapped: string[]
    coverage: number
  } {
    const CORE_FIELDS = [
      'title',
      'slug',
      'description',
      'coverImage',
      'alternativeName',
      'releaseYear',
      'director',
      'cast',
      'duration',
      'quality',
      'language',
      'rating',
      'views',
    ]

    const coreFieldsFilled: string[] = []
    const coreFieldsMissing: string[] = []

    // Check core fields
    CORE_FIELDS.forEach(field => {
      if (story[field] !== null && story[field] !== undefined && story[field] !== '') {
        coreFieldsFilled.push(field)
      } else {
        coreFieldsMissing.push(field)
      }
    })

    // Check metaJson for unmapped fields
   const metaFieldsNotMapped: string[] = []
    if (story.metaJson && typeof story.metaJson === 'object') {
      const metaKeys = Object.keys(story.metaJson)
      metaKeys.forEach(key => {
        if (!CORE_FIELDS.includes(key) && story.metaJson[key]) {
          metaFieldsNotMapped.push(key)
        }
      })
    }

    const coverage = (coreFieldsFilled.length / CORE_FIELDS.length) * 100

    return {
      coreFieldsFilled,
      coreFieldsMissing,
      metaFieldsNotMapped,
      coverage: Math.round(coverage),
    }
  }

  /**
   * Log audit report
   */
  static logAuditReport(storyTitle: string, audit: ReturnType<typeof DataAuditHelper.analyzeStoryCoverage>) {
    logger.info(`📊 Data Audit: ${storyTitle}`)
    logger.info(`  ✅ Coverage: ${audit.coverage}%`)
    
    if (audit.coreFieldsMissing.length > 0) {
      logger.warn(`  ⚠️  Missing fields (${audit.coreFieldsMissing.length}): ${audit.coreFieldsMissing.join(', ')}`)
    }
    
    if (audit.metaFieldsNotMapped.length > 0) {
      logger.info(`  💡 Unmapped meta fields (${audit.metaFieldsNotMapped.length}): ${audit.metaFieldsNotMapped.join(', ')}`)
      logger.info(`     👉 Consider promoting these to core fields!`)
    }
  }

  /**
   * Batch analyze multiple stories
   */
  static analyzeBatch(stories: any[]): {
    avgCoverage: number
    totalMissing: Set<string>
    totalUnmapped: Set<string>
  } {
    const missing = new Set<string>()
    const unmapped = new Set<string>()
    let totalCoverage = 0

    stories.forEach(story => {
      const audit = this.analyzeStoryCoverage(story)
      totalCoverage += audit.coverage
      audit.coreFieldsMissing.forEach(f => missing.add(f))
      audit.metaFieldsNotMapped.forEach(f => unmapped.add(f))
    })

    return {
      avgCoverage: Math.round(totalCoverage / stories.length),
      totalMissing: missing,
      totalUnmapped: unmapped,
    }
  }
}
