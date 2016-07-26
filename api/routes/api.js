var express = require('express'),
	stardog = require('stardog'),
	router = express.Router();

var conn = new stardog.Connection();

conn.setEndpoint("http://dev.nemo.inf.ufes.br:5820");
conn.setCredentials("admin", "admin");
// conn.setReasoning(true);

router.get('/credores/num-empenhos', function(req, res) {
	var limit = req.query['limit'],
		offset = req.query['offset']
		query = 'SELECT ?nome ?codigo (count(?empenho) as ?nEmpenhos) WHERE {'
		  + ' ?empenho a loa:Empenho ;'
		  + ' 	loa:favorece ?credor .'
		  + ' ?credor rdfs:label ?nome ;'
		  + ' 	loa:codigo ?codigo .'
		  + ' }'
		  + ' GROUP BY ?nome ?codigo'
		  + ' ORDER BY DESC(?nEmpenhos)';

	if(limit) {
		query += ' LIMIT ' + limit;
	}

	if(offset) {
		query += ' OFFSET ' + offset;
	}

	executeQuery(query, function (data) {
        res.send(data);
	});
});

router.get('/credor/:codigo', function(req, res) {
	var codigo = req.params.codigo,
		query =   ' SELECT ?nome (count(?empenho) as ?nEmpenhos) (SUM(xsd:double(?valorEmpTotal)) as ?sumValorEmpTotal) (count(?pagamento) as ?nPagamentos) (SUM(xsd:double(?valorPagTotal)) as ?sumValorPagTotal) WHERE {{'
				+ '  ?credor rdfs:label ?nome ;'
				+ '  		  loa:codigo "' + codigo + '" .'
				+ '  ?empenho a loa:Empenho ;'
				+ '       loa:valorTotal ?valorEmpTotal ;'
				+ '       loa:favorece ?credor .'
				+ ' }'
				+ ' UNION'
				+ ' {'
				+ '  ?credor rdfs:label ?nome ;'
				+ '  		  loa:codigo "' + codigo + '" .'
				+ '  ?pagamento a loa:Pagamento ;'
				+ '       loa:valorTotal ?valorPagTotal ;'
				+ '       loa:favorece ?credor .'
				+ ' }}'
				+ ' GROUP BY ?nome';

	executeQuery(query, function (data) {
        res.send(data);
	});
});

// router.get('/:classifier/:id', function(req, res) {
// 	var classifier = req.params.classifier,
// 		id = req.params.id,
//
// 	executeQuery(query, function (data) {
//         res.send(data);
// 	});
// });


function executeQuery(query, callback) {

	console.log(query);

	conn.query({
    	database: "dpf",
    	query: query,
    	//'query.timeout': '20m'
	}, callback);
}

module.exports = router;
