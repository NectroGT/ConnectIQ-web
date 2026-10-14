(function(root){
'use strict';
const M=root.WorkforceModel;
const customOrigin='https://workforce.connectiq.asia';
const origin=root.location&&root.location.hostname==='workforce.connectiq.asia'?customOrigin:customOrigin;
const tags=[
 {token:'housing-op30',job:'JOB-26041',record:'SIM-FDM-041-07',recordText:'Sample dimensional trend and tool-check log for OP30. Readings and effectiveness need review.'},
 {token:'valve-op40',job:'JOB-26042',record:'SIM-QC-042-03',recordText:'Sample inspection checkpoint log for OP40. Effectiveness has not been verified.'},
 {token:'bracket-op20',job:'JOB-26043',record:'SIM-FDM-043-02',recordText:'Sample setup and measurement-trend log for OP20. Technical interpretation needs review.'},
 {token:'sleeve-op10',job:'JOB-26044',record:'SIM-JOB-044-01',recordText:'Sample drawing-revision acknowledgement for OP10. Customer requirements need review.'}
];
const activities=[
 {id:'lead-review',person:'p1',skill:'planning',title:'Lead a job-risk review',type:'Project handover',checks:['Reviewed job milestones','Agreed owners and next steps','Explained the recovery plan']},
 {id:'lead-handover',person:'p1',skill:'documentation',title:'Complete a controlled handover',type:'Project handover',checks:['Checked the drawing revision','Recorded accountable owners','Confirmed the handover checklist']},
 {id:'cnc-investigate',person:'p2',skill:'problem',title:'Investigate a machining issue',type:'Problem-solving case',checks:['Compared measurements','Checked tool condition','Checked setup against the drawing']},
 {id:'cnc-coach',person:'p2',skill:'coaching',title:'Coach a colleague on the setup',type:'On-the-job practice',checks:['Explained the setup method','Observed supervised practice','Gave feedback on the decision']},
 {id:'quality-prevent',person:'p3',skill:'quality',title:'Check a preventive quality control',type:'Quality review',checks:['Reviewed recurring findings','Checked the preventive checkpoint','Compared follow-up observations']},
 {id:'quality-investigate',person:'p3',skill:'problem',title:'Investigate a quality issue',type:'Quality review',checks:['Reviewed the inspection evidence','Checked a possible cause','Recorded an action for verification']},
 {id:'sales-clarify',person:'p4',skill:'requirements',title:'Clarify technical requirements',type:'Customer coordination',checks:['Confirmed the drawing revision','Clarified a missing requirement','Requested engineering review']},
 {id:'sales-handover',person:'p4',skill:'planning',title:'Coordinate a customer handover',type:'Customer coordination',checks:['Recorded the customer commitment','Agreed an internal owner','Confirmed the next follow-up']}
];
const outcomes=[
 {id:'ready',label:'Ready for review',text:'I completed the selected activities and request an assessor review. The result and demonstrated competence are not yet verified.'},
 {id:'followup',label:'Follow-up needed',text:'Follow-up is still needed before the result can be verified. I request a review of the work completed so far.'},
 {id:'escalated',label:'Issue escalated',text:'I escalated the issue for further support. Resolution and demonstrated competence are not yet verified.'}
];
function tagForJob(job){return tags.find(t=>t.job===job)||null;}
function resolve(value){return tags.find(t=>t.token===value)||null;}
function link(job){const tag=tagForJob(job);if(!tag)throw Error('Unknown job label.');return origin+'/?capture='+encodeURIComponent(tag.token)+'#capture';}
function qr(job){const tag=tagForJob(job);if(!tag)throw Error('Unknown job label.');return (origin===customOrigin?'qr-connectiq/':'qr/')+tag.token+'.png';}
function parse(search){const token=new URLSearchParams(search||'').get('capture');return {requested:token!==null,tag:token===null?null:resolve(token)};}
function session(job,person='p2',method='sample-selection'){
 const tag=tagForJob(job),p=M.people.find(p=>p.id===person);if(!tag||!p)throw Error('Select a known sample job and employee.');
 return {job,person,activity:activities.find(a=>a.person===person).id,checks:[],outcome:'',note:'',includeRecord:false,confirmed:false,openedAt:new Date().toISOString(),method};
}
function prepare(x){
 const tag=tagForJob(x.job),job=M.jobs.find(j=>j.id===x.job),a=activities.find(a=>a.id===x.activity&&a.person===x.person),outcome=outcomes.find(o=>o.id===x.outcome);
 if(!tag||!job||!a)throw Error('Select a valid job, employee and activity.');
 const checks=[...new Set(x.checks||[])];if(!checks.length||checks.some(i=>!Number.isInteger(i)||!a.checks[i]))throw Error('Select at least one activity you completed.');
 if(!outcome)throw Error('Choose the current outcome.');
 if(!x.confirmed)throw Error('Confirm that the summary represents this demo submission.');
 const note=String(x.note||'').trim();if(note.length>1000)throw Error('Keep the extra note within 1,000 characters.');
 if(!Number.isFinite(Date.parse(x.openedAt))||!['qr-link','sample-selection','job-code'].includes(x.method))throw Error('Reopen the job to capture its context.');
 return {person:x.person,skill:a.skill,job:job.id,title:a.title+' · '+job.part,type:a.type,
 action:checks.map(i=>a.checks[i]).join('; ')+'.'+(note?' My note: '+note:''),outcome:outcome.text,
 capture:{method:x.method,openedAt:x.openedAt,submittedAt:new Date().toISOString(),token:tag.token,part:job.part,revision:job.rev,operation:job.operation,activity:a.id,checks,outcome:outcome.id,employeeConfirmed:true,sourceRecord:x.includeRecord?{id:tag.record,text:tag.recordText,simulated:true}:null}
 };
}
function submit(state,x){return M.addEvidence(state,prepare(x),'pending');}
const api={origin,tags,activities,outcomes,tagForJob,resolve,link,qr,parse,session,prepare,submit};root.CaptureModel=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
