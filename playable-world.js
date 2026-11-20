/* Capyplan Playable Forest: forest map is the home interface; original feature DOM stays intact. */
(()=> {
 const $=s=>document.querySelector(s);
 const main=$('main'), nav=$('.adventure-nav');
 if(!main||!nav||$('#capy-world'))return;
 const world=document.createElement('section');world.id='capy-world';world.setAttribute('aria-label','Capyplan interactive forest map');
 world.innerHTML=`
 <div class="cw-canopy"></div><div class="cw-hills"></div><div class="cw-path"></div>
 <header class="cw-header"><div><div class="cw-eyebrow">CAPYPLAN · YOUR LIVING PRODUCTIVITY WORLD</div><h1>Where shall we wander?</h1><p>I'm Capy. Pick a place on the map and I'll walk there with you. Your original tools and progress are all still here.</p></div><div class="cw-stats"><div class="cw-stat">🌱 <b id="cw-task-count">0</b> open tasks</div><div class="cw-stat">✨ <b id="cw-points">0</b> focus points</div><div class="cw-stat">🧭 <b id="cw-progress">0/8</b> places explored</div></div></header>
 <div class="cw-landmarks">
  <button class="cw-location" data-place="thought" data-scene="clearing"><span class="cw-icon">💭</span><strong>Thought Clearing</strong><small>Drop your thoughts here</small></button>
  <button class="cw-location" data-place="trail" data-scene="trail"><span class="cw-icon">🗺️</span><strong>Trail Planner</strong><small>Build a realistic route</small></button>
  <button class="cw-location" data-place="tasks" data-scene="camp"><span class="cw-icon">🎒</span><strong>Task Camp</strong><small>Collect today's quests</small></button>
  <button class="cw-location" data-place="focus" data-scene="focus"><span class="cw-icon">🌳</span><strong>Quiet Grove</strong><small>Enter focus sanctuary</small></button>
  <button class="cw-location" data-place="habits" data-scene="habits"><span class="cw-icon">✨</span><strong>Firefly Meadow</strong><small>Grow little habits</small></button>
  <button class="cw-location" data-place="insights" data-scene="lookout"><span class="cw-icon">🔭</span><strong>Canopy Lookout</strong><small>See your progress</small></button>
  <button class="cw-location locked" data-place="treasury" data-scene="focus"><span class="cw-icon">🎁</span><strong>Reward Treasury</strong><small id="cw-chest-status">Locked until a session is eligible</small><span class="cw-lock">🔒</span></button>
  <button class="cw-location" data-place="tools" data-scene="archive"><span class="cw-icon">🏡</span><strong>Ancient Treehouse</strong><small>Voice + DecisionOS tools</small></button>
  <div class="cw-player" id="cw-player"><div class="cw-speech" id="cw-speech">Hi! Use the map to choose our first stop.</div><img src="./capy-wave.png" alt="Capy, your forest guide"></div>
 </div>
 <footer class="cw-footer"><span>🕹️ Move Capy with <b>WASD</b> or arrow keys · Click a landmark to travel there</span><div><span class="cw-hint">Your data remains in this browser.</span> <button id="cw-quick-focus">Quick focus →</button></div></footer>
 <div class="cw-enter" id="cw-enter" hidden><div class="cw-enter-card"><img src="./capy-wave.png" alt=""><h2 id="cw-enter-title">Let's explore</h2><p id="cw-enter-copy">Capy is ready to guide you.</p><button id="cw-enter-go">Enter this place</button></div></div>`;
 main.parentNode.insertBefore(world,main);
 const sceneIds=['arrival','clearing','trail','camp','focus','habits','lookout','patterns','archive'];
 const sceneButton=id=>document.querySelector('[data-scene="'+id+'"]');
 let explored=new Set(),pos={x:48,y:59},moving=false,chosen=null;
 const player=$('#cw-player'),speech=$('#cw-speech');
 const say=t=>{speech.textContent=t};
 const setPosition=(x,y)=>{pos.x=Math.max(6,Math.min(94,x));pos.y=Math.max(12,Math.min(88,y));player.style.left=pos.x+'%';player.style.top=pos.y+'%'};
 const travel=(place,scene)=>{const btn=$('[data-place="'+place+'"]');if(!btn)return;const r=btn.getBoundingClientRect(),w=world.getBoundingClientRect();setPosition((r.left+r.width/2-w.left)/w.width*100,(r.top+r.height/2-w.top)/w.height*100);player.classList.add('walking');say('On my way to '+btn.querySelector('strong').textContent+'!');setTimeout(()=>player.classList.remove('walking'),700);explored.add(place);$('#cw-progress').textContent=explored.size+'/8';chosen={place,scene};setTimeout(()=>{if(place==='treasury'){const unlocked=$('#treasury-lock')?.textContent.includes('unlocked');if(!unlocked){say('This chest is waiting for an eligible focus session.');return}}$('#cw-enter-title').textContent=btn.querySelector('strong').textContent;$('#cw-enter-copy').textContent=btn.querySelector('small').textContent;$('#cw-enter').hidden=false},500)};
 const enter=()=>{if(!chosen)return;$('#cw-enter').hidden=true;document.body.classList.remove('world-map-active');const b=sceneButton(chosen.scene);if(b)b.click();say('We made it! Let’s take this one step at a time.')};
 world.addEventListener('click',e=>{const b=e.target.closest('.cw-location');if(b)travel(b.dataset.place,b.dataset.scene)});
 $('#cw-enter-go').addEventListener('click',enter);
 const mapButton=document.createElement('button');mapButton.className='adventure-help';mapButton.id='cw-map-button';mapButton.textContent='Forest map ⌖';nav.parentNode.insertBefore(mapButton,nav.nextSibling);
 const openMap=()=>{document.body.classList.add('world-map-active');$('#cw-enter').hidden=true;window.scrollTo({top:0,behavior:'smooth'});say('Welcome back! Where shall we go next?');sync()};
 mapButton.addEventListener('click',openMap);
 document.querySelectorAll('.adventure-scene [data-back]').forEach(()=>{});
 $('#cw-quick-focus').addEventListener('click',()=>travel('focus','focus'));
 function sync(){const list=$('#list');$('#cw-task-count').textContent=list?.querySelectorAll('li:not(.done)').length||0;const pts=Number($('#reward-points')?.textContent||0);$('#cw-points').textContent=pts;const unlocked=$('#treasury-lock')?.textContent.toLowerCase().includes('unlocked');const chest=$('[data-place="treasury"]');if(unlocked){chest.classList.remove('locked');chest.classList.add('unlocked');chest.querySelector('.cw-lock').textContent='✓';$('#cw-chest-status').textContent='Capy has a surprise for you!'}else{$('#cw-chest-status').textContent='Locked until a session is eligible'} }
 new MutationObserver(sync).observe(main,{subtree:true,childList:true,characterData:true,attributes:true});
 document.addEventListener('change',e=>{if(e.target.matches('#list input[type=checkbox]')){setTimeout(sync,100);say(e.target.checked?'Quest complete! A little win for the forest.':'Quest reopened. We can try again.')}});
 document.addEventListener('capy:win',()=>{say('A task completed! You are growing your forest.')});
 document.addEventListener('keydown',e=>{if(!document.body.classList.contains('world-map-active'))return;const k=e.key.toLowerCase();const step=3;if(['arrowleft','a'].includes(k)){e.preventDefault();setPosition(pos.x-step,pos.y)}else if(['arrowright','d'].includes(k)){e.preventDefault();setPosition(pos.x+step,pos.y)}else if(['arrowup','w'].includes(k)){e.preventDefault();setPosition(pos.x,pos.y-step)}else if(['arrowdown','s'].includes(k)){e.preventDefault();setPosition(pos.x,pos.y+step)}else if(k==='enter'){const nearest=[...document.querySelectorAll('.cw-location')].sort((a,b)=>{const dist=x=>{const r=x.getBoundingClientRect(),w=world.getBoundingClientRect();return Math.hypot((r.left+r.width/2-w.left)/w.width*100-pos.x,(r.top+r.height/2-w.top)/w.height*100-pos.y)};return dist(a)-dist(b)}[0];if(nearest)travel(nearest.dataset.place,nearest.dataset.scene)}});
 // Preserve all nine existing chapters and their original DOM/event handlers.
 const intro=$('#forest-intro');
 const reveal=()=>{document.body.classList.add('world-map-active');sync()};
 if(intro&&!intro.hidden){['forest-enter','forest-skip'].forEach(id=>$('#'+id)?.addEventListener('click',()=>setTimeout(reveal,650)))}else reveal();
 const oldShow=sceneButton('arrival');if(oldShow){document.querySelectorAll('.adventure-scene').forEach(s=>s.addEventListener('click',e=>{if(e.target.closest('[data-next]'))setTimeout(()=>{if(!document.querySelector('.adventure-scene:not([hidden])'))openMap()},400)}))}
 setInterval(sync,1500);
 window.CapyplanForest={openMap,travel,sync};
})();