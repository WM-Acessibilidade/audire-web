(function(){
 'use strict';
 const $=id=>document.getElementById(id);
 let ctx,revisoes=[];
 const status=msg=>{$('revisoesRepositorioStatus').textContent=msg;};
 function selecionada(){return revisoes.find(v=>v.previa_id===$('revisaoRepositorioSelecionada').value);}
 function mostrar(){const v=selecionada();$('revisaoRepositorioTexto').value=v?.texto_revisado||'';$('revisaoRepositorioBase').value=v?.texto_base||'';$('aplicarRevisaoRepositorio').disabled=!v;
  $('revisaoRepositorioInfo').textContent=v?'Versão '+v.versao+', salva em '+new Date(v.atualizado_em).toLocaleString('pt-BR')+'.'+(v.texto_base!==ctx.obterRoteiro()?.roteiro_texto?' O original foi alterado desde o início da revisão. Compare os textos antes de aplicar.':''):'Nenhuma revisão recebida pelo repositório.';
 }
 async function carregar(c){ctx=c;const r=ctx.obterRoteiro();
  let box=$('revisoesRepositorioPainel');if(!box){box=document.createElement('section');box.id='revisoesRepositorioPainel';box.className='panel';box.innerHTML='<h2>Revisões recebidas pelo repositório</h2><label for="revisaoRepositorioSelecionada">Link de revisão do repositório</label><select id="revisaoRepositorioSelecionada"></select><p id="revisaoRepositorioInfo"></p><label for="revisaoRepositorioTexto">Texto revisado recebido</label><textarea id="revisaoRepositorioTexto" readonly aria-describedby="revisaoRepositorioInfo"></textarea><details><summary>Texto original no início da revisão</summary><label for="revisaoRepositorioBase">Texto usado como base</label><textarea id="revisaoRepositorioBase" readonly></textarea></details><button id="aplicarRevisaoRepositorio" type="button" disabled>Aplicar revisão ao original</button><p>Copia o texto para sua edição. Confira e use Salvar alterações para gravar.</p><div id="revisoesRepositorioStatus" role="status" aria-live="polite"></div>';$('previasPainel').after(box);}
  box.hidden=!r?.repositorio_id;if(box.hidden)return;
  $('revisaoRepositorioSelecionada').onchange=mostrar;
  $('aplicarRevisaoRepositorio').onclick=()=>{const v=selecionada();if(!v)return;const campo=$('texto');if(campo.value!==(ctx.obterRoteiro()?.roteiro_texto||'')){status('O texto original já tem alterações não salvas. Salve ou cancele antes de aplicar a revisão.');return;}campo.value=v.texto_revisado;campo.dispatchEvent(new Event('input',{bubbles:true}));ctx.atualizarAcoes();status('Revisão copiada para edição. Confira e use Salvar alterações para gravar.');campo.focus();};
  try{const j=await ctx.api('/audire/admin/repositorios/'+encodeURIComponent(r.repositorio_id)+'/previas/roteiros/'+encodeURIComponent(r.id)+'/revisoes');revisoes=j.revisoes||[];const sel=$('revisaoRepositorioSelecionada'),anterior=sel.value;sel.replaceChildren();for(const v of revisoes){const o=document.createElement('option');o.value=v.previa_id;o.textContent=v.identificacao||'Prévia do repositório';sel.append(o);}if(revisoes.some(v=>v.previa_id===anterior))sel.value=anterior;mostrar();status('Revisões do repositório carregadas.');}
  catch(e){revisoes=[];$('revisaoRepositorioSelecionada').replaceChildren();mostrar();status('Não foi possível carregar as revisões do repositório: '+e.message);}
 }
 window.AudireRevisoesRepositorioRoteiroAdmin={carregar};
})();
