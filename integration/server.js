var siop = require('./app/siop'),
    siaf = require('./app/siaf'),
    program = require('commander');

program
    .version('0.0.1');

program
    .command('integration')
    .alias('it')
    .description('Integrate SIOP files with SIAF triplestore')
    .option('-g, --generateFiles', 'Generate SIOP files from SIOP endpoint')
    .option('-m, --matchFiles', 'Match SIOP files with SIAF triplestore')
    .action(function(options) {
        if(options.generateFiles) {
            siop.generateSIOPFile();
        }
        if(options.matchFiles) {
            siaf.matchSIOPFile();
        }
    });

program.parse(process.argv);
