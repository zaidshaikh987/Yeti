import { createClient } from '@base44/sdk';
import { appParams } from '@/lib/app-params';

export const db = createClient(appParams);
export const base44 = db;
export default db;