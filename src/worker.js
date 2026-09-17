// Silent preview worker; live domain routing is configured separately.
import manifest from '../dist/media/manifest.json' with {type:'json'};
import previewHeaders from './_data/preview-headers.json' with {type:'json'};
import {visitNotification} from './visit-worker.js';
import {mediaWorker} from './media-worker.js';
const media=mediaWorker(manifest,previewHeaders);
export default {fetch(request,env){
 if(new URL(request.url).pathname==='/api/visit')return visitNotification(request,env);
 return media.fetch(request,env);
}};
