var respecConfig = {
  specStatus: "ED",
  // if there a publicly available Editor's Draft, this is the link
  edDraftURI: "https://rawgit.com/w3c/webrtc-pc/master/simulcast.html",
  shortName: "webrtc-simulcast",
  editors:  [
    //              { name: "Your Name", url: "http://example.org/",
    //                company: "Your Company", companyURL: "http://example.com/" },
    { name: "Adam Bergkvist", company: "Ericsson",
      w3cid: "45507"
    },
    { name: "Daniel C. Burnett", company: "Invited Expert",
      w3cid: "85118"
    },
    { name: "Cullen Jennings", company: "Cisco",
      w3cid: "25254"
    },
    { name: "Bernard Aboba", company: "Microsoft Corporation",
      w3cid: "65611"
    },
    { name: "Taylor Brandstetter", company: "Google",
      w3cid: "82908"
    },
    { name: "Jan-Ivar Bruaroey", company: "Mozilla",
      w3cid: "79152"
    }
  ],
  authors: [
  ],
  wg: "Web Real-Time Communications Working Group",
  wgURI: "https://www.w3.org/2011/04/webrtc/",
  wgPublicList: "public-webrtc",
  wgPatentURI:  "https://www.w3.org/2004/01/pp-impl/47318/status",
  issueBase: "https://github.com/w3c/webrtc-pc/issues",
  otherLinks: [
    {
      key: "Participate",
      data: [
        {
          value: "Mailing list",
          href: "https://lists.w3.org/Archives/Public/public-webrtc/"
        },
        {
          value: "Browse open issues",
          href: "https://github.com/w3c/webrtc-pc/issues"
        },
        {
          "value": "IETF RTCWEB Working Group",
          "href": "https://tools.ietf.org/wg/rtcweb/"
        }
      ]
    }
  ],
  localBiblio: {
    "IANA-STUN-6": {
      "title": "STUN Error Codes",
      "href": "https://www.iana.org/assignments/stun-parameters/stun-parameters.xhtml#stun-parameters-6",
      "publisher": "IANA"
    },
    "JSEP": {
      "title": "Javascript Session Establishment Protocol",
      "href": "https://tools.ietf.org/html/draft-ietf-rtcweb-jsep",
      "authors": [
        "J. Uberti",
        "C. Jennings",
        "E. Rescorla"
      ],
      "status": "10 October 2017. Internet Draft (work in progress)",
      "publisher": "IETF"
    },
    "RFC6184": {
      "title": "RTP Payload Format for H.264 Video",
      "href": "https://tools.ietf.org/html/rfc6184",
      "authors": [
        "Y.-K.. Wang",
        "R. Even",
        "T. Kristensen",
        "R. Jesup"
      ],
      "status": "May 2011. RFC",
      "publisher": "IETF"
    },
    "RFC6190": {
      "title": "RTP Payload Format for Scalable Video Coding",
      "href": "https://tools.ietf.org/html/rfc6190",
      "authors": [
        "S. Wenger",
        "Y.-K. Wang",
        "T. Schierl",
        "A. Eleftheriadis"
      ],
      "status": "May 2011. RFC",
      "publisher": "IETF"
    },
    "RFC7741": {
      "title": "RTP Payload Format for VP8 Video",
      "href": "https://tools.ietf.org/html/rfc7741",
      "authors": [
        "P. Westin",
        "H. Lundin",
        "M. Glover",
        "J. Uberti",
        "F. Galligan"
      ],
      "status": "March 2016. RFC",
      "publisher": "IETF"
    },
    "MMUSIC-RID": {
      "title": "RTP Payload Format Restrictions",
      "href": "https://tools.ietf.org/html/draft-ietf-mmusic-rid",
      "authors": [
        "P. Thatcher",
        "M. Zanaty",
        "S. Nandakumar",
        "B. Burman",
        "A. Roach",
        "B. Campen"
      ],
      "status": "15 May 2018. Internet Draft (work in progress)",
      "publisher": "IETF"
    },
    "RID": {
      "title": "RTP Stream Identifier Source Description (SDES)",
      "href": "https://tools.ietf.org/html/draft-ietf-avtext-rid",
      "authors": [
        "A. Roach",
        "S. Nandakumar",
        "P. Thatcher"
      ],
      "status": "06 October 2016. Internet Draft (work in progress)",
      "publisher": "IETF"
    },
    "RTCWEB-SECURITY": {
      "title": "Security Considerations for WebRTC",
      "href": "https://tools.ietf.org/html/draft-ietf-rtcweb-security",
      "authors": [
        "E. Rescorla"
      ],
      "status": "29 October 2017. Internet Draft (work in progress)",
      "publisher": "IETF"
    },
    "RTCWEB-SECURITY-ARCH": {
      "title": "WebRTC Security Architecture",
      "href": "https://tools.ietf.org/html/draft-ietf-rtcweb-security-arch",
      "authors": [
        "E. Rescorla"
      ],
      "status": "30 October 2017. Internet Draft (work in progress)",
      "publisher": "IETF"
    },
    "WEBRTC-STATS": {
      "title": "Identifiers for WebRTC's Statistics API",
      "href": "https://w3c.github.io/webrtc-stats/",
      "authors": [
        "Harald Alvestrand",
        "Varun Singh"
      ],
      "status": "29 October 2017 (work in progress)",
      "publisher": "W3C"
    }
  }
}
