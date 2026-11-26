'use strict';
const {parseHTML}=require('linkedom'),fs=require('fs'),vm=require('vm'),assert=require('assert/strict');
(async()=>{
 const {window}=parseHTML('<html><body><div id="previaDetalhes"></div></body></html>'),document=window.document,$=id=>document.getElementById(id);
 const inputProto=Object.getPrototypeOf(document.createElement('input'));inputProto.reportValidity=()=>true;
 const selectProto=Object.getPrototypeOf(document.createElement('select'));Object.defineProperty(selectProto,'value',{configurable:true,get(){return this.querySelector('option[selected]')?.value||'';},set(v){for(const o of this.querySelectorAll('option')){if(o.value===String(v))o.setAttribute('selected','');else o.removeAttribute('selected');}}});
 const calls=[],people=[];let renewed=0;
 const p={id:'link',ativo:true,expira_em:new Date(Date.now()+86400000).toISOString()},base='/audire/admin/roteiros/roteiro/previas';
 const api=async(path,opt)=>{calls.push({path,opt});if(opt?.method==='POST')people.push({id:'person',email:JSON.parse(opt.body).email,ativo:true,expira_em:p.expira_em,convidado_por:'Administração do Audire'});if(opt?.method==='DELETE')people[0].ativo=false;return{acessos:people};};
 const c={window:{},document,Date};vm.createContext(c);vm.runInContext(fs.readFileSync(__dirname+'/data/audire-acessos-admin.js','utf8'),c);const helper=c.window.AudireAcessosAdmin;
 await helper.carregar(p,api,base,async()=>renewed++);assert.match($('previaAcessoStatus').textContent,/Nenhum e-mail/);$('previaAcessoEmail').value='pessoa@example.test';await $('previaAutorizarEmail').onclick();assert.match($('previaPessoas').textContent,/pessoa@example.test/);assert.equal(calls.find(c=>c.opt?.method==='POST').path,base+'/link/acessos');
 await $('previaPessoas').querySelector('button').onclick();assert.match($('previaPessoas').textContent,/revogado/);assert.match($('previaAcessoStatus').textContent,/salvamentos bloqueados/);
 await $('previaRenovarLink').onclick();assert.equal(renewed,1);assert.equal(calls.find(c=>c.opt?.method==='PATCH').path,base+'/link');
 p.ativo=false;await helper.carregar(p,api,base,async()=>{});assert.equal($('previaAutorizarEmail').disabled,true);assert.equal($('previaRenovarLink').disabled,true);
 console.log('Administração: autorizar e-mail sem enviar convite, revogar uma pessoa, renovar prazo e respeitar link revogado: OK.');
})().catch(e=>{console.error(e);process.exitCode=1;});
