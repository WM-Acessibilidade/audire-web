'use strict';
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const read=p=>fs.readFileSync(__dirname+'/'+p,'utf8');
function dom(){const els=new Map(),created=[],links=[];function el(tag='div'){return{tag,hidden:false,disabled:false,value:'',dataset:{},children:[],textContent:'',append(o){this.children.push(o);if(tag==='select'&&!this.value)this.value=o.value;},replaceChildren(){this.children=[];this.value='';},setAttribute(){},before(x){created.push(x);},after(x){created.push(x);},focus(){},select(){},dispatchEvent(){},reportValidity:()=>true};}return{els,created,links,document:{getElementById(id){if(!els.has(id))els.set(id,el(id==='previaSelecionada'?'select':'div'));return els.get(id);},querySelector(s){return this.getElementById(s);},querySelectorAll(){return links;},createElement:el,head:{append(){}}}};}
(async()=>{
 for(const file of ['admin-repositorio.html','repositorio.html','roteiro.html'])for(const m of read(file).matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g))new vm.Script(m[1],{filename:file});
 const repo={id:'repo',descricao:'Apresentação original.',atualizado_em:new Date().toISOString()},link={id:'link',repositorio_id:'repo',ativo:true,permitir_revisao:true,expira_em:new Date(Date.now()+86400000).toISOString(),criado_em:repo.atualizado_em,url:'https://audire.pro/repositorio.html?id=repo#previarepo=teste',revisao:{texto_revisado:'Apresentação revisada.',texto_base:repo.descricao,versao:1,atualizado_em:repo.atualizado_em}};
 const d=dom();let acoes=0,requests=0,dirty=false;
 const c={window:{},document:d.document,navigator:{clipboard:{writeText:async()=>{}}},Event:class{},Date};vm.createContext(c);vm.runInContext(read('data/audire-previas-repositorio-admin.js'),c);
 c.window.AudirePreviasRepositorioAdmin.iniciar({api:async()=>{requests++;return{previas:[link],email:{configurado:true,remetente:'Audire <contato@audire.pro>'}};},obterRepositorio:()=>repo,temAlteracoes:()=>dirty,atualizarAcoes:()=>acoes++});
 await c.window.AudirePreviasRepositorioAdmin.carregar();const $=id=>d.document.getElementById(id);assert.equal($('revisaoRecebida').value,link.revisao.texto_revisado);
 $('descricao').value=repo.descricao;const calls=requests;$('aplicarRevisao').onclick();assert.equal($('descricao').value,'Apresentação revisada.');assert.equal(repo.descricao,'Apresentação original.');assert.equal(requests,calls);assert.equal(acoes,1);
 $('descricao').value='Alteração local pendente';$('aplicarRevisao').onclick();assert.equal($('descricao').value,'Alteração local pendente');
 dirty=true;await $('gerarPrevia').onclick({currentTarget:$('gerarPrevia')});assert.equal(requests,calls);assert.match($('previasStatus').textContent,/Salve ou cancele/);
 for(const permitir of [false,true]){
  const p=dom(),captured=[],win={};let display;
  p.links.push({dataset:{rid:'roteiro'},href:''});
  const context={window:win,document:p.document,location:{hash:'#previarepo=token-teste',search:'?id=repo',origin:'https://audire.pro',href:'https://audire.pro/repositorio.html?id=repo#previarepo=token-teste'},URLSearchParams,URL,Date,fetch:async(url,opt)=>{captured.push({url,opt});return{ok:true,json:async()=>url.endsWith('/revisao')?{revisao:{texto_revisado:'Revisão salva.',versao:1,base_atualizado_em:repo.atualizado_em}}:{previa:{permitir_revisao:permitir,expira_em:link.expira_em},repositorio:{...repo,roteiros:[{id:'roteiro'}]},revisao:null}};}};
  vm.createContext(context);vm.runInContext(read('data/audire-previa-repositorio.js'),context);
  assert.equal(await win.AudirePreviaRepositorio.carregarRepositorio({paragrafos:t=>t,render:r=>display=r}),true);
  assert.equal(display.descricao,repo.descricao);assert.match(p.links[0].href,/#previarepo=token-teste/);assert.equal(p.created.some(e=>e.id==='previaApresentacaoEditor'),permitir);
  assert.equal(captured[0].opt.headers['x-audire-previa'],'token-teste');assert.doesNotMatch(captured[0].url,/token-teste/);
  if(permitir){p.document.getElementById('previaApresentacaoTexto').value='Revisão salva.';await p.document.getElementById('salvarApresentacaoPrevia').onclick();assert.deepEqual(Object.keys(JSON.parse(captured[1].opt.body)).sort(),['base_atualizado_em','descricao','versao']);assert.equal(p.document.getElementById('apresentacaoTexto').innerHTML,'Revisão salva.');assert.equal(repo.descricao,'Apresentação original.');}
 }
 for(const code of [200,404,410]){
  const p=dom(),win={},nav={href:'https://audire.pro/roteiro.html?id=seguinte&repositorio=repo'};p.links.push(nav);let display=null;
  const c={window:win,document:p.document,URLSearchParams,URL,Date,location:{hash:'#previarepo=token-teste',search:'?id=roteiro',origin:'https://audire.pro',href:'https://audire.pro/roteiro.html?id=roteiro#previarepo=token-teste'},fetch:async()=>({ok:code===200,status:code,json:async()=>code===200?{previa:{permitir_revisao:false,expira_em:link.expira_em},roteiro:{id:'roteiro',repositorio_id:'repo',roteiro_texto:'Somente leitura'}}:{error:'Prévia indisponível'}})};
  vm.createContext(c);vm.runInContext(read('data/audire-previa-repositorio.js'),c);assert.equal(await win.AudirePreviaRepositorio.carregarRoteiro({render:r=>display=r}),code===200);assert.equal(p.created.some(e=>e.id==='previaApresentacaoEditor'),false);
  if(code===200){assert.equal(display.roteiro_texto,'Somente leitura');assert.match(p.document.getElementById('voltar').href,/repositorio.html\?id=repo#previarepo=token-teste/);assert.match(nav.href,/#previarepo=token-teste/);}else{assert.equal(display,null);assert.equal(p.document.getElementById('conteudo').hidden,true);}
 }
 console.log('Telas dos repositórios: comparação sem salvar automaticamente, preservação de edição local, bloqueio de criação com alterações pendentes, editor apenas na apresentação, navegação com token e erros sem exibir conteúdo passaram.');
})().catch(e=>{console.error(e);process.exitCode=1;});
