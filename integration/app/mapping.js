module.exports = {

    'temPrograma'           : { type: 'relation', value: 'loa:programa'             },
    'temAcao'               : { type: 'relation', value: 'loa:acao'                 },
    'temFuncao'             : { type: 'relation', value: 'loa:funcao'               },
    'temSubfuncao'          : { type: 'relation', value: 'loa:subfuncao'            },
    'temSubtitulo'          : { type: 'relation', value: 'loa:subtitulo'            },
    'temFonteRecursos'      : { type: 'relation', value: 'loa:fonteRecurso'         },
    'temEsfera'             : { type: 'relation', value: 'loa:esfera'               },
    'temPlanoOrcamentario'  : { type: 'relation', value: 'loa:planoOrcamentario'    },
    // 'temIdentificadorUso'   : { type: 'relation', value: 'loa:iduso'                },
    // 'temResultadoPrimario'  : { type: 'relation', value: 'loa:resultado'            },
    'temCategoriaEconomica' : { type: 'class',    value: 'loa:CategoriaEconomica'   },
    'temGND'                : { type: 'class',    value: 'loa:GrupoDespesa'         },
    'temModalidadeAplicacao': { type: 'class',    value: 'loa:ModalidadeAplicacao'  },
    'temElementoDespesa'    : { type: 'class',    value: 'loa:ElementoDespesa'      },
}
