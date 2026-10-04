import frappe
from frappe import _


@frappe.whitelist()
def get_docview_config(doctype):
    if not frappe.db.exists("DocType", doctype):
        frappe.throw(_("Invalid DocType: {0}").format(doctype))

    configs = frappe.get_all(
        "Docview Settings",
        filters={
            "enabled": 1,
            "document_type": doctype,
        },
        fields=[
            "name",
            "document_type",
            "priority",
            "custom_jinja",
            "custom_css",
        ],
        order_by="priority desc, modified desc",
    )

    for config in configs:
        if config.custom_jinja:
            return config

    return None


@frappe.whitelist()
def get_docview_html(doctype, name):
    doc = frappe.get_doc(doctype, name)
    doc.check_permission("read")

    config = get_docview_config(doctype)

    if not config:
        return None

    html = frappe.render_template(
        config.custom_jinja,
        {
            "doc": doc,
            "frappe": frappe,
        },
    )

    return {
        "html": html,
        "css": config.custom_css or "",
        "doctype": doctype,
        "name": name,
    }
