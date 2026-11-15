import test,{before,after} from 'node:test';import assert from 'node:assert/strict';
import {startPolicyLab,stopPolicyLab} from './policy-server.mjs';
let server,origin;before(async()=>({server,origin}=await startPolicyLab()));after(async()=>stopPolicyLab(server));
for(const [lab,path,actor,status] of [
 ['tenant','unprotected/projects/record-a','account-a',200],['tenant','unprotected/projects/record-a','account-b',200],['tenant','protected/projects/record-a','account-a',200],['tenant','protected/projects/record-a','account-b',403],['tenant','protected/projects/record-a','account-admin',200],
 ['role','unprotected/reports/export','account-a',200],['role','unprotected/reports/export','account-admin',200],['role','protected/reports/export','account-a',403],['role','protected/reports/export','account-admin',200]
])test(`${lab} ${path} ${actor} -> ${status}`,async()=>{const r=await fetch(`${origin}/${lab}/${path}`,{headers:{'X-Lab-User':actor}});assert.equal(r.status,status);const body=await r.json();if(status===403){assert.deepEqual(body,{error:'forbidden'});assert.equal(Object.hasOwn(body,'report'),false);assert.equal(Object.hasOwn(body,'text'),false)}});
test('client-supplied role does not elevate member',async()=>{const r=await fetch(origin+'/role/protected/reports/export',{headers:{'X-Lab-User':'account-a','X-Role':'admin'}});assert.equal(r.status,403)});
test('client-supplied tenant does not cross tenant boundary',async()=>{const r=await fetch(origin+'/tenant/protected/projects/record-a',{headers:{'X-Lab-User':'account-b','X-Tenant':'tenant-a'}});assert.equal(r.status,403)});
test('unknown identity denied',async()=>assert.equal((await fetch(origin+'/role/protected/reports/export',{headers:{'X-Lab-User':'unknown'}})).status,401));
test('unknown route denied',async()=>assert.equal((await fetch(origin+'/missing',{headers:{'X-Lab-User':'account-a'}})).status,404));
test('loopback binding',()=>assert.equal(server.address().address,'127.0.0.1'));
