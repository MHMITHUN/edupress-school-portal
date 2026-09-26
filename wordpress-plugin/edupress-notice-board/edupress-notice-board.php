<?php
/**
 * Plugin Name:       EduPress Notice Board
 * Plugin URI:        https://example.com/edupress-notice-board
 * Description:       Notice board custom post type, category taxonomy, metaboxes, a normalized REST endpoint and an accessible shortcode — pairs with the EduPress headless school portal (Next.js connector).
 * Version:           1.0.0
 * Requires at least: 6.0
 * Requires PHP:      7.4
 * Author:            EduPress Lab
 * License:           GPL-2.0-or-later
 * License URI:       https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain:       edupress-notice-board
 * Domain Path:       /languages
 *
 * Custom post type:  edupress_notice (slug "notices", show_in_rest)
 * Taxonomy:          edupress_notice_category
 * REST endpoint:     /wp-json/edupress/v1/notices  (GET public, POST for
 *                    authenticated writers — the shape the Next.js
 *                    connector in this repository consumes)
 * Shortcode:         [edupress_notice_board limit="5" category=""]
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit; // No direct access.
}

define( 'EDUPRESS_NB_VERSION', '1.0.0' );
define( 'EDUPRESS_NB_PLUGIN_FILE', __FILE__ );
define( 'EDUPRESS_NB_PLUGIN_DIR', plugin_dir_path( __FILE__ ) );
define( 'EDUPRESS_NB_PLUGIN_URL', plugin_dir_url( __FILE__ ) );

require_once EDUPRESS_NB_PLUGIN_DIR . 'includes/class-edupress-metaboxes.php';
require_once EDUPRESS_NB_PLUGIN_DIR . 'includes/class-edupress-rest.php';

/**
 * Boot: register textdomain, post type, taxonomy and REST meta on init.
 */
function edupress_nb_init() {
	load_plugin_textdomain(
		'edupress-notice-board',
		false,
		dirname( plugin_basename( EDUPRESS_NB_PLUGIN_FILE ) ) . '/languages'
	);

	edupress_nb_register_post_type();
	edupress_nb_register_taxonomy();
	edupress_nb_register_meta();
}
add_action( 'init', 'edupress_nb_init' );

/**
 * The notice board custom post type (public + REST-enabled).
 */
function edupress_nb_register_post_type() {
	register_post_type(
		'edupress_notice',
		array(
			'labels'              => array(
				'name'               => __( 'Notices', 'edupress-notice-board' ),
				'singular_name'      => __( 'Notice', 'edupress-notice-board' ),
				'add_new'            => __( 'Add New Notice', 'edupress-notice-board' ),
				'add_new_item'       => __( 'Add New Notice', 'edupress-notice-board' ),
				'edit_item'          => __( 'Edit Notice', 'edupress-notice-board' ),
				'new_item'           => __( 'New Notice', 'edupress-notice-board' ),
				'view_item'          => __( 'View Notice', 'edupress-notice-board' ),
				'search_items'       => __( 'Search Notices', 'edupress-notice-board' ),
				'not_found'          => __( 'No notices found.', 'edupress-notice-board' ),
				'not_found_in_trash' => __( 'No notices found in Trash.', 'edupress-notice-board' ),
				'menu_name'          => __( 'Notice Board', 'edupress-notice-board' ),
			),
			'public'              => true,
			'menu_icon'           => 'dashicons-megaphone',
			'menu_position'       => 20,
			'has_archive'         => 'notices',
			'rewrite'             => array(
				'slug'       => 'notices',
				'with_front' => false,
			),
			'show_in_rest'        => true,
			'rest_base'           => 'edupress_notice',
			'supports'            => array( 'title', 'editor', 'custom-fields', 'excerpt' ),
			'taxonomies'          => array( 'edupress_notice_category' ),
			'show_in_menu'        => true,
			'delete_with_user'    => false,
		)
	);
}

/**
 * Notice category taxonomy (slugs match the portal's categories).
 */
function edupress_nb_register_taxonomy() {
	register_taxonomy(
		'edupress_notice_category',
		'edupress_notice',
		array(
			'labels'            => array(
				'name'          => __( 'Notice Categories', 'edupress-notice-board' ),
				'singular_name' => __( 'Notice Category', 'edupress-notice-board' ),
				'menu_name'     => __( 'Categories', 'edupress-notice-board' ),
			),
			'hierarchical'      => false,
			'public'            => true,
			'show_admin_column' => true,
			'show_in_rest'      => true,
			'rewrite'           => array(
				'slug'       => 'notice-category',
				'with_front' => false,
			),
		)
	);

	// Seed the six portal categories once (idempotent).
	$seeded = get_option( 'edupress_nb_categories_seeded' );
	if ( ! $seeded ) {
		foreach ( edupress_nb_category_slugs() as $slug => $label ) {
			if ( ! term_exists( $slug, 'edupress_notice_category' ) ) {
				wp_insert_term(
					$label,
					'edupress_notice_category',
					array( 'slug' => $slug )
				);
			}
		}
		update_option( 'edupress_nb_categories_seeded', 1, false );
	}
}

/**
 * Category slugs shared with the Next.js portal (must stay in sync).
 *
 * @return array<string, string> slug => human label.
 */
function edupress_nb_category_slugs() {
	return array(
		'general'   => __( 'General', 'edupress-notice-board' ),
		'exam'      => __( 'Examination', 'edupress-notice-board' ),
		'admission' => __( 'Admission', 'edupress-notice-board' ),
		'event'     => __( 'Event', 'edupress-notice-board' ),
		'holiday'   => __( 'Holiday', 'edupress-notice-board' ),
		'result'    => __( 'Result', 'edupress-notice-board' ),
	);
}

/**
 * Register notice meta so the core REST API exposes and accepts it
 * (the connector's core-CPT fallback reads/writes these keys).
 */
function edupress_nb_register_meta() {
	$string_args = array(
		'type'              => 'string',
		'single'            => true,
		'show_in_rest'      => true,
		'sanitize_callback' => 'sanitize_text_field',
		'auth_callback'     => function () {
			return current_user_can( 'edit_posts' );
		},
	);

	register_post_meta( 'edupress_notice', 'edupress_priority', $string_args );
	register_post_meta( 'edupress_notice', 'edupress_expiry', $string_args );
	register_post_meta( 'edupress_notice', 'edupress_attachment_url', $string_args );
	register_post_meta( 'edupress_notice', 'edupress_attachment_label', $string_args );

	register_post_meta(
		'edupress_notice',
		'edupress_featured',
		array(
			'type'              => 'boolean',
			'single'            => true,
			'show_in_rest'      => true,
			'sanitize_callback' => function ( $value ) {
				return (bool) $value;
			},
			'auth_callback'     => function () {
				return current_user_can( 'edit_posts' );
			},
		)
	);
}

/**
 * Register the REST routes (delegated to the REST class).
 */
function edupress_nb_rest_init() {
	$rest = new Edupress_Notice_Board_Rest();
	$rest->register_routes();
}
add_action( 'rest_api_init', 'edupress_nb_rest_init' );

/**
 * Admin assets: enqueue the small stylesheet/script only on notice screens.
 *
 * @param string $hook_suffix Current admin page hook.
 */
function edupress_nb_admin_assets( $hook_suffix ) {
	$screen = get_current_screen();
	if ( ! $screen || 'edupress_notice' !== $screen->post_type ) {
		return;
	}

	wp_enqueue_style(
		'edupress-notice-board-admin',
		EDUPRESS_NB_PLUGIN_URL . 'assets/admin.css',
		array(),
		EDUPRESS_NB_VERSION
	);

	wp_enqueue_script(
		'edupress-notice-board-admin',
		EDUPRESS_NB_PLUGIN_URL . 'assets/admin.js',
		array(),
		EDUPRESS_NB_VERSION,
		true
	);

	wp_localize_script(
		'edupress-notice-board-admin',
		'edupressNoticeBoard',
		array(
			'restUrl'  => esc_url_raw( rest_url( 'edupress/v1/' ) ),
			'nonce'    => wp_create_nonce( 'wp_rest' ),
			'i18n'     => array(
				'confirmFeatured' => __( 'Pin this notice to the top of the board?', 'edupress-notice-board' ),
			),
		)
	);
}
add_action( 'admin_enqueue_scripts', 'edupress_nb_admin_assets' );

/**
 * Accessible notice list for content editors: [edupress_notice_board limit="5" category=""].
 *
 * @param array $atts Shortcode attributes (limit, category).
 * @return string Escaped HTML list.
 */
function edupress_nb_shortcode( $atts ) {
	$atts = shortcode_atts(
		array(
			'limit'    => 5,
			'category' => '',
		),
		$atts,
		'edupress_notice_board'
	);

	$limit = absint( $atts['limit'] );
	if ( $limit < 1 ) {
		$limit = 5;
	}
	$limit = min( $limit, 50 );

	$args = array(
		'post_type'              => 'edupress_notice',
		'post_status'            => 'publish',
		'posts_per_page'         => $limit,
		'orderby'                => 'date',
		'order'                  => 'DESC',
		'no_found_rows'          => true,
		'update_post_term_cache' => false,
	);

	$category = sanitize_title( $atts['category'] );
	if ( $category ) {
		$args['tax_query'] = array(
			array(
				'taxonomy' => 'edupress_notice_category',
				'field'    => 'slug',
				'terms'    => $category,
			),
		);
	}

	$query = new WP_Query( $args );
	if ( ! $query->have_posts() ) {
		return '<p class="edupress-notice-board-empty">' .
			esc_html__( 'No notices published yet.', 'edupress-notice-board' ) .
			'</p>';
	}

	$out = '<ul class="edupress-notice-board">';
	foreach ( $query->posts as $post ) {
		$priority   = get_post_meta( $post->ID, 'edupress_priority', true );
		$is_featured = (bool) get_post_meta( $post->ID, 'edupress_featured', true );
		$expiry     = get_post_meta( $post->ID, 'edupress_expiry', true );

		// Skip notices whose expiry has passed (same rule as the portal).
		if ( $expiry && strtotime( $expiry ) && strtotime( $expiry ) < time() ) {
			continue;
		}

		$classes = array( 'edupress-notice-board__item' );
		if ( 'high' === $priority || 'urgent' === $priority ) {
			$classes[] = 'edupress-notice-board__item--' . sanitize_html_class( $priority );
		}
		if ( $is_featured ) {
			$classes[] = 'edupress-notice-board__item--featured';
		}

		$out .= sprintf(
			'<li class="%1$s"><time datetime="%2$s">%3$s</time> <a href="%4$s">%5$s</a></li>',
			esc_attr( implode( ' ', $classes ) ),
			esc_attr( get_the_date( 'c', $post ) ),
			esc_html( get_the_date( '', $post ) ),
			esc_url( get_permalink( $post ) ),
			esc_html( get_the_title( $post ) )
		);
	}
	wp_reset_postdata();

	$out .= '</ul>';
	return $out;
}
add_shortcode( 'edupress_notice_board', 'edupress_nb_shortcode' );

/**
 * Flush rewrite rules on activation/deactivation so /notices works at once.
 */
function edupress_nb_activate() {
	edupress_nb_register_post_type();
	edupress_nb_register_taxonomy();
	flush_rewrite_rules();
}
register_activation_hook( __FILE__, 'edupress_nb_activate' );

function edupress_nb_deactivate() {
	flush_rewrite_rules();
}
register_deactivation_hook( __FILE__, 'edupress_nb_deactivate' );
