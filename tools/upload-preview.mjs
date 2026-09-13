// Publish only the reviewed branch and explicit public asset directory.
import {execFileSync} from 'node:child_process';
import {readFileSync} from 'node:fs';
import path from 'node:path';
const root=path.resolve(import.meta.dirname,'..');
const git=(...args)=>execFileSync('git',args,{cwd:root,encoding:'utf8'}).trim();
if(git('branch','--show-current')!=='site-redesign-v2')throw Error('Preview publication requires site-redesign-v2.');
if(git('status','--porcelain'))throw Error('Commit reviewed changes before publishing.');
const config=JSON.parse(readFileSync(path.join(root,'wrangler.preview.json'),'utf8'));
if(config.name!=='olsen-automation-v2-preview'||config.assets.directory!=='./dist'||config.workers_dev!==false||config.preview_urls!==true||config.routes||config.route)throw Error('Unexpected preview target or routing.');
if(config.main!=='src/worker.js'||config.assets.binding!=='ASSETS'||JSON.stringify(config.assets.run_worker_first)!=='["/media/*.mp4"]')throw Error('Unexpected media Worker configuration.');
execFileSync('npm',['run','check'],{cwd:root,stdio:'inherit'});
execFileSync(path.join(root,'node_modules/.bin/wrangler'),[
  'versions','upload','--config','wrangler.preview.json',
  '--preview-alias','site-redesign-v2','--strict',
  '--tag',git('rev-parse','--short=12','HEAD'),
  '--message',`Public-safe site-redesign-v2 preview from ${git('rev-parse','HEAD')}`
],{cwd:root,stdio:'inherit',env:{...process.env,WRANGLER_SEND_METRICS:'false'}});
