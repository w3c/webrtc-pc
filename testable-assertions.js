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

function showTestAnnotations() {
  if (location.search.match(/viewTests/)) {
    toggleTestAnnotations();
  }
}

function toggleTestAnnotations() {
  if (!document.querySelector("[data-navigable-selector]")) {
    const navigationScript = document.createElement("script");
    navigationScript.setAttribute("data-navigable-selector", ".needs-tests");
    navigationScript.setAttribute("src", "https://w3c.github.io/htmldiff-nav/index.js");
    document.querySelector("head").appendChild(navigationScript);
  }
  document.querySelector("body").classList.toggle("testcoverage");
}
