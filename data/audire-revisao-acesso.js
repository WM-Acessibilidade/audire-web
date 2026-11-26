(function(){
 'use strict';
 const root='https://audesc-events-api.onrender.com',memory=new Map(),pending=new Map();
 const $=id=>document.getElementById(id);
 function key(tipo,token){return 'audire-revisao-sessao:'+tipo+':'+token.split('.')[0];}
 function get(k){try{return sessionStorage.getItem(k)||memory.get(k)||'';}catch{return memory.get(k)||'';}}
 function set(k,v){memory.set(k,v);try{if(v)sessionStorage.setItem(k,v);else sessionStorage.removeItem(k);}catch{}}
 async function raw(path,opt,config){const k=key(config.tipo,config.token),s=get(k),resp=await fetch(root+path,{...opt,cache:'no-store',headers:{'Content-Type':'application/json','x-audire-previa':config.token,...(s?{'x-audire-sessao':s}:{}),...(opt.headers||{})}}),data=await resp.json().catch(()=>({}));if(!resp.ok)throw Object.assign(new Error(data.error||'Não foi possível acessar a revisão.'),{status:resp.status});return data;}
 function verificar(config){
  const k=key(config.tipo,config.token);if(pending.has(k))return pending.get(k);
  const promise=new Promise(resolve=>{
   let box=$('audireVerificacao');if(box)box.remove();box=document.createElement('section');box.id='audireVerificacao';box.className='panel';
   box.innerHTML='<h2>Verificação de acesso — Audire</h2><p>Informe o e-mail autorizado pela administração. O código será enviado por Audire, contato@audire.pro. Você não precisa criar senha.</p><form id="audireEnviarCodigoForm"><label for="audireEmailVerificacao">E-mail autorizado</label><input id="audireEmailVerificacao" type="email" autocomplete="email" required><button type="submit" id="audireEnviarCodigo">Enviar código de verificação</button></form><form id="audireConfirmarCodigoForm" hidden><label for="audireCodigoVerificacao">Código de seis números recebido por e-mail</label><input id="audireCodigoVerificacao" type="text" inputmode="numeric" autocomplete="one-time-code" pattern="[0-9]{6}" minlength="6" maxlength="6" required><p>O código vence em dez minutos e só pode ser usado uma vez. Após a confirmação, você poderá continuar enquanto seu acesso estiver válido.</p><button type="submit" id="audireConfirmarCodigo">Confirmar e acessar</button></form><p id="audireVerificacaoStatus" role="status" aria-live="polite" aria-atomic="true"></p>';
   ($('conteudo')||document.querySelector('main')).before(box);
   const st=msg=>{$('audireVerificacaoStatus').textContent=msg;};let challenge='';
   $('audireEnviarCodigoForm').onsubmit=async e=>{e.preventDefault();const b=$('audireEnviarCodigo');if(!e.currentTarget.reportValidity())return;b.disabled=true;st('Solicitando o código ao Audire...');try{const j=await raw('/audire/public/'+(config.tipo==='repositorio'?'previa-repositorio':'previa')+'/acesso/codigo',{method:'POST',body:JSON.stringify({email:$('audireEmailVerificacao').value.trim()})},config);challenge=j.desafio_id;$('audireConfirmarCodigoForm').hidden=false;st(j.mensagem);$('audireCodigoVerificacao').focus();}catch(error){st(error.message);}finally{b.disabled=false;}};
   $('audireConfirmarCodigoForm').onsubmit=async e=>{e.preventDefault();const b=$('audireConfirmarCodigo');if(!e.currentTarget.reportValidity()||!challenge)return;b.disabled=true;st('Confirmando o código...');try{const j=await raw('/audire/public/'+(config.tipo==='repositorio'?'previa-repositorio':'previa')+'/acesso/confirmar',{method:'POST',body:JSON.stringify({desafio_id:challenge,codigo:$('audireCodigoVerificacao').value.trim()})},config);set(k,j.sessao);box.remove();pending.delete(k);resolve();}catch(error){st(error.message);}finally{b.disabled=false;}};
   $('audireEmailVerificacao').focus();
  });pending.set(k,promise);return promise;
 }
 async function api(path,opt={},config){try{return await raw(path,opt,config);}catch(e){if(e.status!==401)throw e;set(key(config.tipo,config.token),'');await verificar(config);return raw(path,opt,config);}}
 window.AudireRevisaoAcesso={api};
})();
