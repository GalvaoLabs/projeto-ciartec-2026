/* Estado do quiz: guardado só em memória, durante a visita à página.
   Sem localStorage, sem backend: a pontuação é calculada a partir das respostas e some ao recarregar. */
const QZ={i:0,resp:[],fin:false,ord:null};
const quizReset=()=>{QZ.i=0;QZ.resp=[];QZ.fin=false;QZ.ord=null};
/* Ordem das opções: sorteada a cada tentativa e mantida até o fim dela. Perguntas com "fixo":true (números, anos) não embaralham. A resposta é sempre guardada pelo índice ORIGINAL da opção. */
function quizOrdem(Q){if(!QZ.ord||QZ.ord.length!==Q.length)QZ.ord=Q.map(q=>{const a=q.o.map((_,k)=>k);if(!q.fixo)for(let x=a.length-1;x>0;x--){const r=Math.floor(Math.random()*(x+1));[a[x],a[r]]=[a[r],a[x]]}return a});return QZ.ord}
const quizPontos=Q=>QZ.resp.reduce((s,k,i)=>s+(k===Q[i].c?1:0),0);
function quizResponder(Q,k){if(QZ.fin||QZ.resp[QZ.i]!==undefined||!(k>=0&&k<Q[QZ.i].o.length))return false;QZ.resp[QZ.i]=k;return true}
function quizAvancar(Q){if(QZ.fin||QZ.resp[QZ.i]===undefined)return false;if(QZ.i<Q.length-1)QZ.i++;else QZ.fin=true;return true}
function quizMensagem(sc,n){const p=sc/n*100;
 if(p===100)return['Excelente!','Você acertou tudo e mostrou que entendeu a ideia central: o clima muda para todos, mas os impactos dependem de quem enfrenta o evento.'];
 if(p>=80)return['Muito bom!','Você dominou quase todo o conteúdo. Vale rever o ponto que escapou.'];
 if(p>=60)return['Bom resultado.','Você entendeu a ideia central, mas ainda há pontos para revisar.'];
 if(p>=40)return['Vale revisar.','Releia as seções sobre clima e desigualdade e tente de novo.'];
 return['Volte ao conteúdo.','Recomendamos percorrer a trilha antes de refazer o quiz.']}
function renderQuiz(box,Q){const n=Q.length;
 const draw=()=>{
  if(QZ.fin){const sc=quizPontos(Q),pc=Math.round(sc/n*100),[t,m]=quizMensagem(sc,n),err=Q.filter((q,i)=>QZ.resp[i]!==q.c);
   box.innerHTML=`<h2 id="qh" tabindex="-1">Quiz concluído!</h2><p>Você acertou <b>${sc} de ${n} questões</b> (${pc}%).</p><p class="res" aria-hidden="true"><b>${sc}</b>/${n}<span>${pc}%</span></p><p class="lead">${t}</p><p>${m}</p>${err.length?`<h3>Para revisar</h3><ul class="rev">${err.map(q=>`<li>${q.q}<br><b>Resposta correta:</b> ${q.o[q.c]}</li>`).join('')}</ul>`:''}<button class="go" id="rf">Refazer o quiz</button><a class="btn o2" href="#oceania">Rever a trilha</a>`;
   box.querySelector('#rf').onclick=()=>{quizReset();draw()};box.querySelector('#qh').focus();return}
  const i=QZ.i,q=Q[i],a=QZ.resp[i],feito=a!==undefined;
  box.innerHTML=`<div class="qp" role="progressbar" aria-label="Progresso do quiz" aria-valuemin="0" aria-valuemax="${n}" aria-valuenow="${i+(feito?1:0)}"><i style="width:${(i+(feito?1:0))/n*100}%"></i></div><p class="draft">Pergunta ${i+1} de ${n}</p><p class="q">${q.q}</p>`;
  quizOrdem(Q)[i].forEach(k=>{const t=q.o[k];const b=document.createElement('button');b.className='opt'+(feito?(k===q.c?' ok':k===a?' no':''):'');b.textContent=t;b.disabled=feito;b.onclick=()=>{if(quizResponder(Q,k)){draw();const x=box.querySelector('#nx');x&&x.focus()}};box.append(b)});
  if(feito){const f=document.createElement('div');f.className='fb';f.setAttribute('role','status');f.innerHTML=`<b>${a===q.c?'Correto!':'Não foi dessa vez.'}</b> ${q.e}<br>`;
   const nx=document.createElement('button');nx.className='go';nx.id='nx';nx.textContent=i<n-1?'Próxima':'Ver resultado';nx.onclick=()=>{if(quizAvancar(Q))draw()};f.append(nx);box.append(f)}};
 draw()}
