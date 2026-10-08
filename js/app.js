const DEV=/[?&]dev/.test(location.search),$=s=>document.querySelector(s);
const ORDER=[['inicio','Início'],['oceania','Oceania'],['nova-zelandia','Nova Zelândia'],['clima','Clima'],['desigualdade','Desigualdade'],['solucoes','Soluções'],['quiz','Quiz'],['fontes','Fontes']];
let C,Q,F,MP,GR;
Promise.all(['conteudo','quiz','fontes','mapa','graficos'].map(n=>fetch('data/'+n+'.json').then(r=>r.json()))).then(([c,q,f,m,g])=>{C=c;Q=q;F=f;MP=m;GR=g;
 $('#nav').innerHTML=ORDER.map(o=>`<a href="#${o[0]}">${o[1]}</a>`).join('');addEventListener('hashchange',render);render()})
 .catch(()=>{$('#app').innerHTML='<div class="w"><p>Não foi possível carregar o conteúdo. Recarregue a página.</p></div>'});
const fig=(k,c='')=>{const m=C.imagens[k];if(!m)return'';const cr=m.credit?`<span>Foto: ${m.source?`<a href="${m.source}" rel="noopener">${m.credit}</a>`:m.credit}</span>`:'';
 return `<figure class="ph ${c}" data-need="${m.need}"><img src="${m.src}" alt="${m.alt}" ${k==='inicio'?'':'loading="lazy"'} decoding="async"><figcaption>${m.caption||''}${cr}</figcaption></figure>`};
const dl=a=>{const l=a.filter(d=>d.status==='publicado'||DEV);return l.length?`<dl class="dados">${l.map(d=>`<div class="${d.status==='publicado'?'':'pend'}"><dt><b>${d.valor}</b><small>${d.unidade} · ${d.periodo}</small></dt><dd>${d.definicao}<cite>Fonte: ${d.fonte}</cite></dd></div>`).join('')}</dl>`:''};
const grafico=dim=>GR.filter(g=>g.dimensao===dim&&(g.status==='publicado'||DEV)).map(g=>`<figure class="ph chart" data-need="Gráfico não gerado: rode analysis/analisar_dados.py"><h3>${g.titulo}</h3><p class="pq">${g.pergunta}</p><img src="${g.arquivo}" alt="${g.alt}" loading="lazy"><figcaption>Unidade: ${g.unidade} · Período: ${g.periodo} · Fonte: ${g.fonte}${g.status==='publicado'?'':' · RASCUNHO (não verificado)'}<br>${g.explicacao}</figcaption></figure>`).join('');
const raw=a=>DEV&&a&&a.length?`<aside class="raw"><b>Pesquisa bruta (não publicada)</b><ul>${a.map(x=>`<li>${x}</li>`).join('')}</ul></aside>`:'';
const more=a=>a&&a.length?`<details><summary>Saiba mais</summary>${a.map(p=>`<p>${p}</p>`).join('')}</details>`:'';
const ps=a=>a.map(p=>`<p>${p}</p>`).join('');
const head=(k,t,key,lead)=>fig(key,'wide')+`<div class="w"><p class="kick">${k}</p><h1>${t}</h1>${lead?`<p class="lead">${lead}</p>`:''}`;
function view(id){let h='';
 if(id==='inicio')h=`<section class="hero">${fig('inicio')}<div class="in"><p class="tag"><b>CIARTEC 2026</b> · Oceania, clima e desigualdade</p><p class="tag">OCEANIC CLARITY</p><h1>Se o clima muda para todos, por que os impactos não são iguais?</h1><a class="btn" href="#oceania">Começar a trilha</a><a class="btn o" href="#quiz">Ir ao quiz</a></div></section><div class="w"><p class="kick">Como funciona</p><p>Uma trilha de cerca de 3 minutos: Oceania, Nova Zelândia, clima, desigualdade e soluções. No final, um quiz de 5 perguntas.</p></div>`;
 else if(id==='oceania'){const o=C.oceania;h=head('Contexto','Oceania','oceania',o.lead)+ps(o.texto)+'<div id="mapa" class="mapa"></div>'+`<ul class="reg">${o.regioes.map(r=>`<li><b>${r[0]}</b><br>${r[1]}</li>`).join('')}</ul>`+ps(o.texto2)+more(o.mais)+raw(o.bruta)}
 else if(id==='nova-zelandia'){const ds=C.nz.dims,cur=(location.hash.split('/')[1])||'sociedade',D=ds.find(x=>x.id===cur)||ds[0];
  h=head('Estudo de caso','Nova Zelândia','nova-zelandia',C.nz.lead)+`<nav class="sub" aria-label="Dimensões da Nova Zelândia">${ds.map(x=>`<a href="#nova-zelandia/${x.id}" ${x.id===D.id?'aria-current="true"':''}>${x.t}</a>`).join('')}</nav></div>`+fig(D.id,'wide')+`<div class="w"><h2>${D.t}</h2><p class="lead">${D.lead}</p>`+dl(D.dados)+grafico(D.id)+ps(D.texto)+raw(D.bruta)}
 else if(id==='clima'){const c=C.clima;h=head('O problema','Mudanças climáticas','clima',c.lead)+dl(c.dados)+ps(c.texto)+more(c.mais)+raw(c.bruta)}
 else if(id==='desigualdade'){const d=C.des;h=head('O centro do projeto','Quem sente mais?','desigualdade')+`<p class="quote">${d.q}</p><p>${d.lead}</p><div class="tw"><table><caption>O que muda entre quem tem mais e menos recursos</caption><thead><tr><th>Fator</th><th>Mais recursos</th><th>Menos recursos</th></tr></thead><tbody>${d.tabela.map(r=>`<tr><th scope="row">${r[0]}</th><td>${r[1]}</td><td>${r[2]}</td></tr>`).join('')}</tbody></table></div>`+LAB+more(d.mais)+raw(d.bruta)}
 else if(id==='solucoes'){const s=C.sol;h=head('Respostas','O que pode ser feito?','solucoes',s.lead)+`<ol class="sol">${s.lista.map(x=>`<li>${x}</li>`).join('')}</ol>`+more(s.mais)}
 else if(id==='quiz')h=`<div class="w"><p class="kick">Quiz</p><h1>Agora é sua vez</h1><div id="qz"></div>`;
 else h=`<div class="w"><p class="kick">Referências</p><h1>Fontes</h1>`+F.map(f=>`<article class="src"><h3>${f.instituicao}</h3><p>${f.sustenta}</p><p class="meta">${f.titulo}${f.ano?' · '+f.ano:''} · <a href="${f.url}" target="_blank" rel="noopener">${new URL(f.url).hostname}</a>${f.acesso?' · Acesso: '+f.acesso:''}</p></article>`).join('');
 const i=ORDER.findIndex(o=>o[0]===id),p=ORDER[i-1],n=ORDER[i+1];
 return h+(id==='inicio'?'':`<nav class="pn" aria-label="Navegação entre seções"><a href="#${p?p[0]:''}">${p?'← '+p[1]:''}</a><a href="#${n?n[0]:''}">${n?n[1]+' →':''}</a></nav>`)+(id==='inicio'?'':'</div>')}
function render(){const id=(location.hash.slice(1).split('/')[0])||'inicio',ok=ORDER.some(o=>o[0]===id)?id:'inicio',app=$('#app');
 app.innerHTML=view(ok);
 app.querySelectorAll('figure.ph img').forEach(im=>{const bad=()=>{const f=im.closest('figure');if(DEV){f.classList.add('miss');f.innerHTML='<div>FOTO PENDENTE: '+f.dataset.need+'</div>'}else f.remove()};im.onerror=bad;if(im.complete&&!im.naturalWidth)bad()});
 document.querySelectorAll('#nav a').forEach(a=>a.getAttribute('href')==='#'+ok?a.setAttribute('aria-current','page'):a.removeAttribute('aria-current'));
 $('#pi').style.width=((ORDER.findIndex(o=>o[0]===ok)+1)/ORDER.length*100)+'%';document.title=ORDER.find(o=>o[0]===ok)[1]+' — Oceanic Clarity';
 if(ok==='quiz')renderQuiz($('#qz'),Q);if(ok==='desigualdade')storm();if(ok==='oceania')initMapa($('#mapa'),MP);scrollTo(0,0);app.focus({preventScroll:true})}
