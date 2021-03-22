# Procedure for adding new features to webrtc-pc

The WebRTC-PC spec is now a W3C Rec..

This means that we should revise it no more often than every 6 months or so, and only
incorporate new features that are appropriate for "recycle at REC".

This means that we have, at any given moment, 3 different documents to consider:

* WebRTC-PC (REC)
* WebRTC-PC (Editors' draft)
* WebRTC-Extensions

## Incubation

In order to have a new feature considered for inclusion, write it up as an extension spec
or as a pull request against webrtc-extensions.

## Landing in webrtc-extensions

We will land extensions in webrtc-extensions on the following criteria:

* There is rough consensus in the WG that this API makes sense to consider
* There is commitment from at least one browser vendor that they intend to implement

## Documenting implementations

The chief mechanism to verify implementations is the Web Platform Tests suite.

In order to be considered for integration, a new extension must have:

* Reasonable test coverage
* Two passing implementation

## Merging to webrtc-pc

Once a feature is cleared for integration, a pull request is made for moving the feature
into webrtc-pc and removing it from webrtc-extensions.

At the same time, its tests should be moved from where they live into webrtc's WPT suite.


## Changes not subject to incubation

Changes that are pure bug fixes, or patch significant security holes in WebRTC, can be merged
directly to webrtc-pc at any time.

