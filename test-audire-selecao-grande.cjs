'use strict';
const assert=require('node:assert/strict'),core=require('./data/audire-audio-edicao');
// 71 MB of 16-bit stereo AIFF becomes about 142 MB in float PCM.
const sr=48000,n=sr*370,start=sr*120,end=start+sr;
const original={sampleRate:sr,channels:[new Float32Array(n),new Float32Array(n)]};
for(let c=0;c<2;c++){
 const a=original.channels[c],sign=c?-1:1;
 a[start-1]=sign*.125;a[start]=sign*.25;a[end-1]=sign*.375;a[end]=sign*.5;a[n-1]=sign*.625;
}
assert(n*8+44>128*1024*1024);
const clip=core.selecionar(original,120,121),removed=core.excluir(original,120,121);
assert.equal(clip.channels.length,2);assert.equal(clip.channels[0].length,sr);
for(let c=0;c<2;c++){
 assert.equal(removed.channels[c].length,n-sr);
 assert.equal(removed.channels[c][start-1],original.channels[c][start-1]);
 assert.equal(removed.channels[c][start],original.channels[c][end]);
 assert.equal(removed.channels[c][n-sr-1],original.channels[c][n-1]);
}
const restored=core.inserir(removed,clip,120);
for(let c=0;c<2;c++){
 assert.equal(restored.channels[c].length,n);
 for(const i of [start-1,start,end-1,end,n-1])assert.equal(restored.channels[c][i],original.channels[c][i]);
 assert.equal(original.channels[c][start],c?-.25:.25);
}
// Oversized output is rejected before channel buffers are allocated or copied.
const fakeChannel={length:Math.ceil(256*1024*1024/8)+sr,subarray(){throw Error('should not copy');},slice(){throw Error('should not copy');}};
const oversized={sampleRate:sr,channels:[fakeChannel,fakeChannel]};
assert.throws(()=>core.excluir(oversized,0,.001),/256 MB/);
assert.throws(()=>core.selecionar(oversized,0,oversized.channels[0].length/sr),/256 MB/);
assert.throws(()=>core.inserir(oversized,clip,0),/256 MB/);
console.log('PCM estéreo de 142 MB: seleção em 2 minutos, exclusão, reinserção e preservação dos canais; limite de 256 MiB antes de alocar: OK.');
