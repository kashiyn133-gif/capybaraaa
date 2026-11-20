/* Capyplan 3D forest layer — decorative Three.js scene with a graceful CSS fallback. */
(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const scenes = [...document.querySelectorAll('.adventure-scene')];
  if (!scenes.length) return;
  const canvas = document.createElement('canvas');
  const walker = document.createElement('img'); walker.src='capybara-3d.png'; walker.alt='Capybara walking through the forest'; walker.className='forest-capy-walker'; walker.loading='lazy';
  canvas.className = 'forest-three-canvas';
  canvas.setAttribute('aria-hidden', 'true');
  const attach = () => {
    const art = document.querySelector('.adventure-scene:not([hidden]) .scene-art');
    if (art) { if (canvas.parentNode !== art) art.append(canvas); if (walker.parentNode !== art) art.append(walker); }
  };
  attach();
  new MutationObserver(attach).observe(document.body, {attributes:true,subtree:true,attributeFilter:['hidden']});
  const fallback = () => document.body.classList.add('forest-three-fallback');
  if (reduce) { fallback(); return; }
  import('https://cdn.jsdelivr.net/npm/three@0.161.0/build/three.module.js').then(THREE => {
    const renderer = new THREE.WebGLRenderer({canvas,alpha:true,antialias:true});
    renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 1.7));
    renderer.setSize(innerWidth, innerHeight, false);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(48, innerWidth/innerHeight, .1, 100);
    camera.position.set(0, 4.4, 13);
    const hemi = new THREE.HemisphereLight(0xe5f4d9,0x244331,2.0); scene.add(hemi);
    const sun = new THREE.DirectionalLight(0xffe8b7,2.2); sun.position.set(-4,8,5); scene.add(sun);
    const ground = new THREE.Mesh(new THREE.PlaneGeometry(42,30),new THREE.MeshStandardMaterial({color:0x577b50,roughness:1}));
    ground.rotation.x=-Math.PI/2; ground.position.y=-2.3; scene.add(ground);
    const trunkMat = new THREE.MeshStandardMaterial({color:0x493d2d,roughness:1});
    const leafMats = [0x315c3d,0x47764a,0x6d9156].map(c=>new THREE.MeshStandardMaterial({color:c,roughness:.92}));
    const trees=[];
    for(let i=0;i<26;i++){
      const x=(Math.random()-.5)*36, z=-3-Math.random()*15, h=3.5+Math.random()*4;
      const g=new THREE.Group(); g.position.set(x,-2.2,z);
      const trunk=new THREE.Mesh(new THREE.CylinderGeometry(.12,.28,h*.65,7),trunkMat);trunk.position.y=h*.32;g.add(trunk);
      for(let j=0;j<3;j++){const crown=new THREE.Mesh(new THREE.ConeGeometry(1.25-j*.18,2.2,7),leafMats[(i+j)%leafMats.length]);crown.position.y=h*.48+j*.78;crown.rotation.y=j*.8;g.add(crown)}
      scene.add(g); trees.push({g,phase:Math.random()*6});
    }
    const particleGeo=new THREE.BufferGeometry(), count=150, pos=new Float32Array(count*3), speeds=[];
    for(let i=0;i<count;i++){pos[i*3]=(Math.random()-.5)*28;pos[i*3+1]=Math.random()*9-1;pos[i*3+2]=-Math.random()*18;speeds.push(.15+Math.random()*.55)}
    particleGeo.setAttribute('position',new THREE.BufferAttribute(pos,3));
    const dust=new THREE.Points(particleGeo,new THREE.PointsMaterial({color:0xffe9a8,size:.075,transparent:true,opacity:.8}));
    scene.add(dust);
    const leaves=[];
    for(let i=0;i<28;i++){const m=new THREE.Mesh(new THREE.PlaneGeometry(.16,.23),new THREE.MeshBasicMaterial({color:[0xb7a66b,0xd7bd75,0x78945b][i%3],side:THREE.DoubleSide,transparent:true,opacity:.8}));m.position.set((Math.random()-.5)*18,Math.random()*7-1,-Math.random()*10);scene.add(m);leaves.push(m)}
    const butterflies=[];
    const wingMat=new THREE.MeshBasicMaterial({color:0xf2d6a0,side:THREE.DoubleSide});
    for(let i=0;i<7;i++){const b=new THREE.Group();for(const side of [-1,1]){const w=new THREE.Mesh(new THREE.CircleGeometry(.13,12),wingMat);w.scale.set(1.2,.7,1);w.position.x=side*.13;b.add(w)}b.position.set((Math.random()-.5)*12,Math.random()*3,-2-Math.random()*7);scene.add(b);butterflies.push({b,phase:Math.random()*6})}
    const birds=[];
    for(let i=0;i<4;i++){const b=new THREE.Group();const mat=new THREE.MeshBasicMaterial({color:0x263e35});for(const side of [-1,1]){const wing=new THREE.Mesh(new THREE.ConeGeometry(.08,.42,3),mat);wing.rotation.z=side*.9;wing.position.x=side*.18;b.add(wing)}b.position.set(-7+i*4,3+i*.4,-5);scene.add(b);birds.push(b)}
    let raf=0, last=0;
    const tick=t=>{
      raf=requestAnimationFrame(tick);const s=t*.001;
      trees.forEach(o=>{o.g.rotation.z=Math.sin(s*.55+o.phase)*.018});
      const a=particleGeo.attributes.position.array;
      for(let i=0;i<count;i++){a[i*3+1]+=speeds[i]*.008;if(a[i*3+1]>8)a[i*3+1]=-2}
      particleGeo.attributes.position.needsUpdate=true;
      leaves.forEach((l,i)=>{l.position.y-=.006+(i%4)*.001;l.position.x+=Math.sin(s+i)*.002;l.rotation.z+=.004;if(l.position.y<-2){l.position.y=5+Math.random()*3;l.position.x=(Math.random()-.5)*18}});
      birds.forEach((b,i)=>{b.position.x=Math.sin(s*.22+i*2)*7;b.position.y=3+Math.sin(s*.8+i)*.6;b.rotation.z=Math.cos(s*.22+i*2)*.08});
      butterflies.forEach(({b,phase},i)=>{b.position.x+=Math.sin(s+phase)*.004;b.position.y+=Math.sin(s*2+phase)*.008;b.rotation.y=Math.sin(s*5+phase)*.6;b.rotation.z=Math.cos(s*2+phase)*.18});
      camera.position.x=Math.sin(s*.12)*.22;camera.lookAt(0,1,-3);renderer.render(scene,camera);
    };
    const resize=()=>{renderer.setSize(innerWidth,innerHeight,false);camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix()};
    addEventListener('resize',resize);tick(0);
    document.addEventListener('visibilitychange',()=>{if(document.hidden){cancelAnimationFrame(raf)}else if(!raf)tick(0)});
  }).catch(fallback);
})();
