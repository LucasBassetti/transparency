var siop = require('./app/siop'),
    siaf = require('./app/siaf'),
    arg = process.argv[2];

if(arg === 'gsf') {
    siop.generateSIOPFile();
}
else if(arg === 'msf') {
    siaf.matchSIOPFile();
}
else {
    console.log('\n============================\n');
    console.log('Commands: \n');
    console.log('[gsf] - generate siop file');
    console.log('[msf] - match siop file');
    console.log('\n============================\n');
}
