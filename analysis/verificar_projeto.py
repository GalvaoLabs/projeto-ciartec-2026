"""Checagem antes de publicar. Uso: python analysis/verificar_projeto.py
Verifica JSON, quiz, caminhos relativos, gráficos, marcadores internos e servidor HTTP local."""
import json, re, sys, threading, urllib.request, functools
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from pathlib import Path
R = Path(__file__).parent.parent; erros, avisos = [], []
def le(p):
    try: return json.loads((R / p).read_text(encoding="utf-8"))
    except Exception as e: erros.append(f"{p}: JSON inválido ({e})"); return None
C, Q, F, M, G = (le(f"data/{n}.json") for n in ["conteudo", "quiz", "fontes", "mapa", "graficos"])
if Q:
    if len(Q) < 5: erros.append(f"quiz tem {len(Q)} questões (mínimo 5)")
    for i, q in enumerate(Q, 1):
        if not (q.get("q") and q.get("e") and len(q.get("o", [])) >= 2 and 0 <= q.get("c", -1) < len(q["o"])): erros.append(f"quiz {i}: estrutura inválida")
html = (R / "index.html").read_text(encoding="utf-8")
for ref in re.findall(r'(?:href|src)="([^"]+)"', html):
    if ref.startswith(("http", "#")): continue
    if ref.startswith("/"): erros.append(f"caminho absoluto: {ref}")
    elif not (R / ref).exists(): erros.append(f"arquivo ausente: {ref}")
for p in re.findall(r"fetch\('([^']+)'", "".join(f.read_text(encoding="utf-8") for f in (R / "js").glob("*.js"))):
    if p.startswith("/"): erros.append(f"fetch absoluto: {p}")
    elif not (R / p).exists(): avisos.append(f"opcional ausente: {p}")
if C:
    for k, m in C["imagens"].items():
        if not (R / m["src"]).exists(): avisos.append(f"foto pendente: {m['src']}")
        elif not (m["credit"] and m["source"] and m["alt"]): erros.append(f"foto {k}: falta credit/source/alt")
    def varre(o, cam=""):
        if isinstance(o, dict):
            if o.get("status") == "pendente": return
            for k, v in o.items():
                if k not in ("bruta", "need"): varre(v, cam + "/" + k)
        elif isinstance(o, list):
            for i, v in enumerate(o): varre(v, f"{cam}[{i}]")
        elif isinstance(o, str) and re.search(r"\[(verificar|conferir|levantar|PESQUISAR|detalhar)", o, re.I): erros.append(f"marcador interno publicado em {cam}")
    varre({k: v for k, v in C.items() if k != "imagens"})
for g in G or []:
    if not (R / g["arquivo"]).exists(): erros.append(f"gráfico ausente: {g['arquivo']}")
    if g["status"] == "publicado" and (g["periodo"] == "a definir" or not g["fonte"]): erros.append(f"gráfico {g['id']} publicado sem período/fonte")
for f in F or []:
    if not f["url"].startswith("http"): erros.append(f"fonte sem URL: {f['instituicao']}")
    if not f.get("acesso"): avisos.append(f"fonte sem data de acesso: {f['instituicao']}")
for f in [*R.glob("js/*.js"), *R.glob("css/*.css"), R / "index.html", *R.glob("data/*.json")]:
    if re.search(r"leaflet|cartocdn|api[_-]?key|apikey|ukrain", f.read_text(encoding="utf-8"), re.I): erros.append(f"{f.name}: referência a Leaflet/CARTO/chave de API")
if M:
    reg = {r["id"] for r in M["regioes"]}; isos = [p["iso"] for p in M["locais"]]
    if len(reg) != 4: erros.append("mapa: devem existir 4 regiões")
    if len(set(isos)) != len(isos) or any(p["regiao"] not in reg for p in M["locais"]): erros.append("mapa: iso duplicado ou região inválida")
    for r in reg:
        if not any(p["regiao"] == r for p in M["locais"]): erros.append(f"mapa: região sem países: {r}")
srv = ThreadingHTTPServer(("127.0.0.1", 0), functools.partial(SimpleHTTPRequestHandler, directory=str(R)))
threading.Thread(target=srv.serve_forever, daemon=True).start()
for u in ["", "css/style.css", "js/app.js", "js/quiz.js", "js/mapa.js", "js/sim.js"] + [f"data/{n}.json" for n in ["conteudo", "quiz", "fontes", "mapa", "graficos"]]:
    try: urllib.request.urlopen(f"http://127.0.0.1:{srv.server_port}/{u}")
    except Exception as e: erros.append(f"HTTP falhou: /{u} ({e})")
srv.shutdown()
print("AVISOS:", *avisos, sep="\n  ") if avisos else print("sem avisos")
print("ERROS:", *erros, sep="\n  ") if erros else print("OK: sem erros")
sys.exit(1 if erros else 0)
