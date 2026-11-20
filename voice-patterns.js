/* Capyplan Voice Companion + Pattern Detective + Adaptive Calendar
   Browser-native voice input/output; local commands work without an API key. */
(()=>{
 'use strict';
 const $=s=>document.querySelector(s), safe=s=>String(s||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const STORE='capyplan.companion.v1';
 let profile={voice:'en-IN',personality:0,kindness:0,focusWins:0,unlocked:['classic'],outfit:'classic',world:'pond'};
 try{profile={...profile,...JSON.parse(localStorage.getItem(STORE)||'{}')}}catch(e){}
 const persist=()=>{try{localStorage.setItem(STORE,JSON.stringify(profile))}catch(e){}};
 const status=$('#voice-status'),transcript=$('#voice-transcript'),input=$('#voice-command'),answer=$('#voice-answer'),dock=$('#voice-dock');
 let recognition=null,listening=false;
 const say=(text,opts={})=>{
   if(answer)answer.textContent=text;
   if(status)status.textContent=opts.status||'Capy is here';
   if(window.CapyMotion)window.CapyMotion.react(opts.pose||'talk',text);
   try{if('speechSynthesis'in window){speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(text);u.lang=profile.voice||'en-US';u.rate=1.02;u.pitch=1.12;speechSynthesis.speak(u)}}catch(e){}
 };
 const tasks=()=>typeof S!=='undefined'?S.tasks:[];
 const openTasks=()=>tasks().filter(t=>!t.done).sort((a,b)=>(typeof score==='function'?score(b):0)-(typeof score==='function'?score(a):0));
 const matchTask=query=>{const q=query.toLowerCase().trim();return tasks().filter(t=>t.title.toLowerCase().includes(q)||q.split(/\s+/).filter(w=>w.length>2).some(w=>t.title.toLowerCase().includes(w))).sort((a,b)=>b.title.length-a.title.length)[0]};
 const refresh=()=>{try{renderTasks();buildPlan();renderStats()}catch(e){} renderPatterns();};
 function addTask(title){const normalized=title.replace(/\bfor\s+(\d+)\s*(minutes?|mins?)\b/i,'~$1m').replace(/\bfor\s+(\d+)\s*(hours?|hrs?)\b/i,(_,n)=>`~${Number(n)*60}m`);const parsed=typeof parse==='function'?parse(normalized):null;if(!parsed)throw Error('I could not understand that task. Try: add task finish the report tomorrow for 45 minutes.');S.tasks.push(parsed);save();refresh();window.CapyMotion?.play('task-added');return `Added ${parsed.title}. I have included it in your task list and refreshed your plan.`}
 function planDay(){const avail=$('#avail');if(avail&&!+avail.value)avail.value=120;buildPlan();$('#plan')?.scrollIntoView({behavior:'smooth',block:'center'});window.CapyMotion?.play('planning');return 'Your day has been replanned using your open tasks and available time.'}
 function nextTask(){const t=openTasks()[0];if(!t)return 'You have no open tasks. Add one whenever you are ready.';return `Your best next step is ${t.title}${t.due?`, due ${new Date(t.due+'T00:00').toLocaleDateString()}`:''}. It is estimated at ${typeof eff==='function'?eff(t):t.est||25} minutes. Say start focus when you are ready.`}
 function startFocus(){const t=openTasks()[0];if(t){const sel=$('#sel');if(sel){sel.value=t.id;sel.dispatchEvent(new Event('change',{bubbles:true}))}}if($('#go')&&!T.run)$('#go').click();return t?`Starting a focus session for ${t.title}.`:'Starting a free focus session. You can add a task later.'}
 function completeTask(query){const t=matchTask(query);if(!t)return `I couldn't find a task matching ${query}.`;if(t.done)return `${t.title} is already complete.`;t.done=true;t.doneAt=Date.now();save();refresh();document.dispatchEvent(new Event('capy:win'));window.CapyMotion?.play('victory');return `Marked ${t.title} complete. Nice work!`}
 function postponeTask(query){const t=matchTask(query);if(!t)return `I couldn't find a task matching ${query}.`;const d=t.due?new Date(t.due+'T12:00:00'):new Date();d.setDate(d.getDate()+1);t.due=`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;save();refresh();return `Moved ${t.title} to ${d.toLocaleDateString()}. Your calendar has been rebuilt.`}
 function deleteTask(query){const t=matchTask(query);if(!t)return `I couldn't find a task matching ${query}.`;S.tasks=S.tasks.filter(x=>x.id!==t.id);save();refresh();return `Deleted ${t.title}.`}
 function pauseFocus(){if(T.run){$('#go')?.click();return 'Focus timer paused.'}return 'Your focus timer is already paused.'}
 function startBreak(){T.run=false;T.mode='break';T.left=5*60;drawTimer();$('#go')?.click();window.CapyMotion?.play('rest');return 'A five minute break is starting. Stretch and get some water.'}
 function patternSummary(){const all=tasks(),done=all.filter(t=>t.done&&t.est>0&&t.spent>=1),open=all.filter(t=>!t.done),late=all.filter(t=>t.due&&new Date(t.due+'T23:59:59').getTime()<Date.now()&&!t.done),ratios=done.map(t=>t.spent/t.est),avg=ratios.length?ratios.reduce((a,b)=>a+b,0)/ratios.length:null;let msg=`You have ${open.length} open tasks and ${done.length} completed tasks with time estimates.`;if(late.length)msg+=` ${late.length} open tasks are past their due date.`;if(avg!==null)msg+=avg>1.2?` Your completed tasks take about ${Math.round(avg*100)} percent of their estimates on average. I recommend adding a buffer.`:avg<.8?` You are finishing in about ${Math.round(avg*100)} percent of your estimates. Your planning may be conservative.`:' Your estimates are tracking fairly close to actual time.';return msg}
 function execute(raw){const q=raw.trim();if(!q)return;const low=q.toLowerCase().replace(/[.!?]+$/,'');let out;
   let m;
   try{
   if((m=low.match(/^(?:please )?(?:add|create|remember|capture)(?: a)? task\s+(.+)$/))||(m=low.match(/^task add karo\s+(.+)$/)))out=addTask(m[1]);
   else if(/^(?:plan my day|make my plan|build my plan|replan my day|schedule my tasks|mera din plan karo|aaj ka plan banao)$/.test(low))out=planDay();
   else if(/^(?:what should i do next|what next|choose for me|pick my next task|what is my priority|ab kya karun|agla task kya hai|next kya karna hai)$/.test(low))out=nextTask();
   else if(/^(?:start focus|start focusing|focus on the next task|begin focus|focus shuru karo|focus start karo)$/.test(low))out=startFocus();
   else if(/^(?:pause focus|pause timer|stop focus|focus pause karo)$/.test(low))out=pauseFocus();
   else if(/^(?:start a break|take a break|break time|break do|thoda break do)$/.test(low))out=startBreak();
   else if((m=low.match(/^(?:complete|finish|mark complete|mark as done)(?: the)? task\s+(.+)$/))||(m=low.match(/^task complete karo\s+(.+)$/)))out=completeTask(m[1]);
   else if((m=low.match(/^(?:postpone|delay|move)(?: the)? task\s+(.+)$/))||(m=low.match(/^task postpone karo\s+(.+)$/)))out=postponeTask(m[1]);
   else if((m=low.match(/^(?:delete|remove)(?: the)? task\s+(.+)$/)))out=deleteTask(m[1]);
   else if((m=low.match(/^(?:set available time to|i have)\s+(\d+)\s*(minutes?|mins?|hours?|hrs?)$/))){const n=Number(m[1])*(/h|hour/i.test(m[2])?60:1);$('#avail').value=n;if($('#adaptive-capacity'))$('#adaptive-capacity').value=n;buildPlan();out=`Available time set to ${n} minutes. I rebuilt your plan.`}
   else if((m=low.match(/^set (?:my )?daily goal to\s+(\d+)\s*(minutes?|mins?)$/))){$('#goal').value=Number(m[1]);$('#goal').dispatchEvent(new Event('change',{bubbles:true}));out=`Daily focus goal set to ${m[1]} minutes.`}
   else if((m=low.match(/^set focus timer to\s+(15|25|50)\s*(minutes?|mins?)$/))){document.querySelector(`.chip[data-m="${m[1]}"]`)?.click();out=`Focus timer set to ${m[1]} minutes.`}
   else if(/^(?:open decisionos|go to decisionos)$/.test(low)){$('#decision-hub')?.scrollIntoView({behavior:'smooth'});out='Opening DecisionOS.'}
   else if(/^(?:open patterns|show pattern detective)$/.test(low)){$('#pattern-detective')?.scrollIntoView({behavior:'smooth'});renderPatterns();out='Opening Pattern Detective.'}
   else if(/^(?:list my tasks|read my tasks|show my tasks|mere tasks dikhao|aaj ke tasks dikhao)$/.test(low)){const list=openTasks().slice(0,5);out=list.length?`Your next tasks are: ${list.map((t,i)=>`${i+1}. ${t.title}`).join('; ')}.`:'You have no open tasks.'}
   else if(/^(?:what is due today|what's due today|show today's deadlines)$/.test(low)){const due=openTasks().filter(t=>t.due===today());out=due.length?`Due today: ${due.map(t=>t.title).join(', ')}.`:'I do not see any open tasks due today.'}
   else if(/^(?:show|analyse|analyze|tell me) (?:my )?(?:patterns|productivity patterns|insights)$/.test(low)||/^(?:how am i doing|how is my productivity|show my patterns|meri patterns dikhao|meri productivity batao)$/.test(low)){renderPatterns();$('#pattern-detective')?.scrollIntoView({behavior:'smooth'});out=patternSummary()}
   else if(/^(?:what is on my plate|what do i have today|how many tasks do i have)$/.test(low))out=`You have ${openTasks().length} open tasks. ${nextTask()}`;
   else if(/^(?:hello|hi|hey capy|hey)$/.test(low))out='Hey, friend! Tell me what is on your mind. I can add tasks, plan your day, start focus, complete tasks and spot patterns.';
   else out=`I heard: ${q}. I can add tasks, plan your day, tell you what to do next, start or pause focus, start a break, complete or postpone a task, and analyse your patterns. Try saying “add task prepare presentation tomorrow for 45 minutes”.`;
   }catch(error){out=error?.message||'I could not complete that action. Please try again.'}
   say(out,{pose:/complete|finish/.test(low)?'victory':/plan|schedule/.test(low)?'planning':/pattern|insight/.test(low)?'thinking':'talk'});return out;
 }
 window.CapyVoice={execute,say,patternSummary};
 $('#voice-toggle')?.addEventListener('click',()=>{dock?.classList.toggle('open');if(dock?.classList.contains('open')){input?.focus();window.CapyMotion?.play('wave')}});
 $('#voice-close')?.addEventListener('click',()=>dock?.classList.remove('open'));
 $('#voice-send')?.addEventListener('click',()=>{const q=input?.value||'';if(!q.trim())return;transcript.textContent=`You: ${q}`;input.value='';execute(q)});
 input?.addEventListener('keydown',e=>{if(e.key==='Enter')$('#voice-send')?.click()});
 function setupRecognition(){const SR=window.SpeechRecognition||window.webkitSpeechRecognition;if(!SR){if(status)status.textContent='Voice input is not supported in this browser. Use the text command box.';$('#voice-mic')?.setAttribute('disabled','disabled');return}
   recognition=new SR();recognition.lang=profile.voice||'en-US';recognition.interimResults=true;recognition.continuous=false;
   recognition.onstart=()=>{listening=true;$('#voice-mic')?.classList.add('listening');if(status)status.textContent='Listening… tell me what you need'};
   recognition.onresult=e=>{let final='';for(let i=e.resultIndex;i<e.results.length;i++){const part=e.results[i][0].transcript;if(e.results[i].isFinal)final+=part;else if(transcript)transcript.textContent=`Hearing: ${part}`}if(final){if(transcript)transcript.textContent=`You: ${final}`;execute(final)}};
   recognition.onerror=e=>{if(status)status.textContent=e.error==='not-allowed'?'Microphone permission was blocked. Allow it in your browser settings.':`Voice input issue: ${e.error}. You can type instead.`};
   recognition.onend=()=>{listening=false;$('#voice-mic')?.classList.remove('listening');if(status&&status.textContent==='Listening… tell me what you need')status.textContent='Ready when you are'};
 }
 setupRecognition();$('#voice-mic')?.addEventListener('click',()=>{if(!recognition)return;try{if(listening)recognition.stop();else{if('speechSynthesis'in window)speechSynthesis.cancel();recognition.start()}}catch(e){if(status)status.textContent='Microphone is busy. Please try again.'}});

 // Pattern Detective: transparent, evidence-based summaries from actual history only.
 function renderPatterns(){const all=tasks(),done=all.filter(t=>t.done&&t.est>0&&t.spent>=1),open=all.filter(t=>!t.done),late=open.filter(t=>t.due&&new Date(t.due+'T23:59:59').getTime()<Date.now()),lateDone=all.filter(t=>t.done&&t.due&&t.doneAt&&t.doneAt>new Date(t.due+'T23:59:59').getTime());
   const samples=done.map(t=>({t,ratio:t.spent/t.est})),avg=samples.length?samples.reduce((a,x)=>a+x.ratio,0)/samples.length:null;
   const groups={};all.forEach(t=>((t.tags&&t.tags.length)?t.tags:['Uncategorised']).forEach(tag=>{groups[tag]=groups[tag]||{n:0,mins:0};groups[tag].n++;groups[tag].mins+=t.spent||t.est||0}));
   const top=Object.entries(groups).sort((a,b)=>b[1].mins-a[1].mins).slice(0,4);
   const insight=[];if(samples.length>=3&&avg>1.2)insight.push(`Your completed tasks take ${Math.round((avg-1)*100)}% longer than estimated on average. Add a ${Math.max(10,Math.round((avg-1)*100/5)*5)}% planning buffer.`);else if(samples.length>=3&&avg<.8)insight.push('Your estimates are consistently conservative. You may be able to plan slightly more confidently.');else if(samples.length<3)insight.push(`Only ${samples.length} completed tasks have both estimates and tracked focus time. Complete a few more for a reliable estimate pattern.`);
   if(late.length)insight.push(`${late.length} open task${late.length===1?' is':'s are'} past the due date. Consider renegotiating or rescheduling them.`);if(lateDone.length){const lateTags={};lateDone.forEach(t=>(t.tags||[]).forEach(tag=>lateTags[tag]=(lateTags[tag]||0)+1));const common=Object.entries(lateTags).sort((a,b)=>b[1]-a[1])[0];insight.push(`${lateDone.length} completed task${lateDone.length===1?' was':'s were'} finished after their due date${common?`. The most common tag in that late group is #${common[0]}`:''}. This is a correlation, not proof of the cause.`)}
   const unsized=open.filter(t=>!t.est&&!t.spent).length;if(unsized)insight.push(`${unsized} open tasks have no duration estimate. Add ~30m style estimates to improve your adaptive plan.`);
   const avgNode=$('#pattern-estimate'),lateNode=$('#pattern-late'),sampleNode=$('#pattern-samples'),lateDoneNode=$('#pattern-late-done'),insNode=$('#pattern-insights'),tagNode=$('#pattern-categories');
   if(avgNode)avgNode.textContent=avg===null?'Not enough data':`${Math.round(avg*100)}% of estimate`;
   if(lateNode)lateNode.textContent=String(late.length);if(sampleNode)sampleNode.textContent=String(samples.length);if(lateDoneNode)lateDoneNode.textContent=String(lateDone.length);
   if(insNode)insNode.innerHTML=(insight.length?insight:['Your current estimates are broadly on track. Keep logging focus time so Capy can learn.']).map(x=>`<li>${safe(x)}</li>`).join('');
   if(tagNode)tagNode.innerHTML=top.length?top.map(([k,v])=>`<div class="pattern-bar-row"><span>${safe(k)}</span><div class="pattern-bar"><i style="width:${Math.max(4,v.mins/Math.max(1,top[0][1].mins)*100)}%"></i></div><b>${v.mins}m</b></div>`).join(''):'<p class="muted">Add tags to your tasks to see where your time goes.</p>';
   const delayed=$('#pattern-delayed');if(delayed)delayed.textContent=`Possible delay signals: ${late.length} overdue open · ${lateDone.length} completed late · ${unsized} open without estimates. These indicators show where to investigate; they do not establish a cause.`;
 }
 window.renderPatterns=renderPatterns;
 $('#pattern-refresh')?.addEventListener('click',()=>{renderPatterns();say('I refreshed your pattern report.',{pose:'thinking'})});
 // Adaptive calendar only rearranges the plan; it never changes deadlines or deletes commitments.
 const auto=$('#adaptive-auto'),capacity=$('#adaptive-capacity'),notice=$('#adaptive-notice');
 let adaptiveTimer=0;
 function rebuild(reason='Your plan was updated'){if(!auto?.checked)return;clearTimeout(adaptiveTimer);adaptiveTimer=setTimeout(()=>{const a=$('#avail');if(capacity&&a&&+capacity.value>0)a.value=capacity.value;try{buildPlan();if(notice)notice.textContent=`${reason} · refreshed ${new Date().toLocaleTimeString([],{hour:'numeric',minute:'2-digit'})}`;window.CapyMotion?.play('replan',{quiet:true})}catch(e){}},220)}
 $('#adaptive-rebuild')?.addEventListener('click',()=>{const a=$('#avail');if(capacity&&a&&+capacity.value>0)a.value=capacity.value;buildPlan();if(notice)notice.textContent='Plan rebuilt using your current open tasks.';window.CapyMotion?.play('replan')});
 $('#adaptive-auto')?.addEventListener('change',()=>{if(notice)notice.textContent=auto.checked?'Auto-replanning is on. Task changes will refresh your schedule.':'Auto-replanning is paused.';if(auto.checked)rebuild('Auto-replanning enabled')});
 $('#adaptive-capacity')?.addEventListener('change',()=>{if(auto?.checked)rebuild('Available time changed')});
 $('#adaptive-interrupt')?.addEventListener('click',()=>{const a=$('#avail');if(a){a.value=Math.max(0,(+a.value||60)-30);if(capacity)capacity.value=a.value;buildPlan();if(notice)notice.textContent='A 30-minute interruption was added. Your remaining day has been replanned.';window.CapyMotion?.play('replan')}});
 // Refresh the detective and optionally rebuild after core app updates.
 const list=$('#list');if(list&&'MutationObserver'in window)new MutationObserver(()=>{renderPatterns();rebuild('Tasks changed')}).observe(list,{childList:true,subtree:true});
 $('#avail')?.addEventListener('change',()=>{if(capacity)capacity.value=$('#avail').value;if(auto?.checked)rebuild('Available time changed')});
 renderPatterns();if(capacity&&$('#avail'))capacity.value=$('#avail').value||90;
 // Companion profile, outfit unlocks and personality are stored separately from task data.
 const outfit=$('#capy-outfit'),world=$('#capy-world'),persona=$('#capy-personality');
 const unlocks=[{id:'classic',label:'Classic',at:0,emoji:'🤎'},{id:'leaf',label:'Leaf crown',at:60,emoji:'🍃'},{id:'disco',label:'Disco star',at:180,emoji:'🪩'},{id:'sleepy',label:'Sleepy scarf',at:360,emoji:'🌙'},{id:'gold',label:'Golden capy',at:700,emoji:'✨'}];
 function minutes(){return Object.values(S.log||{}).reduce((a,b)=>a+b,0)}
 function renderProfile(){const mins=minutes(),worlds=[{id:'pond',label:'Pond',at:0},{id:'garden',label:'Garden',at:60},{id:'disco',label:'Disco',at:180},{id:'moon',label:'Moonlit',at:360}];profile.unlocked=unlocks.filter(x=>mins>=x.at).map(x=>x.id);profile.worldUnlocked=worlds.filter(x=>mins>=x.at).map(x=>x.id);if(!profile.unlocked.includes(profile.outfit))profile.outfit='classic';if(!profile.worldUnlocked.includes(profile.world))profile.world='pond';if(outfit)outfit.innerHTML=unlocks.map(x=>`<option value="${x.id}" ${profile.outfit===x.id?'selected':''} ${mins<x.at?'disabled':''}>${x.emoji} ${x.label}${mins<x.at?` · unlock at ${x.at} focus min`:''}</option>`).join('');if(world)world.innerHTML=worlds.map(x=>`<option value="${x.id}" ${profile.world===x.id?'selected':''} ${mins<x.at?'disabled':''}>${x.label}${mins<x.at?` · unlock at ${x.at} focus min`:''}</option>`).join('');const done=tasks().filter(t=>t.done).length,late=tasks().filter(t=>!t.done&&t.due&&new Date(t.due+'T23:59:59').getTime()<Date.now()).length;const samples=tasks().filter(t=>t.done&&t.est&&t.spent>0);const ratio=samples.length?samples.reduce((a,t)=>a+t.spent/t.est,0)/samples.length:1;let line=profile.personality>8?'Capy has become your steady planning buddy. ':profile.focusWins>5?'Capy is learning your rhythm and cheering your small wins. ':'Capy is getting to know your habits. ';if(late>=2)line+='I will help you leave more breathing room for tasks that tend to slip. ';else if(samples.length>=3&&ratio>1.2)line+='I have learned that your tasks need a little more time than first estimates. ';else if(done>=5)line+='I noticed how you keep returning to finish what matters. ';if(persona)persona.textContent=line;document.body.dataset.capyWorld=profile.world||'pond';document.body.dataset.capyOutfit=profile.outfit||'classic'}
 outfit?.addEventListener('change',()=>{profile.outfit=outfit.value;persist();renderProfile();window.CapyMotion?.play('outfit')});
 world?.addEventListener('change',()=>{profile.world=world.value;persist();renderProfile();window.CapyMotion?.play('world-shift')});
 document.addEventListener('capy:win',()=>{profile.focusWins++;profile.personality=Math.min(20,profile.personality+1);persist();renderProfile()});
 renderProfile();
})();
