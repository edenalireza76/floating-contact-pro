<?php
/**
 * Admin page (single-page app) + AJAX endpoints.
 */

defined( 'ABSPATH' ) || exit;

class FCP_Admin {

	const CAP = 'manage_options';

	public static function init() {
		add_action( 'admin_menu', array( __CLASS__, 'menu' ) );
		add_action( 'admin_enqueue_scripts', array( __CLASS__, 'assets' ) );
		foreach ( array( 'save', 'delete', 'global', 'icon_add', 'icon_delete', 'search_posts' ) as $a ) {
			add_action( 'wp_ajax_fcp_' . $a, array( __CLASS__, 'ajax_' . $a ) );
		}
	}

	public static function menu() {
		add_menu_page(
			'دکمه‌های تماس شناور',
			'دکمه‌های تماس',
			self::CAP,
			'fcp',
			array( __CLASS__, 'page' ),
			'data:image/svg+xml;base64,' . base64_encode( '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path fill="#a7aaad" d="M164.9 24.6c-7.7-18.6-28-28.5-47.4-23.2l-88 24C12.1 30.2 0 46 0 64C0 311.4 200.6 512 448 512c18 0 33.8-12.1 38.6-29.5l24-88c5.3-19.4-4.6-39.7-23.2-47.4l-96-40c-16.3-6.8-35.2-2.1-46.3 11.6L304.7 368C234.3 334.7 177.3 277.7 144 207.3L193.3 167c13.7-11.2 18.4-30 11.6-46.3l-40-96z"/></svg>' ),
			58
		);
	}

	public static function assets( $hook ) {
		if ( 'toplevel_page_fcp' !== $hook ) {
			return;
		}
		wp_enqueue_media();
		wp_enqueue_style( 'fcp-front', FCP_URL . 'assets/css/front.css', array(), FCP_VERSION );
		wp_enqueue_style( 'fcp-admin', FCP_URL . 'assets/css/admin.css', array( 'fcp-front' ), FCP_VERSION );
		wp_enqueue_script( 'fcp-render', FCP_URL . 'assets/js/render.js', array(), FCP_VERSION, true );
		wp_enqueue_script( 'fcp-templates', FCP_URL . 'assets/js/templates.js', array(), FCP_VERSION, true );
		wp_enqueue_script( 'fcp-admin', FCP_URL . 'assets/js/admin.js', array( 'fcp-render', 'fcp-templates' ), FCP_VERSION, true );

		$instances = array();
		foreach ( FCP_Settings::all() as $id => $inst ) {
			$instances[] = FCP_Settings::fill( $inst );
		}

		wp_localize_script( 'fcp-admin', 'FCP_ADMIN', array(
			'ajax'      => admin_url( 'admin-ajax.php' ),
			'nonce'     => wp_create_nonce( 'fcp_admin' ),
			'iconsUrl'  => FCP_URL . 'assets/icons/',
			'version'   => FCP_VERSION,
			'instances' => $instances,
			'defaults'  => FCP_Settings::defaults(),
			'itemDef'   => FCP_Settings::item_defaults(),
			'networks'  => FCP_Networks::all(),
			'ruleTypes' => FCP_Conditions::types(),
			'global'    => FCP_Settings::get_global(),
			'custom'    => (object) FCP_Icons::custom_library(),
			'woo'       => class_exists( 'WooCommerce' ),
			'theme'     => get_template(),
		) );
	}

	public static function page() {
		echo '<div class="wrap fcp-wrap" dir="rtl"><div id="fcp-app"><div class="fcp-loading">در حال بارگذاری…</div></div></div>';
	}

	/* ------------------------------------------------------------------ ajax */

	private static function guard() {
		if ( ! current_user_can( self::CAP ) || ! check_ajax_referer( 'fcp_admin', 'nonce', false ) ) {
			wp_send_json_error( array( 'message' => 'دسترسی غیرمجاز' ), 403 );
		}
	}

	private static function json_param( $key ) {
		$raw = isset( $_POST[ $key ] ) ? wp_unslash( $_POST[ $key ] ) : ''; // phpcs:ignore
		$val = json_decode( (string) $raw, true );
		return is_array( $val ) ? $val : null;
	}

	public static function ajax_save() {
		self::guard();
		$in = self::json_param( 'instance' );
		if ( ! $in ) {
			wp_send_json_error( array( 'message' => 'داده نامعتبر' ) );
		}
		$clean = FCP_Settings::sanitize( $in );
		$all   = FCP_Settings::all();
		$all[ $clean['id'] ] = $clean;
		update_option( FCP_OPTION, $all, true );
		FCP_Settings::payload( $clean ); // warm the icon cache
		FCP_Icons::save_cache();
		self::flush_caches();
		wp_send_json_success( array( 'instance' => FCP_Settings::fill( $clean ) ) );
	}

	public static function ajax_delete() {
		self::guard();
		$id  = sanitize_key( wp_unslash( $_POST['id'] ?? '' ) ); // phpcs:ignore
		$all = FCP_Settings::all();
		unset( $all[ $id ] );
		update_option( FCP_OPTION, $all, true );
		self::flush_caches();
		wp_send_json_success();
	}

	public static function ajax_global() {
		self::guard();
		$in  = self::json_param( 'global' ) ?: array();
		$def = FCP_Settings::global_defaults();
		$out = array(
			'country_code'   => preg_replace( '/\D/', '', (string) ( $in['country_code'] ?? $def['country_code'] ) ),
			'bp_tablet'      => max( 480, (int) ( $in['bp_tablet'] ?? $def['bp_tablet'] ) ),
			'bp_mobile'      => max( 320, (int) ( $in['bp_mobile'] ?? $def['bp_mobile'] ) ),
		);
		update_option( FCP_GLOBAL_OPTION, $out );
		self::flush_caches();
		wp_send_json_success( array( 'global' => $out ) );
	}

	public static function ajax_icon_add() {
		self::guard();
		$svg  = FCP_Icons::sanitize_svg( wp_unslash( $_POST['svg'] ?? '' ) ); // phpcs:ignore
		$name = sanitize_text_field( wp_unslash( $_POST['name'] ?? 'icon' ) ); // phpcs:ignore
		if ( '' === $svg ) {
			wp_send_json_error( array( 'message' => 'کد SVG معتبر نیست.' ) );
		}
		$lib        = FCP_Icons::custom_library();
		$id         = 'c' . strtolower( wp_generate_password( 6, false ) );
		$lib[ $id ] = array( 'name' => $name, 'svg' => $svg );
		update_option( 'fcp_custom_icons', $lib, false );
		wp_send_json_success( array( 'id' => $id, 'icon' => $lib[ $id ] ) );
	}

	public static function ajax_icon_delete() {
		self::guard();
		$id  = sanitize_key( wp_unslash( $_POST['id'] ?? '' ) ); // phpcs:ignore
		$lib = FCP_Icons::custom_library();
		unset( $lib[ $id ] );
		update_option( 'fcp_custom_icons', $lib, false );
		wp_send_json_success();
	}

	public static function ajax_search_posts() {
		self::guard();
		$q   = sanitize_text_field( wp_unslash( $_POST['q'] ?? '' ) ); // phpcs:ignore
		$res = array();
		$posts = get_posts( array(
			's'              => $q,
			'post_type'      => array_values( get_post_types( array( 'public' => true ) ) ),
			'posts_per_page' => 15,
			'post_status'    => 'publish',
		) );
		foreach ( $posts as $p ) {
			$res[] = array( 'id' => $p->ID, 'title' => get_the_title( $p ), 'type' => $p->post_type );
		}
		$terms = get_terms( array( 'search' => $q, 'number' => 10, 'hide_empty' => false, 'taxonomy' => get_taxonomies( array( 'public' => true ) ) ) );
		if ( ! is_wp_error( $terms ) ) {
			foreach ( $terms as $t ) {
				$res[] = array( 'id' => $t->term_id, 'title' => $t->name, 'type' => 'term:' . $t->taxonomy );
			}
		}
		wp_send_json_success( $res );
	}

	/** Purge common page caches so changes appear immediately. */
	private static function flush_caches() {
		if ( function_exists( 'rocket_clean_domain' ) ) {
			rocket_clean_domain();
		}
		if ( function_exists( 'litespeed_purge_all' ) ) {
			litespeed_purge_all();
		}
		do_action( 'litespeed_purge_all' );
		if ( function_exists( 'w3tc_flush_all' ) ) {
			w3tc_flush_all();
		}
		if ( function_exists( 'wp_cache_clear_cache' ) ) {
			wp_cache_clear_cache();
		}
		do_action( 'fcp_settings_saved' );
	}
}
