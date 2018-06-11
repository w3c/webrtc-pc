# Some Notes on Testing

Here is some background on creating web platform tests:  
http://web-platform-tests.org/writing-tests/index.html  
http://web-platform-tests.org/reviewing-tests/index.html

A simple way to create a new test is to copy an existing one and modify it to fit your needs. Below is a list of example tests that you can base your test on.

Example of test that tests things that should work and things that shouldn't.  
https://wpt.fyi/webrtc/RTCCertificate.html

Thorough example that tests the difference between undefined and null in dictionaries.  
https://wpt.fyi/webrtc/RTCDataChannelEvent-constructor.html

## Naming Guidelines

Update to WebIDL definitions in the spec must also update the IDL test file at [/interfaces/webrtc-pc.idl](https://github.com/web-platform-tests/wpt/blob/master/interfaces/webrtc-pc.idl).
A [helper script](http://web-platform-tests.org/writing-tests/idlharness.html)
can be pasted in the console to generate IDL code from the spec HTML. Note that
partial dictionary definition is not supported in idlharness.js, so some manual
editing is required to merge them as one dictionary definition.

In general, a test case written for a class _RTCClass_ on a method _rtcMethod_
should be added to a file named _RTCClass_-_rtcMethod\[-custom-postfix\]_\[.https].html.
The `.https` extension is _required_ for tests calling `getUserMedia()`.

When a test file contain too many test cases, they may be split into multiple
files with different postfixes, e.g. RTCPeerConnection-setLocalDescription-offer.html

Sometimes the test files are named based on the argument dictionary name and the
tested field, e.g. RTCConfiguration-iceServers.html.

A helper JavaScript file may be added to share helper functions across multiple
test files. Helper functions are exposed as global variables and included as
script tags inside test files. (We may consider using ES modules instead if it
become widely available for WPT) Helper files should have as little dependency
to other helper files, as script tags are not good for dependency management.

## Comments

The current tests have detailed comments referencing sections of the spec that
is being tested. New tests may be written with minimal or no comments up to the
author's preference. If a test case is testing specific steps in a large spec,
it can be helpful to point to that section with either a comment or a "help
link" `(Example: <link rel="help" href="https://w3c.github.io/webrtc-pc/#foo-section">)`

An issue with having too detailed reference comment is they may get outdated when
there is update to the spec. When submitting test PR to update an existing test
file, the author is free to ignore the references, update the references, or
remove them altogether.
