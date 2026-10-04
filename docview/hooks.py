app_name = "docview"
app_title = "Docview"
app_publisher = "PANDITOFCODES"
app_description = "An app that enables docview for different doctypes."
app_email = "panditofcodes@gmail.com"
app_license = "mit"

# Apps
# ------------------

fixtures = [
    {
        "dt": "Docview Settings",
        "filters": [["is_system_generated", "=", 1]],
    }
]

# required_apps = []

# Each item in the list will be shown as an app in the apps page
# add_to_apps_screen = [
# 	{
# 		"name": "docview",
# 		"logo": "/assets/docview/logo.png",
# 		"title": "Docview",
# 		"route": "/docview",
# 		"has_permission": "docview.api.permission.has_app_permission"
# 	}
# ]

# Includes in <head>
# ------------------

# include js, css files in header of desk.html
app_include_css = [
    "/assets/docview/css/docview.css",
]
app_include_js = [
    "/assets/docview/js/docview.js",
    "/assets/docview/js/docview_list.js",
]

# include js, css files in header of web template
# web_include_css = "/assets/docview/css/docview.css"
# web_include_js = "/assets/docview/js/docview.js"

# include custom scss in every website theme (without file extension ".scss")
# website_theme_scss = "docview/public/scss/website"

# include js, css files in header of web form
# webform_include_js = {"doctype": "public/js/doctype.js"}
# webform_include_css = {"doctype": "public/css/doctype.css"}

# include js in page
# page_js = {"page" : "public/js/file.js"}

# include js in doctype views
# doctype_js = {"Sales Invoice": "public/js/sales_invoice.js"}
# doctype_list_js = {
#     "Sales Invoice": "public/js/sales_invoice_list.js",
# }
# doctype_tree_js = {"doctype" : "public/js/doctype_tree.js"}
# doctype_calendar_js = {"doctype" : "public/js/doctype_calendar.js"}

# Svg Icons
# ------------------
# include app icons in desk
# app_include_icons = "docview/public/icons.svg"

# Home Pages
# ----------

# application home page (will override Website Settings)
# home_page = "login"

# website user home page (by Role)
# role_home_page = {
# 	"Role": "home_page"
# }

# Generators
# ----------

# automatically create page for each record of this doctype
# website_generators = ["Web Page"]

# automatically load and sync documents of this doctype from downstream apps
# importable_doctypes = [doctype_1]

# Jinja
# ----------

# add methods and filters to jinja environment
# jinja = {
# 	"methods": "docview.utils.jinja_methods",
# 	"filters": "docview.utils.jinja_filters"
# }

# Installation
# ------------

# before_install = "docview.install.before_install"
# after_install = "docview.install.after_install"

# Uninstallation
# ------------

# before_uninstall = "docview.uninstall.before_uninstall"
# after_uninstall = "docview.uninstall.after_uninstall"

# Integration Setup
# ------------------
# To set up dependencies/integrations with other apps
# Name of the app being installed is passed as an argument

# before_app_install = "docview.utils.before_app_install"
# after_app_install = "docview.utils.after_app_install"

# Integration Cleanup
# -------------------
# To clean up dependencies/integrations with other apps
# Name of the app being uninstalled is passed as an argument

# before_app_uninstall = "docview.utils.before_app_uninstall"
# after_app_uninstall = "docview.utils.after_app_uninstall"

# Build
# ------------------
# To hook into the build process

# after_build = "docview.build.after_build"

# Desk Notifications
# ------------------
# See frappe.core.notifications.get_notification_config

# notification_config = "docview.notifications.get_notification_config"

# Awesome Bar
# -----------
# Extra search results: list of dicts with label, description, route, index.
# route: ["List", "ToDo"], "/desk/docs/some/page", or "https://example.com"
# awesomebar_search = ["docview.search.awesomebar_results"]

# Permissions
# -----------
# Permissions evaluated in scripted ways

# permission_query_conditions = {
# 	"Event": "frappe.desk.doctype.event.event.get_permission_query_conditions",
# }
#
# has_permission = {
# 	"Event": "frappe.desk.doctype.event.event.has_permission",
# }

# Document Events
# ---------------
# Hook on document methods and events

# doc_events = {
# 	"*": {
# 		"on_update": "method",
# 		"on_cancel": "method",
# 		"on_trash": "method"
# 	}
# }

# Scheduled Tasks
# ---------------

# scheduler_events = {
# 	"all": [
# 		"docview.tasks.all"
# 	],
# 	"daily": [
# 		"docview.tasks.daily"
# 	],
# 	"hourly": [
# 		"docview.tasks.hourly"
# 	],
# 	"weekly": [
# 		"docview.tasks.weekly"
# 	],
# 	"monthly": [
# 		"docview.tasks.monthly"
# 	],
# }

# Testing
# -------

# before_tests = "docview.install.before_tests"

# Extend DocType Class
# ------------------------------
#
# Specify custom mixins to extend the standard doctype controller.
# extend_doctype_class = {
# 	"Task": "docview.custom.task.CustomTaskMixin"
# }

# Overriding Methods
# ------------------------------
#
# override_whitelisted_methods = {
# 	"frappe.desk.doctype.event.event.get_events": "docview.event.get_events"
# }
#
# each overriding function accepts a `data` argument;
# generated from the base implementation of the doctype dashboard,
# along with any modifications made in other Frappe apps
# override_doctype_dashboards = {
# 	"Task": "docview.task.get_dashboard_data"
# }

# exempt linked doctypes from being automatically cancelled
#
# auto_cancel_exempted_doctypes = ["Auto Repeat"]

# Ignore links to specified DocTypes when deleting documents
# -----------------------------------------------------------

# ignore_links_on_delete = ["Communication", "ToDo"]

# Request Events
# ----------------
# before_request = ["docview.utils.before_request"]
# after_request = ["docview.utils.after_request"]

# Job Events
# ----------
# before_job = ["docview.utils.before_job"]
# after_job = ["docview.utils.after_job"]

# User Data Protection
# --------------------

# user_data_fields = [
# 	{
# 		"doctype": "{doctype_1}",
# 		"filter_by": "{filter_by}",
# 		"redact_fields": ["{field_1}", "{field_2}"],
# 		"partial": 1,
# 	},
# 	{
# 		"doctype": "{doctype_2}",
# 		"filter_by": "{filter_by}",
# 		"partial": 1,
# 	},
# 	{
# 		"doctype": "{doctype_3}",
# 		"strict": False,
# 	},
# 	{
# 		"doctype": "{doctype_4}"
# 	}
# ]

# Authentication and authorization
# --------------------------------

# auth_hooks = [
# 	"docview.auth.validate"
# ]

# Automatically update python controller files with type annotations for this app.
# export_python_type_annotations = True

# default_log_clearing_doctypes = {
# 	"Logging DocType Name": 30  # days to retain logs
# }

# Translation
# ------------
# List of apps whose translatable strings should be excluded from this app's translations.
# ignore_translatable_strings_from = []
