/*!
 * grunt-svg2png
 * https://github.com/dbushell/grunt-svg2png
 *
 * Copyright (c) 2013 David Bushell
 * Licensed under The MIT License (MIT)
 */

var fs = require('fs'),
    page = require('webpage').create(),
    files = JSON.parse(phantom.args[0]),
    total = files.length,
    next = 0,

    file, svgdata, frag, svg;

/*
 * This function wraps WebPage.evaluate, and offers the possibility to pass
 * parameters into the webpage function. The PhantomJS issue is here:
 * 
 *   http://code.google.com/p/phantomjs/issues/detail?id=132
 * 
 * This is from comment #43.
 */
function evaluate(page, func) {
    var args = [].slice.call(arguments, 2);
    var fn = "function() { return (" + func.toString() + ").apply(this, " + JSON.stringify(args) + ");}";
    return page.evaluate(fn);
}

var nextFile = function()
{
    if (next >= total) {
        phantom.exit(0);
        return;
    }

    file = files[next++];

    if (file.src.toString().indexOf("html") > -1) {
      page.viewportSize = {
          width: file.width,
          height: file.height
      };
    }

    // page.open('data:image/svg+xml;utf8,' + svgdata, function(status)
    page.open(file.src, function(status)
    {
        evaluate(page, function(width, height) {
          var svgs = document.getElementsByTagName('svg');
          if (svgs.length > 0) {
            var svg = svgs[0];
            svg.setAttribute('width', width);
            svg.setAttribute('height', height);
          }
        }, file.width, file.height);

        page.viewportSize = {
            width: file.width,
            height: file.height
        };
              
        page.render(file.dest);
        console.log(JSON.stringify({ 'file': file, 'status': status }));
        nextFile();
    });
};

nextFile();
