<?php
/**
 * Metaboxes for the EduPress Notice Board plugin: notice priority, featured
 * flag, expiry timestamp and attachment metadata.
 *
 * Security on every save: nonce verification (edupress_nb_meta_nonce),
 * capability check (edit_post), and per-field sanitization. Output in
 * render callbacks is escaped.
 *
 * @package Edupress_Notice_Board
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit; // No direct access.
}

/**
 * Class Edupress_Notice_Board_Metaboxes
 */
class Edupress_Notice_Board_Metaboxes {

	const NONCE_ACTION = 'edupress_nb_save_meta';
	const NONCE_FIELD  = 'edupress_nb_meta_nonce';

	/**
	 * Wire the metabox + save hooks.
	 */
	public function __construct() {
		add_action( 'add_meta_boxes', array( $this, 'add_metabox' ) );
		add_action( 'save_post_edupress_notice', array( $this, 'save' ), 10, 2 );
	}

	/**
	 * Register the metabox on the notice editor.
	 */
	public function add_metabox() {
		add_meta_box(
			'edupress_notice_fields',
			__( 'Notice board fields', 'edupress-notice-board' ),
			array( $this, 'render' ),
			'edupress_notice',
			'side',
			'high'
		);
	}

	/**
	 * Render the metabox (escaped output).
	 *
	 * @param WP_Post $post Current post.
	 */
	public function render( $post ) {
		wp_nonce_field( self::NONCE_ACTION, self::NONCE_FIELD );

		$priority = get_post_meta( $post->ID, 'edupress_priority', true );
		if ( ! in_array( $priority, array( 'normal', 'high', 'urgent' ), true ) ) {
			$priority = 'normal';
		}
		$featured = (bool) get_post_meta( $post->ID, 'edupress_featured', true );
		$expiry   = get_post_meta( $post->ID, 'edupress_expiry', true );
		$att_url  = get_post_meta( $post->ID, 'edupress_attachment_url', true );
		$att_lbl  = get_post_meta( $post->ID, 'edupress_attachment_label', true );
		?>
		<div class="edupress-meta">
			<p class="edupress-meta__field">
				<label for="edupress_priority">
					<strong><?php esc_html_e( 'Priority', 'edupress-notice-board' ); ?></strong>
				</label><br />
				<select id="edupress_priority" name="edupress_priority" class="edupress-meta__priority">
					<option value="normal" <?php selected( $priority, 'normal' ); ?>>
						<?php esc_html_e( 'Normal', 'edupress-notice-board' ); ?>
					</option>
					<option value="high" <?php selected( $priority, 'high' ); ?>>
						<?php esc_html_e( 'High', 'edupress-notice-board' ); ?>
					</option>
					<option value="urgent" <?php selected( $priority, 'urgent' ); ?>>
						<?php esc_html_e( 'Urgent', 'edupress-notice-board' ); ?>
					</option>
				</select>
			</p>

			<p class="edupress-meta__field">
				<label for="edupress_featured">
					<input type="checkbox" id="edupress_featured" name="edupress_featured" value="1" <?php checked( $featured ); ?> />
					<strong><?php esc_html_e( 'Featured (pinned first)', 'edupress-notice-board' ); ?></strong>
				</label>
			</p>

			<p class="edupress-meta__field">
				<label for="edupress_expiry">
					<strong><?php esc_html_e( 'Expires at', 'edupress-notice-board' ); ?></strong>
				</label><br />
				<input type="datetime-local" id="edupress_expiry" name="edupress_expiry"
					value="<?php echo esc_attr( $expiry ); ?>"
					placeholder="YYYY-MM-DD HH:MM" />
				<span class="description">
					<?php esc_html_e( 'Hidden from listings after this time. Leave empty for no expiry.', 'edupress-notice-board' ); ?>
				</span>
			</p>

			<p class="edupress-meta__field">
				<label for="edupress_attachment_label">
					<strong><?php esc_html_e( 'Attachment label', 'edupress-notice-board' ); ?></strong>
				</label><br />
				<input type="text" id="edupress_attachment_label" name="edupress_attachment_label"
					value="<?php echo esc_attr( $att_lbl ); ?>"
					placeholder="<?php esc_attr_e( 'e.g. Routine PDF (420 KB)', 'edupress-notice-board' ); ?>"
					class="widefat" />
			</p>

			<p class="edupress-meta__field">
				<label for="edupress_attachment_url">
					<strong><?php esc_html_e( 'Attachment file/URL', 'edupress-notice-board' ); ?></strong>
				</label><br />
				<input type="text" id="edupress_attachment_url" name="edupress_attachment_url"
					value="<?php echo esc_attr( $att_url ); ?>"
					placeholder="<?php esc_attr_e( 'routine-2026.pdf', 'edupress-notice-board' ); ?>"
					class="widefat" />
			</p>
		</div>
		<?php
	}

	/**
	 * Save handler: nonce + capability checks, then sanitized writes.
	 *
	 * @param int     $post_id Post ID.
	 * @param WP_Post $post    Post object.
	 */
	public function save( $post_id, $post ) {
		// Nonce first — always.
		if ( ! isset( $_POST[ self::NONCE_FIELD ] ) ||
			! wp_verify_nonce( sanitize_text_field( wp_unslash( $_POST[ self::NONCE_FIELD ] ) ), self::NONCE_ACTION ) ) {
			return;
		}

		// Capability check for this specific post.
		if ( ! current_user_can( 'edit_post', $post_id ) ) {
			return;
		}

		// Never save on autosaves/revisions.
		if ( wp_is_post_autosave( $post_id ) || wp_is_post_revision( $post_id ) ) {
			return;
		}

		// Priority (whitelist).
		$priorities = array( 'normal', 'high', 'urgent' );
		$priority   = isset( $_POST['edupress_priority'] )
			? sanitize_text_field( wp_unslash( $_POST['edupress_priority'] ) )
			: 'normal';
		update_post_meta( $post_id, 'edupress_priority', in_array( $priority, $priorities, true ) ? $priority : 'normal' );

		// Featured (checkbox).
		$featured = isset( $_POST['edupress_featured'] );
		update_post_meta( $post_id, 'edupress_featured', $featured ? '1' : '' );

		// Expiry (datetime-local string, normalized Y-m-d H:i).
		$expiry = isset( $_POST['edupress_expiry'] )
			? sanitize_text_field( wp_unslash( $_POST['edupress_expiry'] ) )
			: '';
		if ( '' === $expiry ) {
			delete_post_meta( $post_id, 'edupress_expiry' );
		} else {
			$timestamp = strtotime( str_replace( 'T', ' ', $expiry ) );
			update_post_meta(
				$post_id,
				'edupress_expiry',
				$timestamp ? gmdate( 'Y-m-d H:i', $timestamp ) : ''
			);
		}

		// Attachment metadata.
		$att_label = isset( $_POST['edupress_attachment_label'] )
			? sanitize_text_field( wp_unslash( $_POST['edupress_attachment_label'] ) )
			: '';
		$att_url = isset( $_POST['edupress_attachment_url'] )
			? sanitize_text_field( wp_unslash( $_POST['edupress_attachment_url'] ) )
			: '';
		if ( '' !== $att_label && '' !== $att_url ) {
			update_post_meta( $post_id, 'edupress_attachment_label', $att_label );
			update_post_meta( $post_id, 'edupress_attachment_url', $att_url );
		} else {
			delete_post_meta( $post_id, 'edupress_attachment_label' );
			delete_post_meta( $post_id, 'edupress_attachment_url' );
		}
	}
}

new Edupress_Notice_Board_Metaboxes();
