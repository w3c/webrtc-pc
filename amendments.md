* Identify the `id` of the element that wraps the amended content (or alternatively, add a container and/or an `id` to base-rec.html and the relevant block in the editors draft)
* Add an array under that `id` as top level key in `amendments.json`, or complete the existing array if that `id` is already used
* Add an an object to that array with keys:
  * `description`: an HTML description of what the change is,
  * `dittype` (optional): defaults to "modify" (only the content of the block has changed); can also be "append" (in which case the added blocks in the editors draft should have the class `add-to-`*id*)
  * `pr`: the number of the pull request where the amendment was merged (or an array thereof),
  * `type`: ["correction"](https://www.w3.org/2021/Process-20211102/#candidate-correction) or ["addition"](https://www.w3.org/2021/Process-20211102/#candidate-addition),
  * `status`: ["candidate"](https://www.w3.org/2021/Process-20211102/#candidate-amendment) or ["proposed"](https://www.w3.org/2021/Process-20211102/#last-call-review),
  * `id` (an incremented number, possibly tying together several changes made across different sections)

Limitations:
* does not allow to handle different type of changes ("modification" vs "append") in a single section - treating all of them as modification should suffice in such a situation
* does not allow to handle different type of amendment ("correction" vs "addition") or different status of amendment ("candidate" vs "proposed") in a single section - the only alternative is to find a lower granularity section should that be needed