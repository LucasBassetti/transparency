var express = require('express'),
	stardog = require('stardog'),
	router = express.Router();

var conn = new stardog.Connection(),
	base_uri = "http://localhost:3000/loa/";

conn.setEndpoint("http://localhost:5820");
conn.setCredentials("admin", "admin");
// conn.setReasoning(true);

router.get('/etapa/:stage', function(req, res) {
	var stage = req.params.stage, // empenhos, liquidacoes e pagamentos
		classifier = req.query['classifier'],
		year = req.query['year'],
		limit = req.query['limit'],
		offset = req.query['offset']

		// get stage value
		stageValue = (function() {
			switch(stage) {
				case 'empenho':
					return 'loa:Empenho';
				case 'liquidacao':
					return 'loa:Liquidacao';
				case 'pagamento':
					return 'loa:Pagamento';
				default:
					return false;
			}
		})(),

		// get classifier value
		classifierValue = (function() {
			switch(classifier) {
				case 'programa':
					return 'loa:Programa';
				case 'acao':
					return 'loa:Acao';
				case 'funcao':
					return 'loa:Funcao';
				case 'subfuncao':
					return 'loa:Subfuncao';
				case 'subtitulo':
					return 'loa:Subtitulo';
				case 'fonte-recurso':
					return 'loa:FonteRecurso';
				default:
					return false;
			}
		})(),

		query = "";

	// add object var (?o) if has classifier
	if(classifier) {
		query = "select ?s ?o ?valorTotal ?nome ";
	}
	else {
		query = "select ?s ?valorTotal ?nome ";
	}

	if(!stageValue) {
		var result = {"head":{"vars":[]},"results":{"bindings":[{}]}};
		res.send(result);
		return false;
	}

	// start query
	query += "where { ?s a " + stageValue + " . ?s loa:valorTotal ?valorTotal . ";

	// add year
	if(year) {
		query += "?s time:year " + year + " . ";
	}

	// add classifier
	if(classifier) {
		query += "?s loa:valorTotal ?valorTotal . " +
				  "?s ?p ?o . " +
				  "?o a " + classifierValue +  " . " +
				  "OPTIONAL { ?o rdfs:label ?nome } . ";
	}

	query += "}";

	// add limit
	if(limit) {
		query += ' LIMIT ' + limit;
	}

	// add offset
	if(offset) {
		query += ' OFFSET ' + offset;
	}

	executeQuery(query, function (data) {
        res.send(data);
	});
});

router.get('/:classifier/:id', function(req, res) {
	var classifier = req.params.classifier,
		id = req.params.id,
		uri = "<" + base_uri + classifier + "/" + id + ">",
		query = createNormalQuery(uri, req);

	executeQuery(query, function (data) {
        res.send(data);
	});
});

router.get('/:classifier/:year/:id', function(req, res) {
	var classifier = req.params.classifier,
		year = req.params.year,
		id = req.params.id,
		uri = "<" + base_uri + classifier + "/" + year + "/" + id + ">",
		query = createNormalQuery(uri, req);

	executeQuery(query, function (data) {
        res.send(data);
	});
});

router.get('/:stage/:year/:pid/:id', function(req, res) {
	var stage = req.params.stage,
		year = req.params.year,
		pid = req.params.pid,
		id = req.params.id,
		uri = "<" + base_uri + stage + "/" + year + "/" + pid + "/" + id + ">",
		query = createNormalQuery(uri, req);

	executeQuery(query, function (data) {
        res.send(data);
	});
});

function createNormalQuery(uri, req) {

	var only = req.query['only'],
		limit = req.query['limit'],
		offset = req.query['offset'],
		query = "";

	if(only === "subject") {
		query = "SELECT ?s ?label ?comment " +
					"WHERE { " +
						"?s ?p " + uri + " . " +
						"OPTIONAL { ?s rdfs:label ?label } . " +
						"OPTIONAL { ?s rdfs:comment ?comment } . " +
					"} ";
	}
	else if(only === "object") {
		query = "SELECT ?o ?label ?comment " +
					"WHERE { " +
						uri + " ?p ?o . " +
						"OPTIONAL { ?o rdfs:label ?label } . " +
						"OPTIONAL { ?o rdfs:comment ?comment } . " +
					"} ";
	}
	else {
		query = "SELECT ?s ?p ?o ?label ?comment " +
					"WHERE { " +
					 "{ " +
						uri + " ?p ?o . " +
						"OPTIONAL { ?o rdfs:label ?label } . " +
						"OPTIONAL { ?o rdfs:comment ?comment } . " +
					  "} " +
					  "UNION { " +
						  "?s ?p " + uri + " . " +
						  "OPTIONAL { ?s rdfs:label ?label } . " +
						  "OPTIONAL { ?s rdfs:comment ?comment } . " +
					  "} " +
					"} ";
	}

	// add limit
	if(limit) {
		query += ' LIMIT ' + limit;
	}

	// add offset
	if(offset) {
		query += ' OFFSET ' + offset;
	}

	return query;
}

function executeQuery(query, callback) {

	console.log(query);

	conn.query({
    	database: "dpes",
    	query: query,
    	//'query.timeout': '20m'
	}, callback);
}

module.exports = router;
