<?php
/**
 * Front end: decides which instances show on the current request, prints
 * one small JSON payload and loads ~10KB of CSS/JS only when needed.
 */

defined( 'ABSPATH' ) || exit;

class FCP_Frontend {

	private static $floating = array();
	private static $inline   = array();
	private static $printed  = false;

	public static function init() {
		add_action( 'wp', array( __CLASS__, 'collect' ) );
		add_action( 'wp_enqueue_scripts', array( __CLASS__, 'register' ), 5 );
		add_action( 'wp_footer', array( __CLASS__, 'print_data' ), 20 );
		add_shortcode( 'fcp', array( __CLASS__, 'shortcode' ) );
		add_shortcode( 'floating_contact', array( __CLASS__, 'shortcode' ) );
	}

	public static function is_builder_preview() {
		// phpcs:disable WordPress.Security.NonceVerification
		if ( isset( $_GET['elementor-preview'] ) || isset( $_GET['fl_builder'] ) || isset( $_GET['et_fb'] ) ) {
			return true;
		}
		// phpcs:enable
		return class_exists( '\Elementor\Plugin' ) && isset( \Elementor\Plugin::$instance->preview ) && \Elementor\Plugin::$instance->preview->is_preview_mode();
	}

	public static function collect() {
		if ( is_admin() || is_feed() || wp_doing_ajax() || ( defined( 'REST_REQUEST' ) && REST_REQUEST ) || is_embed() ) {
			return;
		}
		$preview = self::is_builder_preview();
		foreach ( FCP_Settings::all() as $raw ) {
			$inst = FCP_Settings::fill( $raw );
			if ( empty( $inst['enabled'] ) ) {
				continue;
			}
			if ( $preview && ! empty( $inst['display']['hide_in_editor'] ) ) {
				continue;
			}
			if ( ! FCP_Conditions::passes( $inst ) ) {
				continue;
			}
			self::$floating[ $inst['id'] ] = FCP_Settings::payload( $inst );
		}
		if ( self::$floating ) {
			add_action( 'wp_enqueue_scripts', array( __CLASS__, 'enqueue' ) );
		}
	}

	public static function register() {
		wp_register_style( 'fcp-front', FCP_URL . 'assets/css/front.css', array(), FCP_VERSION );
		wp_register_script( 'fcp-render', FCP_URL . 'assets/js/render.js', array(), FCP_VERSION, array( 'in_footer' => true, 'strategy' => 'defer' ) );
	}

	public static function enqueue() {
		self::register();
		wp_enqueue_style( 'fcp-front', FCP_URL . 'assets/css/front.css', array(), FCP_VERSION );
		wp_enqueue_script( 'fcp-render', FCP_URL . 'assets/js/render.js', array(), FCP_VERSION, array( 'in_footer' => true, 'strategy' => 'defer' ) );

		static $done = array();
		$css = '';
		foreach ( array_merge( self::$floating, self::$inline ) as $id => $inst ) {
			if ( isset( $done[ $id ] ) ) {
				continue;
			}
			$done[ $id ] = true;
			$css        .= $inst['advanced']['custom_css'] ?? '';
		}
		if ( '' !== trim( $css ) ) {
			wp_add_inline_style( 'fcp-front', $css );
		}
	}

	/**
	 * [fcp id="fcpabc123" part="all|items|socials|trigger"]
	 * Renders a widget inline (e.g. inside a footer column / Elementor / WoodMart HTML block).
	 */
	public static function shortcode( $atts ) {
		$atts = shortcode_atts( array( 'id' => '', 'part' => 'all', 'align' => '' ), $atts, 'fcp' );
		$inst = $atts['id'] ? FCP_Settings::get( $atts['id'] ) : null;
		if ( ! $inst ) {
			$all  = FCP_Settings::all();
			$inst = $all ? FCP_Settings::fill( reset( $all ) ) : null;
		}
		if ( ! $inst ) {
			return '';
		}
		self::$inline[ $inst['id'] ] = FCP_Settings::payload( $inst );
		if ( ! did_action( 'wp_enqueue_scripts' ) ) {
			add_action( 'wp_enqueue_scripts', array( __CLASS__, 'enqueue' ) );
		} else {
			self::enqueue();
		}
		$part  = in_array( $atts['part'], array( 'all', 'items', 'socials' ), true ) ? $atts['part'] : 'all';
		$align = in_array( $atts['align'], array( 'start', 'center', 'end' ), true ) ? $atts['align'] : '';
		$json = wp_json_encode( self::$inline[ $inst['id'] ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_HEX_TAG | JSON_HEX_AMP );
		return '<div class="fcp-inline-slot" data-part="' . esc_attr( $part ) . '"' . ( $align ? ' data-align="' . esc_attr( $align ) . '"' : '' ) . '><script type="application/json">' . $json . '</script></div>'; // phpcs:ignore
	}

	public static function print_data() {
		if ( self::$printed || ! self::$floating ) {
			return;
		}
		self::$printed = true;
		$g    = FCP_Settings::get_global();
		$data = array(
			'bp'       => array( 'tablet' => (int) $g['bp_tablet'], 'mobile' => (int) $g['bp_mobile'] ),
			'tz'       => (float) get_option( 'gmt_offset', 0 ),
			'floating' => array_values( self::$floating ),
		);
		echo "\n<script id=\"fcp-data\" type=\"application/json\">" . wp_json_encode( $data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_HEX_TAG | JSON_HEX_AMP ) . "</script>\n"; // phpcs:ignore
	}
}
