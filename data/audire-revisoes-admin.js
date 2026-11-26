(function(){
 'use strict';
 const $=id=>document.getElementById(id);let ctx,items=[],identity='',loadId=0;
 function original(){return ctx.obterRoteiro?ctx.obterRoteiro():ctx.obterRepositorio();}
 function escolhida(){return items.find(v=>v.id===$('revisaoEscolhida').value);}
 function mostrar(){const v=escolhida();$('revisaoRecebida').value=v?.texto_revisado||'';$('revisaoTextoBase').value=v?.texto_base||'';$('revisaoBasePainel').hidden=!v;$('aplicarRevisao').disabled=!v;
  const base=original(),field=ctx.obterRoteiro?'roteiro_texto':'descricao';
  $('revisaoRecebidaInfo').textContent=v?v.origem+(v.identificacao?' — '+v.identificacao:'')+'. '+(v.revisor_email?'E-mail verificado: '+v.revisor_email+'.':'Autoria não verificada: revisão anterior à verificação por e-mail.')+' Versão '+v.versao+', salva em '+new Date(v.atualizado_em).toLocaleString('pt-BR')+'.'+(v.texto_base!==(base?.[field]||'')?' O original mudou desde o início desta revisão. Compare os textos antes de aplicar.':''):'Nenhuma revisão recebida para este texto.';
 }
 async function carregar(c){ctx=c;const base=original();if(!base?.id)return;const ticket=++loadId,k=(ctx.obterRoteiro?'roteiro:':'repositorio:')+base.id,previous=identity===k?$('revisaoEscolhida').value:'';identity=k;
  $('revisaoRecebidaInfo').setAttribute('role','status');$('revisaoRecebidaInfo').setAttribute('aria-live','polite');
  $('revisaoEscolhida').onchange=mostrar;
  $('aplicarRevisao').onclick=()=>{const v=escolhida();if(!v)return;const target=$(ctx.obterRoteiro?'texto':'descricao'),field=ctx.obterRoteiro?'roteiro_texto':'descricao';if(target.value!==(original()?.[field]||'')){$('revisaoRecebidaInfo').textContent='O texto original tem alterações não salvas. Salve ou cancele antes de aplicar outra revisão.';return;}target.value=v.texto_revisado;target.dispatchEvent(new Event('input',{bubbles:true}));ctx.atualizarAcoes();$('revisaoRecebidaInfo').textContent='Revisão copiada para edição. Confira e use Salvar alterações para gravar.';target.focus();};
  try{const j=await ctx.api('/audire/admin/'+(ctx.obterRoteiro?'roteiros':'repositorios')+'/'+encodeURIComponent(base.id)+'/revisoes-recebidas');if(ticket!==loadId)return;items=(j.revisoes||[]).slice().sort((a,b)=>Date.parse(b.atualizado_em)-Date.parse(a.atualizado_em)||b.versao-a.versao);const sel=$('revisaoEscolhida');sel.replaceChildren();for(const v of items){const o=document.createElement('option');o.value=v.id;o.textContent=v.origem+(v.identificacao?' — '+v.identificacao:'')+' — '+(v.revisor_email||'Autoria não verificada')+' — '+new Date(v.atualizado_em).toLocaleString('pt-BR')+' — versão '+v.versao;sel.append(o);}sel.value=items.some(v=>v.id===previous)?previous:items[0]?.id||'';sel.disabled=!items.length;mostrar();}
  catch(e){if(ticket!==loadId)return;items=[];$('revisaoEscolhida').replaceChildren();$('revisaoEscolhida').disabled=true;mostrar();$('revisaoRecebidaInfo').textContent='Não foi possível carregar as revisões recebidas: '+e.message;}
 }
 window.AudireRevisoesAdmin={carregar};
})();
