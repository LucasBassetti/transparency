(function() {
    "use strict";

    var fs = require('fs'),
        stardog = require('stardog');

    var conn = new stardog.Connection(),
    	base_uri = "http://ontology.com.br/loa/resource/",
        documents, doc, docNumber, docPath,
        triples = [],

        uri = {
            itemLoa: base_uri + 'item-loa/',

            empenho: base_uri + 'empenho/',
            itemDespesa: base_uri + 'item-despesa/',
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
            loa: 'http://ontology.com.br/loa/spec/#'
        };

    // conn.setEndpoint("http://dev.nemo.inf.ufes.br:5820/");
    conn.setEndpoint("http://dev.nemo.inf.ufes.br:5820/");
    conn.setCredentials("admin", "admin");

    // triplify empenhos
    for(var i = 0; i <= 24; i++) {

        if(i < 10) {
            docNumber = "0" + i;
        }
        else {
            docNumber = i;
        }

        docPath = './files/empenhos/empUFES_Jan2016_' + docNumber + '.json';

        documents = JSON.parse(fs.readFileSync(docPath, 'utf8'));
        triplifyData(documents);
    }

    // triplify liquidacoes
    for(var i = 0; i <= 21; i++) {

        if(i < 10) {
            docNumber = "0" + i;
        }
        else {
            docNumber = i;
        }

        docPath = './files/liquidacoes/liqUFES_Jan2016_' + docNumber + '.json';

        documents = JSON.parse(fs.readFileSync(docPath, 'utf8'));
        triplifyData(documents);
    }

    // triplify pagamentos
    for(var i = 0; i <= 25; i++) {

        if(i < 10) {
            docNumber = "0" + i;
        }
        else {
            docNumber = i;
        }

        docPath = './files/pagamentos/pagUFES_Jan2016_' + docNumber + '.json';

        documents = JSON.parse(fs.readFileSync(docPath, 'utf8'));
        triplifyData(documents);
    }

    // insert data
    insertData();

    // triplify documents
    function triplifyData(documents) {

        var date,
            subject,

            itemLoaCodigo,
            itemLoaURI,

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

            itemDespesa,
            itemDespesaURI,
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

            /*
             EMPENHO, LIQUIDACAO E PAGAMENTO
             ================================================================ */

            // Empenho - http://localhost:3000/loa/empenho/2016/{{codigo}}
            if(doc.fase === 'Empenho') {

                itemLoaCodigo =   date.getFullYear() +
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

                itemLoaURI = uri.itemLoa + date.getFullYear() + '/' + itemLoaCodigo;

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

                // uri:empenho rdf:type loa:Empenho
                addTriple({
                    subject: subject,
                    predicate: prefix.rdf + 'type', // rdf:type
                    object: prefix.loa + 'Empenho'  // loa:Empenho
                }, 'URI');

                // uri:empenho loa:conformidadeCom loa:ItemLoa
                addTriple({
                    subject: subject,
                    predicate: prefix.loa + 'conformidadeCom',
                    object: itemLoaURI
                }, 'URI');

                if(doc.especie === "Original") {
                    // uri:empenho rdf:type loa:EmpenhoOriginal
                    addTriple({
                        subject: subject,
                        predicate: prefix.rdf + "type",
                        object: prefix.loa + "EmpenhoOriginal"
                    }, 'URI');
                }
                if(doc.especie === "Anulação") {
                    // uri:empenho rdf:type loa:EmpenhoAnulacao
                    addTriple({
                        subject: subject,
                        predicate: prefix.rdf + "type",
                        object: prefix.loa + "EmpenhoAnulacao"
                    }, 'URI');
                }
                else if(doc.especie === "Reforço") {
                    // uri:empenho rdf:type loa:EmpenhoReforco
                    addTriple({
                        subject: subject,
                        predicate: prefix.rdf + "type",
                        object: prefix.loa + "EmpenhoReforco"
                    }, 'URI');
                }

                if(credorURI.length > 0) {
                    // uri:empenho loa:favorece uri:credor
                    addTriple({
                        subject: subject,
                        predicate: prefix.loa + 'favorece',
                        object: credorURI
                    }, 'URI');
                }

                /* === ITEM LOA === */

                // uri:itemLoa rdf:type loa:ItemLoa
                addTriple({
                    subject: itemLoaURI,
                    predicate: prefix.rdf + 'type',
                    object: prefix.loa + "ItemLoa"
                }, 'URI');

                // uri:itemLoa rdfs:label "label"
                addTriple({
                    subject: itemLoaURI,
                    predicate: prefix.rdfs + 'label',
                    object: 'Item da LOA ' + itemLoaCodigo
                }, 'Literal');

                // uri:itemLoa loa:prescreve uri:funcao
                addTriple({
                    subject: itemLoaURI,
                    predicate: prefix.loa + 'prescreveFuncao',
                    object: funcaoURI
                }, 'URI');

                // uri:itemLoa loa:prescreve uri:subfuncao
                addTriple({
                    subject: itemLoaURI,
                    predicate: prefix.loa + 'prescreveSubfuncao',
                    object: subfuncaoURI
                }, 'URI');

                // uri:itemLoa loa:prescreve uri:programa
                addTriple({
                    subject: itemLoaURI,
                    predicate: prefix.loa + 'prescrevePrograma',
                    object: programaURI
                }, 'URI');

                // uri:itemLoa loa:prescreve uri:acao
                addTriple({
                    subject: itemLoaURI,
                    predicate: prefix.loa + 'prescreveAcao',
                    object: acaoURI
                }, 'URI');

                // uri:itemLoa loa:prescreve uri:subtitulo
                addTriple({
                    subject: itemLoaURI,
                    predicate: prefix.loa + 'prescreveSubtitulo',
                    object: subtituloURI
                }, 'URI');

                // uri:itemLoa loa:prescreve uri:fonteRecurso
                addTriple({
                    subject: itemLoaURI,
                    predicate: prefix.loa + 'prescreveFonteRecursos',
                    object: fonteRecursoURI
                }, 'URI');

                // uri:itemLoa loa:prescreve uri:esfera
                addTriple({
                    subject: itemLoaURI,
                    predicate: prefix.loa + 'prescreveEsfera',
                    object: esferaURI
                }, 'URI');

                // uri:itemLoa loa:prescreve uri:planoOrcamentario
                addTriple({
                    subject: itemLoaURI,
                    predicate: prefix.loa + 'prescrevePlanoOrcamentario',
                    object: planoOrcamentarioURI
                }, 'URI');

                // uri:itemLoa loa:prescreve uri:categoriaEconomica
                addTriple({
                    subject: itemLoaURI,
                    predicate: prefix.loa + 'prescreveCategoriaEconomica',
                    object: categoriaEconomicaURI
                }, 'URI');

                // uri:itemLoa loa:prescreve uri:grupoDespesa
                addTriple({
                    subject: itemLoaURI,
                    predicate: prefix.loa + 'prescreveGrupoDespesa',
                    object: grupoDespesaURI
                }, 'URI');

                // uri:itemLoa loa:prescreve uri:modalidadeAplicacao
                addTriple({
                    subject: itemLoaURI,
                    predicate: prefix.loa + 'prescreveModalidadeAplicacao',
                    object: modalidadeAplicacaoURI
                }, 'URI');

                /* === FUNCAO === */

                // uri:funcao rdf:type loa:Funcao
                addTriple({
                    subject: funcaoURI,
                    predicate: prefix.rdf + 'type',
                    object: prefix.loa + 'Funcao'
                }, 'URI');

                // uri:funcao rdfs:label "rotulo"
                addTriple({
                    subject: funcaoURI,
                    predicate: prefix.rdfs + 'label',
                    object: doc.funcao.rotulo
                }, 'Literal');

                // uri:funcao loa:codigo "codigo"
                addTriple({
                    subject: funcaoURI,
                    predicate: prefix.loa + 'codigo',
                    object: doc.funcao.codigo
                }, 'Literal');

                /* === SUBFUNCAO === */

                // uri:subfuncao rdf:type loa:Subfuncao
                addTriple({
                    subject: subfuncaoURI,
                    predicate: prefix.rdf + 'type',
                    object: prefix.loa + 'Subfuncao'
                }, 'URI');

                // uri:subfuncao rdfs:label "rotulo"
                addTriple({
                    subject: subfuncaoURI,
                    predicate: prefix.rdfs + 'label',
                    object: doc.subfuncao.rotulo
                }, 'Literal');

                // uri:subfuncao loa:codigo "codigo"
                addTriple({
                    subject: subfuncaoURI,
                    predicate: prefix.loa + 'codigo',
                    object: doc.subfuncao.codigo
                }, 'Literal');

                /* === PROGRAMA === */

                // uri:programa rdf:type loa:Programa
                addTriple({
                    subject: programaURI,
                    predicate: prefix.rdf + 'type',
                    object: prefix.loa + 'Programa'
                }, 'URI');

                // uri:programa rdfs:label "rotulo"
                addTriple({
                    subject: programaURI,
                    predicate: prefix.rdfs + 'label',
                    object: doc.programa.rotulo
                }, 'Literal');

                // uri:programa loa:codigo "codigo"
                addTriple({
                    subject: programaURI,
                    predicate: prefix.loa + 'codigo',
                    object: doc.programa.codigo
                }, 'Literal');

                /* === ACAO === */

                // uri:acao rdf:type loa:Acao
                addTriple({
                    subject: acaoURI,
                    predicate: prefix.rdf + 'type',
                    object: prefix.loa + 'Acao'
                }, 'URI');

                // uri:acao rdfs:label "rotulo"
                addTriple({
                    subject: acaoURI,
                    predicate: prefix.rdfs + 'label',
                    object: doc.acao.rotulo
                }, 'Literal');

                // uri:acao loa:codigo "codigo"
                addTriple({
                    subject: acaoURI,
                    predicate: prefix.loa + 'codigo',
                    object: doc.acao.codigo
                }, 'Literal');

                /* === SUBTITULO === */

                // uri:subtitulo rdf:type loa:Subtitulo
                addTriple({
                    subject: subtituloURI,
                    predicate: prefix.rdf + 'type',
                    object: prefix.loa + 'Subtitulo'
                }, 'URI');

                // uri:subtitulo rdfs:label "rotulo"
                addTriple({
                    subject: subtituloURI,
                    predicate: prefix.rdfs + 'label',
                    object: doc.subtitulo.rotulo
                }, 'Literal');

                // uri:subtitulo loa:codigo "codigo"
                addTriple({
                    subject: subtituloURI,
                    predicate: prefix.loa + 'codigo',
                    object: doc.subtitulo.codigo
                }, 'Literal');

                /* === FONTE RECURSO === */

                // uri:fonteRecurso rdf:type loa:FonteRecursos
                addTriple({
                    subject: fonteRecursoURI,
                    predicate: prefix.rdf + 'type',
                    object: prefix.loa + 'FonteRecursos'
                }, 'URI');

                // uri:fonteRecurso rdfs:label "rotulo"
                addTriple({
                    subject: fonteRecursoURI,
                    predicate: prefix.rdfs + 'label',
                    object: doc.fonteRecurso.rotulo
                }, 'Literal');

                // uri:fonteRecurso loa:codigo "codigo"
                addTriple({
                    subject: fonteRecursoURI,
                    predicate: prefix.loa + 'codigo',
                    object: doc.fonteRecurso.codigo
                }, 'Literal');

                /* === ESFERA === */

                // uri:esfera rdf:type loa:Esfera
                addTriple({
                    subject: esferaURI,
                    predicate: prefix.rdf + 'type',
                    object: prefix.loa + 'Esfera'
                }, 'URI');

                // uri:esfera rdfs:label "rotulo"
                addTriple({
                    subject: esferaURI,
                    predicate: prefix.rdfs + 'label',
                    object: doc.esfera.rotulo
                }, 'Literal');

                // uri:esfera loa:codigo "codigo"
                addTriple({
                    subject: esferaURI,
                    predicate: prefix.loa + 'codigo',
                    object: doc.esfera.codigo
                }, 'Literal');

                /* === PLANO ORCAMENTARIO === */

                // uri:planoOrcamentario rdf:type loa:PlanoOrcamentario
                addTriple({
                    subject: planoOrcamentarioURI,
                    predicate: prefix.rdf + 'type',
                    object: prefix.loa + 'PlanoOrcamentario'
                }, 'URI');

                // uri:planoOrcamentario rdfs:label "rotulo"
                addTriple({
                    subject: planoOrcamentarioURI,
                    predicate: prefix.rdfs + 'label',
                    object: doc.planoOrcamentario.rotulo
                }, 'Literal');

                // uri:planoOrcamentario loa:codigo "codigo"
                addTriple({
                    subject: planoOrcamentarioURI,
                    predicate: prefix.loa + 'codigo',
                    object: doc.planoOrcamentario.codigo
                }, 'Literal');
            }

            // Liquidação - http://localhost:3000/loa/liquidacao/2016/{{codigo}}
            else if(doc.fase === 'Liquidação') {
                // uri:liquidacao rdf:type loa:Liquidacao
                addTriple({
                    subject: subject,
                    predicate: prefix.rdf + 'type', // rdf:type
                    object: prefix.loa + 'Liquidacao'  // loa:Empenho
                }, 'URI');

                if(credorURI.length > 0) {
                    // uri:liquidacao loa:favorece uri:credor
                    addTriple({
                        subject: subject,
                        predicate: prefix.loa + 'quita',
                        object: credorURI
                    }, 'URI');
                }
            }

            // Pagamento - http://localhost:3000/loa/pagamento/2016/{{codigo}}
            else if(doc.fase === 'Pagamento') {
                // uri:pagamento rdf:type loa:Pagamento
                addTriple({
                    subject: subject,
                    predicate: prefix.rdf + 'type', // rdf:type
                    object: prefix.loa + 'Pagamento'  // loa:Empenho
                }, 'URI');

                if(credorURI.length > 0) {
                    // uri:pagamento loa:favorece uri:credor
                    addTriple({
                        subject: subject,
                        predicate: prefix.loa + 'favorece',
                        object: credorURI
                    }, 'URI');
                }
            }

            // uri:[emp, liq, pag] loa:valorTotal "valor"
            if(doc.valor && doc.valor.length > 0) {
                addTriple({
                    subject: subject,
                    predicate: prefix.loa + 'valorTotal',
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

                itemDespesa = doc.subitems[j];
                subelementoDespesaURI = uri.subelementoDespesa + date.getFullYear() + '/' + doc.elementoDespesa.codigo + '/' + itemDespesa.codigo;

                if(doc.fase === 'Empenho' && itemDespesa.codigo.length > 0 && itemDespesa.codigo !== 'Não') {

                    itemDespesaURI = uri.itemDespesa + date.getFullYear() + '/' + doc.elementoDespesa.codigo + '/' + itemDespesa.codigo + '/' + doc.unidadeGestora.codigo + doc.gestao.codigo + doc.documento + '/' + i;

                    // uri:empenho loa:compostoDe uri:itemDespesa
                    addTriple({
                        subject: subject,
                        predicate: prefix.loa + 'compostoDe',
                        object: itemDespesaURI
                    }, 'URI');

                    // uri:itemDespesa rdf:label "rotulo"
                    addTriple({
                        subject: itemDespesaURI,
                        predicate: prefix.rdfs + 'label',
                        object: "ITEM " + itemDespesa.rotulo
                    }, 'Literal');

                    // uri:itemDespesa loa:quantidade "quantidade"
                    addTriple({
                        subject: itemDespesaURI,
                        predicate: prefix.loa + 'quantidade',
                        object: itemDespesa.quantidade
                    }, 'Literal');

                    // uri:itemDespesa loa:valorUnitario "valor unitario"
                    addTriple({
                        subject: itemDespesaURI,
                        predicate: prefix.loa + 'valorUnitario',
                        object: itemDespesa.valorUnitario
                    }, 'Literal');

                    // uri:itemDespesa loa:valorTotal "valor total"
                    addTriple({
                        subject: itemDespesaURI,
                        predicate: prefix.loa + 'valorTotal',
                        object: itemDespesa.valorTotal.replace('R$ ', '')
                    }, 'Literal');

                    // uri:itemDespesa rdfs:comment "descricao"
                    addTriple({
                        subject: itemDespesaURI,
                        predicate: prefix.rdfs + 'comment',
                        object: itemDespesa.descricao.replace(/[^a-zA-Z ]/g, "")
                    }, 'Literal');

                    /* === CATEGORIA ECONOMICA === */

                    // uri:itemDespesa rdf:type uri:categoriaEconomica
                    addTriple({
                        subject: itemDespesaURI,
                        predicate: prefix.rdf + 'type',
                        object: categoriaEconomicaURI
                    }, 'URI');

                    // uri:categoriaEconomica rdf:type loa:CategoriaEconomica
                    addTriple({
                        subject: categoriaEconomicaURI,
                        predicate: prefix.rdf + 'type',
                        object: prefix.loa + 'CategoriaEconomica'
                    }, 'URI');

                    // uri:categoriaEconomica rdfs:subClassOf loa:ItemDespesa
                    addTriple({
                        subject: categoriaEconomicaURI,
                        predicate: prefix.rdfs + 'subClassOf',
                        object: prefix.loa + 'ItemDespesa'
                    }, 'URI');

                    // uri:categoriaEconomica rdfs:label "rotulo"
                    addTriple({
                        subject: categoriaEconomicaURI,
                        predicate: prefix.rdfs + 'label',
                        object: doc.classificacaoEconomica.rotulo
                    }, 'Literal');

                    // uri:categoriaEconomica loa:codigo "codigo"
                    addTriple({
                        subject: categoriaEconomicaURI,
                        predicate: prefix.loa + 'codigo',
                        object: doc.classificacaoEconomica.codigo
                    }, 'Literal');

                    /* === GRUPO DA DESPESA === */

                    // uri:itemDespesa rdf:type uri:grupoDespesa
                    addTriple({
                        subject: itemDespesaURI,
                        predicate: prefix.rdf + 'type',
                        object: grupoDespesaURI
                    }, 'URI');

                    // uri:grupoDespesa rdf:type loa:GrupoDespesa
                    addTriple({
                        subject: grupoDespesaURI,
                        predicate: prefix.rdf + 'type',
                        object: prefix.loa + 'GrupoDespesa'
                    }, 'URI');

                    // uri:grupoDespesa rdfs:subClassOf loa:CategoriaEconomica
                    addTriple({
                        subject: grupoDespesaURI,
                        predicate: prefix.rdfs + 'subClassOf',
                        object: categoriaEconomicaURI
                    }, 'URI');

                    // uri:grupoDespesa rdfs:subClassOf loa:ItemDespesa
                    addTriple({
                        subject: grupoDespesaURI,
                        predicate: prefix.rdfs + 'subClassOf',
                        object: prefix.loa + 'ItemDespesa'
                    }, 'URI');

                    // uri:grupoDespesa rdfs:label "rotulo"
                    addTriple({
                        subject: grupoDespesaURI,
                        predicate: prefix.rdfs + 'label',
                        object: doc.grupoDespesa.rotulo
                    }, 'Literal');

                    // uri:grupoDespesa loa:codigo "codigo"
                    addTriple({
                        subject: grupoDespesaURI,
                        predicate: prefix.loa + 'codigo',
                        object: doc.grupoDespesa.codigo
                    }, 'Literal');

                    /* === MODADLIDADE DE APLICACAO === */

                    // uri:itemDespesa rdf:type uri:modalidadeAplicacao
                    addTriple({
                        subject: itemDespesaURI,
                        predicate: prefix.rdf + 'type',
                        object: modalidadeAplicacaoURI
                    }, 'URI');

                    // uri:modalidadeAplicacao rdf:type loa:ModalidadeAplicacao
                    addTriple({
                        subject: modalidadeAplicacaoURI,
                        predicate: prefix.rdf + 'type',
                        object: prefix.loa + 'ModalidadeAplicacao'
                    }, 'URI');

                    // uri:modalidadeAplicacao rdfs:subClassOf loa:ItemDespesa
                    addTriple({
                        subject: modalidadeAplicacaoURI,
                        predicate: prefix.rdfs + 'subClassOf',
                        object: prefix.loa + 'ItemDespesa'
                    }, 'URI');

                    // uri:modalidadeAplicacao rdfs:label "rotulo"
                    addTriple({
                        subject: modalidadeAplicacaoURI,
                        predicate: prefix.rdfs + 'label',
                        object: doc.modalidadeAplicacao.rotulo
                    }, 'Literal');

                    // uri:modalidadeAplicacao loa:codigo "codigo"
                    addTriple({
                        subject: modalidadeAplicacaoURI,
                        predicate: prefix.loa + 'codigo',
                        object: doc.modalidadeAplicacao.codigo
                    }, 'Literal');

                    /* === ELEMENTO DE DESPESA === */

                    // uri:itemDespesa rdf:type uri:elementoDespesaURI
                    addTriple({
                        subject: itemDespesaURI,
                        predicate: prefix.rdf + 'type',
                        object: elementoDespesaURI
                    }, 'URI');

                    // uri:elementoDespesaURI rdfs:subClassOf loa:ElementoDespesa
                    addTriple({
                        subject: elementoDespesaURI,
                        predicate: prefix.rdf + 'type',
                        object: prefix.loa + 'ElementoDespesa'
                    }, 'URI');

                    // uri:elementoDespesaURI rdfs:subClassOf loa:ItemDespesa
                    addTriple({
                        subject: elementoDespesaURI,
                        predicate: prefix.rdfs + 'subClassOf',
                        object: prefix.loa + 'ItemDespesa'
                    }, 'URI');

                    // uri:elementoDespesa rdfs:label "rotulo"
                    addTriple({
                        subject: elementoDespesaURI,
                        predicate: prefix.rdfs + 'label',
                        object: doc.elementoDespesa.rotulo
                    }, 'Literal');

                    // uri:elementoDespesa loa:codigo "codigo"
                    addTriple({
                        subject: elementoDespesaURI,
                        predicate: prefix.loa + 'codigo',
                        object: doc.elementoDespesa.codigo
                    }, 'Literal');

                    /* === SUBELEMENTO DE DESPESA === */

                    // uri:itemDespesa rdf:type uri:subelementoDespesa
                    addTriple({
                        subject: itemDespesaURI,
                        predicate: prefix.rdf + 'type',
                        object: subelementoDespesaURI
                    }, 'URI');

                    // uri:subelementoDespesa rdfs:subClassOf loa:SubelementoDespesa
                    addTriple({
                        subject: subelementoDespesaURI,
                        predicate: prefix.rdf + 'type',
                        object: prefix.loa + 'SubelementoDespesa'
                    }, 'URI');

                    // uri:subelementoDespesa rdfs:subClassOf loa:ItemDespesa
                    addTriple({
                        subject: subelementoDespesaURI,
                        predicate: prefix.rdfs + 'subClassOf',
                        object: prefix.loa + 'ItemDespesa'
                    }, 'URI');

                    // uri:subelementoDespesa rdfs:label "rotulo"
                    addTriple({
                        subject: subelementoDespesaURI,
                        predicate: prefix.rdfs + 'label',
                        object: itemDespesa.rotulo
                    }, 'Literal');

                    // uri:subelementoDespesa loa:codigo "codigo"
                    addTriple({
                        subject: subelementoDespesaURI,
                        predicate: prefix.loa + 'codigo',
                        object: itemDespesa.codigo
                    }, 'Literal');
                }

                else if(doc.fase === 'Liquidação' && itemDespesa.codigo.length > 0 && itemDespesa.codigo !== 'Não') {

                    itemLiquidacaoURI = uri.itemLiquidacao + date.getFullYear() + '/' + doc.elementoDespesa.codigo + '/' + itemDespesa.codigo + '/' + doc.unidadeGestora.codigo + doc.gestao.codigo + doc.documento + '/' + i;

                    // uri:itemLiquidacao rdf:type loa:ItemLiquidacao
                    addTriple({
                        subject: itemLiquidacaoURI,
                        predicate: prefix.rdf + 'type',
                        object: prefix.loa + 'ItemLiquidacao'
                    }, 'URI');

                    // uri:liquidacao loa:compostoDe uri:itemLiquidacao
                    addTriple({
                        subject: subject,
                        predicate: prefix.loa + 'compostoDe',
                        object: itemLiquidacaoURI
                    }, 'URI');

                    // uri:itemLiquidacao rdf:label "rotulo"
                    addTriple({
                        subject: itemLiquidacaoURI,
                        predicate: prefix.rdfs + 'label',
                        object: "ITEM LIQUIDACAO " + itemDespesa.rotulo
                    }, 'Literal');

                    // uri:itemLiquidacaoURI loa:liquida uri:subelementoDespesa
                    addTriple({
                        subject: itemLiquidacaoURI,
                        predicate: prefix.loa + 'liquida',
                        object: subelementoDespesaURI
                    }, 'URI');
                }
                else if(doc.fase === 'Pagamento' && itemDespesa.codigo.length > 0 && itemDespesa.codigo !== 'Não') {

                    itemPagamentoURI = uri.itemPagamento + date.getFullYear() + '/' + doc.elementoDespesa.codigo + '/' + itemDespesa.codigo + '/' + doc.unidadeGestora.codigo + doc.gestao.codigo + doc.documento + '/' + i;

                    // uri:itemPagamento rdf:type loa:ItemPagamento
                    addTriple({
                        subject: itemPagamentoURI,
                        predicate: prefix.rdf + 'type',
                        object: prefix.loa + 'ItemPagamento'
                    }, 'URI');

                    // uri:pagamento loa:compostoDe uri:itemPagamento
                    addTriple({
                        subject: subject,
                        predicate: prefix.loa + 'compostoDe',
                        object: itemPagamentoURI
                    }, 'URI');

                    // uri:itemPagamento rdf:label "rotulo"
                    addTriple({
                        subject: itemPagamentoURI,
                        predicate: prefix.rdfs + 'label',
                        object: "ITEM PAGAMENTO " + itemDespesa.rotulo
                    }, 'Literal');

                    // uri:itemPagamento loa:valorTotal "valorTotal"
                    addTriple({
                        subject: itemPagamentoURI,
                        predicate: prefix.loa + 'valorTotal',
                        object: itemDespesa.valor
                    }, 'Literal');

                    // uri:itemPagamento loa:paga uri:subelementoDespesa
                    addTriple({
                        subject: itemPagamentoURI,
                        predicate: prefix.loa + 'paga',
                        object: subelementoDespesaURI
                    }, 'URI');
                }
            }

            /*
             UNIDADE GESTORA
             ================================================================ */

            // uri:unidadeGestora rdf:type loa:UnidadeGestora
            addTriple({
                subject: unidadeGestoraURI,
                predicate: prefix.rdf + 'type',
                object: prefix.loa + 'UnidadeGestora'
            }, 'URI');

            // uri:unidadeGestora rdfs:label "rotulo"
            addTriple({
                subject: unidadeGestoraURI,
                predicate: prefix.rdfs + 'label',
                object: doc.unidadeGestora.rotulo
            }, 'Literal');

            // uri:unidadeGestora loa:realiza uri:[emp, liq, pag]
            addTriple({
                subject: unidadeGestoraURI,
                predicate: prefix.loa + 'realiza',
                object: subject
            }, 'URI');

            /*
             CREDOR
             ================================================================ */

            if(credorURI.length > 0) {
                // uri:credor rdf:type loa:Credor
                addTriple({
                    subject: credorURI,
                    predicate: prefix.rdf + 'type',
                    object: prefix.loa + 'Credor'
                }, 'URI');

                // uri:credor rdfs:label "credor"
                addTriple({
                    subject: credorURI,
                    predicate: prefix.rdfs + 'label',
                    object: doc.favorecido.rotulo,
                }, 'Literal');

                // uri:credor loa:codigo "codigo"
                addTriple({
                    subject: credorURI,
                    predicate: prefix.loa + 'codigo',
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

                         // uri:empenhoRelacionado rdf:type loa:Empenho
                         addTriple({
                             subject: docRelacionadoURI,
                             predicate: prefix.rdf + "type",
                             object: prefix.loa + "Empenho"
                         }, 'URI');

                         if(docRelacionado.especie === "Anulação") {

                             // uri:empenhoRelacionado rdf:type loa:EmpenhoAnulacao
                             addTriple({
                                 subject: docRelacionadoURI,
                                 predicate: prefix.rdf + "type",
                                 object: prefix.loa + "EmpenhoAnulacao"
                             }, 'URI');

                             // uri:empenhoRelacionado rdf:anula uri:empenho
                             addTriple({
                                 subject: docRelacionadoURI,
                                 predicate: prefix.loa + "anula",
                                 object: subject
                             }, 'URI');
                         }
                         else if(docRelacionado.especie === "Reforço") {

                             // uri:empenhoRelacionado rdf:type loa:EmpenhoReforco
                             addTriple({
                                 subject: docRelacionadoURI,
                                 predicate: prefix.rdf + "type",
                                 object: prefix.loa + "EmpenhoReforco"
                             }, 'URI');

                             // uri:empenhoRelacionado rdf:reforca uri:empenho
                             addTriple({
                                 subject: docRelacionadoURI,
                                 predicate: prefix.loa + "reforca",
                                 object: subject
                             }, 'URI');
                         }
                     }
                     else if(docRelacionado.fase === "Liquidação" && doc.fase === "Empenho") {

                         // uri:liquidacao rdf:type loa:Liquidacao
                         addTriple({
                             subject: docRelacionadoURI,
                             predicate: prefix.rdf + "type",
                             object: prefix.loa + "Liquidacao"
                         }, 'URI');

                         // uri:liquidacao loa:depende uri:empenho
                         addTriple({
                             subject: docRelacionadoURI,
                             predicate: prefix.loa + "depende",
                             object: subject
                         }, 'URI');
                     }
                     else if(docRelacionado.fase === "Pagamento" && doc.fase !== "Pagamento") {

                         // uri:pagamento rdf:type loa:Pagamento
                         addTriple({
                             subject: docRelacionadoURI,
                             predicate: prefix.rdf + "type",
                             object: prefix.loa + "Pagamento"
                         }, 'URI');

                         // uri:pagamento loa:depende uri:[emp, liq]
                         addTriple({
                             subject: docRelacionadoURI,
                             predicate: prefix.loa + "depende",
                             object: subject
                         }, 'URI');
                     }

                     if(docRelacionado.valor && docRelacionado.valor.length > 0) {
                         // uri:docRelacinado loa:valorTotal "valor"
                        addTriple({
                            subject: docRelacionadoURI,
                            predicate: prefix.loa + "valorTotal",
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

        var query = "INSERT DATA { ";

        for(var i = 0, len = triples.length; i < len; i++) {
            query += triples[i] + '. ';
        }

        query += '}';

        // console.log(query);

        // execute query
    	conn.query({
        	database: "dpf",
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
