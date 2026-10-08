# CIARTEC 2026 — Oceanic Clarity

## Sobre o projeto
Experiência digital educativa sobre a **Oceania, com foco na Nova Zelândia**, que parte de uma pergunta: *se o clima muda para todos, por que os impactos não são iguais?* O visitante abre o site pelo QR Code do estande e percorre: Oceania → Nova Zelândia → Clima → Desigualdade → Soluções → Quiz → Fontes.

## Tecnologias
HTML5, CSS3 e JavaScript puro, com conteúdo em JSON. Sem backend, banco de dados ou framework. O mapa da Oceania é SVG puro, sem biblioteca e **sem chave de API**: os contornos vêm de dados do Natural Earth (domínio público). Depois de gerar e enviar o `assets/geo/oceania.geojson` ao GitHub, o mapa não depende de nenhum serviço externo. Python (Pandas e Matplotlib) é usado **apenas para analisar dados**; nada de Python roda no site.

## Estrutura
```
index.html        css/style.css
js/  app.js (navegação e telas) · quiz.js (quiz) · mapa.js (mapa) · sim.js (simulação da tempestade)
data/  conteudo.json · quiz.json · fontes.json · mapa.json · graficos.json
analysis/  dados.csv · analisar_dados.py · preparar_mapa.py · verificar_projeto.py
assets/  images/ (fotos .webp) · charts/ (SVG gerados) · geo/oceania.geojson (contornos do mapa, gerado)
```

## Fluxo de desenvolvimento
```
Pesquisa → Fontes confiáveis → Dados brutos (analysis/dados.csv)
→ Python + Pandas → Análise → Matplotlib (assets/charts)
→ Dados verificados → JSON (data/) → Frontend
→ Teste local → GitHub → Cloudflare Pages
```
Python analisa. JSON transporta. JavaScript interage. HTML/CSS apresentam.

## Como executar localmente
O site carrega arquivos JSON com `fetch()`, e o navegador **não permite isso abrindo o `index.html` com duplo clique** (`file://`). É preciso um servidor local.
1. **Abrir o terminal na pasta do projeto.** Windows: abra a pasta no Explorador, clique na barra de endereço, digite `cmd` e Enter. Mac/Linux: abra o Terminal e use `cd caminho/da/pasta`.
2. **Verificar o Python:** `python --version` (no Windows também funciona `py --version`). Se não aparecer a versão 3.x, instale em python.org (no Windows, marque "Add Python to PATH").
3. **Iniciar:** `python -m http.server 8000` (Windows: `py -m http.server 8000`). Atalho no Windows: dê duplo clique em `iniciar-servidor.bat`.
4. **Abrir:** http://localhost:8000
5. **Parar:** `Ctrl + C` no terminal.
6. **Pelo celular (mesma rede Wi-Fi):** descubra o IP do computador (`ipconfig` no Windows, `ifconfig` ou `hostname -I` no Mac/Linux) e abra `http://IP:8000` no celular. Se não abrir, libere o Python no firewall; algumas redes de escola bloqueiam a comunicação entre aparelhos.
7. **Modo de revisão:** acrescente `?dev` ao endereço (`http://localhost:8000/?dev`) para ver fotos pendentes, pesquisa bruta e gráficos em rascunho. Ele não faz parte da versão pública.
8. **Teste antes de publicar:** `python analysis/verificar_projeto.py` (JSON, quiz, caminhos, gráficos, marcadores internos e servidor HTTP). Depois, percorra o site todo no computador e no celular e faça o quiz até o fim.

## Como publicar
O projeto é um **site estático**: não há build, backend nem servidor Python em produção. Todos os caminhos são relativos (`css/`, `js/`, `data/`, `assets/`), então funcionam em qualquer hospedagem estática.

**GitHub**
1. Crie um repositório (ex.: `ciartec-oceanic-clarity`) e envie **o conteúdo desta pasta**, de modo que o `index.html` fique na **raiz** do repositório, não dentro de uma subpasta.
2. `git init` · `git add .` · `git commit -m "Versão inicial"` · `git branch -M main` · `git remote add origin URL_DO_REPOSITORIO` · `git push -u origin main`.
3. Use nomes de arquivo em minúsculas e iguais aos do JSON: o servidor distingue maiúsculas de minúsculas, o seu computador pode não distinguir.

**Cloudflare Pages**
1. No painel da Cloudflare: Workers & Pages → Create application → Pages → *Import an existing Git repository* (os nomes dos menus podem mudar) e escolha o repositório.
2. **Framework preset:** None. **Build command:** deixe em branco (a documentação também aceita `exit 0`). **Build output directory:** a pasta onde está o `index.html`; com o `index.html` na raiz, use `/`. Se aparecer "no files uploaded", tente `.`. **Root directory:** vazio. Não é necessária nenhuma variável de ambiente.
3. *Save and Deploy*. O site fica em `nome-do-projeto.pages.dev`. A cada `git push` na branch `main`, ele é publicado de novo.
4. Alternativa sem Git: *Direct Upload*, arrastando a pasta do projeto.

**Testar a versão publicada**
Abra o endereço `.pages.dev` no celular, **com rede móvel (4G)** e não só no Wi-Fi: navegue por todas as abas, abra um endereço direto (`.../#clima`), teste o botão voltar, o mapa, a simulação e o quiz até o resultado, confira as fotos e crie o QR Code a partir do endereço final.

## Mapa
Mapa em SVG com quatro regiões (Australásia, Melanésia, Micronésia e Polinésia), países selecionáveis e a Nova Zelândia em destaque. Os contornos vêm de `assets/geo/oceania.geojson`. **Antes de publicar, gere esse arquivo uma vez, com internet:** `python analysis/preparar_mapa.py`, e envie-o ao GitHub. Sem ele, o mapa tenta baixar o contorno (110m, sem as ilhas menores) do pacote público world-atlas via jsDelivr; se isso também falhar, mostra só os pontos dos países. As regiões seguem o agrupamento convencional da ONU e não têm fronteira oficial. Fonte e licença: Natural Earth (domínio público), pacote world-atlas (ISC).

## Dados e fontes
Cada dado do site tem valor, unidade, período, definição e fonte. Em `data/conteudo.json`, só itens com `"status": "publicado"` aparecem. O restante fica em `bruta` (pesquisa ainda não verificada) e só é visível com `?dev`. Para publicar um dado: confira na fonte original, registre período e definição e mude o status. As fontes ficam em `data/fontes.json` (com data de acesso). Fotos precisam de `credit`, `source` e `alt` em `imagens` (lista em `FOTOS.md`).

## Análise de dados
Python é usado para análise, não no site. **Pandas** organiza e trata os dados de `analysis/dados.csv` e calcula diferenças entre grupos; **Matplotlib** gera os gráficos em `assets/charts/` e `analisar_dados.py` escreve `data/graficos.json`. Um gráfico só é publicado quando todas as linhas estão `verificado` e com período preenchido; os resultados verificados são então lidos pelo frontend. Veja `analysis/README.md` e `VALIDACAO.md`.

## Quiz
Cinco perguntas objetivas em `data/quiz.json`, com feedback e explicação a cada resposta. A pontuação é calculada a partir das respostas e fica só na memória da página (sem `localStorage`, sem coleta de dados). O resultado (X/5, percentual e mensagem conforme o desempenho, com a lista do que revisar) aparece só depois da última resposta, e "Refazer o quiz" zera tudo.

## Autoria e desenvolvimento
**Desenvolvimento do aplicativo:** Miguel, responsável pela coordenação técnica e pela implementação do aplicativo web.
**Pesquisa e conteúdo:** equipe CIARTEC 2026, conforme as áreas indicadas em Créditos.
**Apoio de IA:** parte do código e da documentação foi produzida com apoio do assistente Claude (Anthropic).
**Projeto:** CIARTEC 2026 — Oceanic Clarity.

## Créditos
Grupo CIARTEC 2026: Isabelly Lavínia (Sociedade), Arthur e Naely (Política), Miguel (Economia), Ana Clara (Gênero), Gabriel (Educação), Gabriel e Naely (Clima). Créditos das fotos: em `data/conteudo.json`. Contornos do mapa: Natural Earth (domínio público), distribuídos no pacote world-atlas (licença ISC).

## Licença e uso
O **código-fonte** está sob a licença MIT (arquivo `LICENSE`). Os **textos e gráficos originais do grupo** podem ser reutilizados com crédito ao projeto (CC BY 4.0). **Fotografias, dados e contornos de terceiros não são cobertos** por essas licenças e mantêm as condições da fonte original, registradas em `data/conteudo.json`, `data/fontes.json` e `FOTOS.md`. Projeto desenvolvido para fins educacionais.
