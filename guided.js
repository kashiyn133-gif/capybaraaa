/* Capyplan: nine-scene forest adventure. Existing app nodes are moved, never cloned. */
(()=>{
 const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
 const main=$('main'), col=$('main .col'), aside=$('main aside'); if(!main||!col||!aside)return;
 const oldIntro=sessionStorage.getItem('capy-forest-intro-v2');
 const top=document.createElement('header');top.className='adventure-top';top.innerHTML=`<a class="adventure-brand" href="#" aria-label="Capyplan home"><span class="brand-leaf">✦</span> capyplan</a><div class="adventure-progress"><span id="adventure-progress-fill"></span></div><nav class="adventure-nav" aria-label="Forest adventure scenes"></nav><button class="adventure-help" id="adventure-help">Map <span>↗</span></button>`;
 const priorHeader=$('header.topbar'); if(priorHeader)priorHeader.replaceWith(top);else document.body.prepend(top);
 const voice=$('#voice-toggle');if(voice)top.insertBefore(voice,top.lastElementChild);
 const intro=document.createElement('div');intro.className='forest-intro';intro.id='forest-intro';intro.hidden=!!oldIntro;intro.innerHTML=`<div class="intro-canopy"><i></i><i></i><i></i><i></i><i></i></div><div class="intro-fireflies"><b></b><b></b><b></b><b></b><b></b><b></b></div><div class="forest-intro-card"><div class="intro-moon">✧</div><img src="capy-wave.png" alt="Capy waving hello"><p class="adventure-kicker">A LITTLE ADVENTURE IN THE WOODS</p><h1>The forest is waking up.</h1><p>I'm Capy. I'll walk beside you through nine little places: from the first thought in your head to the quiet pride of finishing your day.</p><div class="intro-actions"><button class="adventure-primary" id="forest-enter">Begin the adventure</button><button class="adventure-quiet" id="forest-skip">Skip introduction</button></div><small>Your tasks and progress stay yours. Take each trail at your own pace.</small></div>`;document.body.append(intro);
 const welcome=$('.welcome-hero'),brain=$('#brain'),wel=$('#wel'), biz=$('#biz'),decision=$('#decision-hub'),patterns=$('#pattern-detective'),adaptive=$('#adaptive-calendar'),habit=$('#habit'),mascot=$('.mascot-card');
 const sections=[...col.children];
 const taskSection=sections.find(x=>x.tagName==='SECTION'&&x.querySelector('#list'));
 const planSection=sections.find(x=>x.tagName==='SECTION'&&x.querySelector('#plan'));
 const week=$('.side-card:not(#habit)');
 const voiceDock=$('#voice-dock');
 const defs=[
  ['arrival','The Welcome Glade','Every adventure starts with one small step.','✦'],
  ['clearing','The Thought Clearing','Let every thought land somewhere safe.','❋'],
  ['trail','The Trail Map','Turn your intentions into a route you can actually follow.','⌁'],
  ['camp','The Supply Camp','See every task, choose what matters, and prepare for the day.','⌂'],
  ['focus','The Quiet Grove','One task, one stretch of time, and a calmer corner of the forest.','☼'],
  ['habits','The Firefly Meadow','Small repeatable wins make a path through the dark.','✧'],
  ['lookout','The Canopy Lookout','Climb up and see the bigger picture of your time.','⌖'],
  ['patterns','The Whispering Hollow','Discover patterns, adapt your calendar, and learn your rhythm.','❂'],
  ['archive','The Ancient Treehouse','Your deeper tools and Capy’s voice live here when you need them.','⌘']
 ];
 const scenes={},nav=top.querySelector('.adventure-nav');
 defs.forEach(([id,title,sub,icon],i)=>{
  const b=document.createElement('button');b.className='adventure-nav-dot';b.dataset.scene=id;b.title=`${i+1}. ${title}`;b.setAttribute('aria-label',`${i+1}. ${title}`);b.innerHTML=`<span>${i+1}</span><em>${title.replace('The ','')}</em>`;nav.append(b);
  const el=document.createElement('section');el.className=`adventure-scene scene-${id}`;el.id=`scene-${id}`;el.hidden=true;el.innerHTML=`<div class="scene-art" aria-hidden="true"><div class="scene-sky"></div><div class="scene-sun"></div><div class="scene-mountains mountain-back"></div><div class="scene-mountains mountain-front"></div><div class="scene-tree tree-left"></div><div class="scene-tree tree-right"></div><div class="scene-mist"></div><div class="scene-fireflies"><i></i><i></i><i></i><i></i><i></i><i></i><i></i></div><div class="scene-path"></div></div><div class="scene-content"><div class="scene-heading"><div class="scene-heading-icon">${icon}</div><div><p class="adventure-kicker">CHAPTER ${String(i+1).padStart(2,'0')} · CAPY'S FOREST</p><h1>${title}</h1><p>${sub}</p></div></div><div class="scene-body"></div><div class="scene-foot"><button class="adventure-back" data-back>← Previous trail</button><div class="scene-step-label">${i+1} / 9 · TAKE YOUR TIME</div><button class="adventure-primary" data-next>${i===8?'Return to the beginning ↺':'Continue the trail →'}</button></div></div>`;
  main.append(el);scenes[id]=el;
 });
 const put=(id,...nodes)=>nodes.filter(Boolean).forEach(n=>scenes[id].querySelector('.scene-body').append(n));
 put('arrival',welcome,wel);
 put('clearing',brain);
 put('trail',planSection);
 put('camp',taskSection);
 put('focus',mascot);
 put('habits',habit);
 put('lookout',biz,week);
 put('patterns',patterns,adaptive);
 put('archive',decision,voiceDock);
 // Remove only empty layout wrappers; original controls and their event listeners remain intact.
 col.remove();aside.remove();main.style.display='block';main.classList.add('forest-adventure-main');document.body.classList.add('forest-adventure');
 const order=defs.map(d=>d[0]);let current=0;
 function show(index){current=(index+order.length)%order.length;const id=order[current];Object.entries(scenes).forEach(([k,v])=>v.hidden=k!==id);$$('[data-scene]').forEach(b=>{if(b.dataset.scene===id){b.classList.add('is-current');b.setAttribute('aria-current','step')}else{b.classList.remove('is-current');b.removeAttribute('aria-current')}});top.style.setProperty('--journey-progress',`${(current+1)/order.length*100}%`);$('#adventure-progress-fill').style.width=`${(current+1)/order.length*100}%`;document.body.dataset.forestScene=id;window.scrollTo({top:0,behavior:'smooth'});}
 nav.addEventListener('click',e=>{const b=e.target.closest('[data-scene]');if(b)show(order.indexOf(b.dataset.scene))});
 document.addEventListener('click',e=>{const a=e.target.closest('a[href^="#"]');if(!a)return;const target=a.getAttribute('href');const route={'#brain':1,'#decision-hub':8,'#biz':6,'#pattern-detective':7,'#top':0};if(Object.prototype.hasOwnProperty.call(route,target)){e.preventDefault();show(route[target])}});
 scenes && Object.values(scenes).forEach((el,i)=>{el.querySelector('[data-next]').addEventListener('click',()=>{if(i===0){const got=$('#weld');if(got)got.click()}if(i===2){if($('#mk'))$('#mk').click()}if(i===8){show(0);return}show(i+1)});el.querySelector('[data-back]').addEventListener('click',()=>show(i-1));});
 $('#adventure-help').onclick=()=>{show(0);intro.hidden=false};
 function dismissIntro(){intro.classList.add('is-leaving');setTimeout(()=>{intro.hidden=true;intro.classList.remove('is-leaving')},550);sessionStorage.setItem('capy-forest-intro-v2','1');show(0)}
 $('#forest-enter').onclick=dismissIntro;$('#forest-skip').onclick=dismissIntro;
 if(!oldIntro){show(0)}else show(0);
 // Keep the existing onboarding actions, while giving the first three chapters explicit guidance.
 const brainFoot=scenes.clearing.querySelector('.scene-foot');const hint=document.createElement('p');hint.className='scene-tip';hint.innerHTML='✦ <b>Capy tip:</b> Write messy thoughts. You can organise them later.';scenes.clearing.querySelector('.scene-body').prepend(hint);
 const trailTip=document.createElement('p');trailTip.className='scene-tip';trailTip.innerHTML='✦ <b>Capy tip:</b> Build a plan after adding your tasks. Your available time can change any time.';scenes.trail.querySelector('.scene-body').append(trailTip);
 const campTip=document.createElement('p');campTip.className='scene-tip';campTip.innerHTML='✦ <b>At camp:</b> Edit, complete, postpone or remove tasks using the controls on each task.';scenes.camp.querySelector('.scene-body').prepend(campTip);
 const focusHint=document.createElement('div');focusHint.className='scene-tip';focusHint.innerHTML='✦ <b>Before you begin:</b> Choose your task and duration. For system-wide app and notification blocking, use the device controls below; this browser experience cannot enforce OS-level blocking.';scenes.focus.querySelector('.scene-body').append(focusHint);
 const systemBlock=document.createElement('div');systemBlock.className='system-block-card';systemBlock.innerHTML=`<h3>Protect your focus</h3><p>Choose your device to manage notifications and distracting apps. Capyplan's browser cannot silently block other applications, so these settings remain under your control.</p><div class="block-columns"><article><b>Windows</b><p>Use Windows Focus / Do not disturb to silence notifications. App blocking requires a separate supported desktop tool.</p><button id="forest-win-settings">Open Windows notification settings</button></article><article><b>Android</b><p>Open Digital Wellbeing → Focus mode, choose distracting apps and turn it on before your session.</p><button id="forest-android-guide">Show Android steps</button></article></div><p class="muted">No apps are blocked automatically by this web version.</p>`;scenes.focus.querySelector('.scene-body').append(systemBlock);
 $('#forest-win-settings').onclick=()=>{location.href='ms-settings:notifications'};$('#forest-android-guide').onclick=()=>alert('Android: Settings → Digital Wellbeing & parental controls → Focus mode → choose distracting apps → Turn on now. Menu names vary by device.');
 const focusOverlay=document.createElement('div');focusOverlay.className='focus-screen';focusOverlay.id='focus-screen';focusOverlay.hidden=true;focusOverlay.innerHTML=`<div class="focus-inner"><img class="focus-cap" src="capy-sit.png" alt="Capy sitting quietly"><p class="focus-eyebrow">CAPY'S QUIET GROVE</p><h1 class="focus-task" id="focus-task">Your focus session</h1><div class="focus-clock" id="focus-clock">25:00</div><p class="focus-sub" id="focus-caption">One thing at a time. You've got this.</p><div class="focus-actions"><button id="focus-pause">Pause session</button><button class="secondary" id="focus-exit">Leave focus</button></div><div class="focus-blocking"><h3>Device focus settings</h3><p>For system notifications and app blocking, enable your device's Focus / Do not disturb settings. This web app cannot enforce system-wide blocking.</p><div class="platform-row"><button id="focus-win">Windows settings</button><button id="focus-android">Android setup</button></div></div></div>`;document.body.append(focusOverlay);
 const syncFocus=()=>{const clock=$('#focus-clock'),pause=$('#focus-pause');if(clock)clock.textContent=$('#time')?.textContent||'25:00';if(pause)pause.textContent=$('#go')?.textContent==='Pause'?'Pause session':'Resume session';const cap=$('#focus-caption');if(cap)cap.textContent=$('#mode')?.textContent==='Break'?'Break time. Stretch, drink water, and rest your eyes.':'Stay with this one task. Capy is right here.'};
 const openFocus=()=>{focusOverlay.hidden=false;document.body.classList.add('focus-active');$('#focus-task').textContent=$('#sel option:checked')?.textContent||'Your focus session';syncFocus()};const closeFocus=()=>{focusOverlay.hidden=true;document.body.classList.remove('focus-active')};
 $('#focus-pause').onclick=()=>{$('#go')?.click();setTimeout(syncFocus,60)};$('#focus-exit').onclick=()=>{if($('#go')?.textContent==='Pause')$('#go').click();closeFocus()};$('#focus-win').onclick=()=>{location.href='ms-settings:notifications'};$('#focus-android').onclick=()=>alert('Android: Settings → Digital Wellbeing & parental controls → Focus mode → choose distracting apps → Turn on now.');
 const originalFocusGo=$('#go');if(originalFocusGo)originalFocusGo.addEventListener('click',()=>setTimeout(()=>{if(originalFocusGo.textContent==='Pause'&&$('#mode')?.textContent==='Focus')openFocus();else syncFocus()},80));
 const focusObserver=new MutationObserver(()=>{syncFocus();if(originalFocusGo?.textContent==='Pause'&&$('#mode')?.textContent==='Focus'&&focusOverlay.hidden)openFocus()});if($('#time'))focusObserver.observe($('#time'),{childList:true,characterData:true,subtree:true});if($('#mode'))focusObserver.observe($('#mode'),{childList:true,characterData:true,subtree:true});if(originalFocusGo)focusObserver.observe(originalFocusGo,{childList:true,characterData:true,subtree:true});document.addEventListener('keydown',ev=>{if(ev.key==='Escape'&&!focusOverlay.hidden)closeFocus()});
 // Scene navigation remains independent from the timer's existing state.
 document.addEventListener('keydown',e=>{if(e.altKey&&e.key==='ArrowRight')show(current+1);if(e.altKey&&e.key==='ArrowLeft')show(current-1)});
})();
