var fs = require('fs'),
    file = {
        input: './files/UFES02.TXT',
        refInput: './files/UFES02.json',
        output: './files/UFES02_result.json',
    };

fs.readFile(file.input, 'utf8', function(err, data) {
    if (err) throw err;
    var inputFile = data.replace(/\n/g, "").replace(/\r/g, "");

    fs.readFile(file.refInput, 'utf8', function(err, data) {
        if (err) throw err;
        var ref = JSON.parse(data),
            element = "",
            k = 0,
            results = [],
            result = {};

        console.log(inputFile.length);
        var total = 0;
        for(var i = 0, len = ref.length; i < len; i ++) {
            total += ref[i].value;
        }
        console.log(total);
        console.log(inputFile.length/total);

        for(var i = 0, len = inputFile.length; i < len; i ++) {

            element += inputFile[i];

            if(element.length === ref[k].value) {

                if(ref[k].hasComma) {
                    element = element.slice(0, ref[k].value - ref[k].commaValue) + ',' +
                                element.slice(ref[k].value - ref[k].commaValue, ref[k].value);
                }

                // if(ref[k].type === 'N') {
                //     element = element.replace(',', '.');
                //     result[ref[k].key] = Number(element);
                // }
                // else {
                    result[ref[k].key] = element;
                // }

                element = "";
                k++;
            }

            if(k === ref.length) {
                results.push(result);

                result = {};
                k = 0;
            }
        }

        // console.log(JSON.stringify(results));

        fs.writeFile(file.output, JSON.stringify(results), function (err) {
            if (err) return console.log(err);
        });
    });
});
