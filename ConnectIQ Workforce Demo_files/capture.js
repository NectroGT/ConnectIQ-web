'use strict';
const C=window.CaptureModel;
let captureSession=null,captureError='',captureSuccess=null;
function dateLabel(value){return new Date(value).toLocaleString(undefined,{dateStyle:'medium',timeStyle:'short'});}
function startCapture(job,method='sample-selection',pid='p2'){
 captureSession=C.session(job,pid,method);captureError='';captureSuccess=null;
 navigate('capture');
}
function capturePage(){
 if(captureSuccess)return captureReceipt();
 const x=captureSession,j=x&&M.jobs.find(j=>j.id===x.job),p=x&&person(x.person),tag=x&&C.tagForJob(x.job),a=x&&C.activities.find(a=>a.id===x.activity);
 return heading('Mobile workplace evidence','Scan the job. Capture the work.','Job context is filled in. A few taps tell the rest of the story.',btn('Job QR labels','qr-labels','','','qr'))+
 `<div class="capture-layout"><div class="capture-main">${captureError?`<div class="field-error" role="alert">${esc(captureError)}</div>`:''}${!x?captureStart():`
 <section class="capture-context"><div class="capture-context-top">${badge(x.method==='qr-link'?'Opened from job link':'Sample job selected','green',true)}${btn('Change job','capture-change','','small')}</div><h2>${j.title}</h2><p>${j.id} · ${j.customer}</p><dl class="capture-facts"><div><dt>Part</dt><dd>${j.part}</dd></div><div><dt>Drawing</dt><dd>Rev ${j.rev}</dd></div><div><dt>Operation</dt><dd>${j.operation}</dd></div><div><dt>Opened on this device</dt><dd>${esc(dateLabel(x.openedAt))}</dd></div></dl><div class="capture-context-foot">${icon('link')} Filled from the sample job record</div></section>
 <form id="capture-form" class="panel capture-form">
 <div class="capture-step"><span>1</span><div><h2>Who did the work?</h2><p>Choose a sample employee for this demonstration.</p></div></div>
 <div class="field"><label for="capture-person">Demo employee</label><select id="capture-person">${M.people.map(pp=>`<option value="${pp.id}" ${pp.id===x.person?'selected':''}>${pp.name} · ${pp.role}</option>`).join('')}</select></div>
 <div class="capture-step"><span>2</span><div><h2>What did you do?</h2><p>Select what happened. Add context only where it helps.</p></div></div>
 <div class="field"><label for="capture-activity">Work activity</label><select id="capture-activity">${C.activities.filter(v=>v.person===x.person).map(v=>`<option value="${v.id}" ${v.id===a.id?'selected':''}>${v.title}</option>`).join('')}</select><small>Linked role skill: ${M.skills[a.skill]}</small></div>
 <fieldset class="capture-options"><legend>Activities completed <span>(choose at least one)</span></legend>${a.checks.map((v,i)=>`<label class="capture-option ${x.checks.includes(i)?'selected':''}"><input type="checkbox" data-capture-check="${i}" ${x.checks.includes(i)?'checked':''}><span>${v}</span>${icon('check')}</label>`).join('')}</fieldset>
 <fieldset class="capture-outcomes"><legend>Current outcome</legend>${C.outcomes.map(o=>`<label class="capture-option ${x.outcome===o.id?'selected':''}"><input type="radio" name="capture-outcome" value="${o.id}" ${x.outcome===o.id?'checked':''}><span>${o.label}</span>${icon('check')}</label>`).join('')}</fieldset>
 <div class="field"><label for="capture-note">Your decision or extra context <span class="optional">Optional</span></label><textarea id="capture-note" maxlength="1000" placeholder="e.g. Why you escalated, or what you asked a colleague to check.">${esc(x.note)}</textarea><small>Use your phone keyboard’s dictation if you prefer to speak.</small></div>
 <details class="capture-source"><summary>${icon('file')} Add a sample supporting record ${badge('Simulated','amber')}</summary><p>${tag.recordText}</p><label class="capture-checkline"><input id="capture-record" type="checkbox" ${x.includeRecord?'checked':''}><span>Include ${tag.record}<small>Illustrates a future connection to job or machine data. This is not a live reading.</small></span></label></details>
 <div class="capture-step last"><span>3</span><div><h2>Check and submit</h2><p>The assessor reviews the result and skill separately.</p></div></div>
 <div id="capture-summary" class="capture-summary">${captureSummary()}</div>
 <label class="capture-checkline confirmation"><input id="capture-confirm" type="checkbox" ${x.confirmed?'checked':''}><span>I confirm the selected activities and outcome represent this demo submission.</span></label>
 <div id="capture-submit-error" role="alert"></div><button type="submit" class="button primary capture-submit">${icon('arrow')} Submit for assessment</button><p class="capture-storage">Saved in this browser only. Phone and desktop records do not sync in this demo.</p>
 </form>`}</div>
 <aside class="capture-aside">${x?`<section class="panel qr-card"><div class="eyebrow">Try it on your phone</div><h2>Scan this job label</h2><img src="${C.qr(x.job)}" width="232" height="232" alt="QR code opening ${j.id} mobile capture"><strong>${j.id} · ${j.part}</strong><p>Open your phone’s Camera or QR scanner, scan, then tap the link. The public demo opens directly; no account is needed.</p><a class="button" href="${C.link(x.job)}">Open the same link ${icon('arrow')}</a><small>The code opens job context. It does not prove attendance or completed work.</small></section>`:`<section class="panel capture-how"><span class="capture-how-icon">${icon('qr')}</span><h2>A label, not another form.</h2><p>Put the job’s QR label on its traveller. Scanning opens the same capture screen with the right job details.</p>${btn('Show job QR labels','qr-labels','','primary','qr')}</section>`}
 <section class="panel capture-how"><h2>Less typing. Better context.</h2><div class="capture-how-row">${icon('check')}<div><strong>Filled from the job</strong><p>Job ID, part, revision and operation.</p></div></div><div class="capture-how-row">${icon('users')}<div><strong>Confirmed by the employee</strong><p>What they did, the outcome and any useful explanation.</p></div></div><div class="capture-how-row">${icon('shield')}<div><strong>Reviewed by the assessor</strong><p>Evidence, reasoning and demonstrated proficiency.</p></div></div></section>
 <details class="panel capture-next"><summary>Foundation for the live version</summary><p>Employee identity from sign-in, controlled job data from your ERP/MES, supporting records from FDM and a shared assessor inbox. The structured record already links person → activity → job → skill → evidence.</p><p>Current demo: sample data, device time, a selected demo employee and browser-local storage.</p></details></aside></div>`;
}
function captureStart(){return `<section class="panel capture-start"><span class="capture-how-icon">${icon('qr')}</span><h2>Open a sample job</h2><p>Try the flow here, or display a QR label and scan it with your phone.</p><div class="capture-job-list">${M.jobs.map(j=>`<button type="button" data-action="capture-job" data-id="${j.id}"><span><b>${j.title}</b><small>${j.id} · ${j.part} · Rev ${j.rev}</small></span>${icon('arrow')}</button>`).join('')}</div><form id="capture-code-form" class="capture-code-form"><label for="capture-code">Or enter the job number from its label</label><div><input id="capture-code" name="code" placeholder="JOB-26041" autocomplete="off" required maxlength="30"><button class="button" type="submit">Open job</button></div></form></section>`;}
function captureSummary(){
 const x=captureSession;if(!x)return '';
 const a=C.activities.find(a=>a.id===x.activity),o=C.outcomes.find(o=>o.id===x.outcome),tag=C.tagForJob(x.job);
 return `<div class="eyebrow">Your evidence summary</div><h3>${a.title}</h3><p>${person(x.person).name} · ${x.job}<br>${M.skills[a.skill]}</p><p>${x.checks.length?x.checks.map(i=>a.checks[i]).join('; ')+'.':'Choose the activities you completed above.'}</p>${x.note.trim()?`<p>${esc(x.note.trim())}</p>`:''}<p><b>Outcome:</b> ${o?o.label:'Choose an outcome above.'}</p>${x.includeRecord?`<p class="capture-sample-ref">${icon('file')} ${tag.record} · Simulated supporting record</p>`:''}`;
}
function syncCapture(){
 if(!captureSession)return;
 captureSession.confirmed=false;$('#capture-confirm').checked=false;
 $('#capture-summary').innerHTML=captureSummary();
 document.querySelectorAll('.capture-option').forEach(el=>el.classList.toggle('selected',el.querySelector('input').checked));
}
function submitCapture(){
 try{const e=C.submit(state,captureSession);persist();captureSuccess=e.id;captureError='';render();window.scrollTo({top:0,behavior:'instant'});}
 catch(e){$('#capture-submit-error').innerHTML=`<div class="field-error">${esc(e.message)}</div>`;$('#capture-submit-error').scrollIntoView({behavior:'smooth',block:'center'});}
}
function captureReceipt(){const e=state.evidence.find(e=>e.id===captureSuccess);if(!e){captureSuccess=null;return capturePage();}return `<section class="panel capture-receipt"><span class="receipt-icon">${icon('check')}</span><div class="eyebrow">Evidence captured</div><h1>Ready for a human review.</h1><p>${person(e.person).name}’s activities are linked to ${e.job} and ${M.skills[e.skill].toLowerCase()}.</p><div class="capture-receipt-id"><b>${e.id}</b>${statusBadge(e.status)}</div><div class="capture-summary"><h3>${esc(e.title)}</h3><p>${esc(e.action)}</p><p>${esc(e.outcome)}</p></div><p class="capture-storage">Saved in this browser. No skills were awarded by submitting. This prototype does not send notifications or sync across devices.</p><div class="receipt-actions">${btn('Try assessor review','review',e.id,'primary','shield')}${btn('Capture another activity','capture-another','','','plus')}${btn('View evidence list','nav','evidence')}</div></section>`;}
function qrLabels(){showModal('Job QR labels','Scan with your phone · Public demo',`<p class="qr-intro">Display these labels on a desktop, or print them for a sample job traveller. Each opens a different job in mobile capture. No account is needed to open the demo.</p><div class="qr-label-grid">${M.jobs.map(j=>{return `<article class="qr-label"><div class="eyebrow">ConnectIQ · Workplace evidence</div><img src="${C.qr(j.id)}" width="210" height="210" alt="QR code for ${j.id}"><h3>${j.id}</h3><p>${j.title}<br>${j.part} · Rev ${j.rev}<br>${j.operation}</p><a href="${C.link(j.id)}" class="button small">Open job</a> <a href="${C.qr(j.id)}" download="${j.id}-QR.png" class="button small">Download QR</a></article>`;}).join('')}</div><p class="qr-intro">These are sample labels. Scanning preloads context; it does not submit a record or verify competence.</p>`,btn('Close','close')+btn('Print labels','print-labels','','primary','file'),true);$('.dialog').classList.add('qr-print-dialog');}
function captureEvidenceDetails(e){if(!e.capture)return '';const c=e.capture;return `<details class="capture-audit" open><summary>${icon('qr')} Mobile capture context</summary><dl><div><dt>Opened via</dt><dd>${c.method==='qr-link'?'QR-compatible job link':c.method==='job-code'?'Typed job number':'Sample job selection'}</dd></div><div><dt>Opened / submitted (device time)</dt><dd>${esc(dateLabel(c.openedAt))} / ${esc(dateLabel(c.submittedAt))}</dd></div><div><dt>Job context at capture</dt><dd>${esc(c.part)} · Rev ${esc(c.revision)} · ${esc(c.operation)}</dd></div><div><dt>Employee confirmation</dt><dd>${c.editedAt?'Original capture confirmed; text amended on '+esc(dateLabel(c.editedAt)):'Demo employee confirmed activities and outcome'}</dd></div></dl>${c.sourceRecord?`<div class="capture-sample-source">${badge('Simulated supporting record','amber')}<h3>${esc(c.sourceRecord.id)}</h3><p>${esc(c.sourceRecord.text)}</p></div>`:''}<p class="muted">The QR link loads context. It does not verify identity, physical presence, the outcome or competence.</p></details>`;}
document.addEventListener('click',event=>{const b=event.target.closest('[data-action]');if(!b)return;switch(b.dataset.action){
 case 'capture-job':startCapture(b.dataset.id);break;
 case 'capture-person':{const p=person(b.dataset.id),j=M.jobs.find(j=>j.owner===p.id)||M.jobs[0];startCapture(j.id,'sample-selection',p.id);break;}
 case 'capture-change':captureSession=null;captureSuccess=null;captureError='';render();break;
 case 'capture-another':{const x=captureSession;startCapture(x.job,'sample-selection',x.person);break;}
 case 'qr-labels':qrLabels();break;
 case 'print-labels':window.print();break;
}});
document.addEventListener('change',e=>{
 if(!captureSession)return;const x=captureSession,t=e.target;
 if(t.id==='capture-person'){x.person=t.value;x.activity=C.activities.find(a=>a.person===x.person).id;x.checks=[];x.outcome='';x.note='';x.confirmed=false;render();$('#capture-person').focus();}
 if(t.id==='capture-activity'){x.activity=t.value;x.checks=[];x.outcome='';x.note='';x.confirmed=false;render();$('#capture-activity').focus();}
 if(t.dataset.captureCheck!==undefined){const v=Number(t.dataset.captureCheck);x.checks=t.checked?[...new Set([...x.checks,v])]:x.checks.filter(i=>i!==v);syncCapture();}
 if(t.name==='capture-outcome'){x.outcome=t.value;syncCapture();}
 if(t.id==='capture-record'){x.includeRecord=t.checked;syncCapture();}
 if(t.id==='capture-confirm')x.confirmed=t.checked;
});
document.addEventListener('input',e=>{if(e.target.id==='capture-note'&&captureSession){captureSession.note=e.target.value;syncCapture();}});
document.addEventListener('submit',e=>{
 if(e.target.id==='capture-form'){e.preventDefault();submitCapture();}
 if(e.target.id==='capture-code-form'){e.preventDefault();const id=String(new FormData(e.target).get('code')||'').trim().toUpperCase();if(C.tagForJob(id))startCapture(id,'job-code');else{captureError='Job not found. Try one of the four sample job numbers below.';render();}}
});
function initCapture(){const parsed=C.parse(location.search);if(parsed.requested){page='capture';if(parsed.tag)captureSession=C.session(parsed.tag.job,'p2','qr-link');else captureError='This QR link is not recognised. Choose a sample job or enter its job number.';}}
initCapture();render();
