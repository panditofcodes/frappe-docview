frappe.pages["docview"].on_page_load = function (wrapper) {
	frappe.ui.make_app_page({
		parent: wrapper,
		title: __("Doc View"),
		single_column: true,
	});

	render_doc_view(wrapper);
};

frappe.pages["docview"].on_page_show = function (wrapper) {
	render_doc_view(wrapper);
};

async function render_doc_view(wrapper) {
	const route = frappe.get_route();

	const doctype = route[1];
	const docname = route[2];

	const $container = $(wrapper).find(".layout-main-section");

	if (!doctype || !docname) {
		show_empty_state($container);
		return;
	}

	show_loading($container);

	try {
		const doc = await frappe.db.get_doc(doctype, docname);

		if (doctype === "Sales Invoice") {
			render_sales_invoice($container, doc);
		} else {
			render_unsupported($container, doctype);
		}
	} catch (error) {
		console.error("Doc View error:", error);
		show_error($container);
	}
}

function render_sales_invoice($container, doc) {
	const status = get_sales_invoice_status(doc);

	const items = (doc.items || [])
		.map((item) => {
			return `
				<tr>
					<td>
						<div class="doc-view-item-name">
							${escape_html(item.item_name || item.item_code || "")}
						</div>

						${
							item.item_code && item.item_name !== item.item_code
								? `
									<div class="doc-view-item-code">
										${escape_html(item.item_code)}
									</div>
								`
								: ""
						}
					</td>

					<td class="doc-view-number">
						${format_number(item.qty)}
					</td>

					<td class="doc-view-number">
						${format_currency(item.rate, doc.currency)}
					</td>

					<td class="doc-view-number doc-view-amount">
						${format_currency(item.amount, doc.currency)}
					</td>
				</tr>
			`;
		})
		.join("");

	const html = `
		<div class="doc-view-wrapper">

			<!-- Back -->
			<div class="doc-view-back" id="doc-view-back">
				${frappe.utils.icon("arrow-left", "sm")}
				<span>${__("Sales Invoices")}</span>
			</div>


			<!-- Header -->
			<div class="doc-view-header">

				<div class="doc-view-header-info">

					<div class="doc-view-eyebrow">
						${__("Sales Invoice")}
					</div>

					<h1 class="doc-view-title">
						${escape_html(doc.name)}
					</h1>

				</div>


				<div class="doc-view-header-actions">

					<span class="doc-view-status ${get_status_class(status)}">
						${escape_html(status)}
					</span>

					<button
						class="btn btn-primary"
						id="doc-view-edit"
					>
						${frappe.utils.icon("edit", "sm")}
						${__("Edit")}
					</button>

				</div>

			</div>


			<!-- Address / Invoice Information -->
			<div class="doc-view-card">

				<div class="doc-view-address-grid">

					<!-- Bill To -->
					<div class="doc-view-address-block">

						<div class="doc-view-section-title">
							${__("Bill To")}
						</div>

						<div class="doc-view-address-name">
							${escape_html(doc.customer_name || doc.customer || "")}
						</div>

						<div class="doc-view-address">
							${format_address(doc.address_display)}
						</div>

					</div>


					<!-- Ship To -->
					<div class="doc-view-address-block">

						<div class="doc-view-section-title">
							${__("Ship To")}
						</div>

						<div class="doc-view-address-name">
							${escape_html(doc.shipping_address_name || "")}
						</div>

						<div class="doc-view-address">
							${format_address(doc.shipping_address)}
						</div>

					</div>


					<!-- Company -->
					<div class="doc-view-address-block">

						<div class="doc-view-section-title">
							${__("Company")}
						</div>

						<div class="doc-view-address-name">
							${escape_html(doc.company || "")}
						</div>

						<div class="doc-view-address">
							${format_address(doc.company_address_display)}
						</div>

					</div>

				</div>


				<!-- Dispatch From -->
				<div class="doc-view-dispatch">

					<div class="doc-view-section-title">
						${__("Dispatch From")}
					</div>

					<div class="doc-view-dispatch-content">

						<div>
							<div class="doc-view-address-name">
								${escape_html(get_dispatch_warehouse(doc))}
							</div>

							<div class="doc-view-address">
								${format_address(get_dispatch_address(doc))}
							</div>
						</div>

					</div>

				</div>


				<!-- Invoice Details -->
				<div class="doc-view-invoice-details">

					<div class="doc-view-meta">

						<div class="doc-view-meta-item">

							<div class="doc-view-meta-label">
								${__("Invoice Date")}
							</div>

							<div class="doc-view-meta-value">
								${format_date(doc.posting_date)}
							</div>

						</div>


						<div class="doc-view-meta-item">

							<div class="doc-view-meta-label">
								${__("Due Date")}
							</div>

							<div class="doc-view-meta-value">
								${format_date(doc.due_date)}
							</div>

						</div>


						<div class="doc-view-meta-item">

							<div class="doc-view-meta-label">
								${__("Currency")}
							</div>

							<div class="doc-view-meta-value">
								${escape_html(doc.currency || "")}
							</div>

						</div>


						<div class="doc-view-meta-item">

							<div class="doc-view-meta-label">
								${__("Payment Terms")}
							</div>

							<div class="doc-view-meta-value">
								${escape_html(doc.payment_terms_template || "—")}
							</div>

						</div>

					</div>

				</div>

			</div>


			<!-- Items -->
			<div class="doc-view-card">

				<div class="doc-view-section">

					<div class="doc-view-section-header">

						<div class="doc-view-section-title">
							${__("Items")}
						</div>

						<div class="doc-view-section-count">
							${(doc.items || []).length}
							${__("items")}
						</div>

					</div>


					<div class="doc-view-items-wrapper">

						<table class="doc-view-items">

							<thead>

								<tr>

									<th>
										${__("Item")}
									</th>

									<th class="doc-view-number">
										${__("Qty")}
									</th>

									<th class="doc-view-number">
										${__("Rate")}
									</th>

									<th class="doc-view-number">
										${__("Amount")}
									</th>

								</tr>

							</thead>


							<tbody>
								${items}
							</tbody>

						</table>

					</div>

				</div>

			</div>


			<!-- Totals -->
			<div class="doc-view-card">

				<div class="doc-view-section">

					<div class="doc-view-totals">

						<div class="doc-view-total-table">

							<div class="doc-view-total-row">

								<span>
									${__("Net Total")}
								</span>

								<span>
									${format_currency(doc.total, doc.currency)}
								</span>

							</div>


							<div class="doc-view-total-row">

								<span>
									${__("Tax")}
								</span>

								<span>
									${format_currency(doc.total_taxes_and_charges, doc.currency)}
								</span>

							</div>


							<div class="doc-view-total-row grand-total">

								<span>
									${__("Grand Total")}
								</span>

								<span>
									${format_currency(doc.grand_total, doc.currency)}
								</span>

							</div>


							${
								doc.outstanding_amount !== undefined
									? `
										<div class="doc-view-total-row outstanding">

											<span>
												${__("Outstanding")}
											</span>

											<span>
												${format_currency(doc.outstanding_amount, doc.currency)}
											</span>

										</div>
									`
									: ""
							}

						</div>

					</div>

				</div>

			</div>


			<!-- Actions -->
			<div class="doc-view-actions">

				<button
					class="btn btn-default"
					id="doc-view-email"
				>
					${frappe.utils.icon("mail", "sm")}
					${__("Email")}
				</button>


				<button
					class="btn btn-default"
					id="doc-view-pdf"
				>
					${frappe.utils.icon("download", "sm")}
					${__("Download PDF")}
				</button>


				<button
					class="btn btn-default"
					id="doc-view-share"
				>
					${frappe.utils.icon("share", "sm")}
					${__("Share")}
				</button>

			</div>

		</div>
	`;

	$container.html(html);

	// Back
	$("#doc-view-back").on("click", () => {
		frappe.set_route("List", "Sales Invoice");
	});

	// Edit
	$("#doc-view-edit").on("click", () => {
		frappe.set_route("Form", "Sales Invoice", doc.name);
	});

	// PDF
	$("#doc-view-pdf").on("click", () => {
		download_pdf(doc);
	});

	// Email
	$("#doc-view-email").on("click", () => {
		email_invoice(doc);
	});

	// Share
	$("#doc-view-share").on("click", () => {
		share_document(doc);
	});
}

/* -------------------------------------------------------------------------- */
/* Status */
/* -------------------------------------------------------------------------- */

function get_sales_invoice_status(doc) {
	if (doc.docstatus === 0) {
		return "Draft";
	}

	if (doc.docstatus === 2) {
		return "Cancelled";
	}

	if (doc.status) {
		return doc.status;
	}

	return "Submitted";
}

function get_status_class(status) {
	return `status-${String(status || "")
		.toLowerCase()
		.replace(/\s+/g, "-")}`;
}

/* -------------------------------------------------------------------------- */
/* Address */
/* -------------------------------------------------------------------------- */

function format_address(value) {
	if (!value) {
		return `<span class="doc-view-empty-value">—</span>`;
	}

	return escape_html(value).replace(/\n/g, "<br>");
}

function get_dispatch_warehouse(doc) {
	if (doc.set_warehouse) {
		return doc.set_warehouse;
	}

	if (doc.items && doc.items.length) {
		const warehouse = doc.items.find((item) => item.warehouse);

		if (warehouse) {
			return warehouse.warehouse;
		}
	}

	return "—";
}

function get_dispatch_address(doc) {
	if (doc.dispatch_address) {
		return doc.dispatch_address;
	}

	if (doc.items && doc.items.length) {
		const warehouse = doc.items.find((item) => item.warehouse);

		if (warehouse && warehouse.warehouse_address) {
			return warehouse.warehouse_address;
		}
	}

	return "";
}

/* -------------------------------------------------------------------------- */
/* Formatting */
/* -------------------------------------------------------------------------- */

function format_number(value) {
	if (value === undefined || value === null) {
		return "";
	}

	return frappe.format(value, {
		fieldtype: "Float",
	});
}

function format_currency(value, currency) {
	if (value === undefined || value === null) {
		return "";
	}

	return frappe.format(value, {
		fieldtype: "Currency",
		options: currency,
	});
}

function format_date(value) {
	if (!value) {
		return "";
	}

	return frappe.datetime.str_to_user(value);
}

function escape_html(value) {
	return frappe.utils.escape_html(value === undefined || value === null ? "" : String(value));
}

/* -------------------------------------------------------------------------- */
/* Actions */
/* -------------------------------------------------------------------------- */

function download_pdf(doc) {
	const url =
		`/api/method/frappe.utils.print_format.download_pdf` +
		`?doctype=${encodeURIComponent(doc.doctype)}` +
		`&name=${encodeURIComponent(doc.name)}` +
		`&format=${encodeURIComponent("Standard")}` +
		`&no_letterhead=0`;

	window.open(url, "_blank");
}

function email_invoice(doc) {
	frappe.msgprint({
		title: __("Coming Soon"),
		message: __("Email action will be implemented next."),
	});
}

function share_document(doc) {
	frappe.msgprint({
		title: __("Coming Soon"),
		message: __("Share action will be implemented next."),
	});
}

/* -------------------------------------------------------------------------- */
/* States */
/* -------------------------------------------------------------------------- */

function show_loading($container) {
	$container.html(`
		<div class="doc-view-loading">
			<div class="text-muted">
				${__("Loading...")}
			</div>
		</div>
	`);
}

function show_empty_state($container) {
	$container.html(`
		<div class="doc-view-empty-state">

			<h3>
				${__("Doc View")}
			</h3>

			<p>
				${__("No document specified.")}
			</p>

		</div>
	`);
}

function show_unsupported($container, doctype) {
	$container.html(`
		<div class="doc-view-empty-state">

			<h3>
				${__("Unsupported Document")}
			</h3>

			<p>
				${escape_html(doctype)}
			</p>

		</div>
	`);
}

function render_unsupported($container, doctype) {
	show_unsupported($container, doctype);
}

function show_error($container) {
	$container.html(`
		<div class="doc-view-empty-state">

			<h3 class="text-danger">
				${__("Unable to load document")}
			</h3>

			<p class="text-muted">
				${__("Please check the document and your permissions.")}
			</p>

		</div>
	`);
}
