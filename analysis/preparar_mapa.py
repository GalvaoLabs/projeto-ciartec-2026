"""Gera assets/geo/oceania.geojson (contornos locais do mapa) a partir do world-atlas.
Fonte: Natural Earth (domínio público) distribuída no pacote npm world-atlas (licença ISC).
Rode UMA vez, com internet, e publique o arquivo gerado junto com o site:
  python analysis/preparar_mapa.py            (usa a versão 50m, inclui as ilhas pequenas)
O site então não depende de nenhum serviço externo para desenhar o mapa."""
import json, sys, urllib.request
from pathlib import Path
URL = "https://cdn.jsdelivr.net/npm/world-atlas@2.0.2/countries-50m.json"
DADOS = Path(__file__).parent.parent / "data/mapa.json"

def decode(topo, locais):
    sc, tr = topo["transform"]["scale"], topo["transform"]["translate"]
    arcos = []
    for a in topo["arcs"]:
        x = y = 0; pts = []
        for dx, dy in a:
            x += dx; y += dy; pts.append([x * sc[0] + tr[0], y * sc[1] + tr[1]])
        arcos.append(pts)
    def anel(ix):
        pts = []
        for i in ix:
            a = arcos[i] if i >= 0 else arcos[~i][::-1]
            pts += a[1:] if pts else a
        return [[round(lon + 360 if lon < 0 else lon, 2), round(lat, 2)] for lon, lat in pts]  # longitudes negativas +360: o Pacífico não é cortado na linha de data
    itens = []
    for g in topo["objects"]["countries"]["geometries"]:
        iso = str(g.get("id")).zfill(3); nome = (g.get("properties") or {}).get("name", "")
        if any(l["iso"] == iso or l["en"].lower() == nome.lower() for l in locais):
            polis = [g["arcs"]] if g["type"] == "Polygon" else g["arcs"]
            itens.append((iso, nome, [[anel(r) for r in poli] for poli in polis]))
    feats = []  # casa pelo NOME; sem nome igual usa o código. Territórios repetem o ISO do país-mãe (ex.: Ashmore e Cartier = 036).
    pts = lambda i: sum(len(r) for po in i[2] for r in po)
    for l in locais:
        c = [i for i in itens if i[1].lower() == l["en"].lower()] or [i for i in itens if i[0] == l["iso"]]
        if c:
            melhor = max(c, key=pts)
            feats.append({"type": "Feature", "properties": {"iso": l["iso"], "name": l["en"]}, "geometry": {"type": "MultiPolygon", "coordinates": melhor[2]}})
    return {"type": "FeatureCollection", "features": feats}

if __name__ == "__main__":
    locais = json.loads(DADOS.read_text(encoding="utf-8"))["locais"]; ids = {l["iso"] for l in locais}
    topo = json.load(urllib.request.urlopen(URL))
    fc = decode(topo, locais)
    achados = {f["properties"]["iso"] for f in fc["features"]}
    print("sem contorno no conjunto de dados:", sorted(ids - achados) or "nenhum")
    out = Path(__file__).parent.parent / "assets/geo/oceania.geojson"
    out.parent.mkdir(parents=True, exist_ok=True); out.write_text(json.dumps(fc, separators=(",", ":")), encoding="utf-8")
    print(len(achados), "países ->", out, f"({out.stat().st_size // 1024} KB)")
