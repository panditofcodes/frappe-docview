# Docview

A modern, universal document viewing layer for [Frappe Framework](https://github.com/frappe/frappe) and [ERPNext](https://github.com/frappe/erpnext).

Docview provides a clean, intuitive, and accountant-friendly document experience for Frappe DocTypes while preserving the native Frappe Form interface.

It is designed as a generic presentation layer that can support multiple Frappe and ERPNext DocTypes through configurable document templates instead of requiring a separate JavaScript renderer for every DocType.

---

## Features

- Modern document viewing experience inside the native Frappe Form shell
- Designed for Frappe Framework v16
- Designed for ERPNext v16
- Generic DocType-based rendering
- Configurable **Docview Settings**
- Custom Jinja document templates
- Custom CSS per DocType
- System-generated templates shipped with the application
- Template priority support
- Native Frappe navigation remains available
- Native Frappe sidebar remains available
- Native breadcrumbs remain available
- Native document sidebar remains available
- Quick switch between Docview and the standard Frappe Form
- No route change when switching between Docview and the native Form
- Frappe List View integration
- Business-oriented document statuses
- Accountant and CA-friendly tax and totals presentation
- Sales Taxes and Charges presentation
- GST breakup support where applicable
- HSN/SAC
- Taxable Amount
- CGST
- SGST
- IGST
- Tax rates and tax amounts
- Native Frappe PDF generation remains separate from screen rendering
- Responsive layout
- Separate HTML/Jinja, JavaScript, and CSS responsibilities
- Extensible architecture for additional DocTypes

---

## Current Status

**Generic MVP / Early Release**

Docview has moved from a Sales Invoice-specific implementation to a generic DocType-based rendering architecture.

The current release ships with system-generated templates for:

- Sales Invoice
- Sales Order
- Quotation
- Lead
- Item
- Delivery Note

Additional DocTypes can be added through **Docview Settings** without creating a dedicated renderer JavaScript file for every DocType.

The architecture is intentionally designed to allow the project to grow toward a universal document-viewing experience across Frappe and ERPNext.

---

## Supported Versions

| Component | Version |
| ---------------- | ------- |
| Frappe Framework | v16 |
| ERPNext | v16 |
| Docview | v1.0.0 |

---

# Installation

You can install this app using the [Bench CLI](https://github.com/frappe/bench).

From your Frappe Bench directory:

```bash
cd $PATH_TO_YOUR_BENCH

bench get-app https://github.com/panditofcodes/frappe-docview.git

bench --site $SITE_NAME install-app docview
```

For example:

```bash
bench get-app https://github.com/panditofcodes/frappe-docview.git

bench --site your-site.local install-app docview
```

After installation, build the assets:

```bash
bench build --app docview
```

Then restart your bench:

```bash
bench restart
```

If you are developing locally, you may also want to run:

```bash
bench start
```

Frappe apps are installed into a Bench and then installed on individual sites using:

```bash
bench --site $SITE_NAME install-app docview
```

---

# Usage

Once Docview is installed, open a supported DocType from the Frappe Desk.

The current release includes system-generated templates for:

```text
Sales Invoice
Sales Order
Quotation
Lead
Item
Delivery Note
```

For example, opening a Sales Invoice will use the configured Docview template for that DocType.

The document continues to use the native Frappe Form route.

For example:

```text
/app/sales-invoice/<invoice-name>
```

Docview enhances the central document area without replacing the surrounding Frappe Desk interface.

The following parts of the native Frappe shell remain available:

- Navbar
- Desk sidebar
- Breadcrumbs
- Document header
- Right document sidebar

---

# Switching Between Docview and Native Form

Docview does not replace the native Frappe Form.

Instead, the central document area can switch between:

```text
Docview
   ⇅
Native Frappe Form
```

The user can open the native Full Form when they need the complete standard Frappe editing experience.

The user can then return to Docview without changing the document route.

This allows Docview to provide a modern viewing experience while keeping the standard Frappe Form available whenever editing or native ERPNext actions are required.

---

# Docview Settings

Docview is configured through the **Docview Settings** DocType.

Open:

```text
Docview Settings
```

from the Frappe Desk.

A Docview Settings record contains configuration for a particular DocType.

| Field | Description |
| -------------------- | ---------------------------------------------- |
| Enabled | Enables or disables Docview for the DocType |
| Document Type | Frappe DocType that should be rendered |
| Priority | Determines which configuration is selected |
| Is System Generated | Identifies templates shipped by the application |
| System Key | Stable identifier for a system-generated template |
| Template Version | Version of the system template |
| Is Customized | Indicates whether a system template has been customized |
| Custom Jinja | Jinja/HTML template used to render the document |
| Custom CSS | CSS used to style the document |
| Preview | Template preview action |

---

# Enabling and Disabling Docview

Each DocType can be enabled or disabled independently.

To disable Docview for a DocType:

1. Open **Docview Settings**.
2. Open the configuration for the DocType.
3. Set **Enabled** to `No`.
4. Save the document.

The native Frappe Form will then be used normally for that DocType.

Docview does not need to be removed from the application.

---

# Creating a Custom Docview Template

Docview allows users and developers to create custom document views.

Create a new:

```text
Docview Settings
```

Set:

```text
Enabled = Yes
Document Type = Your DocType
Priority = 10
```

Then provide the document markup in **Custom Jinja**.

Example:

```html
<div class="doc-view-wrapper">

    <div class="doc-view-header">
        <div>
            <div class="doc-view-eyebrow">
                {{ doc.doctype }}
            </div>

            <h1 class="doc-view-title">
                {{ doc.name }}
            </h1>
        </div>
    </div>

    <div class="doc-view-card">

        <div class="doc-view-field">
            <div class="doc-view-field-label">
                Customer
            </div>

            <div class="doc-view-field-value">
                {{ doc.customer }}
            </div>
        </div>

        <div class="doc-view-field">
            <div class="doc-view-field-label">
                Date
            </div>

            <div class="doc-view-field-value">
                {{ doc.posting_date }}
            </div>
        </div>

    </div>

</div>
```

Then add styling in **Custom CSS**:

```css
.doc-view-wrapper {
    padding: 32px;
    background: var(--bg-color);
}

.doc-view-card {
    padding: 24px;
    border: 1px solid var(--border-color);
    border-radius: 12px;
    background: var(--card-bg);
}

.doc-view-title {
    margin: 0;
    font-size: 28px;
    font-weight: 600;
}
```

---

# Jinja Template Context

The current document is available to the template as:

```jinja
{{ doc }}
```

Document fields can be accessed directly:

```jinja
{{ doc.name }}
{{ doc.customer }}
{{ doc.company }}
{{ doc.posting_date }}
```

Child tables can be rendered using normal Jinja loops:

```jinja
{% for item in doc.items %}
    <div>
        {{ item.item_code }}
        {{ item.qty }}
        {{ item.rate }}
        {{ item.amount }}
    </div>
{% endfor %}
```

The template is responsible for presenting document data.

---

# Jinja, CSS and JavaScript Responsibilities

Docview intentionally separates document presentation from UI behavior.

## Jinja

Jinja should contain:

- Document content
- Document fields
- Child table data
- Document-specific markup
- Labels
- Conditional document content

## CSS

CSS should contain:

- Layout
- Typography
- Spacing
- Borders
- Colors
- Responsive styling
- Visual presentation

## JavaScript

JavaScript controls:

- Docview lifecycle
- Form ↔ Docview switching
- Expand / collapse controls
- Native Form controls
- UI interactions
- Docview state
- Document navigation behavior

This separation keeps document templates easier to customize and maintain.

---

# Do Not Use Print Formats for Screen Rendering

Docview does **not** use Frappe Print Formats as its screen renderer.

Print Formats and Docview serve different purposes.

### Print Formats

Print Formats are intended for:

- Printing
- PDF generation
- Official document output
- Print-specific layouts

### Docview

Docview is intended for:

- Interactive document viewing
- Modern screen presentation
- Document navigation
- Business document readability
- Switching between view and native Form

This separation allows the Docview screen experience to evolve independently from print and PDF layouts.

---

# Do Not Put UI Icons or Buttons in Jinja

Interactive UI controls belong to the Docview JavaScript layer.

Avoid adding UI controls such as expand, collapse, PDF, email, or share buttons directly into the Jinja template.

For example, do not rely on:

```jinja
{{ frappe.utils.icon("expand", "sm") }}
```

The Jinja template should primarily contain the document content and presentation markup.

Docview JavaScript owns the application-level UI controls.

---

# Template Priority

Multiple Docview Settings records can exist for the same DocType.

Docview selects the applicable configuration using priority.

Example:

```text
Sales Invoice

System Template
Priority: 0

Custom Template
Priority: 10
```

The custom template will be selected because it has the higher priority.

This allows a user or implementation to customize the presentation of a DocType without modifying the application source code.

---

# System-Generated Templates

Docview ships with default templates through application fixtures.

System-generated templates are identified using:

```text
Is System Generated = Yes
```

and a stable:

```text
System Key
```

The current system templates include keys such as:

```text
sales_invoice
sales_order
quotation
lead
item
delivery_note
```

System templates also contain template version information.

This provides a foundation for future application updates while allowing customized templates to be distinguished from application-provided defaults.

---

# Architecture

Docview is designed as a presentation layer on top of the existing Frappe document system.

The architecture is:

```text
Frappe Form
     │
     ▼
docview.js
     │
     ▼
Docview API
     │
     ├── Find Docview Settings
     │
     ├── Check whether Docview is enabled
     │
     ├── Select applicable configuration
     │
     ├── Load Frappe document
     │
     └── Render Jinja template
             │
             ▼
        HTML + Custom CSS
             │
             ▼
          Docview
```

Document data continues to come from the underlying Frappe DocType.

Docview is responsible for presenting that information in a structured, modern document-oriented interface.

---

# Generic Rendering

One of the primary goals of Docview is to avoid maintaining a separate JavaScript renderer for every DocType.

The architecture is intended to avoid a structure such as:

```text
sales_invoice.js
purchase_invoice.js
sales_order.js
purchase_order.js
quotation.js
delivery_note.js
```

Instead, document presentation can be configured through:

```text
Docview Settings
        │
        ├── Document Type
        ├── Custom Jinja
        └── Custom CSS
```

This makes the rendering system reusable across many Frappe DocTypes.

---

# API

Docview provides generic server-side APIs for configuration and document rendering.

## Get Docview Configuration

```text
docview.api.get_docview_config
```

This resolves the enabled Docview configuration for a DocType.

## Render a Document

```text
docview.api.get_docview_html
```

The rendering API accepts:

```text
doctype
name
```

and returns the rendered document content and associated CSS for the selected configuration.

The server verifies that the requested document can be read before rendering it.

---

# Frappe List View

Docview includes frontend support for Frappe List View workflows.

The goal is to allow the existing Frappe navigation model to remain intact while providing a more modern document-viewing experience when a document is opened.

The native Frappe routing and document structure remain the source of truth.

---

# Roadmap

The long-term goal is to provide a consistent document experience across as many Frappe and ERPNext DocTypes as practical.

Potential future support includes:

- Sales Invoice
- Purchase Invoice
- Sales Order
- Purchase Order
- Quotation
- Delivery Note
- Purchase Receipt
- Payment Entry
- Journal Entry
- Expense-related documents
- Stock-related documents
- Customer and Supplier documents
- Other business DocTypes
- More configurable DocType-specific document layouts
- Improved template customization workflows
- Additional document actions
- Additional system-generated templates

The roadmap may evolve as the project develops.

---

# Development

Clone the repository into your Bench:

```bash
cd $PATH_TO_YOUR_BENCH/apps

git clone https://github.com/panditofcodes/frappe-docview.git docview
```

Or use Bench:

```bash
cd $PATH_TO_YOUR_BENCH

bench get-app https://github.com/panditofcodes/frappe-docview.git
```

Install the app on your development site:

```bash
bench --site $SITE_NAME install-app docview
```

Enable developer mode if required:

```bash
bench set-config -g developer_mode 1
```

Then clear the cache:

```bash
bench --site $SITE_NAME clear-cache
```

Build the application assets:

```bash
bench build --app docview
```

For active development, start the Bench:

```bash
bench start
```

Frappe recommends developer mode when developing application components whose changes need to be reflected in the app repository.

---

# Application Structure

The main application structure is:

```text
docview/
├── api.py
├── hooks.py
├── fixtures/
│   └── docview_settings.json
├── docview/
│   └── doctype/
│       └── docview_settings/
│           ├── docview_settings.js
│           ├── docview_settings.json
│           ├── docview_settings.py
│           └── test_docview_settings.py
└── public/
    ├── css/
    │   └── docview.css
    └── js/
        ├── docview.js
        └── docview_list.js
```

---

# Code Quality

Docview uses `pre-commit` for code formatting and linting.

Install pre-commit:

```bash
pip install pre-commit
```

Enable it for the repository:

```bash
cd apps/docview

pre-commit install
```

The repository is configured to use the following tools:

- Ruff
- ESLint
- Prettier
- PyUpgrade

Before submitting a pull request, run:

```bash
pre-commit run --all-files
```

---

# Testing

Before submitting changes, test the affected DocType in a Frappe/ERPNext v16 environment.

For Docview changes, verify at minimum:

1. The configured DocType opens correctly.
2. The Docview template renders correctly.
3. Custom CSS is applied correctly.
4. Native Frappe navigation remains functional.
5. Switching to the native Full Form works.
6. Returning to Docview works.
7. Disabled Docview configurations fall back to the native Form.
8. Navigating between documents does not retain stale Docview state.
9. System-generated templates load correctly after installation or migration.

---

# Contributing

Contributions are welcome.

Before making a significant change, please consider opening an issue to discuss the proposed change.

When submitting a pull request:

1. Keep changes focused and easy to review.
2. Follow the existing project structure and coding style.
3. Run the configured pre-commit checks.
4. Test the affected DocType in a Frappe v16 environment.
5. Avoid unnecessary DocType-specific JavaScript.
6. Keep document presentation in Jinja where possible.
7. Keep styling in CSS.
8. Keep application-level UI behavior in JavaScript.
9. Include screenshots or a short explanation for UI changes where appropriate.
10. Update the documentation when introducing user-facing functionality.

---

# Project Goals

Docview aims to provide:

- A consistent document experience across Frappe applications
- A cleaner presentation of business documents
- Better readability of financial and transactional information
- An interface that works naturally with the existing Frappe Desk
- A reusable architecture for multiple DocTypes
- Configurable document presentation
- A clear separation between document data and presentation
- A community-driven foundation for future document experiences

Docview does not aim to replace the Frappe Form.

The native Form remains available whenever users need the complete standard Frappe editing experience.

---

# License

Docview is released under the **MIT License**.

See [`license.txt`](license.txt) for the full license text.
