let amendments;
var baseRec = document.createElement("html");

const PLUGIN_NAME = "amendments manager";

const differ = new HTMLTreeDiff();

function removeComments(el) {
  // Remove HTML comments
  const commentsIterator = document.createNodeIterator(el, NodeFilter.SHOW_COMMENT);
  let comment;
  while ((comment = commentsIterator.nextNode())) {
    comment.remove();
  }
}

function markInsertion(el, controller) {
  const wrapper = document.createElement("ins");
  if (el.tagName === "DIV" || el.tagName === "SECTION" || el.tagName === "DT"  || el.tagName === "DD"  || el.tagName === "LI") {
    // special casing the case where <div> is used to group <dt>/<dd>
    if (el.tagName === "DIV" && el.parentNode.tagName === "DL") {
      for (let child of el.children) {
	wrapChildNodes(child, document.createElement("ins"));
      }
      el.children[0].prepend(controller);
    } else {
      wrapChildNodes(el, wrapper);
      el.prepend(controller);
    }
  } else {
    wrapElement(el, wrapper);
    el.parentNode.insertBefore(controller, el);
  }
}

function wrapElement(el, wrapper) {
  el.parentNode.insertBefore(wrapper, el);
  wrapper.appendChild(el);
}

function wrapChildNodes(parent, wrapper) {
  // freeze the list by copying it in array
  const children = [...parent.childNodes];
  if (children.length) {
    parent.prepend(wrapper);
    for (let i in children) {
      wrapper.appendChild(children[i]);
    }
  }
}

function titleFromId(id) {
  const container = baseRec.querySelector(`#${id}`) ?? document.getElementById(id);
  if (!container) return id;
  return container.closest("section").querySelector("h1,h2,h3,h4,h5,h6").textContent;
}

function listPRs(pr, repoURL) {
  const span = document.createElement("span");
  span.appendChild(document.createTextNode(" ("));
  pr = Array.isArray(pr) ? pr : [pr];
  for (let i in pr) {
    const number = pr[i];
    const url = repoURL + "pull/" + number;
    const a = document.createElement("a");
    a.href = url;
    a.textContent = `PR #${number}`;
    span.appendChild(a);
    if (i < pr.length - 1) {
      span.appendChild(document.createTextNode(", "));
    }
  }
  span.appendChild(document.createTextNode(")"));
  return span;
}

function listTestUpdates(updates) {
  const s = document.createElement("span");
  if (updates === "not-testable") {
    s.textContent = " (not testable)";
  } else if (updates === "already-tested") {
    s.textContent = " (no change needed in tests)";
  } else if (Array.isArray(updates)) {
    s.textContent = " - Changes to Web Platform Tests: ";
    updates.forEach(u => {
      const link = document.createElement("a");
      link.href = "https://github.com/web-platform-tests/wpt/pull/" + u.split("#")[1];
      link.textContent = "#" + u.split("#")[1];
      s.append(link);
      s.append(" ");
    });
  }
  return s;
}

const capitalize = s => s[0].toUpperCase() + s.slice(1);

async function listAmendments(config, _, {showError}) {
  amendments = await fetch("amendments.json").then(r => r.json());
  baseRec.innerHTML = await fetch("base-rec.html").then(r => r.text());

  for (let id of Object.keys(amendments)) {
  }
  let m;
  let i = 0;
  let consolidatedAmendments = {};
  for (let id of Object.keys(amendments)) {
    // validate that an amendment is not embedded in another
    const container = document.getElementById(id) ?? baseRec.querySelector("#" + id);
    if (!container) {
      showError(`Unknown element with id ${id} identified in amendments, see https://github.com/w3c/webrtc-pc/blob/main/amendments.md for amendments management`, PLUGIN_NAME);
      continue;
    }
    if (amendments[id][0].difftype !== 'append') {
      const embedded = Object.keys(amendments).filter(iid => iid !== id).find(iid => container.querySelector("#" + iid));
      if (embedded) {
	showError(`The container with id ${id} marked as amended cannot embed the other container of amendment ${embedded}, see https://github.com/w3c/webrtc-pc/blob/main/amendments.md for amendments management`, PLUGIN_NAME, {elements: [container]});
      }
    }
    // validate that a section has only one difftype, one amendment type, one amendment status
    if (amendments[id].some(a => a.difftype && a.difftype !== amendments[id][0].difftype)) {
      showError(`Amendments in container with id ${id} are mixing "modification" and "append" difftypes, see https://github.com/w3c/webrtc-pc/blob/main/amendments.md for amendments management`, PLUGIN_NAME, {elements: [container]});
    }
    if (amendments[id].some(a => a.type !== amendments[id][0].type)) {
      //throw new Error(`Amendments in container with id ${id} are mixing "corrections" and "addition" types`);
    }
    if (amendments[id].some(a => a.status !== amendments[id][0].status)) {
      showError(`Amendments in container with id ${id} are mixing "candidate" and "proposed" amendments, see https://github.com/w3c/webrtc-pc/blob/main/amendments.md for amendments management`, PLUGIN_NAME, {elements: [container]});
    }

    // Group by candidate id for listing in the appendix
    for (let amendment of amendments[id]) {
      if (!consolidatedAmendments[amendment.id]) {
	consolidatedAmendments[amendment.id] = [];
      }
      consolidatedAmendments[amendment.id].push({...amendment, section: id});
    }
  }
  if (document.getElementById("changes")) {
    const ul = document.createElement("ul");
    Object.values(consolidatedAmendments).forEach((amendment) => {
      const {status, id, type} = amendment[0];
      const li = document.createElement("li");
      const entriesUl = document.createElement("ul");
      li.appendChild(document.createTextNode(`${capitalize(status)} ${capitalize(type)} ${id}: `));
      amendment.forEach(({description, section, pr, testUpdates}, i) => {
	const entryLi = document.createElement("li");
	entryLi.innerHTML = description;
        const link = document.createElement("a");
	entryLi.appendChild(document.createTextNode(" - "));
        link.href = "#" + section;
        link.textContent = `section ${titleFromId(section)}`;
        entryLi.appendChild(link);
	entryLi.appendChild(listPRs(pr, config.github.repoURL));
	entryLi.appendChild(listTestUpdates(testUpdates));
	entriesUl.appendChild(entryLi);
      });
      li.appendChild(entriesUl);
      ul.appendChild(li);
    });
    document.getElementById("changes").appendChild(ul);
  }
}

const makeIdlDiffable = pre => {
  pre.querySelector(".idlHeader").remove();
  pre.textContent = pre.textContent ;
};

async function showAmendments(config, _, {showError}) {
  for (let section of Object.keys(amendments)) {
    const target = document.getElementById(section);
    let wrapper = document.createElement("div");
    if (amendments[section][0].difftype !== "append") {
      if (["LI", "DD"].includes(target?.tagName)) {
	wrapper = document.createElement(target.tagName);
	wrapper.className = "skip";
      }
    } else {
      if (["DL"].includes(target?.tagName)) {
	wrapper = document.createElement("dt");
      }
    }
    wrapper.id = section + "-change-wrapper";
    const annotations = [];
    for (let {description, id, difftype, status, type, pr} of amendments[section]) {
      // integrate the annotations for candidate/proposed amendments
      // only when Status = REC
      // (but keep them all in for other statuses of changes)
      if (config.specStatus !== "REC" && (["correction", "addition"].includes(type) || ["candidate", "proposed"].includes(status))) {
	continue;
      }
      const amendmentDiv = document.createElement("div");
      amendmentDiv.className = type;
      const marker = document.createElement("span");
      marker.className = "marker";
      marker.textContent = `${capitalize(status)} ${capitalize(type)} ${id}:`;
      const title = document.createElement("span");
      title.innerHTML = description;
      amendmentDiv.appendChild(marker);
      amendmentDiv.appendChild(title);
      amendmentDiv.appendChild(listPRs(pr, config.github.repoURL));
      annotations.push(amendmentDiv);
    }

    for (let div of annotations) {
      wrapper.appendChild(div);
    }
    if (annotations.length) {
      const amendmentTitle = `${capitalize(amendments[section][0].status)} ${capitalize(amendments[section][0].type)}${amendments[section].length > 1 ? "s" : ""} ${amendments[section].map(a => `${a.id}`).join(', ')}`;
      const ui = document.createElement("fieldset");
      ui.className = "diff-ui";
      ui.innerHTML = `<label><input aria-controls="${section}" name="change-${section}" class=both checked type=radio> Show Current and Future</label><label><input name="change-${section}" class=current type=radio> Show Current</label><label><input name="change-${section}" class=future type=radio>Show Future</label>`;
      wrapper.appendChild(ui);
      if (amendments[section][0].difftype === "modify" || !amendments[section][0].difftype) {
	ui.querySelectorAll('input[type="radio"]').forEach(inp => {
	  inp.setAttribute("aria-controls", `${section}`);
	});
	ui.classList.add("modify");
	const containerOld = baseRec.querySelector("#" + section);
	if (!containerOld) {
	  showError(`Unknown element with id ${section} in Recommendation used as basis, see https://github.com/w3c/webrtc-pc/blob/main/amendments.md for amendments management`, PLUGIN_NAME);
	  continue;
	}
	const containerNew = document.getElementById(section)?.cloneNode(true);
	if (!containerNew) {
	  showError(`No element with id ${section} in editors draft, see https://github.com/w3c/webrtc-pc/blob/main/amendments.md for amendments management`, PLUGIN_NAME);
	  continue;
	}
	removeComments(containerNew);
	containerNew.querySelectorAll(".removeOnSave").forEach(el => el.remove());
	const container = document.getElementById(section);
	container.innerHTML = "";
	// Use text-only content for pre - syntax highlights
	// messes it up otherwise
	if (containerNew.matches("pre.idl")) makeIdlDiffable(containerNew);
	containerNew.querySelectorAll("pre.idl").forEach(makeIdlDiffable);
	if (containerOld.matches("pre.idl")) makeIdlDiffable(containerOld);
	containerOld.querySelectorAll("pre.idl").forEach(makeIdlDiffable);
	await differ.diff(container, containerOld, containerNew);
	container.parentNode.insertBefore(wrapper, container);
      } else if (amendments[section][0].difftype === "append") {
	ui.classList.add("append");
	const appendedEl = document.getElementById(section);
	if (!appendedEl) {
	  showError(`No element with id ${section} in editors draft, see https://github.com/w3c/webrtc-pc/blob/main/amendments.md for amendments management`, PLUGIN_NAME);
	  continue;
	}
	appendedEl.setAttribute("aria-label", `Addition from ${amendmentTitle}`);
	appendedEl.classList.add('diff-new');
	markInsertion(appendedEl, wrapper);
	ui.querySelectorAll('input[type="radio"]').forEach(inp => {
	  inp.setAttribute("aria-controls", `${section}`);
	});
      }
    }
  }
  // We clean up any remaining duplicate ids that might be left
  const elements = [...document.querySelectorAll('[id]')];
  const ids = [];
  const dups = [];
  elements.forEach(el => ids.includes(el.id) ? dups.push(el) : ids.push(el.id));
  dups.forEach((el, i) => el.id = el.id + "-dedup-" + i);
}
