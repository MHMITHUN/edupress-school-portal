=== EduPress Notice Board ===
Contributors: edupresslab
Tags: notice, notice-board, headless, rest-api, college, school
Requires at least: 6.0
Tested up to: 6.7
Requires PHP: 7.4
Stable tag: 1.0.0
License: GPLv2 or later
License URI: https://www.gnu.org/licenses/gpl-2.0.html

A notice board custom post type with a taxonomy, metaboxes, a normalized REST endpoint and an accessible shortcode — built to pair with the EduPress headless school portal.

== Description ==

EduPress Notice Board gives a college or school site a proper notice system:

* a `edupress_notice` custom post type (slug `notices`, REST-enabled),
* a `edupress_notice_category` taxonomy (General, Examination, Admission, Event, Holiday, Result),
* metaboxes for priority, featured pin, expiry and attachment metadata,
* a normalized REST endpoint at `/wp-json/edupress/v1/notices` (public GET, authenticated POST),
* the `[edupress_notice_board limit="5" category=""]` shortcode rendering an accessible list,
* a clean uninstall: deleting the plugin removes its posts, terms and options.

The REST payload is the contract consumed by the EduPress Next.js
connector (CMS_MODE=wordpress) — notices created here appear on the
portal's notice board.

Security: nonce verification and capability checks on every save,
parameter sanitization on every endpoint, escaped output, and ABSPATH
guards on every PHP file. Strings are internationalization-ready under
the `edupress-notice-board` textdomain.

== Installation ==

1. Upload the `edupress-notice-board` folder to `/wp-content/plugins/`.
2. Activate the plugin through the **Plugins** screen in WordPress.
3. The **Notice Board** menu appears; rewrite rules are flushed on activation so `/notices/…` works immediately.
4. (Headless mode) Create an Application Password under **Users → Profile → Application Passwords** and set `WORDPRESS_BASE_URL`, `WORDPRESS_USERNAME` and `WORDPRESS_APP_PASSWORD` in the Next.js app.

== Frequently Asked Questions ==

= Does the public REST endpoint leak drafts? =

No. `GET /wp-json/edupress/v1/notices` serves published notices to
everyone; draft rows are only included for authenticated requests by
users who can edit posts.

= What is the normalized JSON shape? =

`id`, `slug`, `title`, `body_md`, `category`, `priority`, `status`
("published" | "draft"), `featured`, `published_at`, `expiry_at`,
`attachment` (`{file_name, label}` or null), `created_at`, `updated_at`.
Pagination totals ride on the `X-WP-Total` / `X-WP-TotalPages` headers.

= Can the shortcode skip expired notices? =

Yes — the same expiry rule as the portal is applied: a notice whose
`edupress_expiry` has passed is skipped by the shortcode.

= What happens when I delete the plugin? =

Everything: the notice posts, the category terms, the plugin's transients
and its single "categories seeded" option. No options-table litter.

== Changelog ==

= 1.0.0 =
* Initial release: `edupress_notice` post type, category taxonomy, metaboxes (priority, featured, expiry, attachment), normalized REST endpoint (GET + POST), accessible shortcode, admin assets, clean uninstall.
