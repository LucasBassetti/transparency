(function() {
    "use strict";

    var fs = require('fs'),
        stardog = require('stardog');

    var conn = new stardog.Connection(),
    	base_uri = "http://ontology.com.br/odp/resource/",
        documents, doc, docNumber, docPath,
        triples = [],

        uri = {
            autorizacaoDespesa: base_uri + 'autorizacao-despesa/',

            empenho: base_uri + 'empenho/',
            itemEmpenho: base_uri + 'item-empenho/',
            liquidacao: base_uri + 'liquidacao/',
            itemLiquidacao: base_uri + 'item-liquidacao/',
            pagamento: base_uri + 'pagamento/',
            itemPagamento: base_uri + 'item-pagamento/',

            orgao: base_uri + 'orgao/',
            unidadeOrcamentaria: base_uri + 'unidade-orcamentaria/',
            unidadeGestora: base_uri + 'unidade-gestora/',
            credor: base_uri + 'credor/',

            programa: base_uri + 'programa/',
            acao: base_uri + 'acao/',
            atividade: base_uri + 'acao/atividade/',
            projeto: base_uri + 'acao/projeto/',
            operacaoEspecial: base_uri + 'acao/operacaoEspecial/',
            subtitulo: base_uri + 'subtitulo/',
            funcao: base_uri + 'funcao/',
            subfuncao: base_uri + 'subfuncao/',

            fonteRecurso: base_uri + 'fonte-recurso/',
            esfera: base_uri + 'esfera/',
            planoOrcamentario: base_uri + 'plano-orcamentario/',

            categoriaEconomica: base_uri + 'categoria-economica/',
            grupoDespesa: base_uri + 'grupo-despesa/',
            modalidadeAplicacao: base_uri + 'modalidade-aplicacao/',
            elementoDespesa: base_uri + 'elemento-despesa/',
            subelementoDespesa: base_uri + 'subelemento-despesa/'
        },

        prefix = {
            rdf: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#',
            rdfs: 'http://www.w3.org/2000/01/rdf-schema#',
            xsd: 'http://www.w3.org/2001/XMLSchema#',
            owl: 'http://www.w3.org/2002/07/owl#',
            stardog: 'tag:stardog:api:',
            time: 'http://www.w3.org/2006/time#',
            odp: 'http://ontology.com.br/odp/spec/#'
        };

    // conn.setEndpoint("http://dev.nemo.inf.ufes.br:5820/");
    conn.setEndpoint("http://dev.nemo.inf.ufes.br:5820/");
    conn.setCredentials("admin", "admin");

    var dir = './files/';

    fs.readdir(dir, function(err, files) {
        files.forEach(function(file) {
            if(file.indexOf('.json') >= 0) {
                // console.log(file);
                documents = JSON.parse(fs.readFileSync(dir + file, 'utf8'));
                triplifyData(documents);
            }
        });

        // insert data
        insertData();
    });

    // triplify documents
    function triplifyData(documents) {

        var date,
            subject,

            autorizacaoDespesaCodigo,
            autorizacaoDespesaURI,

            funcaoURI,
            subfuncaoURI,
            programaURI,
            acaoURI,
            subtituloURI,

            fonteRecursoURI,
            esferaURI,
            planoOrcamentarioURI,

            unidadeGestoraURI,
            credorURI,

            itemExecucao,
            itemEmpenhoURI,
            itemLiquidacaoURI,
            itemPagamentoURI,
            categoriaEconomicaURI,
            grupoDespesaURI,
            modalidadeAplicacaoURI,
            elementoDespesaURI,
            subelementoDespesaURI,

            docRelacionado,
            docRelacionadoURI;

        for(var i = 0, len = documents.length; i < len; i++) {

            doc = documents[i];
            date = new Date(doc.data);

            if(doc.fase === 'Empenho') { subject = uri.empenho }
            else if(doc.fase === 'Liquidação') { subject = uri.liquidacao }
            else if(doc.fase === 'Pagamento') { subject = uri.pagamento }

            // [emp, liq, pag] URI
            subject += date.getFullYear() + '/' + doc.unidadeGestora.codigo + doc.gestao.codigo + doc.documento;

            unidadeGestoraURI = uri.unidadeGestora + date.getFullYear() + '/' + doc.unidadeGestora.codigo;

            if(doc.favorecido) {
                credorURI = uri.credor + doc.favorecido.codigo.replace(/[^\w\s]/gi, '');
            }
            else {
                credorURI = "";
            }

            // [emp, liq, pag] owl:sameAs url
            addTriple({
                subject: subject,
                predicate: prefix.owl + 'sameAs',
                object: doc.url
            }, 'URI');

            /*
             EMPENHO, LIQUIDACAO E PAGAMENTO
             ================================================================ */

            // Empenho - http://localhost:3000/odp/empenho/2016/{{codigo}}
            if(doc.fase === 'Empenho') {

                autorizacaoDespesaCodigo = date.getFullYear() +
                                  doc.esfera.codigo +
                                  doc.programa.codigo +
                                  doc.acao.codigo +
                                  doc.subtitulo.codigo +
                                  doc.funcao.codigo +
                                  doc.subfuncao.codigo +
                                  doc.fonteRecurso.codigo +
                                  doc.planoOrcamentario.codigo +
                                  doc.classificacaoEconomica.codigo +
                                  doc.grupoDespesa.codigo +
                                  doc.modalidadeAplicacao.codigo;

                autorizacaoDespesaURI = uri.autorizacaoDespesa + date.getFullYear() + '/' + autorizacaoDespesaCodigo;

                funcaoURI = uri.funcao + date.getFullYear() + '/' + doc.funcao.codigo;
                subfuncaoURI = uri.subfuncao + date.getFullYear() + '/' + doc.subfuncao.codigo;
                programaURI = uri.programa + date.getFullYear() + '/' + doc.programa.codigo;
                acaoURI = uri.acao + date.getFullYear() + '/' + doc.acao.codigo;
                subtituloURI = uri.subtitulo + date.getFullYear() + '/' + doc.subtitulo.codigo;

                fonteRecursoURI = uri.fonteRecurso + date.getFullYear() + '/' + doc.fonteRecurso.codigo;
                esferaURI = uri.esfera + date.getFullYear() + '/' + doc.esfera.codigo;
                planoOrcamentarioURI = uri.planoOrcamentario + date.getFullYear() + '/' + doc.planoOrcamentario.codigo;

                categoriaEconomicaURI = uri.categoriaEconomica  + date.getFullYear() + '/' + doc.classificacaoEconomica.codigo;
                grupoDespesaURI = uri.grupoDespesa  + date.getFullYear() + '/' + doc.grupoDespesa.codigo;
                modalidadeAplicacaoURI = uri.modalidadeAplicacao  + date.getFullYear() + '/' + doc.modalidadeAplicacao.codigo;
                elementoDespesaURI = uri.elementoDespesa  + date.getFullYear() + '/' + doc.elementoDespesa.codigo;

                // uri:empenho rdf:type odp:Empenho
                addTriple({
                    subject: subject,
                    predicate: prefix.rdf + 'type', // rdf:type
                    object: prefix.odp + 'Empenho'  // odp:Empenho
                }, 'URI');

                // uri:empenho odp:refereSe odp:AutorizacaoDespesa
                addTriple({
                    subject: subject,
                    predicate: prefix.odp + 'refereSe',
                    object: autorizacaoDespesaURI
                }, 'URI');

                if(doc.especie === "Original") {
                    // uri:empenho rdf:type odp:EmpenhoOriginal
                    addTriple({
                        subject: subject,
                        predicate: prefix.rdf + "type",
                        object: prefix.odp + "EmpenhoOriginal"
                    }, 'URI');
                }
                if(doc.especie === "Anulação") {
                    // uri:empenho rdf:type odp:EmpenhoAnulacao
                    addTriple({
                        subject: subject,
                        predicate: prefix.rdf + "type",
                        object: prefix.odp + "EmpenhoAnulacao"
                    }, 'URI');
                }
                else if(doc.especie === "Reforço") {
                    // uri:empenho rdf:type odp:EmpenhoReforco
                    addTriple({
                        subject: subject,
                        predicate: prefix.rdf + "type",
                        object: prefix.odp + "EmpenhoReforco"
                    }, 'URI');
                }

                if(credorURI.length > 0) {
                    // uri:empenho odp:favorece uri:credor
                    addTriple({
                        subject: subject,
                        predicate: prefix.odp + 'favorece',
                        object: credorURI
                    }, 'URI');
                }

                /* === AUTORIZACAO DE DESPESA === */

                // uri:autorizacaoDespesa rdf:type odp:AutorizacaoDespesa
                addTriple({
                    subject: autorizacaoDespesaURI,
                    predicate: prefix.rdf + 'type',
                    object: prefix.odp + "AutorizacaoDespesa"
                }, 'URI');

                // uri:autorizacaoDespesa rdfs:label "label"
                addTriple({
                    subject: autorizacaoDespesaURI,
                    predicate: prefix.rdfs + 'label',
                    object: 'Autorização da Despesa ' + autorizacaoDespesaCodigo
                }, 'Literal');

                // uri:autorizacaoDespesa odp:prescreve uri:funcao
                addTriple({
                    subject: autorizacaoDespesaURI,
                    predicate: prefix.odp + 'prescreveFuncao',
                    object: funcaoURI
                }, 'URI');

                // uri:autorizacaoDespesa odp:prescreve uri:subfuncao
                addTriple({
                    subject: autorizacaoDespesaURI,
                    predicate: prefix.odp + 'prescreveSubfuncao',
                    object: subfuncaoURI
                }, 'URI');

                // uri:autorizacaoDespesa odp:prescreve uri:programa
                addTriple({
                    subject: autorizacaoDespesaURI,
                    predicate: prefix.odp + 'prescrevePrograma',
                    object: programaURI
                }, 'URI');

                // uri:autorizacaoDespesa odp:prescreve uri:acao
                addTriple({
                    subject: autorizacaoDespesaURI,
                    predicate: prefix.odp + 'prescreveAcao',
                    object: acaoURI
                }, 'URI');

                // uri:autorizacaoDespesa odp:prescreve uri:subtitulo
                addTriple({
                    subject: autorizacaoDespesaURI,
                    predicate: prefix.odp + 'prescreveSubtitulo',
                    object: subtituloURI
                }, 'URI');

                // uri:autorizacaoDespesa odp:prescreve uri:fonteRecurso
                addTriple({
                    subject: autorizacaoDespesaURI,
                    predicate: prefix.odp + 'prescreveFonteRecursos',
                    object: fonteRecursoURI
                }, 'URI');

                // uri:autorizacaoDespesa odp:prescreve uri:esfera
                addTriple({
                    subject: autorizacaoDespesaURI,
                    predicate: prefix.odp + 'prescreveEsfera',
                    object: esferaURI
                }, 'URI');

                // uri:autorizacaoDespesa odp:prescreve uri:planoOrcamentario
                addTriple({
                    subject: autorizacaoDespesaURI,
                    predicate: prefix.odp + 'prescrevePlanoOrcamentario',
                    object: planoOrcamentarioURI
                }, 'URI');

                // uri:autorizacaoDespesa odp:prescreve uri:categoriaEconomica
                addTriple({
                    subject: autorizacaoDespesaURI,
                    predicate: prefix.odp + 'prescreveCategoriaEconomica',
                    object: categoriaEconomicaURI
                }, 'URI');

                // uri:autorizacaoDespesa odp:prescreve uri:grupoDespesa
                addTriple({
                    subject: autorizacaoDespesaURI,
                    predicate: prefix.odp + 'prescreveGrupoDespesa',
                    object: grupoDespesaURI
                }, 'URI');

                // uri:autorizacaoDespesa odp:prescreve uri:modalidadeAplicacao
                addTriple({
                    subject: autorizacaoDespesaURI,
                    predicate: prefix.odp + 'prescreveModalidadeAplicacao',
                    object: modalidadeAplicacaoURI
                }, 'URI');

                /* === FUNCAO === */

                // uri:funcao rdf:type odp:Funcao
                addTriple({
                    subject: funcaoURI,
                    predicate: prefix.rdf + 'type',
                    object: prefix.odp + 'Funcao'
                }, 'URI');

                // uri:funcao rdfs:label "rotulo"
                addTriple({
                    subject: funcaoURI,
                    predicate: prefix.rdfs + 'label',
                    object: doc.funcao.rotulo
                }, 'Literal');

                // uri:funcao odp:codigo "codigo"
                addTriple({
                    subject: funcaoURI,
                    predicate: prefix.odp + 'codigo',
                    object: doc.funcao.codigo
                }, 'Literal');

                /* === SUBFUNCAO === */

                // uri:subfuncao rdf:type odp:Subfuncao
                addTriple({
                    subject: subfuncaoURI,
                    predicate: prefix.rdf + 'type',
                    object: prefix.odp + 'Subfuncao'
                }, 'URI');

                // uri:subfuncao rdfs:label "rotulo"
                addTriple({
                    subject: subfuncaoURI,
                    predicate: prefix.rdfs + 'label',
                    object: doc.subfuncao.rotulo
                }, 'Literal');

                // uri:subfuncao odp:codigo "codigo"
                addTriple({
                    subject: subfuncaoURI,
                    predicate: prefix.odp + 'codigo',
                    object: doc.subfuncao.codigo
                }, 'Literal');

                /* === PROGRAMA === */

                // uri:programa rdf:type odp:Programa
                addTriple({
                    subject: programaURI,
                    predicate: prefix.rdf + 'type',
                    object: prefix.odp + 'Programa'
                }, 'URI');

                // uri:programa rdfs:label "rotulo"
                addTriple({
                    subject: programaURI,
                    predicate: prefix.rdfs + 'label',
                    object: doc.programa.rotulo
                }, 'Literal');

                // uri:programa odp:codigo "codigo"
                addTriple({
                    subject: programaURI,
                    predicate: prefix.odp + 'codigo',
                    object: doc.programa.codigo
                }, 'Literal');

                /* === ACAO === */

                // uri:acao rdf:type odp:Acao
                addTriple({
                    subject: acaoURI,
                    predicate: prefix.rdf + 'type',
                    object: prefix.odp + 'Acao'
                }, 'URI');

                // uri:acao rdfs:label "rotulo"
                addTriple({
                    subject: acaoURI,
                    predicate: prefix.rdfs + 'label',
                    object: doc.acao.rotulo
                }, 'Literal');

                // uri:acao odp:codigo "codigo"
                addTriple({
                    subject: acaoURI,
                    predicate: prefix.odp + 'codigo',
                    object: doc.acao.codigo
                }, 'Literal');

                /* === SUBTITULO === */

                // uri:subtitulo rdf:type odp:Subtitulo
                addTriple({
                    subject: subtituloURI,
                    predicate: prefix.rdf + 'type',
                    object: prefix.odp + 'Subtitulo'
                }, 'URI');

                // uri:subtitulo rdfs:label "rotulo"
                addTriple({
                    subject: subtituloURI,
                    predicate: prefix.rdfs + 'label',
                    object: doc.subtitulo.rotulo
                }, 'Literal');

                // uri:subtitulo odp:codigo "codigo"
                addTriple({
                    subject: subtituloURI,
                    predicate: prefix.odp + 'codigo',
                    object: doc.subtitulo.codigo
                }, 'Literal');

                /* === FONTE RECURSO === */

                // uri:fonteRecurso rdf:type odp:FonteRecursos
                addTriple({
                    subject: fonteRecursoURI,
                    predicate: prefix.rdf + 'type',
                    object: prefix.odp + 'FonteRecursos'
                }, 'URI');

                // uri:fonteRecurso rdfs:label "rotulo"
                addTriple({
                    subject: fonteRecursoURI,
                    predicate: prefix.rdfs + 'label',
                    object: doc.fonteRecurso.rotulo
                }, 'Literal');

                // uri:fonteRecurso odp:codigo "codigo"
                addTriple({
                    subject: fonteRecursoURI,
                    predicate: prefix.odp + 'codigo',
                    object: doc.fonteRecurso.codigo
                }, 'Literal');

                /* === ESFERA === */

                // uri:esfera rdf:type odp:Esfera
                addTriple({
                    subject: esferaURI,
                    predicate: prefix.rdf + 'type',
                    object: prefix.odp + 'Esfera'
                }, 'URI');

                // uri:esfera rdfs:label "rotulo"
                addTriple({
                    subject: esferaURI,
                    predicate: prefix.rdfs + 'label',
                    object: doc.esfera.rotulo
                }, 'Literal');

                // uri:esfera odp:codigo "codigo"
                addTriple({
                    subject: esferaURI,
                    predicate: prefix.odp + 'codigo',
                    object: doc.esfera.codigo
                }, 'Literal');

                /* === PLANO ORCAMENTARIO === */

                // uri:planoOrcamentario rdf:type odp:PlanoOrcamentario
                addTriple({
                    subject: planoOrcamentarioURI,
                    predicate: prefix.rdf + 'type',
                    object: prefix.odp + 'PlanoOrcamentario'
                }, 'URI');

                // uri:planoOrcamentario rdfs:label "rotulo"
                addTriple({
                    subject: planoOrcamentarioURI,
                    predicate: prefix.rdfs + 'label',
                    object: doc.planoOrcamentario.rotulo
                }, 'Literal');

                // uri:planoOrcamentario odp:codigo "codigo"
                addTriple({
                    subject: planoOrcamentarioURI,
                    predicate: prefix.odp + 'codigo',
                    object: doc.planoOrcamentario.codigo
                }, 'Literal');
            }

            // Liquidação - http://localhost:3000/odp/liquidacao/2016/{{codigo}}
            else if(doc.fase === 'Liquidação') {
                // uri:liquidacao rdf:type odp:Liquidacao
                addTriple({
                    subject: subject,
                    predicate: prefix.rdf + 'type', // rdf:type
                    object: prefix.odp + 'Liquidacao'  // odp:Empenho
                }, 'URI');

                if(credorURI.length > 0) {
                    // uri:liquidacao odp:favorece uri:credor
                    addTriple({
                        subject: subject,
                        predicate: prefix.odp + 'quita',
                        object: credorURI
                    }, 'URI');
                }
            }

            // Pagamento - http://localhost:3000/odp/pagamento/2016/{{codigo}}
            else if(doc.fase === 'Pagamento') {
                // uri:pagamento rdf:type odp:Pagamento
                addTriple({
                    subject: subject,
                    predicate: prefix.rdf + 'type', // rdf:type
                    object: prefix.odp + 'Pagamento'  // odp:Empenho
                }, 'URI');

                if(credorURI.length > 0) {
                    // uri:pagamento odp:favorece uri:credor
                    addTriple({
                        subject: subject,
                        predicate: prefix.odp + 'favorece',
                        object: credorURI
                    }, 'URI');
                }
            }

            // uri:[emp, liq, pag] odp:valorTotal "valor"
            if(doc.valor && doc.valor.length > 0) {
                addTriple({
                    subject: subject,
                    predicate: prefix.odp + 'valorTotal',
                    object: doc.valor.replace('R$ ', '')
                }, 'Literal');
            }

            if(doc.observacao && doc.observacao.length > 0) {
                // uri:[emp, liq, pag] rdfs:comment "observacao"
                addTriple({
                    subject: subject,
                    predicate: prefix.rdfs + 'comment',
                    object: doc.observacao.replace(/[^a-zA-Z ]/g, "")
                }, 'Literal');
            }

            /*
             SUBITEMS
             ================================================================ */

            for(var j = 0, slen = doc.subitems.length; j < slen; j++) {

                itemExecucao = doc.subitems[j];
                subelementoDespesaURI = uri.subelementoDespesa + date.getFullYear() + '/' + doc.elementoDespesa.codigo + '/' + itemExecucao.codigo;

                if(doc.fase === 'Empenho' && itemExecucao.codigo.length > 0 && itemExecucao.codigo !== 'Não') {

                    itemEmpenhoURI = uri.itemEmpenho + date.getFullYear() + '/' + doc.elementoDespesa.codigo + '/' + itemExecucao.codigo + '/' + doc.unidadeGestora.codigo + doc.gestao.codigo + doc.documento + '/' + (Math.floor(Math.random() * 10000000) + 1) ;

                    // uri:empenho odp:compostoDe uri:itemEmpenho
                    addTriple({
                        subject: subject,
                        predicate: prefix.odp + 'compostoDe',
                        object: itemEmpenhoURI
                    }, 'URI');

                    // uri:itemEmpenho rdf:label "rotulo"
                    addTriple({
                        subject: itemEmpenhoURI,
                        predicate: prefix.rdfs + 'label',
                        object: "ITEM " + itemExecucao.rotulo
                    }, 'Literal');

                    // uri:itemEmpenho odp:quantidade "quantidade"
                    addTriple({
                        subject: itemEmpenhoURI,
                        predicate: prefix.odp + 'quantidade',
                        object: itemExecucao.quantidade
                    }, 'Literal');

                    // uri:itemEmpenho odp:valorUnitario "valor unitario"
                    // addTriple({
                    //     subject: itemEmpenhoURI,
                    //     predicate: prefix.odp + 'valorUnitario',
                    //     object: itemExecucao.valorUnitario
                    // }, 'Literal');

                    // uri:itemEmpenho odp:valorTotal "valor total"
                    addTriple({
                        subject: itemEmpenhoURI,
                        predicate: prefix.odp + 'valorTotal',
                        object: itemExecucao.valor.replace('R$ ', '')
                    }, 'Literal');

                    // uri:itemEmpenho rdfs:comment "descricao"
                    addTriple({
                        subject: itemEmpenhoURI,
                        predicate: prefix.rdfs + 'comment',
                        object: itemExecucao.descricao.replace(/[^a-zA-Z ]/g, "")
                    }, 'Literal');

                    /* === CATEGORIA ECONOMICA === */

                    // uri:itemEmpenho rdf:type uri:categoriaEconomica
                    addTriple({
                        subject: itemEmpenhoURI,
                        predicate: prefix.rdf + 'type',
                        object: categoriaEconomicaURI
                    }, 'URI');

                    // uri:categoriaEconomica rdf:type odp:CategoriaEconomica
                    addTriple({
                        subject: categoriaEconomicaURI,
                        predicate: prefix.rdf + 'type',
                        object: prefix.odp + 'CategoriaEconomica'
                    }, 'URI');

                    // uri:categoriaEconomica rdfs:subClassOf odp:ItemEmpenho
                    addTriple({
                        subject: categoriaEconomicaURI,
                        predicate: prefix.rdfs + 'subClassOf',
                        object: prefix.odp + 'ItemEmpenho'
                    }, 'URI');

                    // uri:categoriaEconomica rdfs:label "rotulo"
                    addTriple({
                        subject: categoriaEconomicaURI,
                        predicate: prefix.rdfs + 'label',
                        object: doc.classificacaoEconomica.rotulo
                    }, 'Literal');

                    // uri:categoriaEconomica odp:codigo "codigo"
                    addTriple({
                        subject: categoriaEconomicaURI,
                        predicate: prefix.odp + 'codigo',
                        object: doc.classificacaoEconomica.codigo
                    }, 'Literal');

                    /* === GRUPO DA DESPESA === */

                    // uri:itemEmpenho rdf:type uri:grupoDespesa
                    addTriple({
                        subject: itemEmpenhoURI,
                        predicate: prefix.rdf + 'type',
                        object: grupoDespesaURI
                    }, 'URI');

                    // uri:grupoDespesa rdf:type odp:GrupoDespesa
                    addTriple({
                        subject: grupoDespesaURI,
                        predicate: prefix.rdf + 'type',
                        object: prefix.odp + 'GrupoDespesa'
                    }, 'URI');

                    // uri:grupoDespesa rdfs:subClassOf odp:CategoriaEconomica
                    addTriple({
                        subject: grupoDespesaURI,
                        predicate: prefix.rdfs + 'subClassOf',
                        object: categoriaEconomicaURI
                    }, 'URI');

                    // uri:grupoDespesa rdfs:subClassOf odp:ItemEmpenho
                    addTriple({
                        subject: grupoDespesaURI,
                        predicate: prefix.rdfs + 'subClassOf',
                        object: prefix.odp + 'ItemEmpenho'
                    }, 'URI');

                    // uri:grupoDespesa rdfs:label "rotulo"
                    addTriple({
                        subject: grupoDespesaURI,
                        predicate: prefix.rdfs + 'label',
                        object: doc.grupoDespesa.rotulo
                    }, 'Literal');

                    // uri:grupoDespesa odp:codigo "codigo"
                    addTriple({
                        subject: grupoDespesaURI,
                        predicate: prefix.odp + 'codigo',
                        object: doc.grupoDespesa.codigo
                    }, 'Literal');

                    /* === MODADLIDADE DE APLICACAO === */

                    // uri:itemEmpenho rdf:type uri:modalidadeAplicacao
                    addTriple({
                        subject: itemEmpenhoURI,
                        predicate: prefix.rdf + 'type',
                        object: modalidadeAplicacaoURI
                    }, 'URI');

                    // uri:modalidadeAplicacao rdf:type odp:ModalidadeAplicacao
                    addTriple({
                        subject: modalidadeAplicacaoURI,
                        predicate: prefix.rdf + 'type',
                        object: prefix.odp + 'ModalidadeAplicacao'
                    }, 'URI');

                    // uri:modalidadeAplicacao rdfs:subClassOf odp:ItemEmpenho
                    addTriple({
                        subject: modalidadeAplicacaoURI,
                        predicate: prefix.rdfs + 'subClassOf',
                        object: prefix.odp + 'ItemEmpenho'
                    }, 'URI');

                    // uri:modalidadeAplicacao rdfs:label "rotulo"
                    addTriple({
                        subject: modalidadeAplicacaoURI,
                        predicate: prefix.rdfs + 'label',
                        object: doc.modalidadeAplicacao.rotulo
                    }, 'Literal');

                    // uri:modalidadeAplicacao odp:codigo "codigo"
                    addTriple({
                        subject: modalidadeAplicacaoURI,
                        predicate: prefix.odp + 'codigo',
                        object: doc.modalidadeAplicacao.codigo
                    }, 'Literal');

                    /* === ELEMENTO DE DESPESA === */

                    // uri:itemEmpenho rdf:type uri:elementoDespesaURI
                    // addTriple({
                    //     subject: itemEmpenhoURI,
                    //     predicate: prefix.rdf + 'type',
                    //     object: elementoDespesaURI
                    // }, 'URI');

                    // uri:elementoDespesaURI rdf:type odp:ElementoDespesa
                    addTriple({
                        subject: elementoDespesaURI,
                        predicate: prefix.rdf + 'type',
                        object: prefix.odp + 'ElementoDespesa'
                    }, 'URI');

                    // uri:itemEmpenho odp:prescreve uri:ElementoDespesa
                    addTriple({
                        subject: subject,
                        predicate: prefix.odp + 'prescreveElementoDespesa',
                        object: elementoDespesaURI
                    }, 'URI');

                    // uri:elementoDespesa rdfs:label "rotulo"
                    addTriple({
                        subject: elementoDespesaURI,
                        predicate: prefix.rdfs + 'label',
                        object: doc.elementoDespesa.rotulo
                    }, 'Literal');

                    // uri:elementoDespesa odp:codigo "codigo"
                    addTriple({
                        subject: elementoDespesaURI,
                        predicate: prefix.odp + 'codigo',
                        object: doc.elementoDespesa.codigo
                    }, 'Literal');

                    /* === SUBELEMENTO DE DESPESA === */

                    // uri:itemEmpenho rdf:type uri:subelementoDespesa
                    // addTriple({
                    //     subject: itemEmpenhoURI,
                    //     predicate: prefix.rdf + 'type',
                    //     object: subelementoDespesaURI
                    // }, 'URI');

                    // uri:subelementoDespesa rdf:type odp:SubelementoDespesa
                    addTriple({
                        subject: subelementoDespesaURI,
                        predicate: prefix.rdf + 'type',
                        object: prefix.odp + 'SubelementoDespesa'
                    }, 'URI');

                    // uri:itemEmpenho odp:prescreve uri:SubelementoDespesa
                    addTriple({
                        subject: itemEmpenhoURI,
                        predicate: prefix.odp + 'prescreveSubelementoDespesa',
                        object: subelementoDespesaURI
                    }, 'URI');

                    // uri:subelementoDespesa rdfs:label "rotulo"
                    addTriple({
                        subject: subelementoDespesaURI,
                        predicate: prefix.rdfs + 'label',
                        object: itemExecucao.rotulo
                    }, 'Literal');

                    // uri:subelementoDespesa odp:codigo "codigo"
                    addTriple({
                        subject: subelementoDespesaURI,
                        predicate: prefix.odp + 'codigo',
                        object: itemExecucao.codigo
                    }, 'Literal');
                }

                else if(doc.fase === 'Liquidação' && itemExecucao.codigo.length > 0 && itemExecucao.codigo !== 'Não') {

                    itemLiquidacaoURI = uri.itemLiquidacao + date.getFullYear() + '/' + doc.elementoDespesa.codigo + '/' + itemExecucao.codigo + '/' + doc.unidadeGestora.codigo + doc.gestao.codigo + doc.documento + '/' + (Math.floor(Math.random() * 10000000) + 1);

                    // uri:itemLiquidacao rdf:type odp:ItemLiquidacao
                    addTriple({
                        subject: itemLiquidacaoURI,
                        predicate: prefix.rdf + 'type',
                        object: prefix.odp + 'ItemLiquidacao'
                    }, 'URI');

                    // uri:liquidacao odp:compostoDe uri:itemLiquidacao
                    addTriple({
                        subject: subject,
                        predicate: prefix.odp + 'compostoDe',
                        object: itemLiquidacaoURI
                    }, 'URI');

                    // uri:itemLiquidacao rdf:label "rotulo"
                    addTriple({
                        subject: itemLiquidacaoURI,
                        predicate: prefix.rdfs + 'label',
                        object: "ITEM LIQUIDACAO " + itemExecucao.rotulo
                    }, 'Literal');

                    // uri:itemLiquidacao odp:valorTotal "valorTotal"
                    addTriple({
                        subject: itemLiquidacaoURI,
                        predicate: prefix.odp + 'valorTotal',
                        object: itemExecucao.valor
                    }, 'Literal');

                    // uri:itemLiquidacaoURI odp:liquida uri:subelementoDespesa
                    addTriple({
                        subject: itemLiquidacaoURI,
                        predicate: prefix.odp + 'liquida',
                        object: subelementoDespesaURI
                    }, 'URI');
                }
                else if(doc.fase === 'Pagamento' && itemExecucao.codigo.length > 0 && itemExecucao.codigo !== 'Não') {

                    itemPagamentoURI = uri.itemPagamento + date.getFullYear() + '/' + doc.elementoDespesa.codigo + '/' + itemExecucao.codigo + '/' + doc.unidadeGestora.codigo + doc.gestao.codigo + doc.documento + '/' + (Math.floor(Math.random() * 10000000) + 1);

                    // uri:itemPagamento rdf:type odp:ItemPagamento
                    addTriple({
                        subject: itemPagamentoURI,
                        predicate: prefix.rdf + 'type',
                        object: prefix.odp + 'ItemPagamento'
                    }, 'URI');

                    // uri:pagamento odp:compostoDe uri:itemPagamento
                    addTriple({
                        subject: subject,
                        predicate: prefix.odp + 'compostoDe',
                        object: itemPagamentoURI
                    }, 'URI');

                    // uri:itemPagamento rdf:label "rotulo"
                    addTriple({
                        subject: itemPagamentoURI,
                        predicate: prefix.rdfs + 'label',
                        object: "ITEM PAGAMENTO " + itemExecucao.rotulo
                    }, 'Literal');

                    // uri:itemPagamento odp:valorTotal "valorTotal"
                    addTriple({
                        subject: itemPagamentoURI,
                        predicate: prefix.odp + 'valorTotal',
                        object: itemExecucao.valor
                    }, 'Literal');

                    // uri:itemPagamento odp:paga uri:subelementoDespesa
                    addTriple({
                        subject: itemPagamentoURI,
                        predicate: prefix.odp + 'paga',
                        object: subelementoDespesaURI
                    }, 'URI');
                }
            }

            /*
             UNIDADE GESTORA
             ================================================================ */

            // uri:unidadeGestora rdf:type odp:UnidadeGestora
            addTriple({
                subject: unidadeGestoraURI,
                predicate: prefix.rdf + 'type',
                object: prefix.odp + 'UnidadeGestora'
            }, 'URI');

            // uri:unidadeGestora rdfs:label "rotulo"
            addTriple({
                subject: unidadeGestoraURI,
                predicate: prefix.rdfs + 'label',
                object: doc.unidadeGestora.rotulo
            }, 'Literal');

            // uri:unidadeGestora odp:realiza uri:[emp, liq, pag]
            addTriple({
                subject: unidadeGestoraURI,
                predicate: prefix.odp + 'realiza',
                object: subject
            }, 'URI');

            /*
             CREDOR
             ================================================================ */

            if(credorURI.length > 0) {
                // uri:credor rdf:type odp:Credor
                addTriple({
                    subject: credorURI,
                    predicate: prefix.rdf + 'type',
                    object: prefix.odp + 'Credor'
                }, 'URI');

                // uri:credor rdfs:label "credor"
                addTriple({
                    subject: credorURI,
                    predicate: prefix.rdfs + 'label',
                    object: doc.favorecido.rotulo,
                }, 'Literal');

                // uri:credor odp:codigo "codigo"
                addTriple({
                    subject: credorURI,
                    predicate: prefix.odp + 'codigo',
                    object: doc.favorecido.codigo.replace(/[^\w\s]/gi, ''),
                }, 'Literal');
            }

            /*
             DOCUMENTOS RELACIONADOS
             ================================================================ */

             for(var j = 0, drlen = doc.documentosRelacionados.length; j < drlen; j++) {

                 docRelacionado = doc.documentosRelacionados[j];

                 if(docRelacionado.fase === 'Empenho') { docRelacionadoURI = uri.empenho }
                 else if(docRelacionado.fase === 'Liquidação') { docRelacionadoURI = uri.liquidacao }
                 else if(docRelacionado.fase === 'Pagamento') { docRelacionadoURI = uri.pagamento }

                 if(docRelacionado.caminho) {
                     docRelacionado.documentoCompleto = docRelacionado.caminho.substring(docRelacionado.caminho.indexOf('=') + 1, docRelacionado.caminho.length);

                     // [emp, liq, pag] documento relacionado URI
                     docRelacionadoURI += date.getFullYear() + '/' + docRelacionado.documentoCompleto;

                     if(docRelacionado.fase === "Empenho" && doc.fase === "Empenho") {

                         // uri:empenhoRelacionado rdf:type odp:Empenho
                         addTriple({
                             subject: docRelacionadoURI,
                             predicate: prefix.rdf + "type",
                             object: prefix.odp + "Empenho"
                         }, 'URI');

                         if(docRelacionado.especie === "Anulação") {

                             // uri:empenhoRelacionado rdf:type odp:EmpenhoAnulacao
                             addTriple({
                                 subject: docRelacionadoURI,
                                 predicate: prefix.rdf + "type",
                                 object: prefix.odp + "EmpenhoAnulacao"
                             }, 'URI');

                             // uri:empenhoRelacionado rdf:anula uri:empenho
                             addTriple({
                                 subject: docRelacionadoURI,
                                 predicate: prefix.odp + "anula",
                                 object: subject
                             }, 'URI');
                         }
                         else if(docRelacionado.especie === "Reforço") {

                             // uri:empenhoRelacionado rdf:type odp:EmpenhoReforco
                             addTriple({
                                 subject: docRelacionadoURI,
                                 predicate: prefix.rdf + "type",
                                 object: prefix.odp + "EmpenhoReforco"
                             }, 'URI');

                             // uri:empenhoRelacionado rdf:reforca uri:empenho
                             addTriple({
                                 subject: docRelacionadoURI,
                                 predicate: prefix.odp + "reforca",
                                 object: subject
                             }, 'URI');
                         }
                     }
                     else if(docRelacionado.fase === "Liquidação" && doc.fase === "Empenho") {

                         // uri:liquidacao rdf:type odp:Liquidacao
                         addTriple({
                             subject: docRelacionadoURI,
                             predicate: prefix.rdf + "type",
                             object: prefix.odp + "Liquidacao"
                         }, 'URI');

                         // uri:liquidacao odp:depende uri:empenho
                         addTriple({
                             subject: docRelacionadoURI,
                             predicate: prefix.odp + "depende",
                             object: subject
                         }, 'URI');
                     }
                     else if(docRelacionado.fase === "Pagamento" && doc.fase !== "Pagamento") {

                         // uri:pagamento rdf:type odp:Pagamento
                         addTriple({
                             subject: docRelacionadoURI,
                             predicate: prefix.rdf + "type",
                             object: prefix.odp + "Pagamento"
                         }, 'URI');

                         // uri:pagamento odp:depende uri:[emp, liq]
                         addTriple({
                             subject: docRelacionadoURI,
                             predicate: prefix.odp + "depende",
                             object: subject
                         }, 'URI');
                     }

                     if(docRelacionado.valor && docRelacionado.valor.length > 0) {
                         // uri:docRelacinado odp:valorTotal "valor"
                        addTriple({
                            subject: docRelacionadoURI,
                            predicate: prefix.odp + "valorTotal",
                            object: docRelacionado.valor
                        }, 'Literal');
                     }
                 }
             }
        }
    }

    // add new triple
    function addTriple(triple, objectType) {

        var triple;

        if(objectType === 'URI') {
            triple = '<' + triple.subject + '> <' + triple.predicate + '> <' + triple.object + '>';
        }
        else if(objectType === 'Literal') {
            triple = '<' + triple.subject + '> <' + triple.predicate + '> \"' + triple.object + '\"';
        }

        // add distinct triple
        if(triples.indexOf(triple) < 0) {
            triples.push(triple);
        }
    }

    // insert data
    function insertData() {

        console.log(triples.length);

        var query = "INSERT DATA { ";

        for(var i = 0, len = triples.length; i < len; i++) {
            query += triples[i] + '. ';
        }

        query += '}';

      // console.log(query);

        // execute query
    	conn.query({
        	database: "odp",
        	query: query,
    	}, function(result) {
            if(!result.boolean) {
                console.log(result);
            }
            else {
                console.log(triples.length + ' triplas inseridas!');
            }
        });
    }

})();
