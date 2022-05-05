document.addEventListener("DOMContentLoaded", () => {
  // This is needed to make it work both in static rendering of the spec
  // and in dynamic respec rendering
  (document.respec ? document.respec.ready : Promise.resolve()).then(() => {
	document.querySelectorAll(".diff-ui").forEach(ui => {
	// the radio input is of the form change-[id_of-section]
	const id = ui.querySelector("input").name.slice("change-".length);
	if (ui.classList.contains("modify")) {
	  ui.addEventListener("change", e => {
	    document.getElementById(id).hidden = (e.target.className !== "current");
	    document.getElementById(id + "-new").hidden = (e.target.className === "current");
	  });
	} else if (ui.classList.contains("append")) {
	  ui.addEventListener("change", ev => {
	    document.querySelectorAll(`.add-to-${id}`).forEach(el => el.hidden = (ev.target.className === "current"));
	  });
	}
      });
      });
});
