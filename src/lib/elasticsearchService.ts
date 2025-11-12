import { Client } from '@elastic/elasticsearch';

const ELASTICSEARCH_URL = process.env.ELASTICSEARCH_URL!;
const ELASTICSEARCH_USERNAME = process.env.ELASTICSEARCH_USERNAME!;
const ELASTICSEARCH_PASSWORD = process.env.ELASTICSEARCH_PASSWORD!;

export const elasticClient = new Client({
  node: ELASTICSEARCH_URL,
  auth: {
    username: ELASTICSEARCH_USERNAME,
    password: ELASTICSEARCH_PASSWORD
  }
});

export class ElasticsearchService {
  static async indexProperty(property: any) {
    return elasticClient.index({
      index: 'properties',
      id: property._id,
      document: property
    });
  }

  static async searchProperties(query: string, filters: any, page: number = 1, limit: number = 20) {
    const from = (page - 1) * limit;

    const body: any = {
      query: {
        bool: {
          must: query
            ? [{ multi_match: { query, fields: ['title^3', 'description', 'address.city', 'address.areaOrLocality', 'address.street', 'address.pinCode'] } }]
            : [{ match_all: {} }],
          filter: []
        }
      },
      from,
      size: limit
    };

    // Example: Adding a filter
    if (filters.propertyType) {
      body.query.bool.filter.push({
        term: { propertyType: filters.propertyType.toLowerCase() }
      });
    }

    if (filters.minPrice || filters.maxPrice) {
      const priceRange: any = {};
      if (filters.minPrice) priceRange.gte = filters.minPrice;
      if (filters.maxPrice) priceRange.lte = filters.maxPrice;

      body.query.bool.filter.push({
        range: { price: priceRange }
      });
    }

    // Add more filters as needed

    const response = await elasticClient.search({
      index: 'properties',
      body
    });

    const hits = response.hits.hits.map(hit => hit._source);

    return {
      properties: hits,
      total: response.hits.total?.valueOf
    };
  }
}
