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
  previousMaturity: "CR",
  previousPublishDate: "2019-12-13",
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
  xref: ["dom", "hr-time", "webidl", "html", "mediacapture-streams", "fileapi", "webrtc-stats"],
  preProcess: [
    highlightTests,
    markTestableAssertions,
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
    }
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
