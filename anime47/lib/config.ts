export const config = {
  sitemap: {
    indexUrl: process.env.SITEMAP_INDEX_URL || 'https://anime47.onl/sitemap_index.xml',
  },
  crawler: {
    timeout: parseInt(process.env.CRAWLER_TIMEOUT || '10000'),
    maxRetries: parseInt(process.env.CRAWLER_MAX_RETRIES || '3'),
    delayMs: parseInt(process.env.CRAWLER_DELAY_MS || '1000'),
    batchSize: parseInt(process.env.CRAWLER_BATCH_SIZE || '5'),
  },
  app: {
    domain: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    sourceDomain: 'https://anime47.onl', // Domain nguồn để replace
  },
}
