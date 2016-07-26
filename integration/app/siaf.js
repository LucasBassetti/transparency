var stardog = require('stardog'),
    fs = require('fs'),
    mapping = require('./mapping'),
    siaf = new stardog.Connection();

siaf.setEndpoint("http://dev.nemo.inf.ufes.br:5820");
siaf.setCredentials("admin", "admin");

module.exports = {

    matchSIOPFile: function() {

        var data = JSON.parse(fs.readFileSync('output/siop.json', 'utf8')),
            itemLoaPrefix = 'http://localhost:3000/loa/item-loa/',
            comment,
            commentTemplate = "http://www1.siop.planejamento.gov.br/sparql/?default-graph-uri=&query=SELECT+*+WHERE+%7B%0D%0A+++%3Chttp%3A%2F%2Forcamento.dados.gov.br%2Fid%2F2016%2FItemDespesa%2F{{CodigoItem}}%3E+%3Fp+%3Fo+.%0D%0A+++OPTIONAL+%7B+%3Fo+rdfs%3Alabel+%3Flabel+%7D%0D%0A%7D&format=text%2Fhtml&timeout=0&debug=on",
            queries = [],
            query, item, prop, element, classe;

        for(var key in data) {

            item = data[key];

            if(_isItemLOA(item)) {

                comment = commentTemplate.replace('{{CodigoItem}}', item.codigo);

                query = 'insert {'
                + ' ?itemLoa owl:sameAs <' + item.uri + '> .'
                + ' ?itemLoa rdfs:comment "' + comment + '" .'
                + ' } where { ';

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
                            query += ' ?itemLoa ' + element.value + '/loa:codigo \"' + prop.codigo + '\" .';
                        }
                        // else {
                        //     query += ' ?item rdf:type/loa:codigo \"' + prop.codigo + '\" .';
                        // }
                    }
                }

                query += '}';

                queries.push(query);
            }
        }

        for(var i = 0, len = queries.length; i < len; i++) {

            (function(index) {
                setTimeout(function() {
                    siaf.query({
                            database: "dpf",
                            query: queries[index],
                        }, function (data) {
                            console.log(data);
                    });
                }, 100);
            })(i);
        }

        function _isItemLOA(item) {

            var prop, isItemLOA = false;

            if(item.valorLeiMaisCredito !== '0' || item.valorDotacaoInicial !== '0' || item.valorProjetoLei !== '0') {
                for(var i = 0, len = item.propriedades.length; i < len; i++) {
                    prop = item.propriedades[i];

                    if(prop.predicado === 'temElementoDespesa' && prop.codigo === '00') {
                        isItemLOA = true;
                    }
                }
            }

            return isItemLOA;
        }
    }
}
