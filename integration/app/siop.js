var sparql = require('sparql'),
    fs = require('fs'),
    siop = new sparql.Client('http://www1.siop.planejamento.gov.br/sparql/');

// UFES : <http://orcamento.dados.gov.br/id/2016/UnidadeOrcamentaria/26234>

var prefix = {
    loa: 'http://vocab.e.gov.br/2013/09/loa#',
    itemDespesa: 'http://orcamento.dados.gov.br/id/2016/ItemDespesa/',
    exercicio: 'http://orcamento.dados.gov.br/id/2016/Exercicio/'
}

var query = 'SELECT * WHERE {'
            + ' ?itemDespesa loa:temUnidadeOrcamentaria <http://orcamento.dados.gov.br/id/2016/UnidadeOrcamentaria/26234> ;'
            + '   ?predicado ?objeto .'
            + ' OPTIONAL { '
            + '   ?objeto rdf:type ?tipoObjeto ;'
            + '   rdfs:label ?rotulo ;'
            + '   loa:codigo ?codigo .'
            + ' } }';

module.exports = {

    generateSIOPFile: function() {

        siop.query(query, function(err, res) {
            if(err) {
                console.log(err);
            }
            else {
                var data = res.results.bindings,
                    items = {},
                    itemDespesa,
                    predicado,
                    objeto,
                    tipoObjeto,
                    rotulo,
                    codigo;

                for(var i = 0, len = data.length; i < len; i++) {

                    itemDespesa = data[i].itemDespesa.value;
                    predicado = data[i].predicado.value.replace(prefix.loa, '');
                    objeto = data[i].objeto;

                    index = itemDespesa.replace(prefix.itemDespesa, '');

                    if(!items[index]) {
                        items[index] = {
                            uri: itemDespesa,
                            codigo: index,
                            propriedades: []
                        }
                    }

                    if(objeto.type === 'uri' && data[i].rotulo && data[i].codigo) {
                        // tipoObjeto = data[i].tipoObjeto.value.replace(prefix.loa, '');
                        rotulo = data[i].rotulo.value;
                        codigo = data[i].codigo.value;

                        items[index].propriedades.push({
                            predicado: predicado,
                            rotulo: rotulo,
                            codigo: codigo
                        });
                    }
                    else if(predicado !== 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type') {

                        if(predicado === 'temExercicio') {
                            items[index][predicado] = objeto.value.replace(prefix.exercicio, '');
                        }
                        else {
                            items[index][predicado] = objeto.value;
                        }
                    }
                }

                fs.writeFile('output/siop.json', JSON.stringify(items), function (err) {
                    if (err) return console.log(err);
                    else {
                        console.log('Arquivo gerado com sucesso!');
                    }
                });
            }
        });
    }
}
