document.addEventListener("DOMContentLoaded", () => {
  // This is needed to make it work both in static rendering of the spec
  // and in dynamic respec rendering
  (document.respec ? document.respec.ready : Promise.resolve()).then(() => {
	document.querySelectorAll(".diff-ui").forEach(ui => {
	// the radio input is of the form change-[id_of-section]
	const id = ui.querySelector("input").name.slice("change-".length);
	if (ui.classList.contains("modify")) {
	    ui.addEventListener("change", e => {
	      document.getElementById(id).querySelectorAll('del').forEach(el => el.hidden = (e.target.className === "future"));
	      document.getElementById(id).querySelectorAll('ins').forEach(el => el.hidden = (e.target.className === "current"));
	  });
	} else if (ui.classList.contains("append")) {
	  ui.addEventListener("change", ev => {
	    const el = document.getElementById(id);
	    const hiddenState = ev.target.className === "current";
	    if (el.querySelector(".diff-ui")) {
	      el.querySelector("ins").hidden = hiddenState;
	    } else {
	      el.hidden = hiddenState;
	    }
	  });
	}
      });
      });
});
