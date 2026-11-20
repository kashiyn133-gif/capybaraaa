const http=require('http');
const fs=require('fs');
const path=require('path');
const ROOT=__dirname;
function loadEnv(){try{for(const line of fs.readFileSync(path.join(ROOT,'.env'),'utf8').split(/\r?\n/)){const m=line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);if(m&&!process.env[m[1]])process.env[m[1]]=m[2].replace(/^['"]|['"]$/g,'')}}catch{}}
loadEnv();
const types={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.json':'application/json; charset=utf-8','.webmanifest':'application/manifest+json','.png':'image/png','.svg':'image/svg+xml'};
const send=(res,status,obj)=>{res.writeHead(status,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'});res.end(JSON.stringify(obj))};
const server=http.createServer(async(req,res)=>{
 const url=new URL(req.url,'http://localhost');
 if(req.method==='POST'&&url.pathname==='/api/ai'){
  let raw='';req.on('data',c=>{raw+=c;if(raw.length>65536){req.destroy()}});req.on('end',async()=>{
   let body;try{body=JSON.parse(raw||'{}')}catch{return send(res,400,{error:'Invalid JSON request.'})}
   if(typeof body.message!=='string'||!body.message.trim())return send(res,400,{error:'A message is required.'});
   const {AI_BASE_URL,AI_API_KEY,AI_MODEL}=process.env;
   if(!AI_BASE_URL||!AI_API_KEY||!AI_MODEL)return send(res,503,{error:'AI provider is not configured. Add AI_BASE_URL, AI_API_KEY and AI_MODEL to .env. Local decision engines still work.'});
   try{const response=await fetch(AI_BASE_URL.replace(/\/$/,'')+'/chat/completions',{method:'POST',headers:{'Content-Type':'application/json','Authorization':`Bearer ${AI_API_KEY}`},body:JSON.stringify({model:AI_MODEL,temperature:.3,messages:[{role:'system',content:'You are Capyplan, a careful personal decision-support assistant. Use the supplied task context, distinguish facts from assumptions, explain trade-offs, never claim certainty, and do not make changes to the user\'s schedule. Keep recommendations practical. Do not provide medical, legal, or financial advice.'},{role:'user',content:JSON.stringify({question:body.message,context:body.context||{}})}]})});const data=await response.json().catch(()=>({}));if(!response.ok)return send(res,502,{error:data.error?.message||`AI provider returned HTTP ${response.status}.`});const answer=data.choices?.[0]?.message?.content;if(!answer)return send(res,502,{error:'The AI provider returned an unexpected response format.'});send(res,200,{answer})}catch{return send(res,502,{error:'Could not reach the AI provider. Check server connection and provider settings.'})}
  });return;
 }
 if(req.method!=='GET'&&req.method!=='HEAD'){res.writeHead(405);return res.end('Method not allowed')}
 let pathname=decodeURIComponent(url.pathname);if(pathname==='/')pathname='/index.html';const file=path.resolve(ROOT,'.'+pathname);if(!file.startsWith(ROOT+path.sep)&&file!==ROOT){res.writeHead(403);return res.end('Forbidden')}
 fs.readFile(file,(err,data)=>{if(err){res.writeHead(404);return res.end('Not found')};res.writeHead(200,{'Content-Type':types[path.extname(file)]||'application/octet-stream','X-Content-Type-Options':'nosniff'});if(req.method==='HEAD')return res.end();res.end(data)});
});
const port=Number(process.env.PORT||5500);server.listen(port,'0.0.0.0',()=>console.log(`Capyplan running at http://localhost:${port}`));
