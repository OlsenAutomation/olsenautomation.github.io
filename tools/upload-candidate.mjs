// Versions upload only: cannot activate production traffic or change domains.
import {execFileSync} from 'node:child_process';
import {readFileSync} from 'node:fs';
import path from 'node:path';
const root=path.resolve(import.meta.dirname,'..');
const git=(...args)=>execFileSync('git',args,{cwd:root,encoding:'utf8'}).trim();
if(git('branch','--show-current')!=='site-redesign-v2'||git('status','--porcelain'))throw Error('Commit reviewed branch changes before upload.');
const config=JSON.parse(readFileSync(path.join(root,'wrangler.candidate.json'),'utf8'));
if(config.name!=='olsen-automation-v2-preview'||config.main!=='src/candidate-worker.js'||config.assets.directory!=='./dist-candidate'||config.assets.run_worker_first!==true||config.workers_dev!==false||config.preview_urls!==true||config.routes||config.route||config.vars?.VISIT_NOTIFICATIONS!=='disabled'||config.vars?.RELEASE_QA_EXPIRES!=='0')throw Error('Unsafe candidate target/configuration.');
execFileSync('npm',['run','release:build'],{cwd:root,stdio:'inherit'});
const args=['versions','upload','--config','wrangler.candidate.json','--preview-alias','release-candidate','--strict','--tag',git('rev-parse','--short=12','HEAD'),'--message',`Release candidate from ${git('rev-parse','HEAD')}; no production traffic`];
if(process.argv.includes('--owner-delivery-test')){
  const file=path.join(root,'.migration-local/release-candidate/qa-secrets.json');
  const secret=JSON.parse(readFileSync(file,'utf8'));
  const expires=Number(readFileSync(path.join(root,'.migration-local/release-candidate/qa-expires.txt'),'utf8'));
  if(!/^[a-f0-9]{64}$/.test(secret.RELEASE_QA_TOKEN)||expires<=Date.now()||expires>Date.now()+3600000)throw Error('QA capability must expire within one hour.');
  args.push('--secrets-file',file,'--var',`RELEASE_QA_EXPIRES:${expires}`);
}
execFileSync(path.join(root,'node_modules/.bin/wrangler'),args,{cwd:root,stdio:'inherit',env:{...process.env,WRANGLER_SEND_METRICS:'false'}});
