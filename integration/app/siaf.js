var stardog = require('stardog'),
    fs = require('fs'),
    mapping = require('./mapping'),
    siaf = new stardog.Connection();

siaf.setEndpoint("http://dev.nemo.inf.ufes.br:5820");
siaf.setCredentials("admin", "admin");

module.exports = {

    matchSIOPFile: function() {

        var enteFederativoURI = '<http://ontology.com.br/odp/resource/ente-federativo/uniao>';
        var loaURI = '<http://ontology.com.br/odp/resource/loa/2016>';

        var data = JSON.parse(fs.readFileSync('output/siop.json', 'utf8')),
            comment,
            commentTemplate = "http://www1.siop.planejamento.gov.br/sparql/?default-graph-uri=&query=SELECT+*+WHERE+%7B%0D%0A+++%3Chttp%3A%2F%2Forcamento.dados.gov.br%2Fid%2F2016%2FItemDespesa%2F{{CodigoItem}}%3E+%3Fp+%3Fo+.%0D%0A+++OPTIONAL+%7B+%3Fo+rdfs%3Alabel+%3Flabel+%7D%0D%0A%7D&format=text%2Fhtml&timeout=0&debug=on",
            queries = [],
            query, insertClause, whereClause, item, prop, element, classe;

        var initialQuery = 'INSERT { '
          + enteFederativoURI + ' rdf:type odp:EnteFederativo . '
          + enteFederativoURI + ' rdfs:label "União" . '
          + loaURI + ' rdf:type odp:LeiOrcamentariaAnual . '
          + loaURI + ' rdfs:label "LOA 2016" . '
          + loaURI + ' odp:anoExercicio "2016" . '
          + enteFederativoURI + ' odp:cria ' + loaURI + ' . '
          + '} WHERE {}';

        queries.push(initialQuery);

        for(var key in data) {

            item = data[key];

            if(_isAutorizacaoDespesa(item)) {

                comment = commentTemplate.replace('{{CodigoItem}}', item.codigo),

                insertClause = ' ?autorizacaoDespesa owl:sameAs <' + item.uri + '> .'
                             + ' ?autorizacaoDespesa rdfs:comment "' + comment + '" .'
                             + ' ?autorizacaoDespesa odp:valorLeiMaisCredito "' + item.valorLeiMaisCredito + '" .'
                             + ' ?autorizacaoDespesa odp:valorDotacaoInicial "' + item.valorDotacaoInicial + '" .'
                             + ' ?autorizacaoDespesa odp:valorProjetoLei "' + item.valorProjetoLei + '" .'
                             + ' ' + enteFederativoURI + ' odp:concede ?autorizacaoDespesa .'
                             + ' ' + loaURI + ' odp:descreve ?autorizacaoDespesa .',

                whereClause = "";

                for(var i = 0, len = item.propriedades.length; i < len; i++) {
                    prop = item.propriedades[i];

                    if(mapping[prop.predicado] && prop.predicado !== 'temElementoDespesa') {

                        element = mapping[prop.predicado];

                        if(prop.predicado === 'temEsfera') {
                            prop.codigo = prop.codigo.substring(0, 1);
                        }
                        if(prop.predicado === 'temFonteRecursos') {
                            prop.codigo = prop.codigo.substring(1, 3);
                        }

                        if(element.type === 'relation') {
                            whereClause += ' ?autorizacaoDespesa ' + element.value + '/odp:codigo \"' + prop.codigo + '\" .';
                        }
                        // else {
                        //     query += ' ?item rdf:type/odp:codigo \"' + prop.codigo + '\" .';
                        // }
                    }
                }

                query = 'insert {'
                + insertClause
                + ' } where { '
                + whereClause
                + ' }';

                queries.push(query);
            }
        }

        runQueries(queries);

        function runQueries(queries) {

            if(queries.length > 0) {
                siaf.query({
                        database: "odp",
                        query: queries[0],
                    }, function (data) {
                        if(data.boolean) {
                            console.log('Triplas inseridas. Faltam: ' + queries.length);
                        }
                        queries.splice(0, 1);
                        setTimeout(function() {
                            runQueries(queries);
                        }, 1000);
                });
            }
            else {
                return false;
            }
        }

        function _isAutorizacaoDespesa(item) {

            var prop, isAutorizacaoDespesa = false;

            if(item.valorLeiMaisCredito !== '0' || item.valorDotacaoInicial !== '0' || item.valorProjetoLei !== '0') {

                for(var i = 0, len = item.propriedades.length; i < len; i++) {
                    prop = item.propriedades[i];

                    if(prop.predicado === 'temElementoDespesa' && prop.codigo === '00') {
                        isAutorizacaoDespesa = true;
                    }
                }
            }

            return isAutorizacaoDespesa;
        }
    }
}
