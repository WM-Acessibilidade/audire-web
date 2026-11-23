'use strict';
const assert=require('node:assert/strict'),core=require('./data/audire-audio-edicao');
const sr=8000;
const original={sampleRate:sr,channels:[Float32Array.from({length:sr*3},(_,i)=>i<sr?.1:i<sr*2?.2:.3),Float32Array.from({length:sr*3},(_,i)=>i<sr?-.1:i<sr*2?-.2:-.3)]};
const saved=original.channels.map(c=>c.slice());
const clip=core.selecionar(original,'0:01,000','0:02,000');assert.equal(clip.channels[0].length,sr);assert.equal(clip.channels[1][0],saved[1][sr]);
const deleted=core.excluir(original,1,2);assert.equal(deleted.channels[0].length,2*sr);assert.equal(deleted.channels[0][sr-1],saved[0][sr-1]);assert.equal(deleted.channels[0][sr],saved[0][sr*2]);
const pasted=core.inserir(deleted,clip,1);assert.deepEqual(pasted.channels,original.channels);
for(const pos of [0,3]){const next=core.inserir(original,clip,pos);assert.equal(next.channels[0].length,4*sr);assert.equal(next.channels[0][pos*sr],clip.channels[0][0]);}
assert.deepEqual(original.channels,saved);clip.channels[0][0]=.9;assert.equal(original.channels[0][sr],saved[0][sr]);
assert.throws(()=>core.excluir(original,0,3),/todo o áudio/);for(const [a,b] of [[2,1],[-1,1],[0,4],['abc',1],[1,1],[0,Infinity]])assert.throws(()=>core.selecionar(original,a,b));
assert.throws(()=>core.inserir(original,clip,4));assert.throws(()=>core.inserir(original,clip,'-1'));
const stereo={sampleRate:16000,channels:[new Float32Array(16000).fill(.2),new Float32Array(16000).fill(.4)]};
const mono={sampleRate:sr,channels:[new Float32Array(sr).fill(.1)]};const converted=core.inserir(mono,stereo,.5);assert.equal(converted.channels.length,1);assert.equal(converted.channels[0].length,2*sr);assert.ok(Math.abs(converted.channels[0][sr]-.3)<1e-6);
const stereoDest=core.inserir(original,mono,1);assert.equal(stereoDest.channels[0][sr],stereoDest.channels[1][sr]);
const normal=core.editar({sampleRate:sr,channels:[new Float32Array(sr).fill(.2)]},{normalizar:true});assert.ok(Math.abs(normal.channels[0][0]-Math.pow(10,-1/20))<1e-6);
console.log('Seleção: limites, independência da cópia, união exata, inserção início/meio/fim, duração, mono/estéreo, taxas distintas e normalização: OK.');
