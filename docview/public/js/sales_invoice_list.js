original_listview_settings = frappe.listview_settings["Sales Invoice"] || {};
frappe.listview_settings["Sales Invoice"] = {
	...original_listview_settings,
	get_form_link(doc) {
		return `/app/sales-invoice/${encodeURIComponent(doc.name)}`;
	},
};
