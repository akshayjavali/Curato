import test from 'node:test';
import assert from 'node:assert/strict';
import {handler} from '../netlify/lib/api-core.mjs';
import {token,verify,validate} from '../netlify/lib/security.mjs';
import seed from '../public/seed.json' with {type:'json'};
const secret='test-only-long-password-12345';
test('Signed sessions reject tampering, expiration, and changed passwords',()=>{const t=token(secret,1000);assert.equal(verify(t,secret,2000),true);assert.equal(verify(t+'0',secret,2000),false);assert.equal(verify(t,'changed',2000),false);assert.equal(verify(t,secret,1000+8*3600000),false);assert.equal(verify(undefined,secret),false);});
test('Content rejects unsafe links, negative prices, and invalid slugs',()=>{const p=seed.products[0];assert.throws(()=>validate('products',{...p,affiliateUrl:'javascript:alert(1)'}));assert.throws(()=>validate('products',{...p,image:'http://example.com/a.jpg'}));assert.throws(()=>validate('products',{...p,price:-1}));assert.throws(()=>validate('products',{...p,id:'../outside'}));assert.equal(validate('products',p).id,p.id);});
test('API enforces auth/origin and supports durable product and article CRUD',async()=>{process.env.ADMIN_PASSWORD=secret;const records=new Map();const store=()=>({list:async()=>({blobs:[...records.keys()].map(key=>({key}))}),get:async key=>records.get(key),setJSON:async(key,value)=>{records.set(key,value);}});const request=(path,method='GET',body,cookie,origin='https://curato.test')=>handler(new Request(`https://curato.test/api/${path}`,{method,headers:{origin,...(cookie?{cookie}:{}),'Content-Type':'application/json'},body:body?JSON.stringify(body):undefined}),store);
assert.equal((await request('content','PUT',{type:'products',value:seed.products[0]})).status,401);
assert.equal((await request('login','POST',{password:secret},null,'https://evil.test')).status,403);
assert.equal((await request('login','POST',{password:'incorrect'})).status,401);
const login=await request('login','POST',{password:secret});assert.equal(login.status,200);const cookie=login.headers.get('set-cookie');assert.match(cookie,/HttpOnly/);assert.match(cookie,/Secure/);assert.equal((await (await request('session','GET',null,cookie)).json()).authenticated,true);
for(const type of ['products','posts']){const value={...seed[type][0],id:'new-test',title:'My saved content'};assert.equal((await request('content','PUT',{type,value},cookie)).status,200);let data=await (await request('catalog')).json();assert.equal(data[type].find(p=>p.id==='new-test').title,value.title);value.title='Updated';await request('content','PUT',{type,value},cookie);data=await (await request('catalog')).json();assert.equal(data[type].find(p=>p.id==='new-test').title,'Updated');await request('content','DELETE',{type,id:value.id},cookie);data=await (await request('catalog')).json();assert.equal(data[type].some(p=>p.id===value.id),false);}
await request('content','DELETE',{type:'products',id:seed.products[0].id},cookie);const data=await (await request('catalog')).json();assert.equal(data.products.some(p=>p.id===seed.products[0].id),false);
assert.match((await request('logout','POST',null,cookie)).headers.get('set-cookie'),/Max-Age=0/);
delete process.env.ADMIN_PASSWORD;assert.equal((await request('login','POST',{password:secret})).status,503);
});
