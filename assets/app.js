/* ClinicScribe review build: visit workflow with sample data. No network calls. */
(function(){
'use strict';
var me=window.ClinicAuth.require(); if(!me)return;

var $=function(s,el){return (el||document).querySelector(s)};
var $$=function(s,el){return Array.prototype.slice.call((el||document).querySelectorAll(s))};
var esc=function(s){return String(s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})};
var ICON_CHECK='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><path d="M5 12l5 5 9-10"/></svg>';
var ICON_WARN='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 9v4M12 17h.01M10.3 3.9L2.6 17.2A2 2 0 0 0 4.3 20h15.4a2 2 0 0 0 1.7-2.8L13.7 3.9a2 2 0 0 0-3.4 0z"/></svg>';

/* signed-in doctor */
$('#me-avatar').textContent=me.initials; $('#me-name').firstChild.nodeValue=me.name; $('#me-role').textContent=me.role;
$('#vocab-who').textContent=me.name;
(function(){var h=new Date().getHours();$('#greet').textContent=(h<12?'Good morning':h<17?'Good afternoon':'Good evening')+', '+me.name.replace(/^Dr\.\s*/,'Dr. ')})();
$('#btn-logout').addEventListener('click',function(){window.ClinicAuth.logout();location.href='index.html'});

/* templates */
var TEMPLATES={
  soap:{name:'SOAP',sections:[['S','Subjective'],['O','Objective'],['A','Assessment'],['P','Plan']]},
  followup:{name:'Follow-up',sections:[['S','Interval history'],['O','Examination and results'],['A','Assessment'],['P','Plan']]},
  general:{name:'General consult',sections:[['S','Presenting complaint and history'],['O','Examination'],['A','Diagnosis'],['P','Plan']]}
};

/* sample data (fictional) */
var ITEM_SEQ=0;
function seg(id,t,who,text,extra){var o={id:id,t:t,who:who,text:text};if(extra){for(var k in extra)o[k]=extra[k]}return o}
function it(cat,text,ev,extra){var o={id:'i'+(++ITEM_SEQ),cat:cat,text:text,ev:ev||[]};if(extra){for(var k in extra)o[k]=extra[k]}return o}

var AMBIENT_TRANSCRIPT=[
  seg(1,'00:00','d','Good morning, Mr. Kumar, please sit. Before we start, I use an AI assistant that records our conversation to help me write your notes. The recording is deleted after the note is done. Is that okay with you?',{consent:true}),
  seg(2,'00:09','p','Yes, that is fine, doctor.',{consent:true}),
  seg(3,'00:11','d','Thank you. So what brings you in today?'),
  seg(4,'00:14','p','Mainly this cough, doctor. It has been about ten days now. Dry mostly, worse at night. And I wanted to review my sugar reports.'),
  seg(5,'00:25','d','Any fever, breathlessness or chest pain with the cough?'),
  seg(6,'00:29','p','No fever. A little breathlessness when I climb stairs, but no chest pain.'),
  seg(7,'00:35','d','Any blood in the sputum, or weight loss?'),
  seg(8,'00:38','p','No, nothing like that.'),
  seg(9,'00:40','d','Are you still taking the Metformin 500 twice a day and Telmisartan 40 in the morning?'),
  seg(10,'00:46','p','Yes, every day. I missed maybe two or three doses of the Metformin last month.'),
  seg(11,'00:51','d','Okay. Your HbA1c from last week is 7.8 percent, which is up from 7.1 in April. Fasting sugar was 142.'),
  seg(12,'01:00','p','Hmm. I have been eating out more because of work travel.'),
  seg(13,'01:05','d','That fits. Let me check your BP. 148 over 92. That is a bit high. Have you been checking at home?'),
  seg(14,'01:17','p','Sometimes. Usually around 140.'),
  seg(15,'01:20','d','Any headache, swelling of the feet, or trouble with vision?'),
  seg(16,'01:24','p','No swelling. Vision is fine. Occasional headache in the evening.'),
  seg(17,'01:29','d','Let me listen to your chest. Breathe in. Again. Chest is clear, no crepitations, no wheeze. Throat is mildly congested.'),
  seg(18,'01:49','d','So the cough is most likely post-viral or from the upper airway, nothing in the lungs. I will give you a chest X-ray to be safe given the breathlessness, and a short course of an antihistamine with a cough suppressant for the nights.'),
  seg(19,'02:05','p','Okay doctor.'),
  seg(20,'02:07','d','For the sugar, I will increase Metformin to 1000 milligrams twice daily with meals. Keep the Telmisartan the same for now, but check BP at home every morning for two weeks and bring me the readings. If it stays above 140 over 90 we will add something.'),
  seg(21,'02:25','p','Will the higher Metformin upset my stomach?'),
  seg(22,'02:28','d','It can for the first week, so take it with food. If it is severe, call the clinic. Also, I want a lipid profile and kidney function test, and we will repeat HbA1c in three months.'),
  seg(23,'02:41','p','Alright.'),
  seg(24,'02:43','d','See me in two weeks with the X-ray and BP readings. Sooner if fever, chest pain, or the breathlessness gets worse.'),
  seg(25,'02:51','p','Thank you, doctor.')
];
function ambientItems(){return [
  it('S','52-year-old male presents with a 10-day history of predominantly dry cough, worse at night.',[4]),
  it('S','Reports mild exertional breathlessness on climbing stairs; denies fever and chest pain.',[5,6]),
  it('S','Denies haemoptysis and weight loss.',[7,8]),
  it('S','Known type 2 diabetes mellitus and hypertension on Metformin 500 mg BD and Telmisartan 40 mg OD; reports missing 2–3 Metformin doses in the past month.',[9,10]),
  it('S','Increased eating out due to work travel.',[12]),
  it('S','Occasional evening headaches; denies pedal oedema and visual disturbance.',[15,16]),
  it('S','Denies alcohol use.',[]),
  it('O','BP 148/92 mmHg in clinic; home readings reportedly around 140 systolic.',[13,14]),
  it('O','Chest clear on auscultation, no crepitations or wheeze. Mild pharyngeal congestion.',[17]),
  it('O','HbA1c 7.8% (previous 7.1% in April); fasting plasma glucose 142 mg/dL.',[11]),
  it('A','Acute cough, most likely post-viral / upper airway; no clinical evidence of lower respiratory involvement.',[17,18],{alt:'Acute dry cough of 10 days, clinically upper airway in origin with clear chest; chest X-ray requested in view of exertional breathlessness.'}),
  it('A','Type 2 diabetes mellitus with suboptimal glycaemic control (HbA1c 7.8%), contributed to by missed doses and dietary change.',[10,11,12],{alt:'Type 2 diabetes mellitus, glycaemic control worsening (HbA1c 7.1% to 7.8%) in the setting of missed Metformin doses and increased eating out.'}),
  it('A','Hypertension, above target (148/92 mmHg).',[13],{alt:'Hypertension, not at target: clinic BP 148/92 mmHg, home readings around 140 systolic.'}),
  it('P','Chest X-ray in view of exertional breathlessness.',[18]),
  it('P','Short course of antihistamine with a night-time cough suppressant.',[18]),
  it('P','Increase Metformin to 1000 mg BD with meals; counselled on gastrointestinal side effects, to call the clinic if severe.',[20,22]),
  it('P','Continue Telmisartan 40 mg OD; home BP every morning for 2 weeks; add a second agent if persistently above 140/90.',[20]),
  it('P','Investigations: lipid profile, renal function tests; repeat HbA1c in 3 months.',[22]),
  it('P','Review in 2 weeks with X-ray and BP log; earlier if fever, chest pain or worsening breathlessness.',[24])
]}
var AMBIENT_NA=['Allergies','Smoking history','Family history','Weight / BMI'];

var DICT_TRANSCRIPT=[
  seg(1,'00:00','d','Dictation for patient A.P., seven-year-old boy, brought by mother.'),
  seg(2,'00:05','d','Presenting with fever for three days, up to 102 Fahrenheit, with sore throat and reduced appetite. No cough, no vomiting, no rash. Passing urine normally.'),
  seg(3,'00:18','d','No known drug allergies. Immunisations up to date as per mother.'),
  seg(4,'00:23','d','On examination, temperature 101.2, alert and playful, well hydrated. Throat shows enlarged congested tonsils with exudate on the right. Tender anterior cervical nodes. Chest clear, abdomen soft.'),
  seg(5,'00:41','d','Impression: acute tonsillitis, likely bacterial given exudate and lymphadenopathy.'),
  seg(6,'00:47','d','Plan: Amoxicillin 250 milligrams three times daily for seven days, paracetamol syrup for fever, warm fluids, review in three days or earlier if difficulty swallowing or breathing. Weight was 22 kilos.')
];
function dictItems(){return [
  it('S','7-year-old boy brought by mother with 3-day fever up to 102°F, sore throat and reduced appetite.',[1,2]),
  it('S','No cough, vomiting or rash; passing urine normally.',[2]),
  it('S','No known drug allergies; immunisations up to date per mother.',[3]),
  it('O','Temperature 101.2°F, alert and playful, well hydrated. Weight 22 kg.',[4,6]),
  it('O','Enlarged congested tonsils with right-sided exudate; tender anterior cervical lymph nodes. Chest clear, abdomen soft.',[4]),
  it('A','Acute tonsillitis, likely bacterial (exudate, lymphadenopathy).',[5]),
  it('P','Amoxicillin 250 mg TDS for 7 days; paracetamol syrup for fever; warm fluids.',[6]),
  it('P','Review in 3 days, earlier if difficulty swallowing or breathing.',[6])
]}
var DICT_NA=['Family history','Sick contacts at school'];

var FU_TRANSCRIPT=[
  seg(1,'00:00','d','Hello Ms. Mehta. Same as last time, the AI assistant is recording to help with the notes, is that alright?',{consent:true}),
  seg(2,'00:06','p','Yes, no problem.',{consent:true}),
  seg(3,'00:08','d','How have the migraines been since we started the Propranolol?'),
  seg(4,'00:12','p','Much better. Maybe two attacks in the whole month, and milder. Before it was two a week.'),
  seg(5,'00:20','d','Any dizziness or tiredness with the tablet? Are you taking the 40 at night?'),
  seg(6,'00:25','p','Yes, 40 at night. Slight tiredness in the first week, now it is fine.'),
  seg(7,'00:31','d','Good. Blood pressure is 112 over 74, pulse 64. I will continue the same dose for three more months and we will review. Keep the headache diary going and avoid skipping meals.'),
  seg(8,'00:46','p','Okay, thank you doctor.')
];
function fuItems(){return [
  it('S','Migraine frequency reduced from about twice weekly to two attacks in the past month, milder in intensity, since starting Propranolol 40 mg at night.',[3,4,6]),
  it('S','Mild tiredness in the first week, now resolved; no dizziness reported.',[5,6]),
  it('O','BP 112/74 mmHg, pulse 64 bpm.',[7]),
  it('A','Migraine without aura, good response to Propranolol prophylaxis.',[4,7]),
  it('P','Continue Propranolol 40 mg nocte for 3 months; maintain headache diary; avoid skipped meals; review in 3 months.',[7])
]}
var FU_NA=['Menstrual association','Analgesic use per week'];

var VISITS=[
  {id:'v1',patient:'R.K. · 52 M',date:'Today, 10:42',template:'soap',mode:'ambient',status:'draft',dur:'02:55',consentAt:'00:00',transcript:AMBIENT_TRANSCRIPT,items:ambientItems(),na:AMBIENT_NA,audio:'kept'},
  {id:'v2',patient:'A.P. · 7 M',date:'Today, 09:50',template:'general',mode:'dictation',status:'draft',dur:'00:58',consentAt:null,transcript:DICT_TRANSCRIPT,items:dictItems(),na:DICT_NA,audio:'kept'},
  {id:'v3',patient:'S.M. · 34 F',date:'Yesterday, 17:10',template:'followup',mode:'ambient',status:'signed',dur:'00:51',consentAt:'00:00',transcript:FU_TRANSCRIPT,items:fuItems(),na:FU_NA,audio:'deleted',signedAt:'Yesterday, 17:14'}
];
var VOCAB=['Metformin','Telmisartan','Glimepiride','Amlodipine','Pantoprazole','Levocetirizine','Azithromycin','HbA1c','Crepitations','Lipid profile','RFT','BD / OD / TDS'];

/* screens */
var state={screen:null,visit:null,recTimer:null,recSec:0,paused:false,wave:null,sel:null,mtab:'note',editing:null,pending:null};
var SCREENS=['visits','new','rec','proc','ws','vocab'];
function show(name){
  SCREENS.forEach(function(s){$('#scr-'+s).hidden=s!==name});
  state.screen=name;
  $('#tab-visits').classList.toggle('on',name!=='vocab');
  $('#tab-vocab').classList.toggle('on',name==='vocab');
  if(name==='visits')renderVisits();
  if(name==='vocab')renderVocab();
  if(name!=='rec')stopRec();
  window.scrollTo({top:0});
}
$('#tab-visits').addEventListener('click',function(){show('visits')});
$('#tab-vocab').addEventListener('click',function(){show('vocab')});
$('#btn-new').addEventListener('click',function(){show('new');syncConsentUI()});
$('#back-new').addEventListener('click',function(){show('visits')});
$('#back-ws').addEventListener('click',function(){show('visits')});

/* visits list */
function chipStatus(v){return v.status==='signed'?'<span class="chip signed">'+ICON_CHECK+'Signed</span>':'<span class="chip draft">Draft</span>'}
function chipAudio(v){return v.audio==='deleted'?'<span class="chip">Audio deleted</span>':'<span class="chip warn">Audio kept until signed + 24 h</span>'}
function renderVisits(){
  $('#st-total').textContent=VISITS.length;
  $('#st-draft').textContent=VISITS.filter(function(v){return v.status!=='signed'}).length;
  $('#greet-sub').textContent=VISITS.filter(function(v){return v.status!=='signed'}).length?'You have drafts waiting for review.':'All notes are signed.';
  $('#vlist').innerHTML=VISITS.map(function(v){
    return '<button class="vrow" data-id="'+v.id+'"><span class="avatar">'+esc(v.patient.slice(0,2))+'</span><span><div class="t">'+esc(v.patient)+'</div><div class="m"><span>'+esc(v.date)+'</span><span>'+TEMPLATES[v.template].name+'</span><span>'+(v.mode==='ambient'?'Recorded':'Dictated')+'</span><span class="mono">'+v.dur+'</span></div></span><span class="chips">'+chipStatus(v)+chipAudio(v)+'</span></button>';
  }).join('');
  $$('.vrow').forEach(function(b){b.addEventListener('click',function(){openVisit(b.getAttribute('data-id'))})});
}

/* new visit */
var newMode='ambient';
$$('#seg-mode button').forEach(function(b){b.addEventListener('click',function(){
  newMode=b.getAttribute('data-v');
  $$('#seg-mode button').forEach(function(x){x.classList.toggle('on',x===b)});
  syncConsentUI();
})});
function syncConsentUI(){
  var amb=newMode==='ambient';
  $('#consent-box').hidden=!amb;
  var ok=!amb||$('#f-consent').checked;
  $('#btn-start').disabled=!ok;
  $('#start-hint').textContent=amb?(ok?'Consent will be logged when you press start.':'Consent is required to start.'):'Dictation records only you. No patient consent step.';
}
$('#f-consent').addEventListener('change',syncConsentUI);
$('#form-new').addEventListener('submit',function(e){
  e.preventDefault();
  var tpl=$('#f-template').value;
  state.pending={patient:$('#f-patient').value.trim()||'Unnamed · —',template:tpl,mode:newMode};
  $('#rec-title').textContent=(newMode==='ambient'?'Recording consultation':'Recording dictation')+' · '+state.pending.patient;
  $('#rec-mode').textContent=newMode==='ambient'?'Ambient':'Dictation';
  $('#rec-template').textContent=TEMPLATES[tpl].name;
  show('rec'); startRec();
});

/* recording */
function fmt(s){var m=Math.floor(s/60),x=s%60;return (m<10?'0':'')+m+':'+(x<10?'0':'')+x}
function startRec(){
  state.recSec=0;state.paused=false;
  $('#rec-timer').textContent='00:00';
  $('#btn-pause').textContent='Pause';$('#rec-live').classList.remove('paused');$('#rec-live-t').textContent='Listening';
  state.recTimer=setInterval(function(){if(!state.paused){state.recSec++;$('#rec-timer').textContent=fmt(state.recSec)}},1000);
  drawWave();
}
function stopRec(){ if(state.recTimer){clearInterval(state.recTimer);state.recTimer=null} if(state.wave){cancelAnimationFrame(state.wave);state.wave=null} }
function drawWave(){
  var c=$('#wave'),ctx=c.getContext('2d'),W=c.width,H=c.height,n=64,bars=[];
  for(var i=0;i<n;i++)bars.push(0.2);
  var css=getComputedStyle(document.documentElement);
  function frame(){
    var accent=css.getPropertyValue('--accent').trim()||'#0F6E79',line=css.getPropertyValue('--line').trim()||'#ccc';
    ctx.clearRect(0,0,W,H);
    var bw=W/n;
    for(var i=0;i<n;i++){
      var target=state.paused?0.08:0.1+Math.random()*(0.3+0.6*Math.abs(Math.sin(i/5+Date.now()/700)));
      bars[i]+=(target-bars[i])*0.25;
      var h=bars[i]*H*0.9;
      ctx.fillStyle=state.paused?line:accent;
      ctx.globalAlpha=0.35+0.65*bars[i];
      ctx.fillRect(i*bw+bw*0.25,(H-h)/2,bw*0.5,h);
    }
    ctx.globalAlpha=1;
    state.wave=requestAnimationFrame(frame);
  }
  frame();
}
$('#btn-pause').addEventListener('click',function(){
  state.paused=!state.paused;
  this.textContent=state.paused?'Resume':'Pause';
  $('#rec-live').classList.toggle('paused',state.paused);
  $('#rec-live-t').textContent=state.paused?'Paused':'Listening';
});
$('#btn-stop').addEventListener('click',function(){
  var dur=fmt(Math.max(state.recSec,1));
  stopRec();
  runProcessing(function(){
    var p=state.pending,amb=p.mode==='ambient';
    var v={id:'v'+(VISITS.length+1),patient:p.patient,date:'Today, '+nowHM(),template:p.template,mode:p.mode,status:'draft',dur:dur,consentAt:amb?'00:00':null,
      transcript:amb?AMBIENT_TRANSCRIPT:DICT_TRANSCRIPT,items:amb?ambientItems():dictItems(),na:amb?AMBIENT_NA:DICT_NA,audio:'kept'};
    VISITS.unshift(v);
    openVisit(v.id);
    toast('Draft note ready. Review, edit and sign.');
  });
});
function nowHM(){var d=new Date();return (d.getHours()<10?'0':'')+d.getHours()+':'+(d.getMinutes()<10?'0':'')+d.getMinutes()}

/* processing */
function runProcessing(done){
  var reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var steps=[['Uploading audio','0.4 s'],['Transcribing with medical speech model','6 s'],['Separating speakers and matching vocabulary','1 s'],['Drafting note in '+TEMPLATES[state.pending.template].name+' template','9 s'],['Checking every line against the transcript','3 s']];
  var box=$('#proc');
  box.innerHTML=steps.map(function(s){return '<div class="st"><span class="ic"></span><span>'+s[0]+'</span><span class="tm">'+s[1]+'</span></div>'}).join('');
  show('proc');
  var els=$$('.st',box),i=0;
  function next(){
    if(i>0){els[i-1].classList.remove('run');els[i-1].classList.add('done');$('.ic',els[i-1]).innerHTML=ICON_CHECK}
    if(i>=els.length){setTimeout(done,reduced?0:300);return}
    els[i].classList.add('run'); i++;
    setTimeout(next,reduced?60:(i===2||i===4?1100:600));
  }
  next();
}

/* workspace */
function openVisit(id){
  var v=VISITS.filter(function(x){return x.id===id})[0]; if(!v)return;
  state.visit=v; state.sel=null; state.mtab='note'; state.editing=null;
  show('ws'); renderWS();
}
function renderWS(){
  var v=state.visit,t=TEMPLATES[v.template],signed=v.status==='signed';
  $('#ws-title').textContent=v.patient;
  $('#ws-meta').innerHTML='<span class="chip">'+esc(v.date)+'</span><span class="chip acc">'+t.name+'</span><span class="chip">'+(v.mode==='ambient'?'Recorded':'Dictated')+' · '+v.dur+'</span>'+chipStatus(v)+(v.consentAt?'<span class="chip">'+ICON_CHECK+'Verbal consent at '+v.consentAt+'</span>':'')+chipAudio(v);
  $('#ws-tname').textContent=t.name+' · '+v.items.length+' statements';
  $('#ws-trmeta').textContent=v.transcript.length+' turns · '+v.dur;
  var acts=$('#ws-acts');
  if(signed){acts.innerHTML='<button class="btn" id="btn-export">Export preview</button><span class="chip signed">'+ICON_CHECK+'Signed '+esc(v.signedAt||'')+'</span>'}
  else{acts.innerHTML='<button class="btn" id="btn-export">Export preview</button><button class="btn ok" id="btn-sign">'+ICON_CHECK+'Sign note</button>'}
  $('#btn-export').addEventListener('click',openExport);
  if(!signed)$('#btn-sign').addEventListener('click',askSign);
  renderNote(); renderTranscript(); syncMtabs();
}
function unsupported(i){return i.ev.length===0&&!i.edited}
function renderNote(){
  var v=state.visit,t=TEMPLATES[v.template],signed=v.status==='signed';
  var segById={}; v.transcript.forEach(function(s){segById[s.id]=s});
  $('#note').innerHTML=t.sections.map(function(sec){
    var cat=sec[0],name=sec[1],items=v.items.filter(function(i){return i.cat===cat});
    var html='<div class="sec" data-cat="'+cat+'"><div class="sec-h"><h3>'+name+'</h3><span class="sp">'+
      '<button class="ib" data-act="copy" data-cat="'+cat+'" title="Copy section"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="8" y="2" width="12" height="14" rx="2"/><path d="M16 16v3a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h2"/></svg>Copy</button>'+
      (signed?'':'<button class="ib" data-act="regen" data-cat="'+cat+'" title="Regenerate this section"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M20 12a8 8 0 1 1-2.3-5.7M20 4v5h-5"/></svg>Regenerate</button><button class="ib" data-act="edit" data-cat="'+cat+'" title="Edit section"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 20h4l10-10-4-4L4 16zM13 7l4 4"/></svg>Edit</button>')+
      '</span></div>';
    if(state.editing===cat){
      html+='<div class="editbox"><textarea id="edit-ta" aria-label="Edit '+name+'">'+esc(items.map(function(i){return i.text}).join('\n'))+'</textarea><div class="r"><button class="btn sm" data-act="cancel">Cancel</button><button class="btn sm primary" data-act="save" data-cat="'+cat+'">Save section</button></div><div style="font-size:12px;color:var(--muted)">One statement per line. Edited lines are marked as written by you and lose their transcript links.</div></div>';
    } else if(!items.length){
      html+='<div style="color:var(--muted);font-size:13px">Nothing recorded for this section.</div>';
    } else {
      html+='<div class="items">'+items.map(function(i){
        var uns=unsupported(i),on=state.sel===i.id;
        var ev=i.ev.map(function(id){var s=segById[id];return s?'<span>'+s.t+'</span>':''}).join('');
        return '<button class="item'+(uns?' uns':'')+(on?' on':'')+(i.edited?' edited':'')+'" data-item="'+i.id+'"><span class="bul"></span><span><span>'+esc(i.text)+'</span>'+(i.edited?'<span class="edtag">edited by doctor</span>':'')+
          (uns?'<span class="flag">'+ICON_WARN+'No source in transcript'+(signed?'':' <button data-act="remove" data-item="'+i.id+'">Remove</button> <button data-act="keep" data-item="'+i.id+'">Keep as my own</button>')+'</span>':(i.ev.length?'<span class="ev">'+ev+'</span>':''))+
          '</span></button>';
      }).join('')+'</div>';
    }
    return html+'</div>';
  }).join('');
  $('#na').innerHTML='<b>Not addressed in this visit</b> · listed instead of guessed<div class="pills">'+v.na.map(function(x){return '<span>'+esc(x)+'</span>'}).join('')+'</div>';
  $$('#note .item').forEach(function(b){b.addEventListener('click',function(e){
    if(e.target.closest('[data-act]'))return;
    selectItem(b.getAttribute('data-item'));
  })});
  $$('#note [data-act]').forEach(function(b){b.addEventListener('click',function(e){e.stopPropagation();onAct(b)})});
  var ta=$('#edit-ta'); if(ta)ta.focus();
}
function selectItem(id){
  var v=state.visit,i=v.items.filter(function(x){return x.id===id})[0];
  state.sel=state.sel===id?null:id;
  $$('#note .item').forEach(function(b){b.classList.toggle('on',b.getAttribute('data-item')===state.sel)});
  var ids=state.sel&&i?i.ev:[];
  var first=null;
  $$('#tr .seg-row').forEach(function(r){var on=ids.indexOf(+r.getAttribute('data-seg'))>-1;r.classList.toggle('hl',on);if(on&&!first)first=r});
  if(first){ if(window.innerWidth<=900){state.mtab='tr';syncMtabs()} first.scrollIntoView({block:'center',behavior:'smooth'}) }
}
function onAct(b){
  var act=b.getAttribute('data-act'),cat=b.getAttribute('data-cat'),v=state.visit;
  if(act==='copy'){copyText(sectionText(v,cat),'Section copied')}
  if(act==='edit'){state.editing=cat;renderNote()}
  if(act==='cancel'){state.editing=null;renderNote()}
  if(act==='save'){
    var lines=$('#edit-ta').value.split('\n').map(function(s){return s.trim()}).filter(Boolean);
    var old=v.items.filter(function(i){return i.cat===cat});
    var fresh=lines.map(function(l){var same=old.filter(function(o){return o.text===l})[0];return same||it(cat,l,[],{edited:true})});
    v.items=v.items.filter(function(i){return i.cat!==cat}).concat(fresh);
    state.editing=null;renderWS();toast('Section saved');
  }
  if(act==='regen'){
    b.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" style="animation:spin .9s linear infinite"><path d="M20 12a8 8 0 1 1-2.3-5.7M20 4v5h-5"/></svg>Drafting…';
    setTimeout(function(){
      var changed=0;
      v.items.forEach(function(i){if(i.cat===cat&&i.alt){var t=i.text;i.text=i.alt;i.alt=t;changed++}});
      renderNote();
      toast(changed?'Section regenerated from the same transcript':'Regenerated. The sample has one phrasing for this section.');
    },900);
  }
  if(act==='remove'){var id=b.getAttribute('data-item');v.items=v.items.filter(function(i){return i.id!==id});renderWS();toast('Unsupported line removed')}
  if(act==='keep'){var id2=b.getAttribute('data-item');v.items.forEach(function(i){if(i.id===id2)i.edited=true});renderNote();toast('Kept and marked as written by you')}
}
function sectionText(v,cat){var t=TEMPLATES[v.template],name=t.sections.filter(function(s){return s[0]===cat})[0][1];return name+'\n'+v.items.filter(function(i){return i.cat===cat}).map(function(i){return '- '+i.text}).join('\n')}
function noteText(v){var t=TEMPLATES[v.template];return v.patient+' · '+v.date+' · '+t.name+'\n\n'+t.sections.map(function(s){return sectionText(v,s[0])}).join('\n\n')+(v.na.length?'\n\nNot addressed: '+v.na.join(', '):'')}
$('#btn-copy-all').addEventListener('click',function(){copyText(noteText(state.visit),'Whole note copied')});

function renderTranscript(){
  var v=state.visit;
  $('#tr').innerHTML=v.transcript.map(function(s){
    return '<div class="seg-row '+s.who+(s.consent?' consent':'')+'" data-seg="'+s.id+'"><span class="t">'+s.t+'</span><span><div class="who">'+(s.who==='d'?'Doctor':'Patient')+(s.consent?' · consent':'')+'</div><div class="x">'+esc(s.text)+'</div></span></div>';
  }).join('');
  $('#tr-foot').innerHTML=(v.audio==='deleted'?'<span class="chip">Audio deleted after signing</span>':'<span class="chip warn">Audio kept · deleted 24 h after signing</span>')+'<span>'+(v.mode==='ambient'?'Speaker labels from the medical speech model.':'Dictation: single speaker.')+'</span>';
}
function syncMtabs(){
  var note=state.mtab==='note';
  $('#mt-note').classList.toggle('on',note);$('#mt-tr').classList.toggle('on',!note);
  $('#note-pane').classList.toggle('off',!note);$('#tr-pane').classList.toggle('off',note);
}
$('#mt-note').addEventListener('click',function(){state.mtab='note';syncMtabs()});
$('#mt-tr').addEventListener('click',function(){state.mtab='tr';syncMtabs()});

function askSign(){
  var v=state.visit,uns=v.items.filter(unsupported).length;
  var acts=$('#ws-acts');
  acts.innerHTML='<div class="confirm">'+(uns?'<span style="color:var(--warn)">'+uns+' unsupported line'+(uns>1?'s':'')+' still in the note.</span>':'<span>Sign and lock this note?</span>')+'<button class="btn sm" id="sign-no">Back</button><button class="btn sm ok" id="sign-yes">'+(uns?'Sign anyway':'Yes, sign')+'</button></div>';
  $('#sign-no').addEventListener('click',renderWS);
  $('#sign-yes').addEventListener('click',function(){
    v.status='signed';v.signedAt='Today, '+nowHM();v.items.forEach(function(i){if(unsupported(i))i.edited=true});
    state.editing=null;renderWS();toast('Note signed. Audio will be deleted in 24 hours.');
  });
}

/* export preview */
function openExport(){
  var v=state.visit,t=TEMPLATES[v.template];
  var body=t.sections.map(function(s){var items=v.items.filter(function(i){return i.cat===s[0]});return '<h4>'+s[1]+'</h4>'+(items.length?'<ul>'+items.map(function(i){return '<li>'+esc(i.text)+'</li>'}).join('')+'</ul>':'<p style="color:var(--muted)">—</p>')}).join('');
  var html='<div class="modal" id="modal"><div class="box"><div class="bh"><h3>Export preview</h3><span class="sp"><button class="btn sm" id="m-copy">Copy as text</button><button class="btn sm primary" id="m-close">Close</button></span></div>'+
    '<div class="doc"><div class="dh"><div><b>'+esc(me.clinic)+'</b><div style="font-size:12.5px;color:var(--muted)">'+esc(me.name)+' · '+esc(me.role)+'</div></div><div class="r">'+esc(v.patient)+'<br>'+esc(v.date)+'<br>'+t.name+' note</div></div>'+body+
    (v.na.length?'<h4>Not addressed</h4><p style="font-size:13.5px">'+esc(v.na.join(', '))+'</p>':'')+
    '<div class="sig">'+(v.status==='signed'?'Electronically signed by '+esc(me.name)+' · '+esc(v.signedAt||''):'Unsigned draft · not for the record')+'<br>Drafted with ClinicScribe from a '+(v.mode==='ambient'?'recorded consultation':'dictation')+' ('+v.dur+')'+(v.consentAt?' · patient consent at '+v.consentAt:'')+'</div></div>'+
    '<div style="padding:10px 16px;border-top:1px solid var(--line);font-size:12.5px;color:var(--muted)">This is how the PDF will look. The download button is part of the full build.</div></div></div>';
  $('#modal-root').innerHTML=html;
  $('#m-close').addEventListener('click',function(){$('#modal-root').innerHTML=''});
  $('#modal').addEventListener('click',function(e){if(e.target.id==='modal')$('#modal-root').innerHTML=''});
  $('#m-copy').addEventListener('click',function(){copyText(noteText(v),'Note copied as text')});
}

/* vocabulary */
function renderVocab(){
  $('#vocab').innerHTML=VOCAB.map(function(t,i){return '<span>'+esc(t)+'<button data-i="'+i+'" aria-label="Remove '+esc(t)+'">×</button></span>'}).join('');
  $$('#vocab button').forEach(function(b){b.addEventListener('click',function(){VOCAB.splice(+b.getAttribute('data-i'),1);renderVocab()})});
}
$('#form-vocab').addEventListener('submit',function(e){e.preventDefault();var v=$('#f-term').value.trim();if(!v)return;VOCAB.push(v);$('#f-term').value='';renderVocab();toast('Added. Sent to the speech model on the next recording.')});

/* utils */
function copyText(text,msg){
  var ok=function(){toast(msg)};
  var fallback=function(){var ta=document.createElement('textarea');ta.value=text;ta.style.position='fixed';ta.style.opacity='0';document.body.appendChild(ta);ta.select();try{document.execCommand('copy');ok()}catch(e){toast('Select and copy manually')}document.body.removeChild(ta)};
  if(navigator.clipboard&&navigator.clipboard.writeText){navigator.clipboard.writeText(text).then(ok,fallback)}else fallback();
}
var toastT=null;
function toast(msg){var r=$('#toast-root');r.innerHTML='<div class="toast">'+esc(msg)+'</div>';clearTimeout(toastT);toastT=setTimeout(function(){r.innerHTML=''},2600)}

show('visits');
})();
