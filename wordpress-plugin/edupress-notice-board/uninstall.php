<?php
/**
 * Uninstall handler for the EduPress Notice Board plugin.
 *
 * Runs when the plugin is DELETED from the Plugins screen. Removes every
 * trace of its data: CPT posts (any status, including trash), taxonomy
 * terms, its transients and the single "categories seeded" flag. Nothing
 * is left in wp_options.
 *
 * Security: guarded by WP_UNINSTALL_PLUGIN (WordPress sets it only for a
 * genuine, user-initiated delete) — direct requests exit immediately.
 *
 * @package Edupress_Notice_Board
 */

if ( ! defined( 'WP_UNINSTALL_PLUGIN' ) ) {
	exit; // No direct access, no accidental runs.
}

// 1) Delete every edupress_notice post (published, draft, trashed).
$notice_ids = get_posts(
	array(
		'post_type'      => 'edupress_notice',
		'post_status'    => 'any',
		'posts_per_page' => -1,
		'fields'         => 'ids',
	)
);
foreach ( (array) $notice_ids as $notice_id ) {
	wp_delete_post( (int) $notice_id, true ); // force delete, bypass trash
}

// 2) Delete the taxonomy terms (deleting posts does not remove terms).
$terms = get_terms(
	array(
		'taxonomy'   => 'edupress_notice_category',
		'hide_empty' => false,
	)
);
if ( ! is_wp_error( $terms ) ) {
	foreach ( $terms as $term ) {
		wp_delete_term( (int) $term->term_id, 'edupress_notice_category' );
	}
}

// 3) Remove any transients the plugin may have cached.
global $wpdb;
$wpdb->query( // phpcs:ignore WordPress.DB.DirectDatabaseQuery
	"DELETE FROM {$wpdb->options}
	 WHERE option_name LIKE '\\_transient\\_edupress\\_nb\\_%'
	    OR option_name LIKE '\\_transient\\_timeout\\_edupress\\_nb\\_%'"
);

// 4) Remove the one option flag the plugin writes.
delete_option( 'edupress_nb_categories_seeded' );
