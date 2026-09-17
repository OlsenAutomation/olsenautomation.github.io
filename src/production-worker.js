import manifest from '../dist-production/media/manifest.json' with {type:'json'};
import security from './_data/production-headers.json' with {type:'json'};
import {mediaWorker} from './media-worker.js';
import {visitNotification} from './visit-worker.js';
const media=mediaWorker(manifest,security);
export default {async fetch(request,env){
 const url=new URL(request.url);
 if(url.hostname==='www.olsenautomation.com'){
  url.hostname='olsenautomation.com';return Response.redirect(url,301);
 }
 if(url.pathname==='/api/visit')return visitNotification(request,env);
 return media.fetch(request,env);
}};
