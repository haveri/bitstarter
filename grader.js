#!/usr/bin/env node
/*
Automatically grade files for the presence of specified HTML tags/attributes.
Uses commander.js and cheerio. Teaches command line application development
and basic DOM parsing.

References:

 + cheerio
   - https://github.com/MatthewMueller/cheerio
   - http://encosia.com/cheerio-faster-windows-friendly-alternative-jsdom/
   - http://maxogden.com/scraping-with-node.html

 + commander.js
   - https://github.com/visionmedia/commander.js
   - http://tjholowaychuk.com/post/9103188408/commander-js-nodejs-command-line-interfaces-made-easy

 + JSON
   - http://en.wikipedia.org/wiki/JSON
   - https://developer.mozilla.org/en-US/docs/JSON
   - https://developer.mozilla.org/en-US/docs/JSON#JSON_in_Firefox_2
*/

var fs = require('fs');
var program = require('commander');
var cheerio = require('cheerio');
var HTMLFILE_DEFAULT = "index.html";
var CHECKSFILE_DEFAULT = "checks.json";

var util = require('util');
var rest = require('restler');
var URL_DEFAULT = null; // "http://aqueous-cove-5739.herokuapp.com";

var assertFileExists = function(infile) {
  var instr = infile.toString();
  if (!fs.existsSync(instr)) {
    console.log("%s does not exist. Exiting.", instr);
    process.exit(1); // http://nodejs.org/api/process.html#process_process_exit_code
  }
  return instr;
};

var assertUrlExists = function(urllink) {
  var instr = urllink.toString();
  return instr;
}

var cheerioHtmlFile = function(htmlfile) {
  return cheerio.load(fs.readFileSync(htmlfile));
};

var loadChecks = function(checksfile) {
  return JSON.parse(fs.readFileSync(checksfile));
};

var checkHtmlFile = function(htmlfile, checksfile) {
  $ = cheerioHtmlFile(htmlfile);
  var checks = loadChecks(checksfile).sort();
  var out = {};
  for (var ii in checks) {
    var present = $(checks[ii]).length > 0;
    out[checks[ii]] = present;
  }
  return out;
};

var clone = function(fn) {
  // Workaround for commander.js issue.
  // http://stackoverflow.com/a/6772648
  return fn.bind({});
};

var processFile = function(htmlfile, checksfile) {
  var checkJson = checkHtmlFile(htmlfile, checksfile);
  var outJson = JSON.stringify(checkJson, null, 4);
  console.log(outJson);
}

var buildfn = function(urllink, htmlfile, checksfile) {
  var response2Url = function(result, response) {
    if(result instanceof Error) {
      msg = 'Unable to load urllink';
      // console.log("result is an error");
      if (response != null) {
        msg = response.message;
      }
      // console.error('Error: ' + util.format(msg));
      // console.log('Processing html file provided: ' + htmlfile);
      if (htmlfile != null) {
        processFile(htmlfile, checksfile);
      }
    } else {
      // console.log("Read urllink %s", urllink);
      fs.writeFileSync("myindex.html", result);
      processFile("myindex.html", checksfile);
    }
  };
  return response2Url;
}

var processUrl = function(urllink, htmlfile, checksfile) {
  var response2Url = buildfn(urllink, htmlfile, checksfile);
  rest.get(urllink).on('complete', response2Url);
}

if (require.main == module) {
  program
    .option('-c, --checks <check_file>', 'Path to checks.json', clone(assertFileExists), CHECKSFILE_DEFAULT)
    .option('-f, --file <html_file>', 'Path to index.html', clone(assertFileExists), HTMLFILE_DEFAULT)
    .option('-u, --url <url_link>', 'Path to url link', clone(assertUrlExists), URL_DEFAULT)
    .parse(process.argv);

  // console.log('program.file is %s', program.file);
  // console.log('program.checks is %s', program.checks);
  // console.log('program.url is %s', program.url);
  if (program.url != null) {
    // console.log('url is not null');
    processUrl(program.url, program.file, program.checks);
  } else {
    // console.log('url is null');
    processFile(program.file, program.checks);
  }
} else {
  exports.checkHtmlFile = checkHtmlFile;
}
