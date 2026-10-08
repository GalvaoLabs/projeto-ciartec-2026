/* Mapa da Oceania em SVG puro, sem biblioteca de mapas e sem chave de API.
   Contornos: assets/geo/oceania.geojson (local, gerado por analysis/preparar_mapa.py);
   se não existir, usa o TopoJSON público world-atlas (Natural Earth, domínio público) via jsDelivr. */
const CDN_TOPO='https://cdn.jsdelivr.net/npm/world-atlas@2.0.2/countries-110m.json';
/* No world-atlas 50m, territórios (ex.: Ashmore e Cartier) repetem o código ISO do país-mãe (Austrália, 036).
   Por isso o casamento é feito primeiro pelo NOME em inglês; só sem nome igual usa o código, e entre candidatos fica o de maior geometria. */
const nPts=pl=>pl.reduce((s,po)=>s+po.reduce((t,r)=>t+r.length,0),0);
function escolhe(L,itens){const out={};L.forEach(p=>{let c=itens.filter(i=>i.nome&&i.nome.toLowerCase()===p.en.toLowerCase());if(!c.length)c=itens.filter(i=>i.id===p.iso);if(c.length)out[p.id]=c.reduce((a,b)=>nPts(b.polys)>nPts(a.polys)?b:a).polys});return out}
function topoPolys(t,L){const sc=t.transform.scale,tr=t.transform.translate,A=t.arcs.map(a=>{let x=0,y=0;return a.map(p=>{x+=p[0];y+=p[1];return[x*sc[0]+tr[0],y*sc[1]+tr[1]]})});
 const ring=ix=>{let o=[];ix.forEach(i=>{const a=i<0?A[~i].slice().reverse():A[i];o=o.concat(o.length?a.slice(1):a)});return o},itens=[];
 t.objects.countries.geometries.forEach(g=>{const id=g.id==null?'':String(g.id).padStart(3,'0'),nome=g.properties&&g.properties.name;
  if(L.some(p=>p.iso===id||(nome&&p.en.toLowerCase()===nome.toLowerCase())))itens.push({id,nome,polys:(g.type==='Polygon'?[g.arcs]:g.arcs).map(po=>po.map(ring))})});return escolhe(L,itens)}
function geoPolys(g,L){return escolhe(L,g.features.map(f=>({id:f.properties.iso,nome:f.properties.name,polys:f.geometry.type==='Polygon'?[f.geometry.coordinates]:f.geometry.coordinates})))}
function initMapa(box,M){if(!box)return;
 const RG=Object.fromEntries(M.regioes.map(r=>[r.id,r])),P=Object.fromEntries(M.locais.map(p=>[p.id,p]));
 const W=800,L0=110,L1=215,T=16,B=-48,SX=W/(L1-L0),H=Math.round((T-B)*SX),AR=W/H,NS='http://www.w3.org/2000/svg',st={reg:null,loc:null},bb={};let vb=[0,0,W,H],fim=false;
 const X=l=>((l<0?l+360:l)-L0)*SX,Y=a=>(T-a)*SX;
 box.innerHTML=`<div class="chips" role="group" aria-label="Regiões da Oceania">${M.regioes.map(r=>`<button class="chip" data-r="${r.id}" aria-pressed="false">${r.nome}</button>`).join('')}<button class="chip nzb" data-l="nova-zelandia" aria-pressed="false">Nova Zelândia</button></div><svg class="msvg" role="group" aria-label="Mapa da Oceania com as quatro regiões e a Nova Zelândia em destaque. Use os botões acima ou os marcadores para explorar." viewBox="0 0 ${W} ${H}"><rect class="sea" x="-5000" y="-5000" width="10000" height="10000"/><g class="grat"></g><g class="geo"></g><g class="pts"></g></svg><div class="mp" aria-live="polite"></div><p class="cap">${M.fonte_geo}</p>`;
 const svg=box.querySelector('svg'),gr=svg.querySelector('.grat'),geo=svg.querySelector('.geo'),pts=svg.querySelector('.pts'),mp=box.querySelector('.mp'),chips=[...box.querySelectorAll('.chip')];
 function view(b){if(!b)vb=[0,0,W,H];else{const x0=X(b[0]),x1=X(b[2]),y0=Y(b[1]),y1=Y(b[3]);let w=x1-x0,h=y1-y0;if(w/h<AR)w=h*AR;else h=w/AR;vb=[(x0+x1)/2-w/2,(y0+y1)/2-h/2,w,h]}svg.setAttribute('viewBox',vb.join(' '))}
 function paint(){const u=vb[2]/(svg.clientWidth||390),fk=document.activeElement&&document.activeElement.closest&&document.activeElement.closest('.pt'),fid=fk&&fk.dataset.id;
  gr.innerHTML=`<line x1="-3000" x2="3000" y1="${Y(0)}" y2="${Y(0)}"/><line x1="-3000" x2="3000" y1="${Y(-23.44)}" y2="${Y(-23.44)}"/><text x="${vb[0]+6*u}" y="${Y(0)-5*u}" style="font-size:${11*u}px">Equador</text><text x="${vb[0]+6*u}" y="${Y(-23.44)-5*u}" style="font-size:${11*u}px">Trópico de Capricórnio</text>`;
  let h=M.regioes.map(r=>`<text class="rl${st.reg===r.id?' on':''}" x="${X(r.rot[0])}" y="${Y(r.rot[1])}" text-anchor="middle" style="font-size:${12*u}px">${r.nome.toUpperCase()}</text>`).join('');
  M.locais.forEach(p=>{const nz=p.id==='nova-zelandia',on=st.loc===p.id,dim=st.reg&&st.reg!==p.regiao&&!nz,show=nz||st.reg===p.regiao||on,esq=(X(p.lon)-vb[0])/vb[2]>.62;
   h+=`<g class="pt r-${p.regiao}${nz?' nz':''}${on?' on':''}${dim?' dim':''}" data-id="${p.id}" tabindex="0" role="button" aria-pressed="${on}" aria-label="${p.nome}, ${RG[p.regiao].nome}" transform="translate(${X(p.lon)} ${Y(p.lat)})"><circle class="hit" r="${22*u}"/>${nz?`<circle class="ring" r="${15*u}"/>`:''}<circle class="dot" r="${(nz?8:6)*u}"/>${show?`<text x="${esq?-11*u:11*u}" y="${4*u}" text-anchor="${esq?'end':'start'}" style="font-size:${13*u}px">${p.nome}</text>`:''}</g>`});
  pts.innerHTML=h;pts.querySelectorAll('.pt').forEach(g=>{g.onclick=()=>pick(g.dataset.id);g.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();pick(g.dataset.id)}}});
  if(fid){const f=pts.querySelector('[data-id="'+fid+'"]');if(f)f.focus()}
  geo.querySelectorAll('path').forEach(e=>{const p=P[e.dataset.id];e.classList.toggle('dim',!!st.reg&&st.reg!==p.regiao&&p.id!=='nova-zelandia');e.classList.toggle('on',st.loc===p.id)});
  chips.forEach(c=>c.setAttribute('aria-pressed',c.dataset.r?st.reg===c.dataset.r:st.loc===c.dataset.l))}
 function info(){let h;
  if(st.loc){const p=P[st.loc];h=`<h3>${p.nome}</h3><p class="reg">Região: ${RG[p.regiao].nome}</p>${p.id==='nova-zelandia'?'<p><b>País estudado pelo projeto.</b></p>':''}<p>${p.descricao}</p><p><b>Clima:</b> ${p.clima}</p><p><b>Desigualdade:</b> ${p.desigualdade}</p>${p.links?`<p><b>Explore a Nova Zelândia:</b></p><ul class="nzl">${p.links.map(l=>`<li><a href="${l[1]}">${l[0]}</a></li>`).join('')}</ul>`:''}${p.nota?`<p class="reg">${p.nota}</p>`:''}${fim&&!bb[p.id]?'<p class="reg">O contorno deste país não está disponível agora; o ponto marca a posição aproximada.</p>':''}<button class="go mb" data-reset>Ver toda a Oceania</button>`}
  else if(st.reg){const r=RG[st.reg];h=`<h3>${r.nome}</h3><p>${r.descricao}</p><p><b>Clima e desigualdade:</b> ${r.clima}</p><p><b>Países no mapa:</b></p><div class="clist">${M.locais.filter(p=>p.regiao===r.id).map(p=>`<button class="chip" data-l="${p.id}">${p.nome}</button>`).join('')}</div><button class="go mb" data-reset>Ver toda a Oceania</button>`}
  else h=`<h3>Oceania</h3><p>${M.intro}</p>`;
  mp.innerHTML=h;mp.querySelectorAll('[data-l]').forEach(b=>b.onclick=()=>pick(b.dataset.l));const rs=mp.querySelector('[data-reset]');if(rs)rs.onclick=reset}
 function pick(id){const p=P[id],b=bb[id];st.loc=id;st.reg=p.regiao;
  if(b){const mx=Math.max(0,(14-(b[2]-b[0]))/2),my=Math.max(0,(9-(b[1]-b[3]))/2),px=(b[2]-b[0])*.15,py=(b[1]-b[3])*.15;view([b[0]-mx-px,b[1]+my+py,b[2]+mx+px,b[3]-my-py])}else view(p.vista||RG[p.regiao].vista);paint();info()}
 function region(id){if(st.reg===id&&!st.loc)return reset();st.reg=id;st.loc=null;view(RG[id].vista);paint();info()}
 function reset(){st.reg=st.loc=null;view(null);paint();info()}
 chips.forEach(c=>c.onclick=()=>c.dataset.r?region(c.dataset.r):pick(c.dataset.l));
 function build(polys){geo.innerHTML='';const falta=[];M.locais.forEach(p=>{const pl=polys[p.id];if(!pl){falta.push(p.nome);return}
  let a=1e9,b=-1e9,c=1e9,d=-1e9;pl.forEach(po=>po.forEach(r=>r.forEach(q=>{const x=q[0]<0?q[0]+360:q[0];a=Math.min(a,x);b=Math.max(b,x);c=Math.min(c,q[1]);d=Math.max(d,q[1])})));bb[p.id]=[a,d,b,c];
  const e=document.createElementNS(NS,'path');e.setAttribute('d',pl.map(po=>po.map(r=>'M'+r.map(c=>X(c[0]).toFixed(1)+' '+Y(c[1]).toFixed(1)).join('L')+'Z').join('')).join(''));
  e.setAttribute('class','c r-'+p.regiao+(p.id==='nova-zelandia'?' nz':''));e.dataset.id=p.id;e.onclick=()=>pick(p.id);geo.append(e)});
  fim=true;if(falta.length)console.warn('[mapa] sem contorno:',falta.join(', '));paint();info();if(DEV&&falta.length)mp.insertAdjacentHTML('beforeend','<p class="reg">[dev] sem contorno: '+falta.join(', ')+'</p>')}
 view(null);paint();info();
 if(window.ResizeObserver)new ResizeObserver(()=>paint()).observe(svg);
 fetch('assets/geo/oceania.geojson').then(r=>r.ok?r.json():Promise.reject()).then(g=>geoPolys(g,M.locais))
  .catch(()=>fetch(CDN_TOPO).then(r=>r.json()).then(t=>topoPolys(t,M.locais))).then(build).catch(()=>{fim=true;info();if(DEV)mp.insertAdjacentHTML('beforeend','<p class="reg">[dev] Contornos indisponíveis: rode analysis/preparar_mapa.py.</p>')})}
