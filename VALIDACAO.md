# Pesquisa bruta x conteudo publicado
- Itens com "status":"publicado" em data/conteudo.json aparecem no site. Os demais ficam em "bruta" e so aparecem com ?dev.
- Antes da feira: confira cada dado "publicado" na fonte original, preencha ano/acesso em data/fontes.json e, para cada item de "bruta" confirmado, converta em objeto com valor, unidade, periodo, definicao, fonte e status "publicado".
- Economia e Genero estao sem numeros publicados ate essa conferencia (principalmente: tipo de crescimento do PIB e periodo de cada valor).
- Mapa (data/mapa.json): textos qualitativos, sem números; confira com IPCC e fontes nacionais antes da feira. Coordenadas são aproximadas.
- Graficos: so aparecem no site quando todas as linhas de analysis/dados.csv estao com status=verificado e periodo preenchido (veja analysis/README.md).
