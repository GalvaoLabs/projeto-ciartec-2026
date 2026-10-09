/* Simulação conceitual: mesma tempestade, recursos diferentes.
   Não representa dados reais de uma comunidade específica. */
const LAB = `<div class="sim" id="sim-box">
  <b>Mesma tempestade, recursos diferentes</b>
  <p class="sim-desc">Mesma tempestade, impactos diferentes. Arraste o controle ou toque em <em>Simular tempestade</em>: a casa em terreno alto e com mais recursos resiste melhor, e a de terreno baixo e com menos recursos alaga antes e demora mais para se recuperar.</p>
  <p class="draft">Simulação conceitual — não representa dados reais de uma comunidade específica.</p>
  <svg class="sv" viewBox="0 0 400 220" role="img" aria-label="Duas casas durante uma tempestade: a água sobe e atinge primeiro a casa com menos recursos">
    <rect id="sk" width="400" height="220" fill="#bfe0f0"/>
    <g id="cl" fill="#fff">
      <ellipse cx="90" cy="30" rx="60" ry="18"/>
      <ellipse cx="150" cy="24" rx="45" ry="16"/>
      <ellipse cx="270" cy="32" rx="65" ry="18"/>
      <ellipse cx="335" cy="26" rx="45" ry="15"/>
    </g>
    <path d="M180 140Q260 168 400 165V220H180Z" fill="#8a9a6a"/>
    <path d="M0 118Q110 100 200 140V220H0Z" fill="#7aa66a"/>
    <!-- Casa mais recursos (terreno mais alto) -->
    <rect x="45" y="86" width="64" height="34" fill="#f3e4c8"/>
    <path d="M38 88L77 58L116 88Z" fill="#1A7A6D"/>
    <rect x="68" y="100" width="14" height="20" fill="#5a4a3a"/>
    <!-- Casa menos recursos (terreno mais baixo) -->
    <rect x="256" y="132" width="64" height="34" fill="#f3e4c8"/>
    <path d="M249 134L288 104L327 134Z" fill="#b5533c"/>
    <rect x="279" y="146" width="14" height="20" fill="#5a4a3a"/>
    <!-- Água: grupo sobe verticalmente; onda anima horizontalmente no path -->
    <g id="wt" transform="translate(0,200)">
      <path class="wvp" d="M-100 0 Q-75 -7 -50 0 T0 0 T50 0 T100 0 T150 0 T200 0 T250 0 T300 0 T350 0 T400 0 T450 0 T500 0 V260 H-100Z" fill="#2f6b86" opacity=".82"/>
    </g>
    <text x="77" y="48" text-anchor="middle" font-size="12" font-weight="700" fill="#08243a">Mais recursos</text>
    <text x="288" y="94" text-anchor="middle" font-size="12" font-weight="700" fill="#08243a">Menos recursos</text>
    <g id="rn" class="rn"></g>
  </svg>
  <label class="sr-only" for="sl">Intensidade da tempestade</label>
  <input type="range" id="sl" min="0" max="100" value="0" aria-label="Intensidade da tempestade" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0">
  <button class="go" id="pl" type="button">▶ Simular tempestade</button>
  <div class="row"><span>Mais recursos</span><div class="m" aria-hidden="true"><i id="m1" style="background:#1A7A6D;width:95%"></i></div></div>
  <div class="row"><span>Menos recursos</span><div class="m" aria-hidden="true"><i id="m2" style="background:#E8A838;width:85%"></i></div></div>
  <div class="stt" role="status" aria-live="polite">
    <div id="sa"></div>
    <div id="sb"></div>
  </div>
</div>`;

function storm() {
  const sl = document.getElementById('sl');
  if (!sl) return;
  const g = id => document.getElementById(id);
  let animId = null; // cancela animação em andamento

  // Gera gotas de chuva cobrindo a largura do SVG
  function makeRain() {
    let r = '';
    for (let k = 0; k < 36; k++) {
      const x = 4 + k * 11 + (Math.random() * 6 - 3);
      const delay = (Math.random() * 0.8).toFixed(2);
      const dur = (0.55 + Math.random() * 0.35).toFixed(2);
      r += `<line x1="${x}" y1="0" x2="${x - 5}" y2="18" style="animation-delay:-${delay}s;animation-duration:${dur}s"/>`;
    }
    g('rn').innerHTML = r;
  }
  makeRain();

  const mx = (a, b, t) => a.map((c, i) => Math.round(c + (b[i] - c) * t));

  const update = () => {
    const v = +sl.value;
    const t = v / 100;
    sl.setAttribute('aria-valuenow', String(v));

    // Céu e nuvens escurecem
    g('sk').setAttribute('fill', 'rgb(' + mx([191, 224, 240], [55, 70, 88], t) + ')');
    g('cl').setAttribute('fill', 'rgb(' + mx([255, 255, 255], [50, 68, 85], t) + ')');

    // Chuva: opacidade e (re)ativação visual
    const rn = g('rn');
    rn.style.opacity = String(Math.min(1, t * 1.6));
    rn.style.visibility = t > 0.02 ? 'visible' : 'hidden';

    // Nível da água: sobe de y=200 até ~y=118 (atinge a casa alta)
    // Casa alta: base ~120; casa baixa: base ~166
    const waterY = 200 - v * 0.82;
    g('wt').setAttribute('transform', 'translate(0,' + waterY + ')');

    // Barras de "capacidade restante" (resiliência)
    g('m1').style.width = (95 - v * 0.22) + '%';
    g('m2').style.width = Math.max(5, 88 - v * 0.82) + '%';

    // Mensagens de status
    let msgA, msgB;
    if (v < 25) {
      msgA = 'protegida — terreno alto, estrutura e preparo.';
      msgB = 'segura por enquanto.';
    } else if (v < 50) {
      msgA = 'protegida, com planos e barreiras.';
      msgB = 'alagamento começando nas áreas mais baixas.';
    } else if (v < 75) {
      msgA = 'em alerta, mas ainda segura.';
      msgB = 'alagada — precisa de ajuda; recuperação será lenta.';
    } else {
      msgA = 'danos leves e recuperação relativamente rápida.';
      msgB = 'severamente atingida — isolamento, perda de bens e tempo longo para reconstruir.';
    }
    g('sa').innerHTML = '<b style="color:var(--teal)">Mais recursos:</b> ' + msgA;
    g('sb').innerHTML = '<b style="color:#c07a10">Menos recursos:</b> ' + msgB;
  };

  sl.oninput = () => {
    // Cancela animação automática se o usuário mexer no controle
    if (animId != null) {
      cancelAnimationFrame(animId);
      animId = null;
      const btn = g('pl');
      if (btn) {
        btn.disabled = false;
        btn.textContent = '↺ Repetir';
      }
    }
    update();
  };
  update();

  g('pl').onclick = () => {
    // Reduced motion: pula direto ao final
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
      if (animId != null) {
        cancelAnimationFrame(animId);
        animId = null;
      }
      makeRain();
      sl.value = 100;
      update();
      g('pl').textContent = '↺ Repetir';
      return;
    }

    // Cancela animação anterior
    if (animId != null) {
      cancelAnimationFrame(animId);
      animId = null;
    }

    makeRain(); // novas gotas a cada simulação
    const btn = g('pl');
    btn.disabled = true;
    btn.textContent = 'Simulando…';
    const t0 = performance.now();
    const duration = 4800;

    const frame = now => {
      const p = Math.min(1, (now - t0) / duration);
      // Ease-in-out suave
      const eased = p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;
      sl.value = Math.round(100 * eased);
      update();
      if (p < 1) {
        animId = requestAnimationFrame(frame);
      } else {
        animId = null;
        btn.disabled = false;
        btn.textContent = '↺ Repetir';
      }
    };
    animId = requestAnimationFrame(frame);
  };
}
