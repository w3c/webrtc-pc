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

  // new ability to override the copyright completely
  overrideCopyright:  "<p class='copyright'>Initial Author of this Specification was Ian Hickson, Google Inc., with the following copyright statement:<br /> &#169; Copyright 2004-2011 Apple Computer, Inc., Mozilla Foundation, and Opera Software ASA. You are granted a license to use, reproduce and create derivative works of this document.</p> <p class='copyright'>All subsequent changes since 26 July 2011 done by the W3C WebRTC Working Group are under the following <a href='http://www.w3.org/Consortium/Legal/ipr-notice#Copyright'>Copyright</a>:<br />&#169; 2011-2015 <a href='http://www.w3.org/'><abbr title='World Wide Web Consortium'>W3C</abbr></a><sup>&#174;</sup> (<a href='http://www.csail.mit.edu/'><abbr title='Massachusetts Institute of Technology'>MIT</abbr></a>, <a href='http://www.ercim.eu/'><abbr title='European Research Consortium for Informatics and Mathematics'>ERCIM</abbr></a>, <a href='http://www.keio.ac.jp/'>Keio</a>, <a href='http://ev.buaa.edu.cn/'>Beihang<\/a>). <a href='http://www.w3.org/Consortium/Legal/copyright-documents'>Document use</a>  rules apply.</p> <p class='copyright'>For the entire publication on the W3C site the <a href='http://www.w3.org/Consortium/Legal/ipr-notice#Legal_Disclaimer'>liability</a> and <a href='http://www.w3.org/Consortium/Legal/ipr-notice#W3C_Trademarks'>trademark</a> rules apply.</p>",


  // if the specification's copyright date is a range of years, specify
  // the start date here:
  // copyrightStart: "2005",

  // if there is a previously published draft, uncomment this and set its YYYY-MM-DD
  prevED: "https://w3c.github.io/webrtc-pc/archives/20151123/webrtc.html",

  // if there a publicly available Editor's Draft, this is the link
  edDraftURI: "http://w3c.github.io/webrtc-pc/",

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
    { name: "Adam Bergkvist", company: "Ericsson" },
    { name: "Daniel C. Burnett", company: "Invited Expert" },
    { name: "Cullen Jennings", company: "Cisco" },
    { name: "Anant Narayanan", company: "Mozilla (until November 2012)" },
    { name: "Bernard Aboba", company: "Microsoft Corporation" }
  ],

  // authors, add as many as you like.
  // This is optional, uncomment if you have authors as well as editors.
  // only "name" is REQUIRED. Same format as editors.

  //authors:  [
  //    { name: "Your Name", url: "http://example.org/",
  //      company: "Your Company", companyURL: "http://example.com/" }
  //],

  // name of the WG
  wg:           "Web Real-Time Communications Working Group",

  // URI of the public WG page
  wgURI:        "http://www.w3.org/2011/04/webrtc/",

  // name (without the @w3c.org) of the public mailing to which comments are due
  wgPublicList: "public-webrtc",

  // URI of the patent status for this WG, for Rec-track documents
  // !!!! IMPORTANT !!!!
  // This is important for Rec-track documents, do not copy a patent URI from a random
  // document unless you know what you're doing. If in doubt ask your friendly neighbourhood
  // Team Contact.
  wgPatentURI:  "http://www.w3.org/2004/01/pp-impl/47318/status",
  issueBase: "https://github.com/w3c/webrtc-pc/issues/",
  otherLinks: [
    {
      key: "Participate",
      data: [
        {
          value: "Mailing list",
          href: "http://lists.w3.org/Archives/Public/public-webrtc/"
        },
        {
          value: "Browse open issues",
          href: "https://github.com/w3c/webrtc-pc/issues"
        },
        {
          value: "IETF RTCWEB Working Group",
          href: "https://tools.ietf.org/wg/rtcweb/"
        }
      ]
    }
  ],
  useExperimentalStyles: true,
  preProcess: [
      function linkToJsep() {
          var xhr = new XMLHttpRequest();
          xhr.open('GET', 'jsep-mapping/map.json');
          xhr.onload = function(e) {
              var data = JSON.parse(this.responseText);
              if (respecConfig.localBiblio.JSEP.date !== data.metadata.date) {
                  respecEvents.pub("warn", "Date of JSEP draft in localBiblio (" + respecConfig.localBiblio.date + ") does not match date of JSEP draft used in map.json (" + data.metadata.date + ").");
              }
              // Replace all
              //    <span data-jsep="foo">[[!JSEP]]</a>
              // with
              //    <span>[[!JSEP]] (<a href="...#X.Y">section X.Y.</a>)
              // based on mapping maintained in jsep-mapping/map.json
              Array.prototype.forEach.call(
                  document.querySelectorAll("*[data-jsep]"),
                  function (el) {
                      var jsepAnchors = el.dataset.jsep.split(" ");
                      var jsepSections = jsepAnchors.map(function (s) { return data.sections["sec." + s];});
                      if (jsepSections.indexOf(undefined) !== -1) {
                          respecEvents.pub("warn", "Reference to inexistent JSEP section in '" + el.dataset.jsep + "': unrecognized anchor #" + jsepSections.indexOf(undefined) + " 'sec." + jsepAnchors[jsepSections.indexOf(undefined)] + "'.");
                          return;
                      }
                      el.removeAttribute("data-jsep");
                      el.appendChild(document.createTextNode(" ("));
                      jsepSections.forEach(function (s, i) {
                          var sectionLink = document.createElement("a");
                          sectionLink.href = "https://tools.ietf.org/html/draft-ietf-rtcweb-jsep-" + data.metadata.version + "#section-" +  s.slice(0, s.length - 1);
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
        "JSEP": {
            "authors":["Justin Uberti","Cullen Jennings","Eric Rescorla"],
            "href": "http://datatracker.ietf.org/doc/draft-ietf-rtcweb-jsep/",
            "publisher": "IETF",
            "status": "Active Internet-Draft",
            "title": "Javascript Session Establishment Protocol",
            "date": "18 October 2015"
        }
    }
};
