(function() {

    var request = require("request"),
    	cheerio = require('cheerio'),
        fs = require('fs'),
        config = require('./config');

    var baseURL = 'http://www.portaltransparencia.gov.br/despesasdiarias/',
        URL,
        documentsURL = [],
        results = [],

        periodoInicio = config.query.periodoInicio.replace(/\//g, '%2F'),
        periodoFim = config.query.periodoFim.replace(/\//g, '%2F'),
        fase = config.query.fase,
        codigoOS = config.query.codigoOS,
        codigoOrgao = config.query.codigoOrgao,
        codigoUG = config.query.codigoUG,
        codigoED = config.query.codigoED,
        codigoFavorecido = config.query.codigoFavorecido,
        numeroDePaginas = config.query.numeroDePaginas,
        offset = config.query.offset,
        arquivoSaida = config.query.arquivoSaida,
        pagina,

        consultaURL = 'resultado?consulta=avancada&periodoInicio=' + periodoInicio
                        + '&periodoFim=' + periodoFim
                        + '&fase=' + fase
                        + '&codigoOS=' + codigoOS
                        + '&codigoOrgao=' + codigoOrgao
                        + '&codigoUG=' + codigoUG
                        + '&codigoED=' + codigoED
                        + '&codigoFavorecido=' + codigoFavorecido
                        + '&pagina=';

    // start parser
    startParser();

    // executeURLS();

    /**
     * startParser - start the parser
     */
    function startParser() {

        for(var i = 0; i < numeroDePaginas; i++) {

            (function () {
                var aux = i;

                pagina = offset + (i + 1);
                URL =  baseURL + consultaURL + pagina;

                request(URL, function (error, response, body) {

                    if (!error) {
                        var $ = cheerio.load(body),
                            fields = $('table').last().find('.campo:nth-child(3)').find('a'),
                            docURL;

                        // console.log(body);

                        for(var i = 0, len = fields.length; i < len; i++) {
                            docURL = $(fields[i]).prop('href');
                            documentsURL.push(baseURL + docURL);
                        }

                        // captcha
                        if(documentsURL.length === 0) {
                            console.log('Captcha apareceu! :(');
                        }
                        else {
                            // execute URLs when get all of them
                            if(aux === numeroDePaginas - 1) {
                                console.log(documentsURL.length + ' urls serão executadas!');
                                console.log('======================================================');
                                setTimeout(function() {
                                    executeURLS();
                                }, 1000);
                            }
                        }
                    } else {
                        console.log(error);
                    }
                });
            })();
        }
    }


    /**
     * executeURLS - get URLs from a search to parse
     */
    function executeURLS() {

        for(var i = 0, len = documentsURL.length; i < len; i++) {
            (function () {
                var aux = i, endChecker = false;

                request(documentsURL[i], function (error, response, body) {
                    if (!error) {
                        if(aux === len - 1) {
                            endChecker = true;
                        }
                        parseDocument(body, documentsURL[aux], endChecker);
                    } else {
                        console.log(error);
                    }
                });
            })();
        }
    }

    /**
     * parseDocument - description
     *
     * @param  {String} htmlString - the html page
     * @param  {Array} documentsURL
     * @param  {Boolean} endChecker
     */
    function parseDocument(htmlString, documentsURL, endChecker) {

        var $ = cheerio.load(htmlString),

            result = {},
            label, value, url,
            subitem, subitemFields, cabecalho, subitemsCabecalhoFields,
            relatedDocument, relatedDocumentFields,

            fields = $('.rotulo'),
            subitems = $('.subtabela').find('tr').not('.cabecalho'),
            subitemsCabecalho = $('.subtabela').find('tr.cabecalho'),
            relatedDocuments = $('table').last().find('tr').not('.titulo').not('.cabecalho');

        results.url = documentsURL;

        for(var i = 0, len = fields.length; i < len; i++) {

            label = $(fields[i]).text().replace(':', '').trim();
            value = $(fields[i]).next().text();
            value = JSON.stringify(value).replace(/(?:\\r\\n|\\r|\\n|\\t|")/g, '').trim();

            switch (label) {
                case 'Fase':
                    result.fase = value;
                break;

                case 'Documento':
                    result.documento = value;
                break;

                case 'Tipo de Documento':
                    result.tipoDocumento = value;
                break;

                case 'Data':
                    result.data = value;
                break;

                case 'Tipo de Empenho':
                    result.tipo = value;
                break;

                case 'Espécie de Empenho':
                    result.especie = value;
                break;

                case 'Órgão Superior':
                    result.orgaoSuperior = {
                        codigo: value.substring(0, 5),
                        rotulo: value.substring(8, value.length)
                    }
                break;

                case 'Órgão / Entidade Vinculada':
                    result.orgao = {
                        codigo: value.substring(0, 5),
                        rotulo: value.substring(8, value.length)
                    }
                break;

                case 'Unidade Gestora Emitente':
                    result.unidadeGestora = {
                        codigo: value.substring(0, 6),
                        rotulo: value.substring(9, value.length)
                    }

                case 'Gestão':
                    result.gestao = {
                        codigo: value.substring(0, 5),
                        rotulo: value.substring(8, value.length)
                    }
                break;

                case 'Favorecido':
                    result.favorecido = {
                        codigo: value.substring(0, value.indexOf(' ') - 1),
                        rotulo: value.substring(value.indexOf(' - ') + 3, value.length)
                    }
                break;

                case 'Valor':
                    result.valor = value;
                break;

                case 'Observação do Documento':
                    result.observacao = value;
                break;

                case 'Esfera':
                    result.esfera = {
                        codigo: value.substring(0, 1),
                        rotulo: value.substring(4, value.length)
                    };
                break;

                case 'Tipo de Crédito':
                    result.tipoCredito = value;
                break;

                case 'Grupo da Fonte de Recursos':
                    result.grupoFonteRecurso = {
                        codigo: value.substring(0, 1),
                        rotulo: value.substring(4, value.length)
                    };
                break;

                case 'Fonte de Recursos':
                    result.fonteRecurso = {
                        codigo: value.substring(0, 2),
                        rotulo: value.substring(5, value.length)
                    };
                break;

                case 'Unidade Orçamentária':
                    result.unidadeOrcamentaria = {
                        codigo: value.substring(0, 5),
                        rotulo: value.substring(8, value.length)
                    };
                break;

                case 'Função':
                    result.funcao = {
                        codigo: value.substring(0, 2),
                        rotulo: value.substring(5, value.length)
                    };
                break;

                case 'Subfunção':
                    result.subfuncao = {
                        codigo: value.substring(0, 3),
                        rotulo: value.substring(6, value.length)
                    };
                break;

                case 'Programa':
                    result.programa = {
                        codigo: value.substring(0, 4),
                        rotulo: value.substring(7, value.length)
                    };
                break;

                case 'Ação':
                    result.acao = {
                        codigo: value.substring(0, 4),
                        rotulo: value.substring(7, value.length)
                    };
                break;

                case 'Subtítulo (localizador)':
                    result.subtitulo = {
                        codigo: value.substring(0, 4),
                        rotulo: value.substring(7, value.length)
                    };
                break;

                case 'Plano Orçamentário - PO':
                    result.planoOrcamentario = {
                        codigo: value.substring(0, 4),
                        rotulo: value.substring(7, value.length)
                    };
                break;

                case 'Categoria de Despesa':
                    result.classificacaoEconomica = {
                        codigo: value.substring(0, 1),
                        rotulo: value.substring(4, value.length)
                    };
                break;

                case 'Grupo de Despesa':
                    result.grupoDespesa = {
                        codigo: value.substring(0, 1),
                        rotulo: value.substring(4, value.length)
                    };
                break;

                case 'Modalidade de Aplicação':
                    result.modalidadeAplicacao = {
                        codigo: value.substring(0, 2),
                        rotulo: value.substring(5, value.length)
                    };
                break;

                case 'Elemento de Despesa':
                    result.elementoDespesa = {
                        codigo: value.substring(0, 2),
                        rotulo: value.substring(5, value.length),
                    };
                break;

                case 'Processo N':
                    result.processo = value;
                break;

                default:
            }
        }

        /*
         DOCUMENTOS RELACIONADOS
         ================================================================== */

        result.documentosRelacionados = [];

        // subitems
        for(var i = 0, len = relatedDocuments.length; i < len; i++) {

            relatedDocumentFields = $(relatedDocuments[i]).find('td');
            relatedDocument = {};

            if(relatedDocumentFields.length === 10) {

                for(var j = 0; j < 10; j++) {

                    value = $(relatedDocumentFields[j]).text();
                    value = JSON.stringify(value).replace(/(?:\\r\\n|\\r|\\n|\\t|")/g, '').trim();

                    if(j === 2) {
                        url = $(relatedDocumentFields[j]).find('a').attr('href');
                    }

                    switch (j) {
                        // Data
                        case 0:
                            relatedDocument.data = value;
                        break;

                        // Fase
                        case 1:
                            relatedDocument.fase = value;
                        break;

                        // Documento
                        case 2:
                            relatedDocument.documento = value;
                            if(url) {
                                relatedDocument.caminho = url;
                                relatedDocument.instancia = url.substring(url.indexOf('=') + 1, url.length);
                            }
                        break;

                        // Especie
                        case 3:
                            relatedDocument.especie = value;
                        break;

                        // Valor
                        case 9:
                            relatedDocument.valor = value;
                        break;

                        default:

                    }
                }

                result.documentosRelacionados.push(relatedDocument);
            }
        }

        /*
         SUBITEMS
         ================================================================== */

        result.subitems = [];

        // subitems
        for(var i = 0, len = subitems.length; i < len; i++) {

            subitemsCabecalhoFields = $(subitemsCabecalho).find('th');
            subitemFields = $(subitems[i]).find('td');
            subitem = {};

            for(var j = 0; j < subitemsCabecalhoFields.length; j++) {

                cabecalho = $(subitemsCabecalhoFields[j]).text();
                value = $(subitemFields[j]).text();
                value = JSON.stringify(value).replace(/(?:\\r\\n|\\r|\\n|\\t|")/g, '').trim();

                if(cabecalho.indexOf('Subitem da Despesa') >= 0) {
                    subitem.codigo = value.substring(0, value.indexOf(' '));
                    subitem.rotulo = value.substring(value.indexOf('-') + 2, value.length);
                }
                else if(cabecalho.indexOf('Quantidade') >= 0) {
                    subitem.quantidade = value;
                }
                else if(cabecalho.indexOf('Valor Unitário') >= 0) {
                    subitem.valorUnitario = value;
                }
                else if(cabecalho.indexOf('Valor Total') >= 0) {
                    subitem.valorTotal = value;
                }
                else if(cabecalho.indexOf('Descrição') >= 0) {
                    subitem.descricao = value;
                }
                else if(cabecalho.indexOf('Empenho') >= 0) {
                    subitem.documento = value;

                    for(var k = 0, klen = result.documentosRelacionados.length; k < klen; k++) {
                        if(value === result.documentosRelacionados[k].documento) {
                            subitem.instancia = result.documentosRelacionados[k].instancia;
                        }
                    }
                }
                else if(cabecalho.indexOf('Valor') >= 0 && cabecalho.indexOf('Valor Total') < 0 && cabecalho.indexOf('Valor Unitário') < 0) {
                    subitem.valor = value;
                }
            }

            if(!subitem.documento){
                result.subitems.push(subitem);
            }
            else if(subitem.documento.indexOf('Não há detalhamento para este documento.') < 0) {
                result.subitems.push(subitem);
            }

        }

        /*
         INSERE DOCUMENTO
         ================================================================== */

        if(result.documento) {
            results.push(result);
            console.log('Documento inserido!');
        }

        if(endChecker) {
            setTimeout(function() {
                writeResultFile();
            }, 5000);
        }
    }


    /**
     * writeResultFile - write the result in a json file
     */
    function writeResultFile() {
        fs.writeFile(arquivoSaida, JSON.stringify(results), function (err) {
            if (err) return console.log(err);
            console.log('======================================================');
            console.log(results.length + ' documentos foram inseridos em ' + arquivoSaida + '!');
        });
    }

    // var ocr = require('ocr-by-image-url'),
    //     ncr = require('nodecr');
    //
    // function solveCaptcha() {
    //     var image = $('img[alt=captcha]').attr('src'),
    //         captchaURL = 'http://www.portaltransparencia.gov.br/despesasdiarias/stickyImg.jpg';
    //
    //         // Recognize text of any language in any format
    //         ocr.getImageText(captchaURL, function(error, text){
    //             console.log(text);
    //         });
    //
    //         // Create image name from end of URL.
    //         // Note this will fail in loads of cases.
    //         var imgName = captchaURL.split('/').pop()
    //
    //         // Process the image and read the text from it using Tesseract
    //         function ncrHandler(){
    //
    //           ncr.process(__dirname + '/' + imgName,function(err, text){
    //
    //               if(err) return console.error(err)
    //
    //               console.log("Here is the text: \n")
    //               console.log(text)
    //
    //           }, 'eng', 6)
    //
    //         }
    //
    //         // Fetch the image, pipe it to a writeable stream and then fire
    //         // ncrHandler...
    //         request(captchaURL, ncrHandler).pipe(fs.createWriteStream(imgName))
    // }
})();
