import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';
import { readFile } from 'node:fs/promises';
import { pbkdf2Sync } from 'node:crypto';

const sqlite = new DatabaseSync(':memory:');
sqlite.exec('PRAGMA foreign_keys = ON');
const schema=await readFile(new URL('./database.sql',import.meta.url),'utf8');
sqlite.exec(schema);sqlite.exec(schema);
class RuntimeStatement {
  constructor(sql,args=[]){this.sql=sql;this.args=args;}
  bind(...args){return new RuntimeStatement(this.sql,args);}
  async first(){return sqlite.prepare(this.sql).get(...this.args)||null;}
  async all(){return {results:sqlite.prepare(this.sql).all(...this.args)};}
  async run(){return sqlite.prepare(this.sql).run(...this.args);}
}
const password='Runtime-Fixture-Only-2026';
const salt='f03b856c13b47a22b21c988fd65c8e77';
const env={SHOP_AUTH:JSON.stringify({username:'fixture.admin',salt,passwordHash:pbkdf2Sync(password,Buffer.from(salt,'hex'),100000,32,'sha256').toString('hex'),iterations:100000,storeId:'original-store'}),DB:{prepare(sql){return new RuntimeStatement(sql)},async batch(statements){sqlite.exec('BEGIN');try{const results=[];for(const s of statements)results.push(await s.run());sqlite.exec('COMMIT');return results;}catch(e){sqlite.exec('ROLLBACK');throw e;}}}};
sqlite.prepare('INSERT INTO customers (id,user_id,name,created_at,updated_at) VALUES (?,?,?,?,?)').run('legacy-customer','original-store','Cliente existente','2026-01-01','2026-01-01');
const source=await readFile(new URL('./index.js',import.meta.url),'utf8');
const {default:worker}=await import('data:text/javascript;base64,'+Buffer.from(source).toString('base64'));
async function call(path,{method='GET',body,cookie,headers={}}={}){
  return worker.fetch(new Request('https://store.example'+path,{method,headers:{...(body?{'content-type':'application/json',origin:'https://store.example'}:{}),...(cookie?{cookie}:{}),...headers},...(body?{body:JSON.stringify(body)}:{})}),env);
}
assert.match(await (await call('/')).text(),/autocomplete="username"/);
assert.equal((await call('/api/bootstrap')).status,401);
assert.equal((await call('/api/bootstrap',{headers:{'oai-authenticated-user-id':'original-store'}})).status,401);
const login=await call('/api/auth/login',{method:'POST',body:{username:'fixture.admin',password}});
assert.equal(login.status,200);
const cookie=login.headers.get('set-cookie').split(';')[0];
assert.match(await (await call('/',{cookie})).text(),/id="mainNav"/);
sqlite.exec(schema);
const data=await (await call('/api/bootstrap',{cookie})).json();
assert.equal(data.customers[0].name,'Cliente existente');
const sale=await call('/api/sales',{method:'POST',cookie,body:{requestId:'runtime-sale',customerId:'legacy-customer',items:[{category:'footwear',name:'Tenis',size:'40',color:'Blanco',quantity:1,price:50}],paid:50}});
assert.equal(sale.status,201);assert.equal((await sale.json()).items[0].category,'footwear');
assert.equal((await (await call('/api/bootstrap',{cookie})).json()).sales.length,1);
assert.equal((await call('/api/auth/logout',{method:'POST',body:{},cookie})).status,200);
assert.equal((await call('/api/bootstrap',{cookie})).status,401);
sqlite.close();
console.log('Runtime integration passed: login, protected UI/API, existing store data, footwear purchase, persistence, logout and forged-header rejection.');
