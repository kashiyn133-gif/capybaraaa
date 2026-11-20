/* Capy Motion Studio: 20 source poses, 25 choreographies, event-driven reactions. */
(()=>{
 const $=s=>document.querySelector(s),stage=$('#pond'),side=$('#capy-mascot'),hero=$('#hero-capy'),bubble=$('#mascot-bubble');
 if(!stage||!side)return;
 const frame=n=>`capy-frames/frame-${String(n).padStart(2,'0')}.png`;
 const routines={
  idle:[1,20,1,20],wave:[4,15,4,15],dance:[2,3,10,11,13,14,19,20],boogie:[2,10,12,13,19,3],jump:[7,8,17,5],celebrate:[5,15,17,18,5],think:[1,6,20],curious:[3,16,4],sleep:[6,9,20],stretch:[18,13,2],spin:[10,11,12,13,10],clap:[14,5,14,5],focus:[1,6,20,1],shy:[6,14,6],surprise:[16,3,8],point:[16,15,16],victory:[5,7,17,18,15],rest:[6,9,20],walk:[2,10,11,12],groove:[2,3,13,19,10],heart:[14,5,18],replan:[1,6,16,3,1],outfit:[15,17,5], 'world-shift':[13,8,15],talk:[4,1,4], 'task-added':[4,5,7], 'planning':[1,6,16,3], 'world-shift':[13,8,15]
 };
 const messages={wave:'Hey, friend! What shall we make room for?',dance:'A little rhythm for your hard work!',boogie:'Tiny disco break. You earned it.',jump:'WOOHOO! Look at you go!',celebrate:'That deserves a celebration!',think:'Let me look at the whole picture.',curious:'Oh? Tell me a little more.',sleep:'Rest is part of the plan, too.',stretch:'Shoulders down. Take a breath.',spin:'New direction, same lovely you.',clap:'Clap clap! Progress is progress.',focus:'I will keep the pond calm while you focus.',shy:'A small win still counts.',surprise:'Ooh! That changes the plan.',point:'Here is your next little step.',victory:'YOU DID IT! Capy dance time!',rest:'A proper little pause.',walk:'One step, then the next.',groove:'We have got a rhythm!',heart:'I am proud of your consistency.',replan:'Let us make a plan that fits the day.',outfit:'A fresh look for a fresh start.','world-shift':'Welcome to a new little corner of your world.',talk:'I am listening.', 'task-added':'Saved! One less thing floating around your head.',planning:'Let us make a realistic plan.'};
 let timer=0,restore=0,idleTimer=0,current='wave',index=0,playing=false;
 const images=[side,hero].filter(Boolean);
 function pose(n){const src=frame(n);images.forEach(img=>{img.src=src;img.dataset.frame=n});}
 function setBubble(text){if(bubble&&text)bubble.textContent=text}
 function animateCss(name){stage.dataset.motion=name;stage.classList.remove('capy-motion-pop');void stage.offsetWidth;stage.classList.add('capy-motion-pop');}
 function stop(){clearInterval(timer);clearTimeout(restore);playing=false;}
 function play(name='wave',opts={}){
   stop();current=name;const seq=routines[name]||routines.wave;index=0;playing=true;pose(seq[0]);animateCss(name);if(!opts.quiet)setBubble(opts.message||messages[name]||messages.wave);
   const speed=opts.speed||(["dance","boogie","groove","victory"].includes(name)?210:(["idle","focus","sleep","rest"].includes(name)?850:360));
   if(seq.length>1)timer=setInterval(()=>{index=(index+1)%seq.length;pose(seq[index]);},speed);
   const duration=opts.loop?0:(opts.duration===0?0:(opts.duration||(["dance","boogie","groove","victory","jump"].includes(name)?3600:2400)));
   if(duration)restore=setTimeout(()=>{stop();idle(true)},duration);
 }
 function idle(quiet=false){stop();current='idle';pose(1);if(!quiet)setBubble('Here with you, one small step at a time.');stage.dataset.motion='idle';}
 function react(kind='talk',message=''){play(kind,{message,duration:2600})}
 window.CapyMotion={play,react,idle,routines};
 window.celebrateCapy=(kind='happy')=>play(kind==='think'?'think':kind==='wave'?'wave':kind==='surprise'?'surprise':['victory','dance','boogie','groove'][Math.floor(Math.random()*4)]);
 // Core app actions.
 $('#add')?.addEventListener('click',()=>{if($('#txt')?.value.trim())play('task-added')});
 $('#mk')?.addEventListener('click',()=>play('planning'));
 $('#go')?.addEventListener('click',()=>play('focus',{duration:2200}));
 $('#demo')?.addEventListener('click',()=>play('surprise'));
 document.addEventListener('change',e=>{if(e.target.matches('#list input[type="checkbox"]')&&e.target.checked){play(['victory','dance','boogie','groove'][Math.floor(Math.random()*4)]);document.dispatchEvent(new Event('capy:win'))}});
 $('#decision-hub')?.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;if(b.id==='dh-simulate')play('surprise');else if(['dh-analyse','dh-refresh','dh-ai-ask'].includes(b.id))play('think');else if(b.id==='dh-add-dep')play('clap')});
 // Cinematic, accessible section-to-section camera transitions.
 function enter(target){if(!target)return;document.body.classList.add('capy-camera-out');const name=target.id;play(name==='decision-hub'?'think':name==='biz'||name==='pattern-detective'?'point':name==='adaptive-calendar'?'replan':'wave',{duration:1700});setTimeout(()=>{target.scrollIntoView({behavior:'smooth',block:'start'});document.body.classList.remove('capy-camera-out');document.body.classList.add('capy-camera-in');target.classList.add('capy-section-arrive');setTimeout(()=>{document.body.classList.remove('capy-camera-in');target.classList.remove('capy-section-arrive')},850)},150)}
 document.querySelectorAll('a[href^="#"]').forEach(a=>a.addEventListener('click',e=>{const target=document.getElementById(a.getAttribute('href').slice(1));if(!target)return;e.preventDefault();history.pushState(null,'',`#${target.id}`);enter(target)}));
 window.addEventListener('popstate',()=>{const target=document.getElementById(location.hash.slice(1));if(target)enter(target)});
 stage.addEventListener('click',()=>{const next=['wave','dance','boogie','think','jump','sleep','victory'];play(next[(next.indexOf(current)+1)%next.length])});
 // A little life between interactions; respects reduced motion and hidden tabs.
 const reduced=window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
 if(!reduced){let idleCount=0;idleTimer=setInterval(()=>{if(document.hidden||playing||stage.matches(':hover'))return;const seq=['idle','curious','stretch','wave'];play(seq[idleCount++%seq.length],{quiet:true,loop:true,speed:900})},11000)}
 play('wave',{duration:2800});
})();
