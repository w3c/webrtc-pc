## WebRTC 1.0: Real-time Communication Between Browsers

This document defines a set of ECMAScript APIs in WebIDL to allow media to be
sent to and received from another browser or device implementing the appropriate
set of real-time protocols. This specification is being developed in conjunction
with a protocol specification developed by the IETF RTCWEB group and an API
specification to get access to local media devices developed by the Media
Capture Task Force.

### Published Versions

The top-of-tree of this document may contain work in progress changes and other
inconsistencies, so please review and report bugs against the latest editor's
draft.

[Latest editor's draft](https://w3c.github.io/webrtc-pc/)  
[Latest published version](http://www.w3.org/TR/webrtc/)

### Useful Links

The content of this document is discussed at the
[public-webrtc](http://lists.w3.org/Archives/Public/public-webrtc/)
mailing list.

[RTCWeb IETF Working Group](https://tools.ietf.org/wg/rtcweb/)

### Contribution Guidelines
Since we are a lot of people contributing to the specification, we have defined a few guidelines. Please follow them and we will be able to review your PR a lot faster when we don't have to point out style and other non-technical issues. Thank you.

#### 80 Characters
Format new text to break each line within 80 characters. If you add a few new words to an existing paragraph, it's OK if that line exceeds 80 characters. If fixing the width means that the next line gets to wide, and so on, it's better to leave it since touching a lot of lines unrelated to the actual fix makes the PR harder to review. We will make automatic re-flows of the document every once in a while.

#### Pull Request Names
Choose a name for your PR that would make sense in a change log.  
Example: Add support for new attribute X on Y (fixes: #123).  
Avoid: Fix for #123.

#### Linked Names
Make names of interfaces, enums and other identifiers clickable like this ```<code><a>MediaStreamTrack</a></code>```.

#### JSEP References
Reference specific sections of JSEP where possible. The syntax looks like this:  
```<span data-jsep="initial-offers initial-answers">[[!JSEP]]</span>```  
Section aliases, to be used as data-jsep values, are found in [jsep-mapping/map.json](jsep-mapping/map.json). Information on how to update the map is found in [jsep-mapping/README.md](jsep-mapping/README.md).

#### Refactoring: Moving Text
If your PR needs to both move a section of text and update it, please do these operations in two separate commits (or even PRs). That will make the review process simpler.
