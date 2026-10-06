// Playwright CLI run-code function. Open the game in a NEW isolated session first.
// Uses only that session’s test localStorage; includes explicit reset.
async page => {
 const assert=(v,m)=>{if(!v)throw Error(m)}, report=[], click=async name=>page.getByRole('button',{name,exact:true}).click();
 const state=()=>page.evaluate(()=>JSON.parse(localStorage.getItem('scale-works-v1')));
 await page.goto(page.url());await page.getByRole('heading',{name:'Small parts. Big possibilities.',exact:false}).waitFor();
 await click('Enter the workshop →');await click('(4, 0)');await click('Increase scale factor');await click('Get a hint');await click('Print & test fit');
 const before=(await state()).drafts.brace;
 assert(before.k===1.25&&before.hint===1&&before.attempts===1&&before.prediction==='(4, 0)','non-default draft');
 await click('Mission map');await page.locator('[data-mission="0"]').click();assert(JSON.stringify((await state()).drafts.brace)===JSON.stringify(before),'map reopen exact draft');
 await page.reload();await click('Resume workshop →');assert(JSON.stringify((await state()).drafts.brace)===JSON.stringify(before),'reload/resume exact draft');
 await click('Mission map');await page.reload();await page.locator('[data-mission="0"]').click();assert(JSON.stringify((await state()).drafts.brace)===JSON.stringify(before),'reload/card exact draft');
 await page.setViewportSize({width:390,height:844});assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'phone overflow');await page.screenshot({path:'output/playwright/resume-fix/fixed-phone.png',fullPage:true});
 await click('Restart repair');let s=(await state()).drafts.brace;assert(s.prediction===null&&s.k===1&&s.hint===0&&s.attempts===0&&!s.message,'explicit restart fresh');
 await click('(4, 0)');for(let i=0;i<4;i++)await click('Increase scale factor');await click('Print & test fit');assert((await state()).done.includes('brace'),'complete mission');const completed=(await state()).drafts.brace;
 await click('Mission map');assert((await page.locator('[data-mission="0"]').innerText()).includes('Review repair'),'accurate completed label');await page.locator('[data-mission="0"]').click();assert(JSON.stringify((await state()).drafts.brace)===JSON.stringify(completed),'completed review preserves');await click('Restart repair');assert((await state()).drafts.brace.prediction===null,'completed explicit replay');assert((await state()).done.includes('brace'),'replay retains unlocked progression');
 // Exercise a ramp draft with non-default endpoint using an isolated test save.
 await page.evaluate(()=>{const s=JSON.parse(localStorage.getItem('scale-works-v1'));s.done=['brace','mini','offset','center','check-scale'];localStorage.setItem('scale-works-v1',JSON.stringify(s))});await page.reload();await page.locator('[data-mission="5"]').click();await click('½');await click('Move endpoint right');await click('Get a hint');await click('Test rover route');const ramp=(await state()).drafts.ramp;
 await click('Mission map');await page.locator('[data-mission="5"]').click();assert(JSON.stringify((await state()).drafts.ramp)===JSON.stringify(ramp),'ramp endpoint/hint/attempt feedback preserved');await page.reload();await click('Resume workshop →');assert(JSON.stringify((await state()).drafts.ramp)===JSON.stringify(ramp),'ramp reload preserved');
 await page.setViewportSize({width:1024,height:768});await page.screenshot({path:'output/playwright/resume-fix/fixed-tablet.png',fullPage:true});
 await click('Reset progress');await click('Clear progress');assert((await state()).done.length===0&&Object.keys((await state()).drafts).length===0,'explicit global reset');
 report.push('PASS: scale and ramp drafts survive map-card reopening and reload/resume; prediction, factor/endpoint, hints, attempts, feedback preserved.','PASS: explicit restart resets drafts; completed review preserves state; replay retains unlocks; explicit global reset clears progress.','PASS: phone overflow and 1024×768 tablet/390×844 phone screenshots.');return report;
}
