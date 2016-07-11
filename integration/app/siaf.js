var stardog = require('stardog'),
    fs = require('fs'),
    mapping = require('./mapping'),
    siaf = new stardog.Connection();

siaf.setEndpoint("http://dev.nemo.inf.ufes.br:5820");
siaf.setCredentials("admin", "admin");

module.exports = {

    matchSIOPFile: function() {

        var data = JSON.parse(fs.readFileSync('output/siop.json', 'utf8')),
            queries = [],
            query, item, prop, element, classe;

        for(var key in data) {
            item = data[key];
            query = 'select ?empenho where {'
            + ' ?empenho loa:compostoDe ?item .';

            for(var i = 0, len = item.propriedades.length; i < len; i++) {
                prop = item.propriedades[i];

                if(mapping[prop.predicado]) {

                    element = mapping[prop.predicado];

                    if(prop.predicado === 'temEsfera') {
                        prop.codigo = prop.codigo.substring(0, 1);
                    }
                    if(prop.predicado === 'temFonteRecursos') {
                        prop.codigo = prop.codigo.substring(1, 3);
                    }

                    if(element.type === 'relation') {
                        query += ' ?empenho ' + element.value + '/loa:codigo \"' + prop.codigo + '\" .';
                    }
                    else {
                        query += ' ?item rdf:type/loa:codigo \"' + prop.codigo + '\" .';
                    }
                }
            }

            query += '}';

            if(queries.indexOf(query) < 0) {
                queries.push(query);
                // console.log(query);
            }
        }

        console.log(queries.length);

        // for(var i = 0, len = queries.length; i < len; i++) {
        //
        //     (function(index) {
        //         setTimeout(function() {
        //             siaf.query({
        //                     database: "dpf",
        //                     query: queries[index],
        //                     // limit: 10,
        //                     // offset: 0
        //                 }, function (data) {
        //                     if(data.results && data.results.bindings) {
        //                         if(data.results.bindings.length > 0) {
        //                             console.log(data.results.bindings.length);
        //                             // console.log(queries[index]);
        //                         }
        //
        //                     }
        //             });
        //         }, 100);
        //     })(i);
        // }
    }
}
