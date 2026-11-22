(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory();else root.AudireAudioTempo=factory();})(typeof globalThis!=='undefined'?globalThis:this,function(){
 'use strict';
 function valida(v){const n=Number(v);return Number.isFinite(n)&&n>0?n:null;}
 function formatar(v){const s=Math.max(0,Math.floor(Number(v)||0));return Math.floor(s/60)+':'+String(s%60).padStart(2,'0');}
 function iniciar(audio,elemento,seconds){let total=valida(seconds);function atualizar(){const atual=Math.max(0,Number(audio.currentTime)||0);elemento.textContent='Tempo: '+formatar(total?Math.min(atual,total):atual)+' / '+(total?formatar(total):'duração indisponível');}
  // Browser duration can be an estimate until the complete stream is decoded.
  audio.addEventListener('timeupdate',atualizar);audio.addEventListener('loadedmetadata',atualizar);audio.addEventListener('durationchange',atualizar);audio.addEventListener('ended',()=>{if(!total)total=valida(audio.currentTime);atualizar();});atualizar();return{atualizar,total:()=>total};
 }
 return{iniciar,formatar};
});
