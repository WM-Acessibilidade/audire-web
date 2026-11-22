'use strict';
const assert=require('node:assert/strict'),tempo=require('./data/audire-audio-tempo');
 const events={},audio={currentTime:0,duration:310,addEventListener:(e,fn)=>events[e]=fn},label={};const t=tempo.iniciar(audio,label,295);assert.equal(label.textContent,'Tempo: 0:00 / 4:55');audio.currentTime=120;events.timeupdate();assert.equal(label.textContent,'Tempo: 2:00 / 4:55');audio.duration=315;events.durationchange();assert.equal(t.total(),295);audio.currentTime=295;events.ended();assert.equal(label.textContent,'Tempo: 4:55 / 4:55');
 const unknown={};tempo.iniciar({...audio,currentTime:0,addEventListener(){}},unknown,null);assert.match(unknown.textContent,/duração indisponível/);assert.doesNotMatch(unknown.textContent,/0:00 \/ 0:00/);

console.log('Tempo total antes de play e duração estável durante reprodução: OK.');
