import { Client } from '@elastic/elasticsearch';
import { logger } from '../utils/logger';

const esNode = process.env.ELASTICSEARCH_URL || 'http://localhost:9200';

export const searchClient = new Client({
  node: esNode,
  // Add authentication here if needed in production
});

export const initSearchEngine = async () => {
  try {
    const health = await searchClient.cluster.health({});
    logger.info(`[Search] Elasticsearch connected. Cluster health: ${health.status}`);
  } catch (error) {
    logger.error('[Search] Failed to connect to Elasticsearch', error);
  }
};

// Index mapping definitions
export const indexDefinitions = {
  students: {
    index: 'students',
    body: {
      mappings: {
        properties: {
          id: { type: 'keyword' },
          tenantId: { type: 'keyword' },
          firstName: { type: 'text' },
          lastName: { type: 'text' },
          email: { type: 'keyword' },
          admissionNumber: { type: 'keyword' },
          status: { type: 'keyword' },
        }
      }
    }
  },
  // We can add teachers, fees, attendance in future
};

export const createIndexesIfNotExist = async () => {
  for (const [key, config] of Object.entries(indexDefinitions)) {
    try {
      const exists = await searchClient.indices.exists({ index: config.index });
      if (!exists) {
        await searchClient.indices.create(config as any);
        logger.info(`[Search] Created index: ${config.index}`);
      }
    } catch (error) {
      logger.error(`[Search] Error creating index ${config.index}`, error);
    }
  }
};
