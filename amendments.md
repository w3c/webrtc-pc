* Identify the `id` of the element that wraps the amended content (or alternatively, add a container and/or an `id` to base-rec.html and the relevant block in the editors draft); an element with an `id` used to wrap an existing amendment cannot contain another such container - when such a situation arises, use the top-most container `id`
  * to mark up a container as removed in the new version, keep the element in the editors draft with the container `id` set, and add the class `diff-rm` to make sure it doesn't show up
* Add an array under that `id` as top level key in `amendments.json`, or complete the existing array if that `id` is already used
* Add an an object to that array with keys:
  * `description`: an HTML description of what the change is,
  * `difftype` (optional): defaults to "modify" (only the content of the block has changed); can also be "append" (in which case the `id` identifies the newly added blocks in the editors draft)
  * `pr`: the number of the pull request where the amendment was merged (or an array thereof),
  * `tests` (optional): list of path to WPT test files that illustrate the change,
  * `testUpdates`: either "already-tested", "not-testable", or an array of references to WPT pull requests where the changes to WPT were added (of the form "web-platform-tests/wpt#NNN" where NNN is the number of the pull request)
  * `type`: ["correction"](https://www.w3.org/2021/Process-20211102/#candidate-correction) or ["addition"](https://www.w3.org/2021/Process-20211102/#candidate-addition),
  * `status`: ["candidate"](https://www.w3.org/2021/Process-20211102/#candidate-amendment) or ["proposed"](https://www.w3.org/2021/Process-20211102/#last-call-review),
  * `id` (an incremented number, possibly tying together several changes made across different sections)

Limitations:
* does not allow to handle different type of changes ("modification" vs "append") in a single section - treating all of them as modification should suffice in such a situation
* does not allow to handle different status of amendment ("candidate" vs "proposed") in a single section - the only alternative is to find a lower granularity section should that be needed

# Upon publication of a new Recommendation that integrates amendments
* remove said amendments from amendments.json
* replace base-rec.html with the new static content of the Rec, and add in the `<head>`:
```html
<meta name="ROBOTS" content="noindex">
<style>
  /* copy of https://www.w3.org/TR/@@@/REC-webrtc-@@@/ only meant
  to be used to generate Rec with amendments */
  html { display: none}
</style>
```
