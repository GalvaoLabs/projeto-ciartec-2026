"""Lê dados.csv, valida, calcula diferenças e gera gráficos SVG + data/graficos.json.
Um gráfico só é 'publicado' se TODAS as linhas tiverem status 'verificado', período e fonte.
Uso: python analysis/analisar_dados.py   (requer pandas e matplotlib)"""
import json
from pathlib import Path
import pandas as pd, matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt

AQUI = Path(__file__).parent; RAIZ = AQUI.parent
TX, MUT, DESTAQUE, REF = "#e6eeee", "#9db3b6", "#E8A838", "#6f8f95"
plt.rcParams.update({"svg.fonttype": "none", "font.family": "DejaVu Sans", "text.color": TX,
    "axes.labelcolor": TX, "xtick.color": TX, "ytick.color": MUT, "axes.edgecolor": MUT})
df = pd.read_csv(AQUI / "dados.csv")

def valido(g):
    return bool(g.status.eq("verificado").all() and g.periodo.notna().all() and g.fonte.notna().all())

def grafico(gid, dim, ind, titulo, pergunta, destaque, explica):
    g = df[df.indicador == ind]
    tab = g.pivot(index="subgrupo", columns="grupo", values="valor")
    ok = valido(g)
    fig, ax = plt.subplots(figsize=(6.4, 3.6), dpi=100)
    tab.plot.bar(ax=ax, color=[DESTAQUE if c == destaque else REF for c in tab.columns], width=.7, rot=0)
    ax.set_xlabel(""); ax.set_ylabel(g.unidade.iloc[0]); ax.legend(frameon=False, labelcolor=TX)
    for c in ax.containers: ax.bar_label(c, fmt="%g", color=TX, padding=3, fontsize=9)
    ax.spines[["top", "right"]].set_visible(False); ax.set_ylim(0, tab.values.max() * 1.15)
    if not ok:
        fig.text(.5, .5, "RASCUNHO · NÃO VERIFICADO", rotation=20, ha="center", va="center", fontsize=22, alpha=.18, color=TX)
    fig.tight_layout(); fig.savefig(RAIZ / "assets/charts" / f"{gid}.svg", transparent=True); plt.close(fig)
    per = ", ".join(sorted(g.periodo.dropna().astype(str).unique())) or "a definir"
    return dict(id=gid, dimensao=dim, titulo=titulo, pergunta=pergunta, unidade=g.unidade.iloc[0], periodo=per,
        fonte=", ".join(sorted(g.fonte.dropna().unique())), explicacao=explica(tab), arquivo=f"assets/charts/{gid}.svg",
        alt=f"Gráfico de barras: {titulo}", status="publicado" if ok else "bruta")

def vida(t):
    d = (t["Média nacional"] - t["Māori"]).round(1)
    return f"A média nacional não representa todos os grupos: a expectativa de vida Māori é {d['Homens']} anos menor para homens e {d['Mulheres']} anos menor para mulheres."
def salario(t):
    r = (t["Mulheres"] / t["Homens"] * 100).round(1).iloc[0]
    return f"O salário semanal mediano das mulheres equivale a {r}% do dos homens (mediana semanal, que difere da diferença por hora)."

saida = [
 grafico("expectativa-vida", "sociedade", "expectativa_vida", "Expectativa de vida: Māori e média nacional",
         "A média nacional representa igualmente todos os grupos?", "Māori", vida),
 grafico("salario-semanal", "genero", "salario_semanal_mediano", "Salário semanal mediano por gênero",
         "Homens e mulheres recebem o mesmo?", "Mulheres", salario)]
(RAIZ / "data/graficos.json").write_text(json.dumps(saida, ensure_ascii=False, indent=1), encoding="utf-8")
print(pd.DataFrame(saida)[["id", "periodo", "status"]])
