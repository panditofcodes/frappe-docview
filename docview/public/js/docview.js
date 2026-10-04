(function () {
	"use strict";

	const Docview = {
		initialized: false,
		rendering: false,

		// =========================================================
		// CONFIG
		// =========================================================

		async get_config(doctype) {
			if (!doctype) {
				return null;
			}

			try {
				const response = await frappe.call({
					method: "docview.api.get_docview_config",
					args: {
						doctype: doctype,
					},
				});

				return response.message || null;
			} catch (error) {
				console.error("Docview: unable to load configuration", error);

				return null;
			}
		},

		// =========================================================
		// DOCVIEW ENABLED GUARD
		// =========================================================

		async is_enabled(doctype) {
			const config = await this.get_config(doctype);

			return !!(config && config.custom_jinja);
		},

		// =========================================================
		// RENDER DOCVIEW
		// =========================================================

		async render(frm, config = null) {
			if (!frm || !frm.doc || frm.is_new()) {
				return false;
			}

			if (this.rendering) {
				return false;
			}

			this.rendering = true;

			try {
				// -------------------------------------------------
				// ALWAYS VERIFY CONFIG BEFORE RENDERING
				// -------------------------------------------------

				if (!config) {
					config = await this.get_config(frm.doctype);
				}

				// -------------------------------------------------
				// DOCVIEW IS DISABLED
				// -------------------------------------------------

				if (!config || !config.custom_jinja) {
					this.disable_docview(frm);

					return false;
				}

				// -------------------------------------------------
				// GET RENDERED HTML
				// -------------------------------------------------

				const response = await frappe.call({
					method: "docview.api.get_docview_html",
					args: {
						doctype: frm.doctype,
						name: frm.doc.name,
					},
				});

				const result = response.message;

				// -------------------------------------------------
				// RENDERING FAILED / NO RESULT
				// -------------------------------------------------

				if (!result || !result.html) {
					this.disable_docview(frm);

					return false;
				}

				// -------------------------------------------------
				// MOUNT DOCVIEW
				// -------------------------------------------------

				this.mount(frm, result.html, result.css || "");

				return true;
			} catch (error) {
				console.error("Docview rendering failed:", error);

				this.disable_docview(frm);

				frappe.msgprint({
					title: __("Docview"),
					message: __("Unable to render the document view."),
					indicator: "red",
				});

				return false;
			} finally {
				this.rendering = false;
			}
		},

		// =========================================================
		// MOUNT DOCVIEW
		// =========================================================

		mount(frm, html, css) {
			const $form_layout = frm.$wrapper.find(".form-layout").first();

			if (!$form_layout.length) {
				console.warn("Docview: .form-layout not found");

				return;
			}

			let $docview = frm.$wrapper.find(".doc-view-inline").first();

			// -----------------------------------------------------
			// CREATE DOCVIEW CONTAINER
			// -----------------------------------------------------

			if (!$docview.length) {
				$docview = $(`
					<div class="doc-view-inline">
						<div class="doc-view-inline-toolbar"></div>
						<div class="doc-view-inline-content"></div>
					</div>
				`);

				$form_layout.before($docview);
			}

			const $content = $docview.find(".doc-view-inline-content");

			$content.empty();

			// -----------------------------------------------------
			// CUSTOM CSS
			// -----------------------------------------------------

			if (css) {
				const style = document.createElement("style");

				style.className = "docview-custom-style";

				style.textContent = css;

				$content.append(style);
			}

			// -----------------------------------------------------
			// CUSTOM HTML
			// -----------------------------------------------------

			$content.append(html);

			// -----------------------------------------------------
			// SWITCH VISIBILITY
			// -----------------------------------------------------

			$form_layout.hide();
			$docview.show();

			// -----------------------------------------------------
			// STATE
			// -----------------------------------------------------

			frm.__docview_active = true;
			frm.__docview_mode = "view";
			frm.__docview_rendered = true;

			// -----------------------------------------------------
			// IMPORTANT:
			// Native collapse button must NOT exist
			// while Docview is visible.
			// -----------------------------------------------------

			this.remove_collapse_button(frm);

			// -----------------------------------------------------
			// ADD FULL FORM BUTTON
			// -----------------------------------------------------

			this.add_full_form_button(frm);
		},

		// =========================================================
		// DISABLE DOCVIEW
		// =========================================================
		//
		// This is the master cleanup path when:
		//
		// - Docview is disabled
		// - configuration doesn't exist
		// - Jinja is missing
		// - rendering fails
		// - configuration was disabled after being enabled
		//
		// =========================================================

		disable_docview(frm) {
			if (!frm || !frm.$wrapper) {
				return;
			}

			const $docview = frm.$wrapper.find(".doc-view-inline").first();

			const $form_layout = frm.$wrapper.find(".form-layout").first();

			// -----------------------------------------------------
			// HIDE DOCVIEW
			// -----------------------------------------------------

			if ($docview.length) {
				$docview.hide();
			}

			// -----------------------------------------------------
			// SHOW NATIVE FORM
			// -----------------------------------------------------

			if ($form_layout.length) {
				$form_layout.show();
			}

			// -----------------------------------------------------
			// REMOVE BOTH DOCVIEW BUTTONS
			// -----------------------------------------------------

			this.remove_full_form_button(frm);
			this.remove_collapse_button(frm);

			// -----------------------------------------------------
			// RESET STATE
			// -----------------------------------------------------

			frm.__docview_active = false;
			frm.__docview_mode = "disabled";
			frm.__docview_rendered = false;
		},

		// =========================================================
		// SHOW NATIVE FORM
		// =========================================================

		show_native_form(frm, add_collapse = true) {
			if (!frm || !frm.$wrapper) {
				return;
			}

			const $docview = frm.$wrapper.find(".doc-view-inline").first();

			const $form_layout = frm.$wrapper.find(".form-layout").first();

			// -----------------------------------------------------
			// HIDE DOCVIEW
			// -----------------------------------------------------

			if ($docview.length) {
				$docview.hide();
			}

			// -----------------------------------------------------
			// SHOW NATIVE FORM
			// -----------------------------------------------------

			if ($form_layout.length) {
				$form_layout.show();
			}

			// -----------------------------------------------------
			// STATE
			// -----------------------------------------------------

			frm.__docview_active = false;
			frm.__docview_mode = "full";

			// -----------------------------------------------------
			// REMOVE DOCVIEW FULL FORM BUTTON
			// -----------------------------------------------------

			this.remove_full_form_button(frm);

			// -----------------------------------------------------
			// IMPORTANT:
			//
			// Only add collapse button when explicitly requested.
			//
			// If Docview is disabled, callers use:
			//
			// show_native_form(frm, false)
			//
			// -----------------------------------------------------

			if (add_collapse) {
				this.add_collapse_button(frm);
			} else {
				this.remove_collapse_button(frm);
			}
		},

		// =========================================================
		// DOCVIEW -> NATIVE FORM BUTTON
		// =========================================================

		add_full_form_button(frm) {
			if (!frm || !frm.$wrapper) {
				return;
			}

			const $docview = frm.$wrapper.find(".doc-view-inline").first();

			if (!$docview.length) {
				return;
			}

			const $toolbar = $docview.find(".doc-view-inline-toolbar").first();

			if (!$toolbar.length) {
				return;
			}

			// -----------------------------------------------------
			// PREVENT DUPLICATES
			// -----------------------------------------------------

			if ($toolbar.find(".doc-view-open-form-btn").length) {
				return;
			}

			const $button = $(`
				<button
					type="button"
					class="doc-view-open-form-btn"
					title="${__("Open Full Form")}"
					aria-label="${__("Open Full Form")}"
				>
					${frappe.utils.icon("expand", "sm")}
				</button>
			`);

			// -----------------------------------------------------
			// CLICK
			// -----------------------------------------------------

			$button.on("click", async () => {
				// Verify Docview is still enabled.
				const config = await this.get_config(frm.doctype);

				if (!config || !config.custom_jinja) {
					this.disable_docview(frm);

					return;
				}

				this.show_native_form(frm, true);
			});

			$toolbar.append($button);
		},

		// =========================================================
		// REMOVE DOCVIEW -> FORM BUTTON
		// =========================================================

		remove_full_form_button(frm) {
			if (!frm || !frm.$wrapper) {
				return;
			}

			frm.$wrapper.find(".doc-view-open-form-btn").remove();
		},

		// =========================================================
		// FIND FRAPPE TAB BAR
		// =========================================================

		get_tabs_list(frm) {
			if (!frm || !frm.$wrapper) {
				return $();
			}

			// -----------------------------------------------------
			// PRIMARY LOCATION
			// -----------------------------------------------------

			let $tabs_list = frm.$wrapper.find(".form-tabs-list").first();

			if ($tabs_list.length) {
				return $tabs_list;
			}

			// -----------------------------------------------------
			// FALLBACK: PAGE WRAPPER
			// -----------------------------------------------------

			if (frm.page && frm.page.wrapper) {
				$tabs_list = $(frm.page.wrapper).find(".form-tabs-list").first();

				if ($tabs_list.length) {
					return $tabs_list;
				}
			}

			// -----------------------------------------------------
			// FINAL FALLBACK
			// -----------------------------------------------------

			return $(".form-tabs-list").first();
		},

		// =========================================================
		// NATIVE FORM -> DOCVIEW BUTTON
		// =========================================================

		async add_collapse_button(frm, attempt = 0) {
			if (!frm || !frm.$wrapper) {
				return;
			}

			// -----------------------------------------------------
			// HARD GUARD:
			//
			// Never create the button unless Docview is enabled.
			// -----------------------------------------------------

			const config = await this.get_config(frm.doctype);

			if (!config || !config.custom_jinja) {
				this.remove_collapse_button(frm);

				return;
			}

			const $tabs_list = this.get_tabs_list(frm);

			// -----------------------------------------------------
			// FRAPPE MAY CREATE TABS SLIGHTLY LATER
			// -----------------------------------------------------

			if (!$tabs_list.length) {
				if (attempt < 20) {
					setTimeout(() => {
						this.add_collapse_button(frm, attempt + 1);
					}, 100);
				} else {
					console.warn("Docview: .form-tabs-list not found");
				}

				return;
			}

			// -----------------------------------------------------
			// REMOVE EXISTING BUTTON
			// -----------------------------------------------------

			$tabs_list.find(".docview-collapse-btn-wrapper").remove();

			$tabs_list.removeClass("docview-has-collapse-button");

			// -----------------------------------------------------
			// POSITIONING CONTEXT
			// -----------------------------------------------------

			$tabs_list.css("position", "relative");

			// -----------------------------------------------------
			// CREATE BUTTON
			// -----------------------------------------------------

			const $button_wrapper = $(`
				<div
					class="docview-collapse-btn-wrapper"
				>
					<button
						type="button"
						class="docview-collapse-btn"
						title="${__("Open Document View")}"
						aria-label="${__("Open Document View")}"
					>
						${frappe.utils.icon("collapse", "sm")}
					</button>
				</div>
			`);

			// -----------------------------------------------------
			// CLICK
			// -----------------------------------------------------

			$button_wrapper.find(".docview-collapse-btn").on("click", async () => {
				// ---------------------------------------------
				// VERIFY CONFIG AGAIN
				// ---------------------------------------------

				const latest_config = await this.get_config(frm.doctype);

				if (!latest_config || !latest_config.custom_jinja) {
					this.disable_docview(frm);

					return;
				}

				// ---------------------------------------------
				// SWITCH TO DOCVIEW
				// ---------------------------------------------

				frm.__docview_mode = "view";
				frm.__docview_active = false;
				frm.__docview_rendered = false;

				// Remove button immediately.
				this.remove_collapse_button(frm);

				// Render.
				await this.render(frm, latest_config);
			});

			// -----------------------------------------------------
			// APPEND TO TAB LIST
			// -----------------------------------------------------

			$tabs_list.append($button_wrapper);

			// -----------------------------------------------------
			// CSS STATE
			// -----------------------------------------------------

			$tabs_list.addClass("docview-has-collapse-button");
		},

		// =========================================================
		// REMOVE COLLAPSE BUTTON
		// =========================================================

		remove_collapse_button(frm) {
			if (!frm || !frm.$wrapper) {
				return;
			}

			const $tabs_list = this.get_tabs_list(frm);

			if (!$tabs_list.length) {
				// Also remove globally inside this form
				frm.$wrapper.find(".docview-collapse-btn-wrapper").remove();

				return;
			}

			$tabs_list.find(".docview-collapse-btn-wrapper").remove();

			$tabs_list.removeClass("docview-has-collapse-button");
		},

		// =========================================================
		// DOCUMENT STATE
		// =========================================================

		sync_document_state(frm) {
			if (!frm || !frm.doc) {
				return;
			}

			const current_docname = frm.doc.name;

			// -----------------------------------------------------
			// NEW DOCUMENT
			// -----------------------------------------------------

			if (frm.__docview_docname !== current_docname) {
				frm.__docview_docname = current_docname;

				frm.__docview_mode = "view";
				frm.__docview_active = false;
				frm.__docview_rendered = false;

				// Remove stale button from previous document.
				this.remove_collapse_button(frm);
				this.remove_full_form_button(frm);
			}
		},

		// =========================================================
		// PROCESS CURRENT FORM
		// =========================================================

		async process_current_form() {
			const frm = window.cur_frm;

			if (!frm || !frm.doc) {
				return;
			}

			// -----------------------------------------------------
			// NEVER TOUCH NEW DOCUMENTS
			// -----------------------------------------------------

			if (frm.is_new()) {
				this.remove_collapse_button(frm);
				this.remove_full_form_button(frm);

				return;
			}

			this.sync_document_state(frm);

			// -----------------------------------------------------
			// MASTER CONFIG GUARD
			// -----------------------------------------------------
			//
			// This is important.
			//
			// Even if this form was previously rendered with
			// Docview enabled, check the current configuration
			// again before doing anything.
			//
			// -----------------------------------------------------

			const config = await this.get_config(frm.doctype);

			if (!config || !config.custom_jinja) {
				this.disable_docview(frm);

				return;
			}

			// -----------------------------------------------------
			// NATIVE FORM MODE
			// -----------------------------------------------------

			if (frm.__docview_mode === "full") {
				this.add_collapse_button(frm);

				return;
			}

			// -----------------------------------------------------
			// ALREADY RENDERED
			// -----------------------------------------------------

			if (frm.__docview_rendered) {
				// Make absolutely sure the native button
				// isn't accidentally left behind.
				this.remove_collapse_button(frm);

				return;
			}

			// -----------------------------------------------------
			// RENDER DOCVIEW
			// -----------------------------------------------------

			await this.render(frm, config);
		},

		// =========================================================
		// INITIALIZE
		// =========================================================

		init() {
			if (this.initialized) {
				return;
			}

			this.initialized = true;

			console.log("Docview: universal engine initialized");

			// -----------------------------------------------------
			// ROUTER CHANGE
			// -----------------------------------------------------

			frappe.router.on("change", () => {
				setTimeout(() => {
					this.process_current_form();
				}, 300);
			});

			// -----------------------------------------------------
			// INITIAL LOAD
			// -----------------------------------------------------

			setTimeout(() => {
				this.process_current_form();
			}, 500);
		},
	};

	// =========================================================
	// GLOBAL API
	// =========================================================

	window.Docview = Docview;

	// =========================================================
	// DOCUMENT READY
	// =========================================================

	$(document).ready(() => {
		Docview.init();
	});
})();
