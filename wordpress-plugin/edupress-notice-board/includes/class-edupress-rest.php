<?php
/**
 * REST endpoint for the EduPress Notice Board plugin.
 *
 * GET  /wp-json/edupress/v1/notices  — public, sanitized, paginated, and
 *                                     NORMALIZED (snake_case) — the exact
 *                                     shape the Next.js connector maps.
 * POST /wp-json/edupress/v1/notices  — authenticated create (Application
 *                                     Passwords / cookie + nonce), the same
 *                                     sanitization as the metabox.
 *
 * Every parameter is sanitized; every response field is escaped or built
 * from already-sanitized data. Draft rows are only served to users who
 * may edit posts.
 *
 * @package Edupress_Notice_Board
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit; // No direct access.
}

/**
 * Class Edupress_Notice_Board_Rest
 */
class Edupress_Notice_Board_Rest {

	const ROUTE_NAMESPACE = 'edupress/v1';
	const ROUTE_BASE      = 'notices';

	/**
	 * Register the two routes.
	 */
	public function register_routes() {
		register_rest_route(
			self::ROUTE_NAMESPACE,
			'/' . self::ROUTE_BASE,
			array(
				array(
					'methods'             => WP_REST_Server::READABLE,
					'callback'            => array( $this, 'get_items' ),
					'permission_callback' => '__return_true', // Public board.
					'args'                => $this->get_collection_args(),
				),
				array(
					'methods'             => WP_REST_Server::CREATABLE,
					'callback'            => array( $this, 'create_item' ),
					'permission_callback' => array( $this, 'can_write' ),
					'args'                => $this->get_create_args(),
				),
			)
		);
	}

	/**
	 * Write permission: any user who can edit posts (Application Password
	 * basic auth maps to the WP user).
	 *
	 * @return bool
	 */
	public function can_write() {
		return current_user_can( 'edit_posts' );
	}

	/**
	 * Sanitized collection query arguments (GET).
	 *
	 * @return array
	 */
	public function get_collection_args() {
		return array(
			'per_page' => array(
				'default'           => 10,
				'sanitize_callback' => function ( $value ) {
					return max( 1, min( 100, absint( $value ) ) );
				},
			),
			'page'     => array(
				'default'           => 1,
				'sanitize_callback' => function ( $value ) {
					return max( 1, absint( $value ) );
				},
			),
			'category' => array(
				'default'           => '',
				'sanitize_callback' => 'sanitize_title',
			),
			'status'   => array(
				'default'           => 'publish',
				'sanitize_callback' => function ( $value ) {
					$value = sanitize_key( $value );
					return in_array( $value, array( 'publish', 'draft', 'any' ), true ) ? $value : 'publish';
				},
			),
			'search'   => array(
				'default'           => '',
				'sanitize_callback' => 'sanitize_text_field',
			),
			'slug'     => array(
				'default'           => '',
				'sanitize_callback' => 'sanitize_title',
			),
		);
	}

	/**
	 * Sanitized create arguments (POST).
	 *
	 * @return array
	 */
	public function get_create_args() {
		return array(
			'title'        => array(
				'required'          => true,
				'sanitize_callback' => 'sanitize_text_field',
			),
			'slug'         => array(
				'default'           => '',
				'sanitize_callback' => 'sanitize_title',
			),
			'body_md'      => array(
				'required'          => true,
				'sanitize_callback' => 'wp_kses_post',
			),
			'category'     => array(
				'default'           => 'general',
				'sanitize_callback' => 'sanitize_title',
			),
			'priority'     => array(
				'default'           => 'normal',
				'sanitize_callback' => function ( $value ) {
					return in_array( $value, array( 'normal', 'high', 'urgent' ), true ) ? $value : 'normal';
				},
			),
			'status'       => array(
				'default'           => 'draft',
				'sanitize_callback' => function ( $value ) {
					return in_array( $value, array( 'publish', 'draft' ), true ) ? $value : 'draft';
				},
			),
			'featured'     => array(
				'default'           => false,
				'sanitize_callback' => function ( $value ) {
					return (bool) $value;
				},
			),
			'published_at' => array(
				'default'           => '',
				'sanitize_callback' => 'sanitize_text_field',
			),
			'expiry_at'    => array(
				'default'           => null,
				'sanitize_callback' => 'sanitize_text_field',
			),
			'attachment'   => array(
				'default'           => null,
			),
		);
	}

	/**
	 * GET handler: normalized notices with pagination headers.
	 *
	 * @param WP_REST_Request $request Incoming request.
	 * @return WP_REST_Response|WP_Error
	 */
	public function get_items( $request ) {
		$can_see_drafts = current_user_can( 'edit_posts' );

		$status = $request->get_param( 'status' );
		if ( 'any' === $status ) {
			$post_status = $can_see_drafts ? array( 'publish', 'draft' ) : 'publish';
		} else {
			$post_status = 'draft' === $status && $can_see_drafts ? 'draft' : 'publish';
		}

		$args = array(
			'post_type'              => 'edupress_notice',
			'post_status'            => $post_status,
			'posts_per_page'         => (int) $request->get_param( 'per_page' ),
			'paged'                  => (int) $request->get_param( 'page' ),
			'orderby'                => 'date',
			'order'                  => 'DESC',
			'suppress_filters'       => false,
		);

		$search = $request->get_param( 'search' );
		if ( $search ) {
			$args['s'] = $search;
		}

		$slug = $request->get_param( 'slug' );
		if ( $slug ) {
			$args['name'] = $slug;
		}

		$category = $request->get_param( 'category' );
		if ( $category ) {
			$args['tax_query'] = array(
				array(
					'taxonomy' => 'edupress_notice_category',
					'field'    => 'slug',
					'terms'    => $category,
				),
			);
		}

		$query    = new WP_Query( $args );
		$post_ids = wp_list_pluck( $query->posts, 'ID' );
		$items    = array();
		foreach ( $post_ids as $post_id ) {
			$normalized = $this->normalize_notice( $post_id );
			if ( null !== $normalized ) {
				$items[] = $normalized;
			}
		}

		$total     = (int) $query->found_posts;
		$per_page  = max( 1, (int) $request->get_param( 'per_page' ) );
		$total_pages = max( 1, (int) ceil( $total / $per_page ) );

		$response = rest_ensure_response( $items );
		$response->header( 'X-WP-Total', $total );
		$response->header( 'X-WP-TotalPages', $total_pages );

		return $response;
	}

	/**
	 * POST handler: create a notice from sanitized args (metabox parity).
	 *
	 * @param WP_REST_Request $request Incoming request.
	 * @return WP_REST_Response|WP_Error
	 */
	public function create_item( $request ) {
		$post_id = wp_insert_post(
			array(
				'post_type'    => 'edupress_notice',
				'post_status'  => 'publish' === $request->get_param( 'status' ) ? 'publish' : 'draft',
				'post_title'   => $request->get_param( 'title' ),
				'post_content' => $request->get_param( 'body_md' ),
				'post_name'    => $request->get_param( 'slug' ) ? $request->get_param( 'slug' ) : '',
			),
			true
		);

		if ( is_wp_error( $post_id ) ) {
			return $post_id;
		}

		update_post_meta( $post_id, 'edupress_priority', $request->get_param( 'priority' ) );
		update_post_meta( $post_id, 'edupress_featured', $request->get_param( 'featured' ) ? '1' : '' );

		$published_at = $request->get_param( 'published_at' );
		if ( $published_at && strtotime( $published_at ) ) {
			// wp_insert_post takes GMT when post_date_gmt is provided.
			wp_update_post(
				array(
					'ID'            => $post_id,
					'post_date_gmt' => gmdate( 'Y-m-d H:i:s', strtotime( $published_at ) ),
					'post_date'     => gmdate( 'Y-m-d H:i:s', strtotime( $published_at ) ),
				)
			);
		}

		$expiry_at = $request->get_param( 'expiry_at' );
		if ( is_string( $expiry_at ) && '' !== $expiry_at && strtotime( $expiry_at ) ) {
			update_post_meta( $post_id, 'edupress_expiry', gmdate( 'Y-m-d H:i', strtotime( $expiry_at ) ) );
		}

		$attachment = $request->get_param( 'attachment' );
		if ( is_array( $attachment ) &&
			isset( $attachment['file_name'], $attachment['label'] ) &&
			'' !== sanitize_text_field( (string) $attachment['file_name'] ) &&
			'' !== sanitize_text_field( (string) $attachment['label'] ) ) {
			update_post_meta( $post_id, 'edupress_attachment_url', sanitize_text_field( (string) $attachment['file_name'] ) );
			update_post_meta( $post_id, 'edupress_attachment_label', sanitize_text_field( (string) $attachment['label'] ) );
		}

		$category = $request->get_param( 'category' );
		$this->assign_category( $post_id, $category );

		$response = rest_ensure_response( $this->normalize_notice( $post_id ) );
		$response->set_status( 201 );

		return $response;
	}

	/**
	 * Assign the category term, creating it when it is a known portal slug.
	 *
	 * @param int    $post_id  Post ID.
	 * @param string $slug     Category slug (already sanitized).
	 */
	private function assign_category( $post_id, $slug ) {
		if ( '' === $slug ) {
			return;
		}

		$term = get_term_by( 'slug', $slug, 'edupress_notice_category' );
		if ( ! $term ) {
			$labels = edupress_nb_category_slugs();
			if ( ! isset( $labels[ $slug ] ) ) {
				return; // Unknown category: leave unassigned rather than invent terms.
			}
			$created = wp_insert_term( $labels[ $slug ], 'edupress_notice_category', array( 'slug' => $slug ) );
			if ( is_wp_error( $created ) ) {
				return;
			}
			$term_id = (int) $created['term_id'];
		} else {
			$term_id = (int) $term->term_id;
		}

		wp_set_object_terms( $post_id, array( $term_id ), 'edupress_notice_category', false );
	}

	/**
	 * Normalize one notice post into the connector's JSON contract.
	 *
	 * @param int $post_id Post ID.
	 * @return array|null Normalized payload (null when unavailable).
	 */
	private function normalize_notice( $post_id ) {
		$post = get_post( $post_id );
		if ( ! $post || 'edupress_notice' !== $post->post_type ) {
			return null;
		}

		$priority = get_post_meta( $post_id, 'edupress_priority', true );
		if ( ! in_array( $priority, array( 'normal', 'high', 'urgent' ), true ) ) {
			$priority = 'normal';
		}

		$expiry = get_post_meta( $post_id, 'edupress_expiry', true );
		if ( $expiry && strtotime( $expiry ) ) {
			$expiry = gmdate( 'c', strtotime( $expiry ) );
		} else {
			$expiry = null;
		}

		$att_url = get_post_meta( $post_id, 'edupress_attachment_url', true );
		$att_lbl = get_post_meta( $post_id, 'edupress_attachment_label', true );
		$attachment = ( $att_url && $att_lbl )
			? array(
				'file_name' => esc_url_raw( $att_url ),
				'label'     => esc_html( $att_lbl ),
			)
			: null;

		$terms = get_the_terms( $post_id, 'edupress_notice_category' );
		$category = ( $terms && ! is_wp_error( $terms ) && isset( $terms[0] ) )
			? $terms[0]->slug
			: 'general';

		return array(
			'id'           => (int) $post_id,
			'slug'         => esc_html( $post->post_name ),
			'title'        => esc_html( $post->post_title ),
			'body_md'      => $post->post_content, // Editor content (markdown-friendly); the portal escapes on render.
			'category'     => esc_html( $category ),
			'priority'     => esc_html( $priority ),
			'status'       => 'publish' === $post->post_status ? 'published' : 'draft',
			'featured'     => (bool) get_post_meta( $post_id, 'edupress_featured', true ),
			'published_at' => mysql2date( 'c', $post->post_date_gmt ),
			'expiry_at'    => $expiry,
			'attachment'   => $attachment,
			'created_at'   => mysql2date( 'c', $post->post_date_gmt ),
			'updated_at'   => mysql2date( 'c', $post->post_modified_gmt ),
		);
	}
}
