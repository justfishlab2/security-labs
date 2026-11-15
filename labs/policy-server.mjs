import http from 'node:http';
const actors={ 'account-a':{tenant:'tenant-a',role:'member'},'account-b':{tenant:'tenant-b',role:'member'},'account-admin':{tenant:'tenant-a',role:'admin'} };
const record={id:'record-a',tenant:'tenant-a',text:'Synthetic tenant-a project'};
export async function startPolicyLab(){
 const server=http.createServer((req,res)=>{
  const send=(status,body)=>{res.writeHead(status,{'Content-Type':'application/json','Cache-Control':'no-store'});res.end(JSON.stringify(body))};
  if(req.method!=='GET')return send(405,{error:'method_not_allowed'});
  const actor=actors[req.headers['x-lab-user']];if(!actor)return send(401,{error:'mock_identity_required'});
  const p=new URL(req.url,'http://localhost').pathname;
  if(/^\/tenant\/(unprotected|protected)\/projects\/record-a$/.test(p)){
   if(p.includes('/protected/')&&actor.tenant!==record.tenant)return send(403,{error:'forbidden'});
   return send(200,record);
  }
  if(/^\/role\/(unprotected|protected)\/reports\/export$/.test(p)){
   if(p.includes('/protected/')&&actor.role!=='admin')return send(403,{error:'forbidden'});
   return send(200,{report:'Synthetic export',tenant:actor.tenant});
  }
  send(404,{error:'not_found'});
 });
 await new Promise((resolve,reject)=>{server.once('error',reject);server.listen(0,'127.0.0.1',resolve)});
 return{server,origin:`http://127.0.0.1:${server.address().port}`};
}
export async function stopPolicyLab(server){await new Promise((resolve,reject)=>{server.close(e=>e?reject(e):resolve());server.closeIdleConnections()})}
