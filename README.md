# Docview

A modern, universal document viewing layer for [Frappe Framework](https://github.com/frappe/frappe) and [ERPNext](https://github.com/frappe/erpnext).

Docview provides a clean, intuitive, and accountant-friendly document experience for Frappe DocTypes while preserving the native Frappe Form interface.

The project is designed to eventually support a wide range of Frappe and ERPNext DocTypes such as invoices, orders, quotations, payments, and other business documents.

## Features

* Modern document viewing experience inside the native Frappe Form shell
* Designed for Frappe Framework v16
* Initial support for **Sales Invoice**
* Native Frappe navigation, sidebar, breadcrumbs, and document actions remain available
* Quick switch between Docview and the standard Frappe Form
* Frappe List View integration
* Business-oriented document statuses
* Accountant and CA-friendly tax and totals presentation
* Sales Taxes and Charges table
* GST breakup with support for:

  * HSN/SAC
  * Taxable Amount
  * CGST
  * SGST
  * IGST
  * Tax rates and tax amounts
* Native Frappe PDF generation
* Responsive layout
* Separate HTML, JavaScript, and CSS architecture
* Designed to be extensible across multiple DocTypes

## Current Status

**MVP**

Docview is currently in its MVP stage with **Sales Invoice** as the first supported DocType.

The architecture is intentionally being built so additional DocTypes can be added without changing the overall user experience.

## Supported Versions

| Component        | Version |
| ---------------- | ------- |
| Frappe Framework | v16     |
| ERPNext          | v16     |
| Docview          | MVP     |

## Installation

You can install this app using the [Bench CLI](https://github.com/frappe/bench).

From your Frappe Bench directory:

```bash
cd $PATH_TO_YOUR_BENCH
bench get-app $URL_OF_THIS_REPO --branch version-16
bench --site $SITE_NAME install-app docview
```

For example:

```bash
bench get-app https://github.com/your-username/docview --branch version-16
bench --site your-site.local install-app docview
```

After installation, build the assets:

```bash
bench build --app docview
```

If you are developing locally, you may also want to run:

```bash
bench start
```

Frappe apps are installed into a Bench and then installed on individual sites using `bench --site ... install-app`.

## Usage

Once installed, open a supported DocType from the Frappe Desk.

For the current MVP, open a **Sales Invoice**:

```text
/app/sales-invoice/<invoice-name>
```

Docview uses the native Frappe Form route and enhances the document experience without replacing the surrounding Frappe Desk interface.

The standard Frappe Form can be restored using the full-form control provided by Docview.

## Architecture

Docview is designed as a presentation layer on top of the existing Frappe document system.

The project keeps the following concerns separated:

```text
Docview
├── HTML templates
├── JavaScript
├── CSS
└── Frappe/ERPNext document data
```

Document data continues to come from the underlying Frappe DocType. Docview is responsible for presenting that information in a more structured document-oriented interface.

This approach makes it possible to add support for additional DocTypes while keeping the overall UI architecture consistent.

## Roadmap

The long-term goal is to provide a consistent document experience across as many Frappe and ERPNext DocTypes as practical.

Potential future support includes:

* Sales Invoice
* Purchase Invoice
* Sales Order
* Purchase Order
* Quotation
* Delivery Note
* Purchase Receipt
* Payment Entry
* Journal Entry
* Expense-related documents
* Stock-related documents
* Other business DocTypes
* Configurable DocType-specific document layouts

The roadmap may evolve as the project develops.

## Development

Clone the repository into your Bench:

```bash
cd $PATH_TO_YOUR_BENCH/apps
git clone $URL_OF_THIS_REPO docview
```

Or use Bench:

```bash
cd $PATH_TO_YOUR_BENCH
bench get-app $URL_OF_THIS_REPO --branch version-16
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

Frappe recommends developer mode when developing application components whose changes need to be reflected in the app repository.

## Code Quality

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

* Ruff
* ESLint
* Prettier
* PyUpgrade

Before submitting a pull request, run:

```bash
pre-commit run --all-files
```

## Contributing

Contributions are welcome.

Before making a significant change, please consider opening an issue to discuss the proposed change.

When submitting a pull request:

1. Keep changes focused and easy to review.
2. Follow the existing project structure and coding style.
3. Run the configured pre-commit checks.
4. Test the affected DocType in a Frappe v16 environment.
5. Include screenshots or a short explanation for UI changes where appropriate.

## Project Goals

Docview aims to provide:

* A consistent document experience across Frappe applications
* A cleaner presentation of business documents
* Better readability of financial and transactional information
* An interface that works naturally with the existing Frappe Desk
* A reusable architecture for multiple DocTypes
* A community-driven foundation for future document experiences

Docview does not aim to replace the Frappe Form. The native Form remains available whenever users need the complete standard Frappe editing experience.

## License

Docview is released under the **MIT License**.

See [`license.txt`](license.txt) for the full license text.
