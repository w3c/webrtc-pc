function markTestableAssertions() {
  const sectionsToIgnore=["#abstract", "#sotd", "#conformance", ".informative", ".appendix"];
  const contentToIgnore = [".untestable", ".issue", ".example", ".note", ".informative", ".has-tests", ".needs-tests", ".no-test-needed"];
  const contentToIgnoreSelector = contentToIgnore.map(sel => `:not(${sel})`).join('');

  [...document.querySelector("body").querySelectorAll(sectionsToIgnore.map(sel => `section:not(${sel})`).join(","))].forEach(
    section => {
      [...section.querySelectorAll(`p${contentToIgnoreSelector}, ol > li${contentToIgnoreSelector}`)].forEach(
        el => {
          let parent = el.parentNode;
          do  {
            if (parent.matches(contentToIgnore.join(','))) return;
            parent = parent.parentNode;
          } while (parent.tagName !== 'SECTION' && parent.matches);
          if (el.tagName === "P" && (el.textContent.match(/MUST/) || el.textContent.match(/SHALL/))) {
            if (!((el.parentNode.tagName === "DD" && el.parentNode.previousElementSibling.getAttribute("data-tests") && !el.nextElementSibling) || (el.nextElementSibling && el.nextElementSibling.tagName === "OL"))) {
              el.classList.add("needs-tests");
            }
          } else if (el.tagName === "LI" && !el.querySelector('ol')) { // Detect argument assignment cases?
            el.classList.add("needs-tests");
          }
        })
    }
  );
}

let amendments;
var baseRec = document.createElement("html");

function containerFromId(id) {
  const container = baseRec.querySelector('#' + id);
  if (!container) {
    throw new Error(`Unknown element with id ${id} in Recommendation used as basis, see https://github.com/w3c/webrtc-pc/blob/main/amendments.md for amendments management`);
  }
  return container;
}

function titleFromId(id) {
  const container = baseRec.querySelector('#' + id);
  if (!container) return id;
  return container.closest("section").querySelector("h1,h2,h3,h4,h5,h6").textContent;
}

function listPRs(pr) {
  const span = document.createElement("span");
  span.appendChild(document.createTextNode(" ("));
  pr = Array.isArray(pr) ? pr : [pr];
  for (let i in pr) {
    const number = pr[i];
    const url = respecConfig.github.repoURL + "pull/" + number;
    const a = document.createElement("a");
    a.href = url;
    a.textContent = `PR #${number}`;
    span.appendChild(a);
    if (i < pr.length - 1) {
      span.appendChild(document.createTextNode(", "));
    }
  }
  span.appendChild(document.createTextNode(")"));
  return span;
}

const capitalize = s => s[0].toUpperCase() + s.slice(1);

async function listAmendments() {
  amendments = await fetch("amendments.json").then(r => r.json());
  baseRec.innerHTML = await fetch("base-rec.html").then(r => r.text());

  for (let id of Object.keys(amendments)) {
  }
  let m;
  let i = 0;
  let consolidatedAmendments = {};
  for (let id of Object.keys(amendments)) {
    // validate that an amendment is not embedded in another
    const container = containerFromId(id);
    if (amendments[id][0].difftype !== 'append') {
      const embedded = Object.keys(amendments).filter(iid => iid !== id).find(iid => container.querySelector("#" + iid));
      if (embedded) {
	throw new Error(`The container with id ${id} marked as amended cannot embed the other container of amendment ${embedded}, see https://github.com/w3c/webrtc-pc/blob/main/amendments.md for amendments management`);
      }
    }
    // validate that a section has only one difftype, one amendment type, one amendemnt status
    if (amendments[id].some(a => a.difftype && a.difftype !== amendments[id][0].difftype)) {
      throw new Error(`Amendments in container with id ${id} are mixing "modification" and "append" difftypes, see https://github.com/w3c/webrtc-pc/blob/main/amendments.md for amendments management`);
    }
    if (amendments[id].some(a => a.type !== amendments[id][0].type)) {
      //throw new Error(`Amendments in container with id ${id} are mixing "corrections" and "addition" types`);
    }
    if (amendments[id].some(a => a.status !== amendments[id][0].status)) {
      throw new Error(`Amendments in container with id ${id} are mixing "candidate" and "proposed" amendments, see https://github.com/w3c/webrtc-pc/blob/main/amendments.md for amendments management`);
    }

    // Group by candidate id for listing in the appendix
    for (let amendment of amendments[id]) {
      if (!consolidatedAmendments[amendment.id]) {
	consolidatedAmendments[amendment.id] = [];
      }
      consolidatedAmendments[amendment.id].push({...amendment, section: id});
    }
  }
  if (document.getElementById("changes")) {
    const ul = document.createElement("ul");
    Object.values(consolidatedAmendments).forEach((amendment) => {
      const {status, id, type} = amendment[0];
      const li = document.createElement("li");
      const entriesUl = document.createElement("ul");
      li.appendChild(document.createTextNode(`${capitalize(status)} ${capitalize(type)} ${id}: `));
      amendment.forEach(({description, section, pr}, i) => {
	const entryLi = document.createElement("li");
	entryLi.innerHTML = description;
        const link = document.createElement("a");
	entryLi.appendChild(document.createTextNode(" - "));
        link.href = "#" + section;
        link.textContent = `section ${titleFromId(section)}`;
        entryLi.appendChild(link);
	entryLi.appendChild(listPRs(pr));
	entriesUl.appendChild(entryLi);
      });
      li.appendChild(entriesUl);
      ul.appendChild(li);
    });
    document.getElementById("changes").appendChild(ul);
  }
}

function showAmendments() {
  for (let section of Object.keys(amendments)) {
    const target = document.getElementById(section);
    let wrapper = document.createElement("div");
    if (amendments[section][0].difftype !== "append") {
      if (["LI"].includes(target?.tagName)) {
	wrapper = document.createElement("li");
	wrapper.className = "skip";
      }
    } else {
      if (["DL"].includes(target?.tagName)) {
	wrapper = document.createElement("dt");
      }
    }
    wrapper.id = section + "-change-wrapper";
    const annotations = [];
    for (let {description, id, difftype, status, type, pr} of amendments[section]) {
      // integrate the annotations for candidate/proposed amendments
      // only when Status = REC
      // (but keep them all in for other statuses of changes)
      if (respecConfig.specStatus !== "REC" && (["correction", "addition"].includes(type) || ["candidate", "proposed"].includes(status))) {
	continue;
      }
      const amendmentDiv = document.createElement("div");
      amendmentDiv.className = type;
      const marker = document.createElement("span");
      marker.className = "marker";
      marker.textContent = `${capitalize(status)} ${capitalize(type)} ${id}:`;
      const title = document.createElement("span");
      title.innerHTML = description;
      amendmentDiv.appendChild(marker);
      amendmentDiv.appendChild(title);
      amendmentDiv.appendChild(listPRs(pr));
      annotations.push(amendmentDiv);
    }

    for (let div of annotations) {
      wrapper.appendChild(div);
    }
    if (annotations.length) {
      const ui = document.createElement("fieldset");
      ui.className = "diff-ui";
      ui.innerHTML = `<label><input aria-controls="${section} ${section}-new" name="change-${section}" class=both checked type=radio> Show Current and Future</label><label><input name="change-${section}" class=current type=radio> Show Current</label><label><input name="change-${section}" class=future type=radio>Show Future</label>`;
      wrapper.appendChild(ui);
      if (amendments[section][0].difftype === "modify" || !amendments[section][0].difftype) {
	ui.querySelectorAll('input[type="radio"]').forEach(inp => {
	  inp.setAttribute("aria-controls", `${section} ${section}-new`);
	});
	ui.classList.add("modify");
	let containerOld = containerFromId(section);
	containerOld = containerOld.cloneNode(true);
	containerOld.classList.add("diff-old", "exclude");
	// clean up ids to avoid duplicates
	containerOld.querySelectorAll("[id]").forEach(el => el.removeAttribute("id"));
	// validator complains about this, but this should be right thing to do
	// containerOld.setAttribute("aria-role", "deletion");
	const containerNew = document.getElementById(section);
	if (!containerNew) throw new Error(`No element with id ${section} in editors draft, see https://github.com/w3c/webrtc-pc/blob/main/amendments.md for amendments management`);
	// validator complains about this, but this should be right thing to do
	// containerNew.setAttribute("aria-role", "insertion");

	containerNew.classList.add("diff-new");
	containerNew.id += "-new";
	containerNew.parentNode.insertBefore(containerOld, containerNew);
	containerNew.parentNode.insertBefore(wrapper, containerOld);
      } else if (amendments[section][0].difftype === "append") {
	ui.classList.add("append");
	const appendBase = document.getElementById(section);
	appendBase.appendChild(wrapper);
	const controlledIds = [];
	document.querySelectorAll(`.add-to-${section}`).forEach((el,i) => {
	  el.classList.add('diff-new');
	  // validator complains about this, but this should be right thing to do
	  // el.setAttribute("aria-role", "insertion");
	  el.id = `${section}-new-${i}`;
	  controlledIds.push(el.id);
	});
	ui.querySelectorAll('input[type="radio"]').forEach(inp => {
	  inp.setAttribute("aria-controls", `${section} ${controlledIds.join(" ")}`);
	});

      }
    }
  }
}

function highlightTests() {
  [...document.querySelectorAll("[data-tests]")].forEach(el => {
    if (el.dataset['tests'])
      el.classList.add("has-tests")
    else
      el.classList.add("needs-tests");
  });
}


var respecConfig = {
  // specification status (e.g. WD, LCWD, NOTE, etc.). If in doubt use ED.
  specStatus:           "ED",

  // the specification's short name, as in http://www.w3.org/TR/short-name/
  shortName:            "webrtc",
  useExperimentalStyles: true,

  // if your specification has a subtitle that goes below the main
  // formal title, define it here
  // subtitle   :  "an excellent document",

  // if you wish the publication date to be other than today, set this
  // publishDate:  "2014-01-27",

  // if the specification's copyright date is a range of years, specify
  // the start date here:
  // copyrightStart: "2005",

  // if there is a previously published draft, uncomment this and set its YYYY-MM-DD
  prevED: "https://w3c.github.io/webrtc-pc/archives/20171002/webrtc.html",

  // if this is a LCWD, uncomment and set the end of its review period
  // lcEnd: "2009-08-05",

  // if you want to have extra CSS, append them to this list
  // it is RECOMMENDED that the respec.css stylesheet be kept
  //        extraCSS:             ["ReSpec.js/css/respec.css"],
  //        extraCSS:             ["../../../2009/dap/ReSpec.js/css/respec.css"],

  // editors, add as many as you like
  // only "name" is REQUIRED
  editors:  [
    //              { name: "Your Name", url: "http://example.org/",
    //                company: "Your Company", companyURL: "http://example.com/" },
    { name: "Cullen Jennings", company: "Cisco",
      w3cid: "25254"
    },
    { name: "Florent Castelli", company: "Google",
      w3cid: "105725"
    },
    { name: "Henrik Boström", company: "Google",
      w3cid: "96936"
    },
    { name: "Jan-Ivar Bruaroey", company: "Mozilla",
      w3cid: "79152"
    }
  ],
  formerEditors: [
    { name: "Adam Bergkvist", company: "Ericsson",
      w3cid: "45507", retiredDate: "2018-06-01"
    },
    { name: "Daniel C. Burnett", company: "Invited Expert",
      w3cid: "85118", retiredDate: "2018-06-01"
    },
    { name: "Anant Narayanan", company: "Mozilla",
      w3cid: "47326", retiredDate: "2012-11-01"
    },
    { name: "Bernard Aboba", company: "Microsoft Corporation",
      w3cid: "65611", retiredDate: "2017-03-01"
    },
    { name: "Taylor Brandstetter", company: "Google",
      w3cid: "82908", retiredDate: "2018-06-01"
    },

  ],
  // authors, add as many as you like.
  // This is optional, uncomment if you have authors as well as editors.
  // only "name" is REQUIRED. Same format as editors.

  //authors:  [
  //    { name: "Your Name", url: "http://example.org/",
  //      company: "Your Company", companyURL: "http://example.com/" }
  //],

  // name of the WG
  group: "webrtc",
  // name (without the @w3c.org) of the public mailing to which comments are due
  wgPublicList: "public-webrtc",

  testSuiteURI: "https://github.com/web-platform-tests/wpt/tree/master/webrtc/",
  implementationReportURI: "https://w3c.github.io/webrtc-interop-reports/webrtc-pc-report.html",
  revisionTypes: ["addition", "correction"],
  lint: {
    "wpt-tests-exist": true
  },
  github: {
    repoURL: "https://github.com/w3c/webrtc-pc/",
    branch: "main"
  },
  otherLinks: [
    {
      key: "Participate",
      data: [
        {
          value: "Mailing list",
          href: "https://lists.w3.org/Archives/Public/public-webrtc/"
        }
      ],
    }

  ],
  xref: ["dom", "hr-time", "webidl", "html", "mediacapture-streams", "fileapi", "webrtc-stats", "websockets", "xhr", "infra"],
  preProcess: [
    highlightTests,
    markTestableAssertions,
    listAmendments,
    function linkToJsep() {
              var xhr = new XMLHttpRequest();
              xhr.open('GET', 'jsep-mapping/map.json');
              xhr.onload = function(e) {
                  var data = JSON.parse(this.responseText);
                  // Replace all
                  //    <span data-jsep="foo">[[!JSEP]]</a>
                  // with
                  //    <span>[[!JSEP]] (<a href="...#X.Y">section X.Y.</a>)
                  // based on mapping maintained in jsep-mapping/map.json
                  Array.prototype.forEach.call(
                      document.querySelectorAll("*[data-jsep]"),
                      function (el) {
                          var jsepAnchors = el.dataset.jsep.split(" ");
                          var jsepSections = jsepAnchors.map(function (s) { return data.sections["sec." + s] || data.sections["sec-" + s];});
                          if (jsepSections.indexOf(undefined) !== -1) {
                              respecUI.warning("Reference to inexistent JSEP section in '" + el.dataset.jsep + "': unrecognized anchor #" + jsepSections.indexOf(undefined) + " 'sec." + jsepAnchors[jsepSections.indexOf(undefined)] + "'.");
                              return;
                          }
                          el.removeAttribute("data-jsep");
                          el.appendChild(document.createTextNode(" ("));
                          jsepSections.forEach(function (s, i) {
                              var sectionLink = document.createElement("a");
                              sectionLink.href = "https://datatracker.ietf.org/doc/html/rfc8829#section-" +  s.slice(0, s.length - 1);
                              sectionLink.textContent = "section " + s;
                              if (i > 0) {
                                  if (i == jsepSections.length - 1) {
                                      el.appendChild(document.createTextNode(" and "));
                                  } else {
                                      el.appendChild(document.createTextNode(", "));
                                  }
                              }
                              el.appendChild(sectionLink);
                          });
                          el.appendChild(document.createTextNode(")"));
                      });
              };
              xhr.send();
      }
  ],
  postProcess: [
    function showTestAnnotations() {
      if (location.search.match(/viewTests/)) {
        toggleTestAnnotations();
      }
    },
    showAmendments
  ],
    afterEnd: function markFingerprinting () {
        Array.prototype.forEach.call(
            document.querySelectorAll(".fingerprint"),
            function (el) {
                var img = new Image();
                img.src = "images/fingerprint.png";
                img.alt = "(This is a fingerprinting vector.)";
                img.width = 15;
                img.height = 21;
                el.appendChild(img);
            });
    },
    localBiblio: {
        "STUN-PARAMETERS": {
            "authors":["IETF"],
            "href": "https://www.iana.org/assignments/stun-parameters/stun-parameters.xhtml#stun-parameters-6",
            "publisher": "IANA",
            "status": "IANA Parameter Assignment",
            "title": "STUN Error Codes",
            "date": "April 2011"
        },
        "IANA-HASH-FUNCTION": {
            "href": "https://www.iana.org/assignments/hash-function-text-names/hash-function-text-names.xml",
            "publisher": "IANA",
            "title": "Hash Function Textual Names"
        }
    }
};

function toggleTestAnnotations() {
  if (!document.querySelector("[data-navigable-selector]")) {
    const navigationScript = document.createElement("script");
    navigationScript.setAttribute("data-navigable-selector", ".needs-tests");
    navigationScript.setAttribute("src", "https://w3c.github.io/htmldiff-nav/index.js");
    document.querySelector("head").appendChild(navigationScript);
  }
  document.querySelector("body").classList.toggle("testcoverage");
}
window.respecUI.addCommand("Toggle test annotations", toggleTestAnnotations);
