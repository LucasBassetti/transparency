config = {}

config.query = {
    periodoInicio: '01/01/2016',    // Período Inicial
    periodoFim: '31/01/2016',       // Período Final (Limite 1 mês para o inicial)
    fase: 'PAG',                    // EMP, LIQ e PAG
    codigoOS: '26000',              // Código Órgão Superior
    codigoOrgao: '26234',           // Código Órgão
    codigoUG: 'TOD',                // Código Unidade Gestora
    codigoED: 'TOD',                // Código Elemento Despesa
    codigoFavorecido: '',           // Código Favorecido
    numeroDePaginas: 1,             // Número de Páginas
    offset: 25,                      // Offset
}

config.query.arquivoSaida = 'files/pagamentos/pagUFES_Jan2016_' + config.query.offset + '.json'  // ArquivoSaida

module.exports = config;
