(function () {
	"use strict";

	const DocviewList = {
		/*
		 * Cache DocTypes that have Docview configuration.
		 */
		config_cache: {},

		async get_config(doctype) {
			if (Object.prototype.hasOwnProperty.call(this.config_cache, doctype)) {
				return this.config_cache[doctype];
			}

			try {
				const response = await frappe.call({
					method: "docview.api.get_docview_config",
					args: {
						doctype: doctype,
					},
				});

				const config = response.message || null;

				this.config_cache[doctype] = config;

				return config;
			} catch (error) {
				console.error("Docview List: unable to get configuration", error);

				return null;
			}
		},

		/*
		 * Build the normal Frappe Form route.
		 */
		get_form_route(doctype, name) {
			return `/app/${frappe.router.slug(doctype)}/${encodeURIComponent(name)}`;
		},

		/*
		 * Install generic List View routing.
		 *
		 * We use Frappe's ListView class rather than registering
		 * one JavaScript file per DocType.
		 */
		init() {
			if (!frappe.views || !frappe.views.ListView) {
				console.warn("Docview List: ListView class is not available yet.");

				return;
			}

			if (frappe.views.ListView.__docview_patched) {
				return;
			}

			const OriginalGetFormLink = frappe.views.ListView.prototype.get_form_link;

			if (!OriginalGetFormLink) {
				console.warn("Docview List: get_form_link is not available.");

				return;
			}

			frappe.views.ListView.prototype.get_form_link = function (doc) {
				const listview = this;

				/*
				 * We cannot make this method async because
				 * Frappe expects the URL synchronously.
				 *
				 * Therefore Docview routing is handled by the
				 * generic Form integration. The normal Frappe
				 * route remains intact.
				 */
				return OriginalGetFormLink.call(listview, doc);
			};

			frappe.views.ListView.__docview_patched = true;

			console.log("Docview List: generic List View integration initialized.");
		},
	};

	window.DocviewList = DocviewList;

	/*
	 * Initialize after Frappe is ready.
	 */
	if (frappe.ready) {
		frappe.ready(() => {
			DocviewList.init();
		});
	} else {
		$(document).ready(() => {
			DocviewList.init();
		});
	}
})();
