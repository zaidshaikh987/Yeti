import { createClient } from '@base44/sdk';
import { appParams } from '@/lib/app-params';

const rawDb = createClient(appParams);

// Intercept filter calls to ensure they return { items: [...] } 
// since some components expect paginated object structure.
export const db = new Proxy(rawDb, {
  get(target, prop) {
    if (prop === 'entities') {
      return new Proxy(target.entities, {
        get(entitiesTarget, entityName) {
          const entity = entitiesTarget[entityName];
          if (!entity) return entity;
          return new Proxy(entity, {
            get(entityTarget, entityProp) {
              if (entityProp === 'filter') {
                return async (...args) => {
                  let query = args[0] || {};
                  
                  // In local dev, /v2/list is unsupported, so we must fetch all using .list() 
                  // and manually filter the results.
                  const allRecords = await entityTarget.list();
                  
                  // Very basic mock filtering for local development
                  let filtered = allRecords;
                  
                  if (query.review_status) {
                    filtered = filtered.filter(item => item.review_status === query.review_status);
                  }
                  if (query.content_type && query.content_type.$in) {
                    filtered = filtered.filter(item => query.content_type.$in.includes(item.content_type));
                  }
                  
                  
                  return { items: filtered };
                };
              }
              if (entityProp === 'count') {
                return async (...args) => {
                  const allRecords = await entityTarget.list();
                  return allRecords.length;
                };
              }
              return entityTarget[entityProp];
            }
          });
        }
      });
    }
    return target[prop];
  }
});

export const base44 = db;
export default db;