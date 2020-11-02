var parseXml = require("xml2js").parseString;
var request = require("request");
var fs = require("fs");

var url = process.argv[2];
if (!url) {
    console.log("Usage: " + process.argv[1] + " <jsep_url>");
    process.exit(2);
}

function sectionMapper(level, map) {
    return function (section, i) {
        var number = level + (i + 1) + ".";
        map.sections[section['$'].anchor] = number;
        if (section.section) {
            section.section.forEach(sectionMapper(number, map));
        }
    }
}

request({url: url, headers: { 'User-Agent': 'W3C JSEP Mapper'}},
        function(err, response, body) {
    if (err || response.statusCode != 200) {
        console.error("Failed to fetch " + url + ": " + ( err || response.statusCode));
        process.exit(2);
    }
    var data = parseXml(body, function (err, res) {
        var map = {sections:{}, metadata: {}};
        map.metadata.version = res.rfc['$'].docName.split('-').pop();
        map.metadata.authors = res.rfc.front[0].author.map(function (a) { return a['$'].fullname;});
        var rfcDate = res.rfc.front[0].date[0]['$'];
        if (rfcDate) {
            map.metadata.date = rfcDate['day'] + ' ' + rfcDate['month'] + ' ' + rfcDate['year'];
        }
        res.rfc.middle[0].section.forEach(sectionMapper("", map));
        fs.writeFileSync("map.json", JSON.stringify(map, null, 2));
    });
});
