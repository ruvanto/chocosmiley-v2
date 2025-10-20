
// @/lib/sanity.ts
import { createClient } from '@sanity/client';

export const client = createClient({
  // projectId: 'mt65l5up',
  projectId: 'yu413ogt',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
});
