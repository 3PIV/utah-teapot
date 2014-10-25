var fs = require('fs');
var Lazy = require('lazy');

var model = {
    sizes       : { vertices: null, texture: null, normals: null },
    vertices    : [],
    texture     : [],
    normals     : [],
    faces       : []
};

new Lazy(fs.createReadStream(process.argv[2], 'utf8'))
    .lines
    .forEach(onLine)
    .join(function() {
        process.stdout.write("module.exports = " + JSON.stringify(model, null, "  "));
    });

function onLine(line) {
    line = line.toString();
    if (line.match(/^vt/)) {
        vertex(line, 'texture')
    } else if (line.match(/^vn/)) {
        vertex(line, 'normals')
    } else if (line.match(/^v/)) {
        vertex(line, 'vertices');
    } else if (line.match(/^f/)) {
        face(line);
    }
}

function vertex(str, target) {
    
    var chunks = str.trim().split(/\s+/).slice(1);

    if (model.sizes[target] === null) {
        model.sizes[target] = chunks.length;
    } else if (chunks.length !== model.sizes[target]) {
        throw new Error("invalid size for " + target + " (expected " + model.sizes[target] + ")");
    }

    chunks.forEach(function(c) {
        model[target].push(parseFloat(c));
    });

}

function face(str) {
    
    var chunks = str.trim().split(/\s+/).slice(1);
    
    if (chunks < 3) {
        throw new Error("face must have at least 3 vertices");
    }

    var f = chunks.map(function(c) {
        var vals = c.split('/');

        var point = { v: parseInt(vals[0], 10) - 1 };
        
        if (vals.length === 2) {
            point.t = parseInt(vals[1], 10) - 1;
        } else if (vals.length === 3) {
            if (vals[1].length) {
                point.t = parseInt(vals[2], 10) - 1;    
            }
            point.n = parseInt(vals[1], 10) - 1;
        }

        return point;
    });

    model.faces.push(f);

}
