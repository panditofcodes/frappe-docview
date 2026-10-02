frappe.ui.form.on("Sales Invoice", {
	before_load(frm) {
		docview_sync_document_state(frm);
	},

	refresh(frm) {
		if (frm.is_new()) {
			return;
		}

		/*

         * Frappe is a SPA.

         *

         * When navigating from one Sales Invoice to another,

         * the same Form instance can be reused.

         *

         * Reset Doc View state when the document changes.

         */

		docview_sync_document_state(frm);

		/*

         * If the user explicitly opened the native

         * Frappe Full Form, keep the native form visible.

         */

		if (frm.__docview_mode === "full") {
			return;
		}

		/*

         * Doc View is active.

         *

         * Hide actions that should only be available

         * in the native full form.

         */

		docview_hide_edit_actions(frm);

		docview_show(frm);
	},

	onload_post_render(frm) {
		if (frm.is_new()) {
			return;
		}

		docview_sync_document_state(frm);

		/*

         * Do not replace the native Frappe Form when

         * the user has explicitly opened Full Form.

         */

		if (frm.__docview_mode === "full") {
			return;
		}

		docview_hide_edit_actions(frm);

		docview_show(frm);
	},
});

/* ==========================================================================

   Document State

   \========================================================================== */

/*

 * Frappe uses SPA navigation.

 *

 * The same Form instance can be reused while moving

 * between documents.

 *

 * Therefore the Doc View state is tied to the

 * current document name.

 */

function docview_sync_document_state(frm) {
	const current_docname = frm.doc && frm.doc.name;

	if (!current_docname) {
		return;
	}

	/*

     * New document detected.

     *

     * Always start the new document in Doc View.

     */

	if (frm.__docview_docname !== current_docname) {
		frm.__docview_docname = current_docname;

		frm.__docview_mode = "view";

		frm.__docview_active = false;
	}
}

/* ==========================================================================

   Hide Native Actions While Doc View Is Active

   \========================================================================== */

function docview_hide_edit_actions(frm) {
	/*

     * "Get Items From" is a native Sales Invoice

     * toolbar action.

     *

     * It should not appear while the compact

     * Doc View is being displayed.

     */

	frm.remove_custom_button(__("Get Items From"));

	frm.remove_custom_button("Get Items From");
}

/* ==========================================================================

   Show Doc View

   \========================================================================== */

function docview_show(frm) {
	/*

     * Prevent duplicate rendering.

     */

	if (frm.__docview_active) {
		return;
	}

	/*

     * Never switch back to Doc View after

     * the user explicitly opened Full Form.

     */

	if (frm.__docview_mode === "full") {
		return;
	}

	const $form_layout = frm.$wrapper.find(".form-layout").first();

	if (!$form_layout.length) {
		console.warn("Doc View: .form-layout not found");

		return;
	}

	/*

     * Create Doc View container.

     */

	let $docview = frm.$wrapper.find(".doc-view-inline").first();

	if (!$docview.length) {
		$docview = $('<div class="doc-view-inline"></div>');

		$form_layout.before($docview);
	}

	/*

     * Hide native form fields.

     *

     * Keep the Frappe shell untouched:

     *

     * - Navbar

     * - Left sidebar

     * - Breadcrumb

     * - Native document header

     * - Right document sidebar

     */

	$form_layout.hide();

	/*

     * Show Doc View.

     */

	$docview.show();

	frm.__docview_mode = "view";

	frm.__docview_active = true;

	render_docview_sales_invoice($docview, frm.doc, frm);
}

/* ==========================================================================

   Open Native Full Form

   \========================================================================== */

function docview_open_full_form(frm) {
	const $docview = frm.$wrapper.find(".doc-view-inline").first();

	const $form_layout = frm.$wrapper.find(".form-layout").first();

	/*

     * Mark the current document as explicitly

     * opened in native Full Form.

     */

	frm.__docview_mode = "full";

	frm.__docview_active = false;

	/*

     * Hide Doc View.

     */

	if ($docview.length) {
		$docview.hide();
	}

	/*

     * Show native Frappe Form.

     */

	$form_layout.show();

	/*

     * Scroll native form to top.

     */

	const $page_content = frm.$wrapper.find(".form-page").first();

	if ($page_content.length) {
		$page_content.scrollTop(0);
	}

	/*

     * Refresh native form.

     *

     * Because mode is "full", the refresh handler

     * will NOT switch back to Doc View.

     *

     * Native ERPNext/Frappe actions are restored.

     */

	frm.refresh();
}

/* ==========================================================================

   Sales Invoice Renderer

   \========================================================================== */

async function render_docview_sales_invoice($container, doc, frm) {
	/* ----------------------------------------------------------------------

       Items

       \\---------------------------------------------------------------------- */

	const items = (doc.items || [])

		.map((item) => {
			return `

                    <tr>

                        <td>

                            <div class="doc-view-item-name">

                                ${docview_escape(item.item_name || item.item_code || "")}

                            </div>

                            ${
								item.item_code && item.item_name !== item.item_code
									? `

                                        <div class="doc-view-item-code">

                                            ${docview_escape(item.item_code)}

                                        </div>

                                    `
									: ""
							}

                        </td>

                        <td class="doc-view-number">

                            ${docview_format_number(item.qty)}

                        </td>

                        <td class="doc-view-number">

                            ${docview_format_currency(item.rate, doc.currency)}

                        </td>

                        <td class="doc-view-number doc-view-amount">

                            ${docview_format_currency(item.amount, doc.currency)}

                        </td>

                    </tr>

                `;
		})

		.join("");

	/* ----------------------------------------------------------------------

       Addresses

       \\---------------------------------------------------------------------- */

	const bill_to_address = doc.address_display || "";

	const ship_to_address = doc.shipping_address_display || "";

	const company_address = doc.company_address_display || "";

	/* ----------------------------------------------------------------------

       Dispatch Warehouse

       \\---------------------------------------------------------------------- */

	const dispatch_from =
		doc.set_warehouse || (doc.items || []).find((item) => item.warehouse)?.warehouse || "—";

	/* ----------------------------------------------------------------------

       Sales Taxes and Charges

       \\---------------------------------------------------------------------- */

	const taxes = (doc.taxes || [])

		.map((tax) => {
			/*

             * Net taxable amount.

             *

             * Prefer the value stored on the tax row.

             * Fall back to the invoice net total.

             */

			const net_amount =
				tax.net_amount !== undefined && tax.net_amount !== null
					? tax.net_amount
					: doc.net_total !== undefined && doc.net_total !== null
						? doc.net_total
						: doc.total;

			/*

             * Actual tax amount.

             *

             * ERPNext may populate

             * tax_amount_after_discount_amount

             * when applicable.

             */

			const tax_amount =
				tax.tax_amount_after_discount_amount !== undefined &&
				tax.tax_amount_after_discount_amount !== null
					? tax.tax_amount_after_discount_amount
					: tax.tax_amount !== undefined && tax.tax_amount !== null
						? tax.tax_amount
						: 0;

			/*

             * Running total after this tax row.

             *

             * ERPNext normally stores this as `total`.

             *

             * Fall back to net + tax if unavailable.

             */

			const tax_total =
				tax.total !== undefined && tax.total !== null
					? tax.total
					: Number(net_amount || 0) + Number(tax_amount || 0);

			return `

                    <tr>

                        <td class="doc-view-tax-type">

                            ${docview_escape(tax.charge_type || "")}

                        </td>

                        <td class="doc-view-tax-account">

                            ${docview_escape(tax.account_head || "")}

                        </td>

                        <td class="doc-view-tax-rate">

                            ${docview_format_rate(tax.rate)}

                        </td>

                        <td class="doc-view-tax-money">

                            ${docview_format_currency(net_amount, doc.currency)}

                        </td>

                        <td class="doc-view-tax-money">

                            ${docview_format_currency(tax_amount, doc.currency)}

                        </td>

                        <td class="doc-view-tax-money">

                            ${docview_format_currency(tax_total, doc.currency)}

                        </td>

                    </tr>

                `;
		})

		.join("");

	/* ----------------------------------------------------------------------

       HTML

       \\---------------------------------------------------------------------- */

	const template = await docview_get_template();

	const outstanding_row =
		doc.outstanding_amount !== undefined && doc.outstanding_amount !== null
			? `
                <div class="doc-view-total-row">
                    <span class="doc-view-total-label">Outstanding</span>
                    <span class="doc-view-total-value">
                        ${docview_format_currency(doc.outstanding_amount, doc.currency)}
                    </span>
                </div>
            `
			: "";

	const sales_taxes = (doc.taxes || []).length
		? `
                <div class="doc-view-section">
                    <div class="doc-view-section-header">
                        <div class="doc-view-section-title">
                            Sales Taxes and Charges
                        </div>

                        <div class="doc-view-section-count">
                            ${(doc.taxes || []).length} taxes
                        </div>
                    </div>

                    <div class="doc-view-tax-wrapper">
                        <table class="doc-view-tax-table">
                            <colgroup>
                                <col class="tax-col-type">
                                <col class="tax-col-account">
                                <col class="tax-col-rate">
                                <col class="tax-col-net">
                                <col class="tax-col-amount">
                                <col class="tax-col-total">
                            </colgroup>

                            <thead>
                                <tr>
                                    <th>Type</th>
                                    <th>Account Head</th>
                                    <th>Tax Rate</th>
                                    <th>Net Amount</th>
                                    <th>Amount</th>
                                    <th>Total</th>
                                </tr>
                            </thead>

                            <tbody>
                                ${taxes}
                            </tbody>
                        </table>
                    </div>
                </div>
            `
		: "";

	/* ----------------------------------------------------------------------

       GST Breakup

       ERPNext v16 stores item-wise tax details on the Sales Invoice.
       Build the breakup from those details so CGST / SGST / IGST are shown
       separately instead of collapsing everything into one "GST" value.

       ---------------------------------------------------------------------- */

	const gst_breakup = docview_build_gst_breakup(doc);

	const html = docview_apply_template(template, {
		DOC_NAME: docview_escape(doc.name),
		FULL_FORM_ICON: docview_full_form_icon(),

		BILL_TO_NAME: docview_escape(doc.customer_name || doc.customer || ""),
		BILL_TO_EMAIL: doc.email_id
			? `
                <div class="doc-view-party-email">
                    ${docview_escape(doc.email_id)}
                </div>
            `
			: "",
		BILL_TO_ADDRESS: docview_format_address(bill_to_address),

		SHIP_TO_NAME: docview_escape(doc.shipping_address_name || ""),
		SHIP_TO_EMAIL: doc.contact_email
			? `
                <div class="doc-view-party-email">
                    ${docview_escape(doc.contact_email)}
                </div>
            `
			: "",
		SHIP_TO_ADDRESS: docview_format_address(ship_to_address),

		COMPANY: docview_escape(doc.company || ""),
		COMPANY_ADDRESS: docview_format_address(company_address),

		DISPATCH_FROM: docview_escape(dispatch_from),

		INVOICE_DATE: docview_format_date(doc.posting_date),
		DUE_DATE: docview_format_date(doc.due_date),
		CURRENCY: docview_escape(doc.currency || ""),
		PAYMENT_TERMS: docview_escape(doc.payment_terms_template || "—"),

		ITEM_COUNT: (doc.items || []).length,
		ITEMS: items,

		SALES_TAXES: sales_taxes,

		GST_BREAKUP: gst_breakup,

		NET_TOTAL: docview_format_currency(
			doc.net_total !== undefined && doc.net_total !== null ? doc.net_total : doc.total,
			doc.currency,
		),

		TAX_TOTAL: docview_format_currency(doc.total_taxes_and_charges, doc.currency),

		GRAND_TOTAL: docview_format_currency(doc.grand_total, doc.currency),

		OUTSTANDING_ROW: outstanding_row,

		EMAIL_ICON: frappe.utils.icon("mail", "sm"),
		DOWNLOAD_ICON: frappe.utils.icon("download", "sm"),
		SHARE_ICON: frappe.utils.icon("share", "sm"),
	});

	$container.html(html);

	$container.find(".doc-view-open-form-btn").on("click", () => {
		docview_open_full_form(frm);
	});

	$container.find('[data-docview-action="pdf"]').on("click", () => {
		docview_download_pdf(doc);
	});

	$container.find('[data-docview-action="email"]').on("click", () => {
		docview_email(doc);
	});

	$container.find('[data-docview-action="share"]').on("click", () => {
		docview_share(doc);
	});
}

function docview_apply_template(template, values) {
	return template.replace(/{{([A-Z0-9_]+)}}/g, (match, key) => {
		return values[key] !== undefined && values[key] !== null ? values[key] : "";
	});
}

let docview_template_cache = null;

async function docview_get_template() {
	if (docview_template_cache) {
		return docview_template_cache;
	}

	if (!docview_template_cache) {
		docview_template_cache = fetch("/assets/docview/templates/sales_invoice.html?v=2")
			.then((response) => {
				if (!response.ok) {
					throw new Error(
						`Unable to load Sales Invoice Doc View template (${response.status})`,
					);
				}

				return response.text();
			})
			.catch((error) => {
				docview_template_cache = null;
				console.error("Doc View template error:", error);
				throw error;
			});
	}

	return docview_template_cache;
}

function docview_build_gst_breakup(doc) {
	const items = Array.isArray(doc.items) ? doc.items : [];
	const tax_rows = Array.isArray(doc.taxes) ? doc.taxes : [];
	const item_wise = Array.isArray(doc.item_wise_tax_details) ? doc.item_wise_tax_details : [];

	const tax_map = new Map();
	tax_rows.forEach((tax) => {
		if (tax && tax.name) {
			tax_map.set(String(tax.name), tax);
		}
		if (tax && tax.idx !== undefined && tax.idx !== null) {
			tax_map.set(String(tax.idx), tax);
		}
	});

	const item_map = new Map();
	items.forEach((item) => {
		if (item && item.name) {
			item_map.set(String(item.name), item);
		}
		if (item && item.idx !== undefined && item.idx !== null) {
			item_map.set(String(item.idx), item);
		}
	});

	const groups = new Map();
	let has_cgst = false;
	let has_sgst = false;
	let has_igst = false;

	const classify_tax = (tax) => {
		const source = [
			tax && tax.gst_tax_type,
			tax && tax.account_head,
			tax && tax.description,
			tax && tax.tax_type,
		]
			.filter(Boolean)
			.join(" ")
			.toUpperCase();

		if (source.includes("CGST")) return "cgst";
		if (source.includes("SGST") || source.includes("UTGST")) return "sgst";
		if (source.includes("IGST")) return "igst";
		return null;
	};

	for (const detail of item_wise) {
		const item = item_map.get(String(detail.item_row || ""));
		const tax = tax_map.get(String(detail.tax_row || ""));
		const component = classify_tax(tax);

		if (!item || !tax || !component) {
			continue;
		}

		const hsn = item.gst_hsn_code || item.hsn_sac || item.gst_hsn || "—";

		const taxable_amount = Number(
			detail.taxable_amount !== undefined && detail.taxable_amount !== null
				? detail.taxable_amount
				: item.net_amount !== undefined && item.net_amount !== null
					? item.net_amount
					: item.amount || 0,
		);

		const tax_amount = Number(
			detail.amount !== undefined && detail.amount !== null ? detail.amount : 0,
		);

		const key = String(hsn);
		if (!groups.has(key)) {
			groups.set(key, {
				hsn,
				taxable_amount: 0,
				cgst_rate: 0,
				cgst_amount: 0,
				sgst_rate: 0,
				sgst_amount: 0,
				igst_rate: 0,
				igst_amount: 0,
			});
		}

		const row = groups.get(key);
		row.taxable_amount += Number.isFinite(taxable_amount) ? taxable_amount : 0;

		const rate = Number(
			detail.rate !== undefined && detail.rate !== null ? detail.rate : tax.rate || 0,
		);
		const safe_rate = Number.isFinite(rate) ? rate : 0;

		if (component === "cgst") {
			has_cgst = true;
			row.cgst_amount += Number.isFinite(tax_amount) ? tax_amount : 0;
			row.cgst_rate = Math.max(row.cgst_rate, safe_rate);
		} else if (component === "sgst") {
			has_sgst = true;
			row.sgst_amount += Number.isFinite(tax_amount) ? tax_amount : 0;
			row.sgst_rate = Math.max(row.sgst_rate, safe_rate);
		} else if (component === "igst") {
			has_igst = true;
			row.igst_amount += Number.isFinite(tax_amount) ? tax_amount : 0;
			row.igst_rate = Math.max(row.igst_rate, safe_rate);
		}
	}

	/*
	 * If item-wise details are unavailable, still render a useful breakup
	 * from the invoice items and tax rows rather than showing a generic GST
	 * total. This fallback is deliberately conservative.
	 */
	if (!groups.size) {
		for (const item of items) {
			const hsn = item.gst_hsn_code || item.hsn_sac || item.gst_hsn || "—";

			const key = String(hsn);
			if (!groups.has(key)) {
				groups.set(key, {
					hsn,
					taxable_amount: Number(item.net_amount ?? item.amount ?? 0),
					cgst_rate: 0,
					cgst_amount: 0,
					sgst_rate: 0,
					sgst_amount: 0,
					igst_rate: 0,
					igst_amount: 0,
				});
			} else {
				groups.get(key).taxable_amount += Number(item.net_amount ?? item.amount ?? 0);
			}
		}

		for (const tax of tax_rows) {
			const component = classify_tax(tax);
			if (!component) continue;

			const amount = Number(tax.tax_amount_after_discount_amount ?? tax.tax_amount ?? 0);
			const rate = Number(tax.rate ?? 0);

			for (const row of groups.values()) {
				if (component === "cgst") {
					has_cgst = true;
					row.cgst_amount += amount;
					row.cgst_rate = Math.max(row.cgst_rate, Number.isFinite(rate) ? rate : 0);
				} else if (component === "sgst") {
					has_sgst = true;
					row.sgst_amount += amount;
					row.sgst_rate = Math.max(row.sgst_rate, Number.isFinite(rate) ? rate : 0);
				} else if (component === "igst") {
					has_igst = true;
					row.igst_amount += amount;
					row.igst_rate = Math.max(row.igst_rate, Number.isFinite(rate) ? rate : 0);
				}
				break;
			}
		}
	}

	const rows = Array.from(groups.values());

	if (!rows.length) {
		return `
            <div class="doc-view-gst-empty">—</div>
        `;
	}

	const columns = [
		{ key: "hsn", label: "HSN/SAC", type: "text" },
		{ key: "taxable_amount", label: "Taxable Amount", type: "money" },
	];

	if (has_cgst) {
		columns.push({ key: "cgst", label: "CGST", type: "tax" });
	}

	if (has_sgst) {
		columns.push({ key: "sgst", label: "SGST", type: "tax" });
	}

	if (has_igst) {
		columns.push({ key: "igst", label: "IGST", type: "tax" });
	}

	const colgroup = columns
		.map((column) => {
			const class_name = `gst-col-${column.key}`;
			return `<col class="${class_name}">`;
		})
		.join("");

	const header = columns.map((column) => `<th>${column.label}</th>`).join("");

	const body = rows
		.map((row) => {
			const cells = columns
				.map((column) => {
					if (column.key === "hsn") {
						return `
                        <td class="doc-view-gst-text">
                            ${docview_escape(row.hsn)}
                        </td>
                    `;
					}

					if (column.key === "taxable_amount") {
						return `
                        <td class="doc-view-gst-money">
                            ${docview_format_currency(row.taxable_amount, doc.currency)}
                        </td>
                    `;
					}

					const prefix = column.key;
					const rate = row[`${prefix}_rate`];
					const amount = row[`${prefix}_amount`];

					return `
                    <td class="doc-view-gst-money">
                        <span class="doc-view-gst-rate">
                            ${docview_format_rate(rate)}
                        </span>
                        <span class="doc-view-gst-amount">
                            ${docview_format_currency(amount, doc.currency)}
                        </span>
                    </td>
                `;
				})
				.join("");

			return `<tr>${cells}</tr>`;
		})
		.join("");

	return `
        <div class="doc-view-gst-table-wrapper">
            <table class="doc-view-gst-table">
                <colgroup>${colgroup}</colgroup>
                <thead>
                    <tr>${header}</tr>
                </thead>
                <tbody>
                    ${body}
                </tbody>
            </table>
        </div>
    `;
}

function docview_format_address(value) {
	if (!value) {
		return `
            <span class="doc-view-empty-value">—</span>
        `;
	}

	let text = String(value);

	text = text
		.replace(/<br\s*\/?>/gi, "\n")
		.replace(/<\/div>\s*<div[^>]*>/gi, "\n")
		.replace(/<div[^>]*>/gi, "")
		.replace(/<\/div>/gi, "\n")
		.replace(/<\/p>\s*<p[^>]*>/gi, "\n")
		.replace(/<p[^>]*>/gi, "")
		.replace(/<\/p>/gi, "\n")
		.replace(/<li[^>]*>/gi, "• ")
		.replace(/<\/li>/gi, "\n");

	text = text.replace(/<[^>]*>/g, "");

	const textarea = document.createElement("textarea");
	textarea.innerHTML = text;
	text = textarea.value;

	text = text
		.replace(/\r\n/g, "\n")
		.replace(/\r/g, "\n")
		.replace(/[ \t]+\n/g, "\n")
		.replace(/\n[ \t]+/g, "\n")
		.replace(/\n{3,}/g, "\n\n")
		.trim();

	if (!text) {
		return `
            <span class="doc-view-empty-value">—</span>
        `;
	}

	return docview_escape(text).replace(/\n/g, "<br>");
}

function docview_format_number(value) {
	if (value === undefined || value === null) {
		return "";
	}

	return frappe.format(value, {
		fieldtype: "Float",
	});
}

function docview_format_rate(value) {
	if (value === undefined || value === null || value === "") {
		return "—";
	}

	const number = Number(value);

	if (Number.isNaN(number)) {
		return docview_escape(value);
	}

	return `${number}%`;
}

function docview_format_currency(value, currency) {
	if (value === undefined || value === null) {
		return "";
	}

	return frappe.format(value, {
		fieldtype: "Currency",

		options: currency,
	});
}

function docview_format_date(value) {
	if (!value) {
		return "";
	}

	return frappe.datetime.str_to_user(value);
}

function docview_escape(value) {
	return frappe.utils.escape_html(value === undefined || value === null ? "" : String(value));
}

/* ==========================================================================

   Actions

   \========================================================================== */

function docview_download_pdf(doc) {
	const params = new URLSearchParams({
		doctype: doc.doctype,

		name: doc.name,

		format: "Standard",

		no_letterhead: "0",
	});

	const url = `/api/method/frappe.utils.print_format.download_pdf?${params.toString()}`;

	window.open(url, "_blank");
}

function docview_email(doc) {
	frappe.msgprint({
		title: __("Coming Soon"),

		message: __("Email action will be implemented next."),
	});
}

function docview_share(doc) {
	frappe.msgprint({
		title: __("Coming Soon"),

		message: __("Share action will be implemented next."),
	});
}

/* ==========================================================================

   Full Form Icon

   \========================================================================== */

function docview_full_form_icon() {
	return frappe.utils.icon("expand", "sm");
}
