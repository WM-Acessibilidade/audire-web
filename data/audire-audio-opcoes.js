(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory();else root.AudireAudioOpcoes=factory();})(typeof globalThis!=='undefined'?globalThis:this,function(){
 'use strict';
 function ler(valor){const p=String(valor?.value??valor??'').split(':');return{bitrate_kbps:Number(p[0])||64,canais:[1,2].includes(Number(p[1]))?Number(p[1]):null};}
 function rotulo(op){return op.bitrate_kbps+' kbps — '+(Number(op.canais)===1?'mono':Number(op.canais)===2?'estéreo':'conforme original');}
 function preencher(sel,formato,bitrate,canais=1){const rates=formato==='opus'?[32,48,64,96,128]:[48,64,96],rate=rates.includes(Number(bitrate))?Number(bitrate):formato==='opus'?48:64;let ch=[1,2].includes(Number(canais))?Number(canais):null;if(ch===null&&formato==='opus'&&rate===128)ch=2;sel.replaceChildren();const doc=sel.ownerDocument||document;function add(k,c){const o=doc.createElement('option');o.value=k+':'+(c||'auto');o.textContent=rotulo({bitrate_kbps:k,canais:c});sel.append(o);}if(ch===null)add(rate,null);for(const k of rates)for(const c of [1,2])add(k,c);sel.value=rate+':'+(ch||'auto');return ler(sel);}
 return {ler,rotulo,preencher};
});
