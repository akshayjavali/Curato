import seed from '../../public/seed.json' with {type:'json'};
import {same,token,verify,validate} from './security.mjs';
const json=(body,status=200,headers={})=>new Response(JSON.stringify(body),{status,headers:{'Content-Type':'application/json','Cache-Control':'no-store',...headers}});
const cookie=(value,age)=>`curato_session=${value}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=${age}`;
export async function handler(req,getStore){
 const path=new URL(req.url).pathname.replace(/^\/(?:api|\.netlify\/functions\/api)\/?/,'');
 const password=process.env.ADMIN_PASSWORD;
 const session=req.headers.get('cookie')?.split(';').map(x=>x.trim()).find(x=>x.startsWith('curato_session='))?.slice(15);
 const authenticated=verify(session,password);
 try{
 if(req.method!=='GET'){if(req.headers.get('origin')!==new URL(req.url).origin)return json({error:'Request origin is not allowed.'},403);if(Number(req.headers.get('content-length'))>100000)return json({error:'Content is too large.'},413);}
 if(path==='session'&&req.method==='GET')return json({authenticated,configured:Boolean(password&&password.length>=16),configurationStatus:!password?'missing':password.length<16?'too_short':'ready'});
 if(path==='login'&&req.method==='POST'){if(!password||password.length<16)return json({error:'Set ADMIN_PASSWORD in Netlify to a unique password of at least 16 characters, then redeploy.'},503);const body=await req.text();if(body.length>2000)return json({error:'Invalid credentials.'},400);const input=JSON.parse(body);if(typeof input.password!=='string'||!same(input.password,password))return json({error:'Incorrect password.'},401);return json({ok:true},200,{'Set-Cookie':cookie(token(password),28800)});}
 if(path==='logout'&&req.method==='POST')return json({ok:true},200,{'Set-Cookie':cookie('',0)});
 if(path==='catalog'&&req.method==='GET'){const store=getStore({name:'curato-content',consistency:'strong'});const {blobs}=await store.list();const overrides=await Promise.all(blobs.map(b=>store.get(b.key,{type:'json'})));const catalog={products:[],posts:[]};for(const type of ['products','posts']){const map=new Map(seed[type].map(p=>[p.id,p]));for(const item of overrides.filter(x=>x&&x.type===type)){if(item.deleted)map.delete(item.id);else map.set(item.id,item.value);}catalog[type]=[...map.values()];}return json(catalog);}
 if(path==='content'&&['PUT','DELETE'].includes(req.method)){if(!authenticated)return json({error:'Please sign in again.'},401);const text=await req.text();if(text.length>100000)return json({error:'Content is too large.'},413);const body=JSON.parse(text);if(!['products','posts'].includes(body.type))return json({error:'Invalid content type.'},400);const store=getStore({name:'curato-content',consistency:'strong'});if(req.method==='DELETE'){if(!/^[a-z0-9][a-z0-9-]{0,79}$/.test(body.id))return json({error:'Invalid ID.'},400);await store.setJSON(`${body.type}/${body.id}`,{type:body.type,id:body.id,deleted:true});}else{let value;try{value=validate(body.type,body.value);}catch(e){return json({error:e.message},400);}await store.setJSON(`${body.type}/${value.id}`,{type:body.type,id:value.id,value});}return json({ok:true});}
 return json({error:'Not found.'},404);
 }catch(e){console.error('Curato API:',e.message);return json({error:e instanceof SyntaxError?'Invalid JSON.':'Unable to complete the request. Please retry.'},e instanceof SyntaxError?400:500);}
}
