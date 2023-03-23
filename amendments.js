let amendments;
var baseRec = document.createElement("html");

function wrap(el, wrapper) {
  if (el.tagName === "DIV" || el.tagName === "SECTION"  || el.tagName === "P"  || el.tagName === "DT"  || el.tagName === "DD"  || el.tagName === "LI") {
    wrapChildren(el, wrapper);
  } else {
    wrapElement(el, wrapper);
  }
}

function wrapElement(el, wrapper) {
  el.parentNode.insertBefore(wrapper, el);
  wrapper.appendChild(el);
}


function wrapChildren(parent, wrapper) {
  const children = [...parent.childNodes];
  if (children && children.length) {
    parent.insertBefore(wrapper, children[0]);
    for (let i in children) {
      wrapper.appendChild(children[i]);
    }
  }
}

function containerFromId(id) {
  const container = baseRec.querySelector('#' + id);
  if (!container) {
    throw new Error(`Unknown element with id ${id} in Recommendation used as basis, see https://github.com/w3c/webrtc-pc/blob/main/amendments.md for amendments management`);
  }
  return container;
}

function titleFromId(id) {
  const container = baseRec.querySelector('#' + id);
  if (!container) return id;
  return container.closest("section").querySelector("h1,h2,h3,h4,h5,h6").textContent;
}

function listPRs(pr) {
  const span = document.createElement("span");
  span.appendChild(document.createTextNode(" ("));
  pr = Array.isArray(pr) ? pr : [pr];
  for (let i in pr) {
    const number = pr[i];
    const url = respecConfig.github.repoURL + "pull/" + number;
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

const capitalize = s => s[0].toUpperCase() + s.slice(1);

async function listAmendments() {
  amendments = await fetch("amendments.json").then(r => r.json());
  baseRec.innerHTML = await fetch("base-rec.html").then(r => r.text());

  for (let id of Object.keys(amendments)) {
  }
  let m;
  let i = 0;
  let consolidatedAmendments = {};
  for (let id of Object.keys(amendments)) {
    // validate that an amendment is not embedded in another
    const container = containerFromId(id);
    if (amendments[id][0].difftype !== 'append') {
      const embedded = Object.keys(amendments).filter(iid => iid !== id).find(iid => container.querySelector("#" + iid));
      if (embedded) {
	throw new Error(`The container with id ${id} marked as amended cannot embed the other container of amendment ${embedded}, see https://github.com/w3c/webrtc-pc/blob/main/amendments.md for amendments management`);
      }
    }
    // validate that a section has only one difftype, one amendment type, one amendemnt status
    if (amendments[id].some(a => a.difftype && a.difftype !== amendments[id][0].difftype)) {
      throw new Error(`Amendments in container with id ${id} are mixing "modification" and "append" difftypes, see https://github.com/w3c/webrtc-pc/blob/main/amendments.md for amendments management`);
    }
    if (amendments[id].some(a => a.type !== amendments[id][0].type)) {
      //throw new Error(`Amendments in container with id ${id} are mixing "corrections" and "addition" types`);
    }
    if (amendments[id].some(a => a.status !== amendments[id][0].status)) {
      throw new Error(`Amendments in container with id ${id} are mixing "candidate" and "proposed" amendments, see https://github.com/w3c/webrtc-pc/blob/main/amendments.md for amendments management`);
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
      amendment.forEach(({description, section, pr}, i) => {
	const entryLi = document.createElement("li");
	entryLi.innerHTML = description;
        const link = document.createElement("a");
	entryLi.appendChild(document.createTextNode(" - "));
        link.href = "#" + section;
        link.textContent = `section ${titleFromId(section)}`;
        entryLi.appendChild(link);
	entryLi.appendChild(listPRs(pr));
	entriesUl.appendChild(entryLi);
      });
      li.appendChild(entriesUl);
      ul.appendChild(li);
    });
    document.getElementById("changes").appendChild(ul);
  }
}

function showAmendments() {
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
      if (respecConfig.specStatus !== "REC" && (["correction", "addition"].includes(type) || ["candidate", "proposed"].includes(status))) {
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
      amendmentDiv.appendChild(listPRs(pr));
      annotations.push(amendmentDiv);
    }

    for (let div of annotations) {
      wrapper.appendChild(div);
    }
    if (annotations.length) {
      const amendmentTitle = `${capitalize(amendments[section][0].status)} ${capitalize(amendments[section][0].type)}${amendments[section].length > 1 ? "s" : ""} ${amendments[section].map(a => `${a.id}`).join(', ')}`;
      const ui = document.createElement("fieldset");
      ui.className = "diff-ui";
      ui.innerHTML = `<label><input aria-controls="${section} ${section}-new" name="change-${section}" class=both checked type=radio> Show Current and Future</label><label><input name="change-${section}" class=current type=radio> Show Current</label><label><input name="change-${section}" class=future type=radio>Show Future</label>`;
      wrapper.appendChild(ui);
      if (amendments[section][0].difftype === "modify" || !amendments[section][0].difftype) {
	ui.querySelectorAll('input[type="radio"]').forEach(inp => {
	  inp.setAttribute("aria-controls", `${section} ${section}-new`);
	});
	ui.classList.add("modify");
	let containerOld = containerFromId(section);
	containerOld = containerOld.cloneNode(true);
	containerOld.classList.add("diff-old", "exclude");
	containerOld.setAttribute("aria-label", `Deletion from ${amendmentTitle}`);
	// clean up ids to avoid duplicates, but not for headings since they're required by pubrules
	containerOld.querySelectorAll("*:not(:is(h2,h3,h4,h5,h6))[id]").forEach(el => el.removeAttribute("id"));
	const containerNew = document.getElementById(section);
	if (!containerNew) throw new Error(`No element with id ${section} in editors draft, see https://github.com/w3c/webrtc-pc/blob/main/amendments.md for amendments management`);

	containerNew.classList.add("diff-new");
	containerNew.id += "-new";
	containerNew.setAttribute("aria-label", `Addition from ${amendmentTitle}`);
	containerNew.parentNode.insertBefore(containerOld, containerNew);
	containerNew.parentNode.insertBefore(wrapper, containerOld);
	wrap(containerOld, document.createElement("del"));
	wrap(containerNew, document.createElement("ins"));
      } else if (amendments[section][0].difftype === "append") {
	ui.classList.add("append");
	const appendBase = document.getElementById(section);
	appendBase.appendChild(wrapper);
	const controlledIds = [];
	document.querySelectorAll(`.add-to-${section}`).forEach((el,i) => {
	  el.setAttribute("aria-label", `Addition from ${amendmentTitle}`);
	  el.classList.add('diff-new');
	  el.id = `${section}-new-${i}`;
	  controlledIds.push(el.id);
	  wrap(el, document.createElement("ins"));
	});
	ui.querySelectorAll('input[type="radio"]').forEach(inp => {
	  inp.setAttribute("aria-controls", `${section} ${controlledIds.join(" ")}`);
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
