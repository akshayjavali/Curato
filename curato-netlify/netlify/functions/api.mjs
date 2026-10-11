import {getStore} from '@netlify/blobs';
import {handler} from '../lib/api-core.mjs';
export default req=>handler(req,getStore);
export const config={rateLimit:{windowLimit:60,windowSize:60,aggregateBy:['ip','domain']}};
