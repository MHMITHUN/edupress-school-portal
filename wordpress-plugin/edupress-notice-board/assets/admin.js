/**
 * EduPress Notice Board — admin behaviour (only on edupress_notice
 * screens). Deliberately tiny: colours the priority select by value and
 * asks before toggling the featured pin. The localized object
 * (edupressNoticeBoard) carries the REST root + a wp_rest nonce so future
 * enhancements (quick publish from the list table) can authenticate
 * without extra plumbing.
 */
(function () {
	"use strict";

	function init() {
		var select = document.getElementById("edupress_priority");
		if (select) {
			var sync = function () {
				select.classList.toggle("is-high", select.value === "high");
				select.classList.toggle("is-urgent", select.value === "urgent");
			};
			select.addEventListener("change", sync);
			sync();
		}

		var featured = document.getElementById("edupress_featured");
		if (featured) {
			featured.addEventListener("change", function () {
				if (featured.checked && window.edupressNoticeBoard && window.edupressNoticeBoard.i18n) {
					// Non-blocking confirmation for the pin action.
					if (!window.confirm(window.edupressNoticeBoard.i18n.confirmFeatured)) {
						featured.checked = false;
					}
				}
			});
		}
	}

	if (document.readyState === "loading") {
		document.addEventListener("DOMContentLoaded", init);
	} else {
		init();
	}
})();
