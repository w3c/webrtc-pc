Since we are a lot of people contributing to the specification, we have defined a few guidelines. Please follow them and we will be able to review your PR a lot faster when we don't have to point out style and other non-technical issues. Thank you.

### W3C Legal
Contributions to this repository are intended to become part of Recommendation-track documents governed by the
[W3C Patent Policy](https://www.w3.org/Consortium/Patent-Policy-20040205/) and
[Document License](https://www.w3.org/Consortium/Legal/copyright-documents). To bring substantive contributions to specifications, you must either participate
in the relevant W3C Working Group or make a non-member patent licensing commitment.

If you are not the sole contributor to a contribution (pull request), please identify all contributors in the 
commit message. In the commit, please include on a new line,
<pre>Contributors: +@githubusername1, +@githubusername2, ...</pre>

### 80 Characters
Format new text to break each line within 80 characters. If you add a few new words to an existing paragraph, it's OK if that line exceeds 80 characters. If fixing the width means that the next line gets to wide, and so on, it's better to leave it since touching a lot of lines unrelated to the actual fix makes the PR harder to review. We will make automatic re-flows of the document every once in a while.

### Pull Request Names
Choose a name for your PR that would make sense in a change log.  
Example: Add support for new attribute X on Y (fixes: #123).  
Avoid: Fix for #123.

### Linked Names
Make names of interfaces, enums and other identifiers clickable like this ```<code><a>MediaStreamTrack</a></code>```.

### JSEP References
Reference specific sections of JSEP where possible. The syntax looks like this:  
```<span data-jsep="initial-offers initial-answers">[[!JSEP]]</span>```  
Section aliases, to be used as data-jsep values, are found in [jsep-mapping/map.json](jsep-mapping/map.json). Information on how to update the map is found in [jsep-mapping/README.md](jsep-mapping/README.md).

### Refactoring: Moving Text
If your PR needs to both move a section of text and update it, please do these operations in two separate commits (or even PRs). That will make the review process simpler.

### Style Conventions

**Strings**. Use quotes and enclose in code tags (to distinguish strings literals from quoted prose).
Example: `<code>"String literal"</code>`

**Booleans**. Enclose booleans in code tags (without quotes).\
Example: `<code>true</code>`

**Enum Values**. See **Strings**.

**Notes**. Use div tags for notes.\
Example: `<div class='note'>FYI</div>`

**Internal Slots**. Use upper camel case (initial upper case letter) with a leading backslash and enclosed by two brackets. The leading backslash prevents the text in double brackets from being interpreted as a reference. If a slot name is very general, like "Id", it might be useful to add more information to it to avoid name collisions and make it easier to identify its owning entity. For example, "Id" could be extended to "ComponentId".\
Example (defining): `<dfn>[[\FooBar]]</dfn>`\
Example (referencing): `<a>[[\FooBar]]</a>`

### Tests
For normative changes, a corresponding [web-platform-tests](https://github.com/w3c/web-platform-tests) PR is highly appreciated. Typically, both PRs will be merged at the same time. Note that a test change that contradicts the spec should not be merged before the corresponding spec change. If testing is not practical, please explain why and if appropriate [file a web-platform-tests issue](https://github.com/w3c/web-platform-tests/issues/new) to follow up later. Add the `type:untestable` or `type:missing-coverage` label as appropriate.
