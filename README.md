## WebRTC 1.0: Real-time Communication Between Browsers

This document defines a set of ECMAScript APIs in WebIDL to allow media to be
sent to and received from another browser or device implementing the appropriate
set of real-time protocols. This specification is being developed in conjunction
with a protocol specification developed by the IETF RTCWEB group and an API
specification to get access to local media devices developed by the Media
Capture Task Force.

### Published Versions

While we have taken measures to reduce the frequency of build breakages
(such as freezing respec-w3c-common at version 8.7.1), the tip-of-tree of
this document may contain work in progress changes and other inconsistencies,
including an incomplete change log. If you want to review something more coherent,
review the latest editors' draft; these are published at intervals on the order of weeks.

* [Latest published editor's draft at github](https://w3c.github.io/webrtc-pc/)
* [Latest W3C published version](http://www.w3.org/TR/webrtc/) (automatically updated; should be identical to the latest editors' draft)

### Extensions and additions

This repo is the currently accepted REC version of the webrtc-pc specification, plus bug fixes.
New features are not accepted directly into this document.

For how to propose extensions and new features, study the
[merge guide](https://github.com/w3c/webrtc-charter/blob/gh-pages/merge-guide.md).

### Useful Links

The content of this document is discussed at the
[public-webrtc](http://lists.w3.org/Archives/Public/public-webrtc/)
mailing list.

[RTCWeb IETF Working Group](https://tools.ietf.org/wg/rtcweb/)

[Contribution Guidelines](CONTRIBUTING.md)

### Test coverage
Parts of the specification that need or have tests are marked with the `data-tests` attribute. If one or several tests exist for the said part in the [webrtc directory of WPT](https://github.com/web-platform-tests/wpt/tree/master/webrtc), fill the attribute with the comma-separated list of their filenames. If no test exists but tests are needed, keep the attribute with no value.

Thumbrules for where to put the `data-tests` attribute in the DOM:
* apply it only to content with normative language
* put it as high in the DOM as possible
* when set on an element, you assert that the said test case provides reasonable coverage of the entire content of the element
