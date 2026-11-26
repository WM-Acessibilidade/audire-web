'use strict';
const {parseHTML}=require('linkedom'),fs=require('fs'),vm=require('vm'),assert=require('assert/strict');
(async()=>{
 const {window}=parseHTML('<html><body><main><div id="conteudo" hidden></div></main></body></html>'),document=window.document,$=id=>document.getElementById(id);
 const formProto=Object.getPrototypeOf(document.createElement('form'));formProto.reportValidity=()=>true;
 const storage=new Map(),calls=[];let reads=0,verified=false;
 const c={window:{},document,sessionStorage:{getItem:k=>storage.get(k),setItem:(k,v)=>storage.set(k,v),removeItem:k=>storage.delete(k)},fetch:async(url,opt)=>{calls.push({url,opt});if(url.endsWith('/codigo'))return{ok:true,json:async()=>({desafio_id:'challenge',mensagem:'Confira o e-mail.'})};if(url.endsWith('/confirmar')){verified=true;return{ok:true,json:async()=>({sessao:'sessao-opaca',email:'revisor@example.test'})};}reads++;return verified?{ok:true,json:async()=>({texto:'Conteúdo protegido'})}:{ok:false,status:401,json:async()=>({error:'Verifique o e-mail'})};}};
 vm.createContext(c);vm.runInContext(fs.readFileSync(__dirname+'/data/audire-revisao-acesso.js','utf8'),c);
 const config={tipo:'repositorio',token:'preview.signature'},promise=c.window.AudireRevisaoAcesso.api('/audire/public/previa-repositorio',{},config);
 await new Promise(setImmediate);assert.equal(reads,1);assert($('audireVerificacao'));assert.equal($('conteudo').hidden,true);assert(!document.body.textContent.includes('Conteúdo protegido'));
 $('audireEmailVerificacao').value='revisor@example.test';await $('audireEnviarCodigoForm').onsubmit({preventDefault(){},currentTarget:$('audireEnviarCodigoForm')});assert.equal($('audireConfirmarCodigoForm').hidden,false);assert.equal(JSON.parse(calls.at(-1).opt.body).email,'revisor@example.test');
 $('audireCodigoVerificacao').value='123456';await $('audireConfirmarCodigoForm').onsubmit({preventDefault(){},currentTarget:$('audireConfirmarCodigoForm')});const result=await promise;assert.equal(result.texto,'Conteúdo protegido');assert.equal($('audireVerificacao'),null);assert.equal(calls.at(-1).opt.headers['x-audire-sessao'],'sessao-opaca');assert.equal(reads,2);
 await c.window.AudireRevisaoAcesso.api('/audire/public/previa-repositorio/roteiros/test',{},config);assert.equal(calls.at(-1).opt.headers['x-audire-sessao'],'sessao-opaca');assert.equal(calls.at(-1).opt.headers['x-audire-previa'],'preview.signature');
 console.log('Verificação na tela: conteúdo oculto antes do código, e-mail, confirmação, sessão no cabeçalho e continuidade da navegação: OK.');
})().catch(e=>{console.error(e);process.exitCode=1;});
