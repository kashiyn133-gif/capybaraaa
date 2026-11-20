/* Strict session integrity + demo treasury. Does not claim to read thoughts or prove attention. */
(() => {
 const $=s=>document.querySelector(s), KEY='capyplan.rewards.v1';
 let wallet={points:0,coupons:[],sessions:[]};try{wallet={...wallet,...JSON.parse(localStorage.getItem(KEY)||'{}')}}catch{}
 const save=()=>localStorage.setItem(KEY,JSON.stringify(wallet));
 const state={active:false,eligible:false,reason:'Complete an uninterrupted focus session to unlock the treasury.',started:0,duration:0,lastActivity:Date.now(),invalid:false};
 const root=document.createElement('section');root.className='treasury-card';root.innerHTML=
  '<div class="treasury-top"><div><p class="treasury-kicker">CAPY’S REWARD GROVE</p><h2>Forest Treasury</h2><p class="treasury-copy">Your focus earns progress. Demo coupons are examples, not live company partnerships.</p></div><div class="treasury-box" aria-hidden="true">🎁</div></div>'+
  '<div class="treasury-stats"><div><strong id="reward-points">0</strong><span>Focus points</span></div><div><strong id="reward-count">0</strong><span>Unlocked coupons</span></div></div>'+
  '<div class="treasury-lock" id="treasury-lock">🔒 Locked — finish a verified session first.</div><button class="treasury-open" id="treasury-open" disabled>Open the treasury</button><div id="treasury-wallet" class="treasury-wallet"></div><p class="treasury-note" id="treasury-note" aria-live="polite">No reward is granted for paused, interrupted or incomplete sessions.</p>';
 const focusScene=document.querySelector('#scene-focus .scene-body'); if(focusScene)focusScene.append(root);
 const coupons=[{id:'GREEN10',brand:'Green Market (demo)',title:'10% off sample eco-store order',cost:50},{id:'STUDY15',brand:'Study Supply (demo)',title:'15% off sample stationery order',cost:75},{id:'COFFEE',brand:'Calm Café (demo)',title:'Free drink sample coupon',cost:100}];
 const render=()=>{
  $('#reward-points').textContent=wallet.points;$('#reward-count').textContent=wallet.coupons.length;
  $('#treasury-open').disabled=!state.eligible;
  $('#treasury-lock').textContent=state.eligible?'✨ Treasury unlocked — Capy has a surprise for you!':'🔒 Locked — finish a verified session first.';
  $('#treasury-wallet').innerHTML=wallet.coupons.length?'<h3>Your coupon wallet</h3>'+wallet.coupons.map(c=>'<article><b>'+c.brand+'</b><p>'+c.title+'</p><code>'+c.code+'</code></article>').join(''):'<p class="treasury-empty">Your coupon wallet is waiting for its first reward.</p>';
  $('#treasury-note').textContent=state.reason;
 };
 const disqualify=reason=>{if(!state.active)return;state.invalid=true;state.reason='Not eligible: '+reason;state.active=false;render()};
 const pause=()=>{if($('#go')&&$('#go').textContent==='Pause')$('#go').click()};
 document.addEventListener('click',e=>{
  if(!e.target.closest('#go'))return;
  const isFocus=$('#mode')?.textContent==='Focus';
  if(isFocus && $('#go').textContent!=='Pause'){
   state.active=true;state.eligible=false;state.invalid=false;state.started=Date.now();state.duration=parseInt(document.querySelector('.chip.on')?.dataset.m||'25',10);state.lastActivity=Date.now();state.reason='Session running. Keep this tab visible and the window active.';render();
  }else if(state.active && $('#go').textContent==='Pause'){disqualify('session was paused.');}
 },true);
 const activity=()=>{state.lastActivity=Date.now()};
 ['pointerdown','keydown','wheel','touchstart'].forEach(ev=>addEventListener(ev,activity,{passive:true}));
 document.addEventListener('visibilitychange',()=>{if(document.hidden&&state.active){disqualify('the Capyplan tab went into the background.');pause()}});
 addEventListener('blur',()=>{if(state.active){disqualify('the app window lost focus.');pause()}});
 setInterval(()=>{if(state.active && Date.now()-state.lastActivity>120000){disqualify('no device activity was detected for 2 minutes.');pause()}},5000);
 document.addEventListener('capy:win',()=>{
  if(!state.active||state.invalid)return;
  const elapsed=(Date.now()-state.started)/60000;
  if(elapsed < state.duration*.94){disqualify('the required focus duration was not completed.');return}
  state.active=false;state.eligible=true;wallet.points+=25;
  wallet.sessions.unshift({at:new Date().toISOString(),minutes:state.duration,verified:'visible-tab + active-window + no-pause + activity'});
  wallet.coupons.push({brand:'Capyplan Forest Reward (demo)',title:'Sample reward unlocked after verified focus',code:'CAPY-'+Math.random().toString(36).slice(2,8).toUpperCase()});
  wallet.coupons=wallet.coupons.slice(-30);save();state.reason='Verified session complete: +25 points and a demo coupon added to your wallet.';render();
 });
 $('#treasury-open').addEventListener('click',()=>{if(!state.eligible)return;$('#treasury-note').textContent='Capy pops out of the treasure chest! Your demo coupon is ready in the wallet below.';const box=$('.treasury-box');box.classList.add('treasury-pop');setTimeout(()=>box.classList.remove('treasury-pop'),900)});
 render();
})();
