# Análise de dados (Python, fora do site)
Fluxo: dados.csv → analisar_dados.py (pandas + matplotlib) → data/graficos.json + assets/charts/*.svg → site.
O navegador só lê os resultados. Nada de Python roda no site.
1. Para cada indicador novo, acrescente linhas em dados.csv (valor, unidade, período, fonte, url) e deixe status=bruta.
2. Confira na fonte original; só então mude para status=verificado (todas as linhas do gráfico, com período preenchido).
3. Rode: pip install pandas matplotlib && python analysis/analisar_dados.py
Gráficos com qualquer linha não verificada recebem a marca "RASCUNHO" e só aparecem no site com ?dev.
Mapa: python analysis/preparar_mapa.py <ne_50m_admin_0_countries.geojson> (opcional, gera os contornos).
