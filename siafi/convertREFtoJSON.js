var fs = require('fs'),
    file = {
        input: './files/UFES02.REF',
        output: './files/UFES02.json',
    };

fs.readFile(file.input, 'utf8', function(err, data) {
    if (err) throw err;

    var data = data.replace(/\s\s+/g, ':'),
        data = data.replace(/ /g, ':'),
        element = "",
        counter = 0,
        results = [],
        result = {};

    // console.log(data);

    for(var i = 0, len = data.length; i < len; i ++) {

        if(data[i] === ':') {
            if(counter === 0) {
                result.key = element;
                element = "";
                counter++;
            }
            else if(counter === 1) {
                result.type = element;
                element = "";
                counter++;
            }
            else if(counter === 2) {
                if(element.indexOf(',') >= 0) {
                    result.value = Number(element.substring(0, element.indexOf(','))) +
                                   Number(element.substring(element.indexOf(',') + 1, element.length));
                    result.hasComma = true;
                    result.commaValue = Number(element.substring(element.indexOf(',') + 1, element.length));
                }
                else {
                    result.value = Number(element);
                }

                results.push(result);

                result = {};
                element = "";
                counter = 0;
            }
        }
        else {
            element += data[i];
        }
    }

    fs.writeFile(file.output, JSON.stringify(results), function (err) {
        if (err) return console.log(err);
    });

});
