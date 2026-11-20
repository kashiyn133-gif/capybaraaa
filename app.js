const $=s=>document.querySelector(s),KEY='capyplan.v1';
let S={tasks:[],log:{}};try{S=JSON.parse(localStorage.getItem(KEY))||S}catch(e){}
const save=()=>{try{localStorage.setItem(KEY,JSON.stringify(S))}catch(e){}};
const pad=n=>String(n).padStart(2,'0'),ds=d=>`${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
const today=()=>ds(new Date()),addDays=n=>{const d=new Date();d.setDate(d.getDate()+n);return ds(d)};
const esc=s=>s.replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const WD=['sun','mon','tue','wed','thu','fri','sat'];
function parse(line){let t=line.trim();if(!t)return null;let imp=(t.match(/!/g)||[]).length,est=0,due=null,tags=[];
 t=t.replace(/~\s*(\d+)\s*(m|min|h|hr)?/i,(_,n,u)=>{est=/h/i.test(u||'')?n*60:+n;return ''});
 t=t.replace(/#(\w+)/g,(_,g)=>{tags.push(g.toLowerCase());return ''});
 t=t.replace(/\b(today|tonight)\b/i,()=>{due=today();return ''}).replace(/\btomorrow\b/i,()=>{due=addDays(1);return ''});
 t=t.replace(/\b(sun|mon|tue|wed|thu|fri|sat)[a-z]*\b/i,(m,w)=>{if(due)return m;const k=WD.indexOf(w.toLowerCase());let n=(k-new Date().getDay()+7)%7||7;due=addDays(n);return ''});
 t=t.replace(/\b(\d{1,2})\/(\d{1,2})\b/,(_,m,d)=>{const y=new Date().getFullYear();due=`${y}-${pad(m)}-${pad(d)}`;return ''});
 t=t.replace(/!+/g,'').replace(/\s+/g,' ').trim();if(!t)return null;
 return{id:Date.now()+Math.random(),title:t,imp,est,due,tags,done:false,spent:0}}
const dd=t=>t.due?Math.round((new Date(t.due+'T00:00')-new Date(today()+'T00:00'))/864e5):null;
function score(t){let s=Math.min(t.imp,3)*14,d=dd(t);if(d!==null)s+=d<0?45:d===0?40:d===1?28:d<=3?18:d<=7?8:0;
 const left=(t.est||25);s+=left<=15?10:left<=30?5:0;s+=Math.min(t.spent/5,6);return Math.round(s)}
const open=()=>S.tasks.filter(t=>!t.done).sort((a,b)=>score(b)-score(a));
function dueLabel(t){const d=dd(t);return d===null?'':d<0?`${-d}d overdue`:d===0?'due today':d===1?'due tomorrow':`due in ${d}d`}
function renderTasks(){const all=[...open(),...S.tasks.filter(t=>t.done)];$('#empty').hidden=all.length>0;$('#count').textContent=all.length?`(${open().length} open)`:'';
 $('#list').innerHTML=all.map(t=>`<li class="${t.done?'done':''}"><input type="checkbox" data-d="${t.id}" ${t.done?'checked':''} aria-label="Done"><div class="t"><b>${esc(t.title)}</b><div class="meta">${dueLabel(t)?`<span class="tag ${dd(t)<=0?'hot':''}">${dueLabel(t)}</span>`:''}${t.rem&&!t.reminded?`<span class="tag">⏰ ${new Date(t.rem).toLocaleTimeString([],{hour:'numeric',minute:'2-digit'})}</span>`:''}${t.est?`<span class="tag">${t.est}m</span>`:(learned(t)?`<span class="tag">≈${learned(t)}m learned</span>`:'')}${t.spent?`<span class="tag">${t.spent}m focused</span>`:''}${t.tags.map(g=>`<span class="tag">#${esc(g)}</span>`).join('')}</div></div>${t.done?'':`<span class="sc" title="Priority score">${score(t)}</span><button data-f="${t.id}">Focus</button>`}<button class="ghost" data-x="${t.id}" aria-label="Delete">✕</button></li>`).join('');
 const o=open();$('#sel').innerHTML='<option value="">Free focus (no task)</option>'+o.map(t=>`<option value="${t.id}">${esc(t.title)}</option>`).join('');if(sel)$('#sel').value=sel}
let sel='';
function buildPlan(){let rem=+$('#avail').value||60,now=new Date();now.setMinutes(Math.ceil(now.getMinutes()/5)*5,0,0);let at=now.getTime(),out=[],skip=[];
 for(const t of open()){const need=Math.max(5,eff(t)-Math.min(t.spent,eff(t)-5));
  if(need<=rem){out.push({t,need,at});at+=need*6e4;rem-=need;if(rem>=10&&need>=25){out.push({br:1,need:5,at});at+=3e5;rem-=5}}else skip.push(t)}
 const f=x=>new Date(x).toLocaleTimeString([],{hour:'numeric',minute:'2-digit'});
 $('#plan').innerHTML=out.map(p=>p.br?`<li class="br"><time>${f(p.at)}</time><span>Break: water, stretch</span><span>5m</span></li>`:`<li><time>${f(p.at)}</time><span><b>${esc(p.t.title)}</b> <span class="tag">score ${score(p.t)}</span></span><button data-f="${p.t.id}">Focus</button></li>`).join('')||'<li class="br"><span></span><span>Add some tasks first.</span></li>';
 $('#skip').textContent=skip.length?`Didn't fit: ${skip.map(t=>t.title).join(', ')}. Shrink the list or add time.`:out.length?'Everything fits. Nice.':''}
/* Focus timer */
const C=326.7;let T={mode:'focus',len:25,end:0,left:25*60,run:false};
const fmt=s=>`${pad(Math.floor(s/60))}:${pad(s%60)}`;
function drawTimer(){const tot=(T.mode==='focus'?T.len:5)*60;$('#time').textContent=fmt(Math.max(0,Math.ceil(T.left)));$('#mode').textContent=T.mode==='focus'?'Focus':'Break';$('#arc').style.strokeDashoffset=C*(1-T.left/tot);$('#go').textContent=T.run?'Pause':(T.left<tot?'Resume':T.mode==='focus'?'Start focus':'Start break');document.title=T.run?`${fmt(Math.ceil(T.left))} · CapyPlan`:'CapyPlan';drawCapy()}
setInterval(()=>{if(!T.run)return;T.left=(T.end-Date.now())/1000;if(T.left<=0)finish();drawTimer()},250);
function toggle(){if(T.run){T.run=false}else{T.end=Date.now()+T.left*1000;T.run=true}drawTimer()}
function reset(){T.run=false;T.left=(T.mode==='focus'?T.len:5)*60;drawTimer()}
function beep(){try{const a=new AudioContext();[0,.25,.5].forEach((d,i)=>{const o=a.createOscillator(),g=a.createGain();o.frequency.value=520+i*130;g.gain.value=.15;o.connect(g);g.connect(a.destination);o.start(a.currentTime+d);o.stop(a.currentTime+d+.2)})}catch(e){}}
function finish(){T.run=false;beep();if(T.mode==='focus'){const k=today();S.log[k]=(S.log[k]||0)+T.len;S.hrs=S.hrs||{};const hh=new Date().getHours();S.hrs[hh]=(S.hrs[hh]||0)+T.len;const t=S.tasks.find(t=>t.id==sel);if(t)t.spent+=T.len;save();document.dispatchEvent(new Event('capy:win'));celebrateCapy('happy');T.mode='break';T.left=300;speak(`+${T.len} focus minutes. Take 5.`);renderTasks();renderStats()}else{T.mode='focus';T.left=T.len*60;speak('Break over. Ready?')}drawTimer()}
/* Capybara */
const LV=[[0,'Pond Pup'],[25,'Chill Capy'],[100,'Focus Capy'],[250,'Zen Capy'],[500,'Capy Legend']];
const total=()=>Object.values(S.log).reduce((a,b)=>a+b,0);
const lvl=()=>{const m=total();let l=0;LV.forEach((x,i)=>{if(m>=x[0])l=i});return l};
let msg='';function speak(m){msg=m;drawCapy();setTimeout(()=>{msg='';drawCapy()},4000)}
function drawCapy(){
 const l=lvl(),f=T.run&&T.mode==='focus',stage=$('#pond'),mascot=$('#capy-mascot'),bubble=$('#mascot-bubble');
 if(!stage||!mascot)return;
 stage.classList.toggle('is-focusing',!!f);
 stage.classList.toggle('has-message',!!msg);
 stage.dataset.level=String(l);
 mascot.alt=f?'Capybara is cheering you on while you focus':msg?'Capybara has a message for you':'Your friendly 3D capybara companion';
 if(bubble)bubble.textContent=msg|| (f?"You are doing great. Stay in your flow.":"Hi, friend! Ready when you are.");
 const m=total(),nx=LV[l+1];$('#cname').textContent=LV[l][1];$('#xp').style.width=nx?Math.min(100,(m-LV[l][0])/(nx[0]-LV[l][0])*100)+'%':'100%';$('#cnext').textContent=nx?`${nx[0]-m} focus minutes until ${nx[1]}`:'Max level. You are the capybara now.';
}
$('#pond').onclick=()=>speak(['You have got this. One thing at a time.','A tiny pause can make a big difference.','Hydrate, stretch, then keep going.','I believe in your little steps.'][Math.random()*4|0]);
function celebrateCapy(kind='happy') {const stage=$('#pond');if(!stage)return;stage.classList.remove('celebrate','thinking','wave');void stage.offsetWidth;stage.classList.add(kind==='think'?'thinking':kind==='wave'?'wave':'celebrate');setTimeout(()=>stage.classList.remove('celebrate','thinking','wave'),1300)}

function renderStats(){const days=[...Array(7)].map((_,i)=>{const d=new Date();d.setDate(d.getDate()-6+i);return[ds(d),['S','M','T','W','T','F','S'][d.getDay()]]});const max=Math.max(30,...days.map(d=>S.log[d[0]]||0));
 $('#week').innerHTML=days.map(([k,n],i)=>`<div class="${i==6?'today':''}" title="${S.log[k]||0} min"><i style="height:${(S.log[k]||0)/max*80}px"></i>${n}</div>`).join('');
 let st=0,d=new Date();if(!S.log[ds(d)])d.setDate(d.getDate()-1);while(S.log[ds(d)]>0){st++;d.setDate(d.getDate()-1)}
 const wk=days.reduce((a,d)=>a+(S.log[d[0]]||0),0);$('#sum').textContent=`${S.log[today()]||0} min today · ${wk} min this week · ${st}-day streak`}
/* Events */
$('#add').onclick=()=>{const n=$('#txt').value.split('\n').map(parse).filter(Boolean);S.tasks.push(...n);$('#txt').value='';save();renderTasks();buildPlan();if(n.length)celebrateCapy('happy')};
$('#demo').onclick=()=>{$('#txt').value=`physics lab report ! fri ~90m #school\nemail coach today ~5m #sports\nhackathon demo video tomorrow !! ~60m #hack\nread 20 pages of English novel ~30m #school\nclean desk ~15m\nplan weekend trip ~20m`;$('#add').click()};
$('#mk').onclick=()=>{buildPlan();celebrateCapy('think')};$('#go').onclick=()=>{toggle();celebrateCapy(T.run?'wave':'happy')};$('#rst').onclick=reset;$('#sel').onchange=e=>sel=e.target.value;
document.querySelectorAll('.chip').forEach(b=>b.onclick=()=>{document.querySelectorAll('.chip').forEach(c=>c.classList.remove('on'));b.classList.add('on');T.len=+b.dataset.m;if(T.mode==='focus'&&!T.run)reset()});
document.addEventListener('click',e=>{const t=e.target,g=k=>t.dataset[k];
 if(g('f')){sel=g('f');$('#sel').value=sel;T.mode='focus';reset();if(!T.run)toggle();$('.hero').scrollIntoView({behavior:'smooth'})}
 if(g('x')){S.tasks=S.tasks.filter(x=>x.id!=g('x'));save();renderTasks();buildPlan()}
 if(g('d')){const x=S.tasks.find(x=>x.id==g('d'));x.done=t.checked;x.doneAt=t.checked?Date.now():0;save();renderTasks();buildPlan();if(t.checked){speak('Task crushed!');celebrateCapy('happy')}}});
document.addEventListener('keydown',e=>{if(e.code==='Space'&&!/INPUT|TEXTAREA|SELECT|BUTTON/.test(e.target.tagName)){e.preventDefault();toggle()}});
renderTasks();renderStats();buildPlan();drawTimer();

/* Capy Call reminders */
const _p=parse;
parse=function(line){let rem=0;
 line=line.replace(/@\s*in\s*(\d+)\s*(m|min|h|hr)\b/i,(_,n,u)=>{rem=Date.now()+n*(/h/i.test(u)?36e5:6e4);return ''});
 if(!rem)line=line.replace(/@\s*(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/i,(_,h,mi,ap)=>{h=+h;if(ap){ap=ap.toLowerCase();if(ap=='pm'&&h<12)h+=12;if(ap=='am'&&h==12)h=0}rem={h,mi:+(mi||0)};return ''});
 const t=_p(line);if(!t)return null;
 if(rem&&typeof rem==='object'){const d=new Date((t.due||today())+'T00:00');d.setHours(rem.h,rem.mi);if(d<Date.now()&&!t.due)d.setDate(d.getDate()+1);rem=+d}
 if(rem){t.rem=rem;t.reminded=false}return t};
let ringT=0,callTask=null;
function ringTone(){try{const a=new AudioContext(),b=(f,d)=>{const o=a.createOscillator(),g=a.createGain();o.frequency.value=f;g.gain.value=.12;o.connect(g);g.connect(a.destination);o.start(a.currentTime+d);o.stop(a.currentTime+d+.18)};b(660,0);b(880,.22);b(660,.6);b(880,.82)}catch(e){}}
function say(x){try{speechSynthesis.cancel();speechSynthesis.speak(new SpeechSynthesisUtterance(x))}catch(e){}}
function callMe(t){callTask=t;$('#ctask').textContent=t.title;$('#call').hidden=false;ringTone();clearInterval(ringT);ringT=setInterval(ringTone,2200);setTimeout(()=>{if(!$('#call').hidden)say(`Hey, it's Capy. Time to start ${t.title}.`)},900);try{if(Notification.permission==='granted')new Notification('Capy is calling',{body:t.title})}catch(e){}}
function endCall(){clearInterval(ringT);try{speechSynthesis.cancel()}catch(e){}$('#call').hidden=true}
$('#ans').onclick=()=>{const t=callTask;S.calls=(S.calls||0)+1;save();endCall();sel=t&&t.id||'';$('#sel').value=sel;T.mode='focus';reset();if(!T.run)toggle();$('.hero').scrollIntoView({behavior:'smooth'})};
$('#snz').onclick=()=>{if(callTask&&callTask.id){callTask.rem=Date.now()+3e5;callTask.reminded=false;save();renderTasks()}endCall()};
$('#dis').onclick=endCall;document.addEventListener('keydown',e=>{if(e.key==='Escape')endCall()});
$('#test').onclick=()=>{try{Notification.requestPermission()}catch(e){}callMe(open()[0]||{title:'Your most important task',id:''})};
setInterval(()=>{if(!$('#call').hidden)return;const t=S.tasks.find(t=>t.rem&&!t.reminded&&!t.done&&t.rem<=Date.now());if(t){t.reminded=true;save();callMe(t);renderTasks()}},4000);
/* Business view */
function renderBiz(){let wk=0;for(let i=0;i<7;i++){const d=new Date();d.setDate(d.getDate()-i);wk+=S.log[ds(d)]||0}
 const r=+$('#rate').value||0,n=S.tasks.filter(t=>t.done&&t.doneAt>Date.now()-6048e5).length,by={};
 S.tasks.forEach(t=>{if(t.spent){const k=t.tags[0]||'untagged';by[k]=(by[k]||0)+t.spent}});const mx=Math.max(1,...Object.values(by));
 $('#kpi').innerHTML=`<div><b>${(wk/60).toFixed(1)}h</b>focused this week</div><div><b>$${Math.round(wk/60*r)}</b>time value</div><div><b>${n}</b>tasks finished</div>`;
 $('#byt').innerHTML=Object.entries(by).sort((a,b)=>b[1]-a[1]).map(([k,v])=>`<li><span>#${esc(k)}</span><i style="width:${v/mx*100}%"></i><em>${v}m</em></li>`).join('')||'<li class="hint">Focus on a tagged task to see where your time goes.</li>'}
$('#rate').value=S.rate||15;$('#rate').onchange=()=>{S.rate=+$('#rate').value;save();renderBiz()};
$('#csv').onclick=()=>{const q=v=>`"${String(v??'').replace(/"/g,'""')}"`,rows=[['Task','Project','Due','Estimate_min','Focused_min','Done','Priority_score']].concat(S.tasks.map(t=>[t.title,t.tags[0]||'',t.due||'',t.est,t.spent,t.done?'yes':'no',score(t)]));
 const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([rows.map(r=>r.map(q).join(',')).join('\n')],{type:'text/csv'}));a.download=`capyplan-report-${today()}.csv`;a.click();$('#bmsg').textContent='Report downloaded. Opens in Excel or Google Sheets.'};
$('#stand').onclick=async()=>{const dn=S.tasks.filter(t=>t.done&&t.doneAt>Date.now()-864e5).map(t=>'- '+t.title),nx=open().slice(0,3).map(t=>'- '+t.title+(dueLabel(t)?` (${dueLabel(t)})`:''));
 const x=`Standup ${today()}\nDone:\n${dn.join('\n')||'- nothing yet'}\nNext:\n${nx.join('\n')||'- nothing queued'}\nFocused today: ${S.log[today()]||0} min`;
 try{await navigator.clipboard.writeText(x);$('#bmsg').textContent='Standup copied. Paste it into Slack or Discord.'}catch(e){prompt('Copy your standup:',x)}};
const _rt=renderTasks;renderTasks=function(){_rt();renderBiz()};const _rs=renderStats;renderStats=function(){_rs();renderBiz()};renderBiz();

/* Retention: goal, check-in call, badges, insights, backup */
function streakN(){let st=0,d=new Date();if(!S.log[ds(d)])d.setDate(d.getDate()-1);while(S.log[ds(d)]>0){st++;d.setDate(d.getDate()-1)}return st}
const hrs=f=>Object.keys(S.hrs||{}).some(h=>f(+h)&&S.hrs[h]>0);
const BD=[['First focus','Finish one focus session',()=>total()>0],['Warm-up','100 focus minutes',()=>total()>=100],['Deep diver','500 focus minutes',()=>total()>=500],['Finisher','Complete 10 tasks',()=>S.tasks.filter(t=>t.done).length>=10],['3-day streak','Focus 3 days in a row',()=>streakN()>=3],['Week warrior','7-day streak',()=>streakN()>=7],['Early bird','Focus before 8 am',()=>hrs(h=>h<8)],['Night owl','Focus after 9 pm',()=>hrs(h=>h>=21)],['Picked up','Answer a Capy call',()=>(S.calls||0)>0],['Goal getter','Hit your daily goal',()=>!!S.hit]];
function renderHabits(){const g=S.goal||50,m=S.log[today()]||0;if(m>=g)S.hit=1;
 $('#gbar').style.width=Math.min(100,m/g*100)+'%';$('#gtxt').textContent=m>=g?`Goal hit: ${m}/${g} min. Anything extra is bonus.`:`${m}/${g} min today. ${g-m} to go.`;
 const h=S.hrs||{},best=Object.keys(h).sort((a,b)=>h[b]-h[a])[0];let wk=0,lw=0;
 for(let i=0;i<7;i++){const a=new Date(),b=new Date();a.setDate(a.getDate()-i);b.setDate(b.getDate()-i-7);wk+=S.log[ds(a)]||0;lw+=S.log[ds(b)]||0}
 const fh=x=>`${x%12||12} ${x<12?'am':'pm'}`;
 $('#ins').innerHTML=(best!==undefined?`<b>Your best focus hour:</b> ${fh(+best)}. Put your hardest task there.<br>`:'Focus a few times and Capy will find your best hour.<br>')+(lw?`<b>This week:</b> ${wk>=lw?'+':''}${Math.round((wk-lw)/lw*100)}% vs last week.`:wk?'<b>This week:</b> a strong start. Next week you can compare.':'');
 const got=S.badges||[];
 $('#bdg').innerHTML=BD.map(([n,d,f])=>{const ok=f();if(ok&&!got.includes(n)){got.push(n);S.badges=got;save();speak('Badge unlocked: '+n)}return `<li class="${ok?'on':''}" title="${d}">${ok?'★':'☆'} ${n}</li>`}).join('')}
$('#goal').value=S.goal||50;$('#goal').onchange=()=>{S.goal=Math.max(10,+$('#goal').value||50);save();renderHabits()};
$('#chk').value=S.chk||'';$('#chk').onchange=()=>{S.chk=$('#chk').value;save();try{Notification.requestPermission()}catch(e){}speak(S.chk?`Daily check-in set for ${S.chk}`:'Check-in off')};
setInterval(()=>{if(!S.chk||S.chkDay===today()||!$('#call').hidden)return;const n=new Date();if(`${pad(n.getHours())}:${pad(n.getMinutes())}`>=S.chk){S.chkDay=today();save();callMe({title:'Daily check-in: pick your top 3 tasks',id:''})}},5000);
$('#bk').onclick=()=>{const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([JSON.stringify(S)],{type:'application/json'}));a.download=`capyplan-backup-${today()}.json`;a.click()};
$('#rs').onclick=()=>$('#rsf').click();
$('#rsf').onchange=e=>{const f=e.target.files[0];if(!f)return;const r=new FileReader();r.onload=()=>{try{const o=JSON.parse(r.result);if(!Array.isArray(o.tasks)||typeof o.log!=='object')throw 0;S=o;save();location.reload()}catch(x){alert('That file is not a CapyPlan backup.')}};r.readAsText(f)};
const _rs2=renderStats;renderStats=function(){_rs2();renderHabits()};renderHabits();

/* Capy Call v2: it rings first, the AI voice speaks after you answer */
let liveT=0,callAt=0,missT=0;try{speechSynthesis.getVoices()}catch(e){}
const pickVoice=()=>{const v=speechSynthesis.getVoices().filter(x=>/^en/i.test(x.lang));return v.find(x=>/Google US|Samantha|Aria|Jenny|Natural/i.test(x.name))||v[0]};
function script(t){const n=new Date().getHours(),g=n<12?'Good morning':n<18?'Good afternoon':'Good evening',o=open(),st=streakN(),goal=(S.goal||50)-(S.log[today()]||0);let s;
 if(!t.id){s=`${g}! It's Capy. Time for your daily check-in. You have ${o.length} open task${o.length==1?'':'s'}. `+(o[0]?`Your top priority is ${o[0].title}${dueLabel(o[0])?', '+dueLabel(o[0]):''}. `:'Add a few tasks and I will plan your day. ')}
 else{s=`${g}! It's Capy. Time to start: ${t.title}. `;if(dueLabel(t))s+=`It is ${dueLabel(t)}. `;if(t.est)s+=`It should take about ${t.est} minutes. `}
 s+=st>=2?`You are on a ${st} day streak, so let's keep it alive. `:goal>0?`You are ${goal} minutes away from today's goal. `:'You already hit your goal, so this one is bonus. ';
 return s+'Press start and I will count down with you.'}
function endLive(){clearInterval(liveT);liveT=0;try{speechSynthesis.cancel()}catch(e){}}
callMe=function(t){callTask=t;endLive();const p=$('#call .phone');p.classList.remove('live','talk');$('#ctask').textContent=t.title;$('#cstat').textContent='Capy is calling…';$('#ctime').hidden=$('#tx').hidden=$('#go2').hidden=true;$('#ans').hidden=$('#snz').hidden=false;$('#dis').textContent='Decline';$('#call').hidden=false;
 ringTone();clearInterval(ringT);ringT=setInterval(ringTone,2200);try{navigator.vibrate&&navigator.vibrate([400,200,400])}catch(e){}
 try{if(Notification.permission==='granted')new Notification('Capy is calling',{body:t.title})}catch(e){}
 clearTimeout(missT);missT=setTimeout(()=>{if($('#call').hidden||liveT)return;const c=callTask;endCall();if(c&&c.id&&!c.missed){c.missed=1;c.rem=Date.now()+12e4;c.reminded=false;save()}speak('Missed call from Capy. Calling back in 2 min.')},30000)};
endCall=function(){clearInterval(ringT);clearTimeout(missT);endLive();$('#call').hidden=true;drawCapy()};
$('#ans').onclick=()=>{clearInterval(ringT);clearTimeout(missT);S.calls=(S.calls||0)+1;save();callAt=Date.now();const p=$('#call .phone');p.classList.add('live');
 $('#cstat').textContent='Connected';$('#ctime').hidden=$('#tx').hidden=$('#go2').hidden=false;$('#ans').hidden=true;$('#dis').textContent='Hang up';
 liveT=setInterval(()=>{const s=Math.floor((Date.now()-callAt)/1000);$('#ctime').textContent=`${Math.floor(s/60)}:${pad(s%60)}`},500);
 const txt=script(callTask||{id:'',title:''});$('#tx').textContent=txt;
 try{speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(txt),v=pickVoice();if(v)u.voice=v;u.rate=1.02;u.pitch=1.1;u.onstart=()=>p.classList.add('talk');u.onend=u.onerror=()=>p.classList.remove('talk');speechSynthesis.speak(u)}catch(e){}};
$('#go2').onclick=()=>{const t=callTask;endCall();sel=t&&t.id||'';$('#sel').value=sel;T.mode='focus';reset();if(!T.run)toggle();$('.hero').scrollIntoView({behavior:'smooth'})};

/* On-device ML: learns from YOUR history, no server */
function words(s){return new Set(s.toLowerCase().replace(/[^a-z0-9 ]/g,' ').split(/\s+/).filter(w=>w.length>2))}
function learned(t){/* k-nearest-neighbors: similar past tasks (word overlap + same project) predict duration */
 const a=words(t.title),c=S.tasks.filter(x=>x.id!==t.id&&x.spent>=5&&x.done).map(x=>{const b=words(x.title);let i=0;a.forEach(w=>b.has(w)&&i++);return[i/(a.size+b.size-i||1)+(t.tags[0]&&t.tags[0]===x.tags[0]?.25:0),x.spent]}).filter(p=>p[0]>=.25).sort((p,q)=>q[0]-p[0]).slice(0,3);
 if(!c.length)return 0;const w=c.reduce((s,p)=>s+p[0],0);return Math.max(5,Math.round(c.reduce((s,p)=>s+p[0]*p[1],0)/w/5)*5)}
function calibN(){return S.tasks.filter(t=>t.done&&t.est&&t.spent>=5).map(t=>t.spent/t.est).sort((a,b)=>a-b)}
function calib(){const r=calibN();return r.length<3?1:Math.min(2.5,Math.max(.6,r[r.length>>1]))}/* median actual/estimate ratio */
function eff(t){return Math.max(5,Math.round((t.est?t.est*calib():(learned(t)||25))/5)*5)}
function forecast(){let tot=0;for(let i=1;i<=7;i++){const d=new Date();d.setDate(d.getDate()-i);tot+=S.log[ds(d)]||0}
 const avg=tot/7,cap=Math.round(avg*4),need=open().filter(t=>{const d=dd(t);return d!==null&&d<=3}).reduce((s,t)=>s+Math.max(5,eff(t)-t.spent),0),n=calibN().length,c=calib();let m='';
 if(need)m+=!tot?`${need} min of work is due within 3 days. Complete a few sessions and Capy learns your pace. `:need>cap?`<b>Forecast:</b> ${need} min due within 3 days, but your usual pace covers about ${cap}. Start now or trim the list. `:`<b>Forecast:</b> on track. ${need} min due in 3 days, your pace covers about ${cap}. `;
 if(n>=3&&Math.abs(c-1)>.1)m+=`<br><b>Learned:</b> your tasks take about ${Math.round(c*100)}% of your estimates, so plans are adjusted automatically.`;
 $('#fc').hidden=!m;$('#fc').innerHTML=m}
const _bp=buildPlan;buildPlan=function(){_bp();forecast()};$('#mk').onclick=buildPlan;
$('#seed').onclick=()=>{const mk=(title,est,spent,tag)=>({id:Date.now()+Math.random(),title,imp:0,est,due:null,tags:[tag],done:true,doneAt:Date.now()-864e5,spent});
 S.tasks.push(mk('physics homework problems',30,45,'school'),mk('chemistry lab report',60,90,'school'),mk('english essay draft',45,70,'school'),mk('history reading notes',30,40,'school'),mk('hackathon landing page',60,85,'hack'),mk('write email to coach',5,5,'sports'));
 S.hrs=S.hrs||{};S.hrs[16]=(S.hrs[16]||0)+120;S.hrs[20]=(S.hrs[20]||0)+60;S.hrs[9]=(S.hrs[9]||0)+30;
 for(let i=1;i<=6;i++){const d=new Date();d.setDate(d.getDate()-i);S.log[ds(d)]=(S.log[ds(d)]||0)+[40,55,30,60,45,50][i-1]}
 save();location.reload()};
renderTasks();buildPlan();

$('#wel').hidden=!!S.seen;$('#weld').onclick=()=>{S.seen=1;save();$('#wel').hidden=true};
if('serviceWorker' in navigator&&location.protocol!=='file:')navigator.serviceWorker.register('sw.js').catch(()=>{});

// Presentation-only companion reactions for the intelligence workspace.
document.querySelector('#decision-hub')?.addEventListener('click',e=>{if(e.target.closest('button'))celebrateCapy('think')});
