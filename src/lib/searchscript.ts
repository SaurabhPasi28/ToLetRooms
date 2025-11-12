import Property from '@/models/Property';
import { dbConnect } from './dbConnect';
import { ElasticsearchService } from './elasticsearchService';

async function indexAllProperties() {
  await dbConnect();
  const properties = await Property.find({ isActive: true }).lean();

  for (const property of properties) {
    await ElasticsearchService.indexProperty(property);
  }

  console.log('All properties indexed in Elasticsearch.');
}

indexAllProperties();
