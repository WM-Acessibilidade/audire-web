/* Shared, session-only audio clipboard. Editing never publishes a roteiro. */
(function(){
 'use strict';
 const core=window.AudireAudioEdicao,instances=[];
 let clipboard=null;
 const seconds=a=>a.channels[0].length/a.sampleRate;
 const time=n=>Number(n).toFixed(3).replace('.',',')+' segundos';
 function restore(value){clipboard=value;instances.forEach(i=>i.refresh());}
 function montar(ctx){
  const p=ctx.prefix,section=document.createElement('section');
  section.className='pause-editor';
  section.innerHTML=`<h3>Seleção interna</h3><p>Informe tempos em segundos ou minutos:segundos. Use as setas para ajustar 0,01 segundo. Início vazio usa o começo do áudio; fim vazio usa o final.</p><div class="grid">${['Inicio','Fim'].map((k,i)=>`<div><label for="${p}${k}">${i?'Fim':'Início'} da seleção</label><input id="${p}${k}" inputmode="decimal" value="" autocomplete="off"><button type="button" class="secondary" id="${p}${k}Cursor">Usar posição atual da reprodução como ${i?'fim':'início'}</button><button type="button" class="secondary" id="${p}${k}Menos">Recuar ${i?'fim':'início'} em 0,01 s</button><button type="button" class="secondary" id="${p}${k}Mais">Avançar ${i?'fim':'início'} em 0,01 s</button></div>`).join('')}</div><p id="${p}Duracao"></p><p><button type="button" class="secondary" id="${p}Ouvir">Ouvir seleção inteira</button><button type="button" class="secondary" id="${p}Primeiros" hidden>Ouvir primeiros cinco segundos</button><button type="button" class="secondary" id="${p}Ultimos" hidden>Ouvir últimos cinco segundos</button></p><audio id="${p}Previa" controls hidden preload="metadata" aria-label="Conferência da seleção interna" style="width:100%"></audio><p><button type="button" id="${p}Copiar">Copiar seleção</button><button type="button" id="${p}Recortar">Recortar seleção</button><button type="button" id="${p}Excluir">Excluir seleção</button></p><fieldset><legend>Área de transferência de áudio</legend><p>O trecho fica disponível nesta página enquanto ela estiver aberta. Copiar ou recortar outro trecho substitui o conteúdo desta área.</p><p id="${p}ClipInfo"></p><audio id="${p}ClipAudio" controls hidden preload="metadata" aria-label="Áudio da área de transferência" style="width:100%"></audio><p><button type="button" class="secondary" id="${p}ClipOuvir">Ouvir trecho</button><button type="button" class="secondary" id="${p}Normalizar">Normalizar trecho para -1 dBFS</button></p><div class="grid"><div><label for="${p}Formato">Formato do trecho para download</label><select id="${p}Formato"><option value="mp3">MP3</option><option value="opus">Ogg/Opus</option></select></div><div><label for="${p}Bitrate">Bitrate e canais do trecho</label><select id="${p}Bitrate"></select></div></div><button type="button" class="secondary" id="${p}Baixar">Baixar trecho</button></fieldset><fieldset><legend>Inserir trecho</legend><label for="${p}Posicao">Tempo da inserção</label><input id="${p}Posicao" inputmode="decimal" value="0"><button type="button" class="secondary" id="${p}PosicaoCursor">Usar posição atual da reprodução</button><button type="button" class="secondary" id="${p}PosicaoMenos">Recuar inserção em 0,01 s</button><button type="button" class="secondary" id="${p}PosicaoMais">Avançar inserção em 0,01 s</button><p>O trecho abre espaço e desloca o áudio seguinte. Use o botão Desfazer do editor para reverter recorte, exclusão, inserção ou normalização.</p><button type="button" id="${p}Inserir">Inserir abrindo espaço</button></fieldset><div id="${p}Status" class="status" role="status" aria-live="polite" aria-atomic="true"></div>`;
  ctx.anchor.append(section);
  const $=suffix=>document.getElementById(p+suffix),say=msg=>{$('Status').textContent=msg;};
  let busy=false,previewUrl='',clipUrl='',seenClip,seenSource,renderedClip,formatTouched=false;
  function selection(){const a=core.tempo($('Inicio').value),b=core.tempo($('Fim').value,ctx.duration());if(!Number.isFinite(a)||!Number.isFinite(b)||a<0||a>=b||b>ctx.duration())return null;return {inicio:a,fim:b,duracao:b-a};}
  function refresh(){
   const source=ctx.identity();if(source!==seenSource){seenSource=source;if(source&&!formatTouched){const f=ctx.format();$('Formato').value=f.formato;formats(f.bitrate_kbps,f.canais??null);}$('Previa').pause();$('Previa').hidden=true;if(previewUrl){URL.revokeObjectURL(previewUrl);previewUrl='';}$('Inicio').value='';$('Fim').value='';$('Posicao').value='0';}
   const r=selection(),long=!!r&&r.duracao>15;
   $('Duracao').textContent=r?'Duração da seleção: '+time(r.duracao):'Defina início e fim válidos.';
   for(const id of ['Primeiros','Ultimos']){$(id).hidden=!long;$(id).disabled=busy||!long;}
   for(const id of ['Ouvir','Copiar','Recortar','Excluir'])$(id).disabled=busy||!r;
   for(const id of ['ClipOuvir','Normalizar','Baixar','Inserir'])$(id).disabled=busy||!clipboard;
   if(seenClip!==clipboard){seenClip=clipboard;$('ClipAudio').pause();$('ClipAudio').hidden=true;renderedClip=null;if(clipUrl){URL.revokeObjectURL(clipUrl);clipUrl='';}}
   $('ClipInfo').textContent=clipboard?'Trecho disponível: '+time(seconds(clipboard))+'; '+(clipboard.channels.length===2?'estéreo':'mono')+'.':'Nenhum trecho copiado ou recortado.';
  }
  async function run(fn){if(busy)return;return ctx.run(async()=>{busy=true;section.querySelectorAll('button,input,select').forEach(e=>e.disabled=true);try{await fn();}catch(e){say(e.message);}finally{busy=false;section.querySelectorAll('button,input,select').forEach(e=>e.disabled=false);refresh();}});}
  function stop(){ctx.player.pause();$('Previa').pause();$('ClipAudio').pause();}
  async function sourceAudio(){const identity=ctx.identity(),audio=await ctx.read();if(identity!==ctx.identity())throw new Error('O áudio mudou durante a operação. Confira a seleção e tente novamente.');return audio;}
  async function preview(mode){stop();const r=selection();if(!r)throw new Error('Defina início e fim válidos.');if(mode!=='all'&&r.duracao<=15)throw new Error('A conferência de cinco segundos está disponível somente acima de quinze segundos.');const a=await sourceAudio(),start=mode==='last'?r.fim-5:r.inicio,end=mode==='first'?r.inicio+5:r.fim;const wav=new Blob([core.wav(core.selecionar(a,start,end))],{type:'audio/wav'});if(previewUrl)URL.revokeObjectURL(previewUrl);previewUrl=URL.createObjectURL(wav);$('Previa').src=previewUrl;$('Previa').hidden=false;await $('Previa').play();say(mode==='all'?'Reproduzindo a seleção inteira.':'Reproduzindo '+(mode==='first'?'os primeiros':'os últimos')+' cinco segundos da seleção.');}
  for(const [id,mode] of [['Ouvir','all'],['Primeiros','first'],['Ultimos','last']])$(id).onclick=()=>run(()=>preview(mode));
  for(const id of ['Inicio','Fim','Posicao']){
   const field=$(id),step=delta=>{try{const v=core.tempo(field.value,id==='Fim'?ctx.duration():0);field.value=Math.max(0,Math.min(ctx.duration(),Math.round((v+delta)*1000)/1000)).toFixed(3);refresh();say((id==='Inicio'?'Início':id==='Fim'?'Fim':'Inserção')+' em '+time(Number(field.value)));}catch(e){say(e.message);}};
   field.oninput=refresh;field.onkeydown=e=>{if(['ArrowUp','ArrowDown'].includes(e.key)){e.preventDefault();step(e.key==='ArrowUp'?.01:-.01);}};
   $(id+'Menos').onclick=()=>step(-.01);$(id+'Mais').onclick=()=>step(.01);
   $(id+'Cursor').onclick=()=>{stop();field.value=Math.max(0,Math.min(ctx.duration(),Number(ctx.player.currentTime)||0)).toFixed(3);refresh();say('Posição marcada em '+time(Number(field.value)));};
  }
  for(const action of ['Copiar','Recortar','Excluir'])$(action).onclick=()=>run(async()=>{
   stop();const r=selection();if(!r)throw new Error('Defina início e fim válidos.');const audio=await sourceAudio();
   const next=action==='Copiar'?null:core.excluir(audio,r.inicio,r.fim),clip=action==='Excluir'?null:core.selecionar(audio,r.inicio,r.fim);
   if(next){ctx.remember(clipboard);await ctx.write(next,r.inicio);}
   if(clip)restore(clip);
   refresh();say(action==='Copiar'?'Seleção copiada: '+time(seconds(clip))+'.':(action==='Recortar'?'Seleção recortada e guardada na área de transferência.':'Seleção excluída. Área de transferência preservada.')+' Partes restantes unidas. Nova duração: '+time(seconds(next))+'.');
  });
  $('Normalizar').onclick=()=>run(async()=>{stop();if(!clipboard)throw new Error('Copie ou recorte um trecho primeiro.');const next=core.editar(clipboard,{normalizar:true});ctx.remember(clipboard);restore(next);say('Trecho normalizado para pico de -1 dBFS. Use Desfazer para reverter.');});
  $('ClipOuvir').onclick=()=>run(async()=>{stop();if(!clipboard)throw new Error('Copie ou recorte um trecho primeiro.');if(renderedClip!==clipboard){if(clipUrl)URL.revokeObjectURL(clipUrl);clipUrl=URL.createObjectURL(new Blob([core.wav(clipboard)],{type:'audio/wav'}));$('ClipAudio').src=clipUrl;renderedClip=clipboard;}$('ClipAudio').hidden=false;$('ClipAudio').currentTime=0;await $('ClipAudio').play();say('Reproduzindo trecho da área de transferência.');});
  function formats(value,canais){window.AudireAudioOpcoes.preencher($('Bitrate'),$('Formato').value,value,canais);}
  const f=ctx.format();$('Formato').value=f.formato;formats(f.bitrate_kbps,f.canais??null);$('Bitrate').onchange=()=>{formatTouched=true;};$('Formato').onchange=()=>{formatTouched=true;const f=window.AudireAudioOpcoes.ler($('Bitrate'));formats(f.bitrate_kbps,f.canais);};
  $('Baixar').onclick=()=>run(async()=>{if(!clipboard)throw new Error('Copie ou recorte um trecho primeiro.');const clip=clipboard,f={formato:$('Formato').value,...window.AudireAudioOpcoes.ler($('Bitrate'))};say('Convertendo trecho para download...');const resp=await ctx.fetch('/audire/admin/audio/editor/convert/'+f.formato,{method:'POST',headers:{'Content-Type':'application/octet-stream','x-audire-audio-bitrate':String(f.bitrate_kbps),'x-audire-audio-canais':String(f.canais??'auto')},body:new Blob([core.wav(clip)],{type:'audio/wav'})});if(!resp.ok){const j=await resp.json().catch(()=>({}));throw new Error(j.error||'Não foi possível converter o trecho.');}ctx.download(await resp.blob(),'audire-trecho.'+(f.formato==='opus'?'ogg':'mp3'));say('Trecho preparado para download. Continua disponível na área de transferência.');});
  $('Inserir').onclick=()=>run(async()=>{stop();if(!clipboard)throw new Error('Copie ou recorte um trecho primeiro.');const pos=core.tempo($('Posicao').value),next=core.inserir(await sourceAudio(),clipboard,pos);ctx.remember(clipboard);await ctx.write(next,pos);refresh();say('Trecho inserido abrindo espaço em '+time(pos)+'. Nova duração: '+time(seconds(next))+'.');});
  const instance={refresh,stop};instances.push(instance);refresh();return instance;
 }
 window.AudireSelecaoInterna={montar,restaurar:restore,atualizar:()=>instances.forEach(i=>i.refresh())};
})();
