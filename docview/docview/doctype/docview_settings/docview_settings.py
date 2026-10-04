import frappe
from frappe import _
from frappe.model.document import Document


class DocviewSettings(Document):

    def validate(self):
        self.validate_document_type()
        self.validate_custom_jinja()
        self.validate_system_key()

    def validate_document_type(self):
        if not self.document_type:
            return

        if not frappe.db.exists("DocType", self.document_type):
            frappe.throw(
                _("Document Type {0} does not exist.").format(self.document_type)
            )

    def validate_custom_jinja(self):
        if not self.enabled:
            return

        if not self.custom_jinja:
            frappe.throw(
                _("Custom Jinja is required when Docview Settings is enabled.")
            )

    def validate_system_key(self):
        if not self.is_system_generated:
            return

        if not self.system_key:
            frappe.throw(
                _("System Key is required for system-generated Docview settings.")
            )

        existing = frappe.db.get_value(
            "Docview Settings",
            {
                "system_key": self.system_key,
                "name": ["!=", self.name],
            },
            "name",
        )

        if existing:
            frappe.throw(
                _("System Key {0} is already used by Docview Settings {1}.").format(
                    self.system_key,
                    existing,
                )
            )
