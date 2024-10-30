const {Parser} = require("xml2js");
const fs = require("fs").promises;

const url = process.argv[2];
if (!url) {
    console.log("Usage: " + process.argv[1] + " <jsep_url>");
    process.exit(2);
}

function sectionMapper(level, map) {
    return function (section, i) {
        const number = level + (i + 1) + ".";
        map.sections[section['$'].anchor] = number;
        if (section.section) {
            section.section.forEach(sectionMapper(number, map));
        }
    };
}

(async function(url) {
  let body;
  try {
    const res = await fetch(url, { headers: {'User-Agent': 'W3C JSEP Mapper'} });
    if (res.status !== 200) {
      console.error("Fetching " + url + " resulted in HTTP error: " +  res.status);
      process.exit(2);

    }
    body = await res.text();
  } catch (err) {
    console.error("Failed to fetch " + url + ": " +  err);
    process.exit(2);
  }
  const parser = new Parser();
  const data = await parser.parseStringPromise(body);
  const map = {sections:{}, metadata: {}};
  map.metadata.version = data.rfc['$'].docName.split('-').pop();
  map.metadata.authors = data.rfc.front[0].author.map(function (a) { return a['$'].fullname;});
  const rfcDate = data.rfc.front[0].date[0]['$'];
  if (rfcDate) {
    map.metadata.date = (rfcDate['day'] ?? '') + ' ' + rfcDate['month'] + ' ' + rfcDate['year'];
  }
  data.rfc.middle[0].section.forEach(sectionMapper("", map));
  await fs.writeFile("map.json", JSON.stringify(map, null, 2));
})(url);

