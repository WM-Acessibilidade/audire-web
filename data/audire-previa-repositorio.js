(function(){
 'use strict';
 const token=new URLSearchParams(location.hash.slice(1)).get('previarepo');
 const $=id=>document.getElementById(id);
 let state=null,original=null,ctx=null;
 const fragmento=()=> '#previarepo='+encodeURIComponent(token);
 const urlRepo=id=>'repositorio.html?id='+encodeURIComponent(id)+fragmento();
 const urlRoteiro=(id,repo)=>'roteiro.html?id='+encodeURIComponent(id)+'&repositorio='+encodeURIComponent(repo)+fragmento();
 async function api(path,opt={}){
  const resp=await fetch('https://audesc-events-api.onrender.com'+path,{...opt,cache:'no-store',headers:{'Content-Type':'application/json','x-audire-previa':token,...(opt.headers||{})}});
  const j=await resp.json().catch(()=>({}));if(!resp.ok)throw Object.assign(new Error(j.error||'Não foi possível abrir a prévia.'),{status:resp.status});return j;
 }
 function preparar(){const m=document.createElement('meta');m.name='robots';m.content='noindex,nofollow,noarchive';document.head.append(m);$('voltar').hidden=true;}
 function aviso(texto){const e=document.createElement('div');e.id='previaRepositorioAviso';e.className='status';e.setAttribute('role','note');e.textContent=texto;$('conteudo').before(e);}
 function st(msg,error=false){$('previaApresentacaoStatus').textContent=msg;$('previaApresentacaoStatus').className='status'+(error?' error':'');}
 function mostrarTexto(texto){$('apresentacaoTexto').innerHTML=ctx.paragrafos(texto);}
 function falha(e){$('conteudo').hidden=true;$('voltar').hidden=true;$('status').hidden=false;$('status').textContent=e.message;return false;}
 async function carregarRepositorio(c){
  ctx=c;preparar();
  try{
   state=await api('/audire/public/previa-repositorio');original=state.repositorio;
   ctx.render({...original,descricao:state.revisao?.texto_revisado||original.descricao});$('voltar').hidden=true;$('audireLema').textContent=state.lema||'';
   document.querySelectorAll('[data-rid]').forEach(a=>{a.href=urlRoteiro(a.dataset.rid,original.id);});
   if(!(original.roteiros||[]).length){const ul=document.querySelector('.roteiros');if(ul)ul.textContent='Nenhum roteiro vinculado.';}
   aviso('Prévia do repositório para consulta'+(state.previa.permitir_revisao?' e revisão da apresentação':'')+'. Inclui todos os roteiros vinculados, inclusive rascunhos e ocultos. O acesso não publica o conteúdo. Válida até '+new Date(state.previa.expira_em).toLocaleString('pt-BR')+'.'+(state.revisao?' Você está visualizando a apresentação revisada salva.':''));
   if(state.previa.permitir_revisao)criarEditor();return true;
  }catch(e){return falha(e);}
 }
 function criarEditor(){
  const box=document.createElement('section');box.className='panel';box.id='previaApresentacaoEditor';
  box.innerHTML='<h2>Revisão da apresentação</h2><p>Somente a apresentação do repositório pode ser editada. A revisão é salva separadamente do original. Os roteiros vinculados permanecem apenas para leitura e escuta.</p><button id="editarApresentacaoPrevia" type="button">Editar apresentação</button><div id="previaApresentacaoEdicao" hidden><label for="previaApresentacaoTexto">Texto de apresentação para revisão</label><textarea id="previaApresentacaoTexto" maxlength="12000" style="width:100%;box-sizing:border-box;min-height:300px;font:inherit"></textarea><p><button id="salvarApresentacaoPrevia" type="button">Salvar revisão</button><button id="cancelarApresentacaoPrevia" type="button" class="secondary">Cancelar alterações</button></p></div><p><button id="verApresentacaoOriginal" type="button" class="secondary">Ver apresentação original salva</button><button id="verApresentacaoRevisada" type="button" class="secondary">Ver revisão salva</button></p><div id="previaApresentacaoStatus" class="status" role="status" aria-live="polite"></div>';
  $('conteudo').after(box);
  const salvo=()=>state.revisao?.texto_revisado||original.descricao;
  $('previaApresentacaoTexto').value=salvo();$('verApresentacaoRevisada').disabled=!state.revisao;
  $('editarApresentacaoPrevia').onclick=()=>{$('previaApresentacaoEdicao').hidden=false;$('previaApresentacaoTexto').focus();};
  $('cancelarApresentacaoPrevia').onclick=()=>{$('previaApresentacaoTexto').value=salvo();$('previaApresentacaoEdicao').hidden=true;st('Alterações locais canceladas. A revisão salva foi preservada.');$('editarApresentacaoPrevia').focus();};
  $('verApresentacaoOriginal').onclick=()=>{mostrarTexto(original.descricao);st('Exibindo a apresentação original salva na administração.');};
  $('verApresentacaoRevisada').onclick=()=>{if(state.revisao){mostrarTexto(state.revisao.texto_revisado);st('Exibindo a apresentação revisada salva.');}};
  $('salvarApresentacaoPrevia').onclick=async()=>{
   const b=$('salvarApresentacaoPrevia');b.disabled=true;
   try{
    const j=await api('/audire/public/previa-repositorio/revisao',{method:'PUT',body:JSON.stringify({descricao:$('previaApresentacaoTexto').value,versao:state.revisao?.versao||0,base_atualizado_em:state.revisao?.base_atualizado_em||original.atualizado_em})});
    state.revisao=j.revisao;mostrarTexto(j.revisao.texto_revisado);$('verApresentacaoRevisada').disabled=false;st('Revisão salva. A apresentação original não foi alterada.');
   }catch(e){st(e.message,true);if([403,410].includes(e.status)){b.dataset.bloqueado='1';$('previaApresentacaoTexto').readOnly=true;$('editarApresentacaoPrevia').disabled=true;}}
   finally{b.disabled=b.dataset.bloqueado==='1';}
  };
  st(state.revisao?'Sua revisão salva está disponível para continuar a edição.':'Nenhuma revisão salva. Use Editar apresentação para começar.');
 }
 async function carregarRoteiro(c){
  preparar();
  try{
   const id=new URLSearchParams(location.search).get('id');
   const j=await api('/audire/public/previa-repositorio/roteiros/'+encodeURIComponent(id||''));
   c.render(j.roteiro);$('audireLema').textContent=j.lema||'';
   const voltar=$('voltar');voltar.href=urlRepo(j.roteiro.repositorio_id);voltar.textContent='Voltar à prévia do repositório';voltar.hidden=false;
   document.querySelectorAll('#conteudo a[href]').forEach(a=>{const u=new URL(a.href,location.href);if(u.origin===location.origin&&u.pathname.endsWith('/roteiro.html')&&u.searchParams.get('repositorio')===j.roteiro.repositorio_id){a.href=urlRoteiro(u.searchParams.get('id'),j.roteiro.repositorio_id);}});
   aviso('Prévia de roteiro vinculada ao repositório. Somente leitura e escuta; este link não permite editar o roteiro. Válida até '+new Date(j.previa.expira_em).toLocaleString('pt-BR')+'.');return true;
  }catch(e){return falha(e);}
 }
 window.AudirePreviaRepositorio={ativo:!!token,carregarRepositorio,carregarRoteiro};
})();
