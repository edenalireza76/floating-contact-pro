<?php
/**
 * Icon resolver. Every icon is turned into inline SVG at save time, so the
 * front end never loads an icon font (no Font Awesome / efaicons requests).
 *
 * Keys:  fas:name | far:name | fab:name  (Font Awesome 6 Free)
 *        efa:name                         (Iranian icons – Persian Elementor efaicons set)
 *        cus:id                           (custom SVG uploaded/pasted by the user)
 *        img:url                          (image from the media library)
 */

defined( 'ABSPATH' ) || exit;

class FCP_Icons {

	const PACKS = array( 'fas', 'far', 'fab', 'efa' );

	private static $packs = array();

	private static function pack( $p ) {
		if ( ! isset( self::$packs[ $p ] ) ) {
			$file              = FCP_DIR . 'assets/icons/' . $p . '.json';
			self::$packs[ $p ] = file_exists( $file ) ? json_decode( file_get_contents( $file ), true ) : array(); // phpcs:ignore
		}
		return self::$packs[ $p ];
	}

	public static function custom_library() {
		$lib = get_option( 'fcp_custom_icons', array() );
		return is_array( $lib ) ? $lib : array();
	}

	private static $cache = null;
	private static $cache_dirty = false;

	/**
	 * Return inline SVG/IMG markup for an icon key, or '' if unknown.
	 * Used icons are cached in a small option so the large icon packs are only
	 * parsed once (when an icon is used for the first time), never per request.
	 */
	public static function render( $key ) {
		$key = (string) $key;
		if ( '' === $key || false === strpos( $key, ':' ) ) {
			return '';
		}
		if ( null === self::$cache ) {
			$c           = get_option( 'fcp_icon_cache', array() );
			self::$cache = is_array( $c ) ? $c : array();
		}
		if ( isset( self::$cache[ $key ] ) ) {
			return self::$cache[ $key ];
		}
		$svg = self::build( $key );
		if ( '' !== $svg && 0 !== strpos( $key, 'cus:' ) && 0 !== strpos( $key, 'img:' ) ) {
			self::$cache[ $key ] = $svg;
			if ( ! self::$cache_dirty ) {
				self::$cache_dirty = true;
				add_action( 'shutdown', array( __CLASS__, 'save_cache' ) );
			}
		}
		return $svg;
	}

	public static function save_cache() {
		update_option( 'fcp_icon_cache', self::$cache, true );
	}

	private static function build( $key ) {
		list( $p, $name ) = explode( ':', $key, 2 );

		if ( 'img' === $p ) {
			return '<img class="fcp-i fcp-i--img" src="' . esc_url( $name ) . '" alt="" loading="lazy" decoding="async">';
		}
		if ( 'cus' === $p ) {
			$lib = self::custom_library();
			return isset( $lib[ $name ]['svg'] ) ? self::sanitize_svg( $lib[ $name ]['svg'], true ) : '';
		}
		if ( ! in_array( $p, self::PACKS, true ) ) {
			return '';
		}
		$pack = self::pack( $p );
		if ( empty( $pack[ $name ] ) ) {
			return '';
		}
		$i = $pack[ $name ];
		$w = (int) $i[0];
		$h = (int) $i[1];
		$d = esc_attr( $i[2] );
		$t = isset( $i[3] ) ? (int) $i[3] : 0;

		if ( 1 === $t ) { // flipped font glyph (efaicons)
			return '<svg class="fcp-i" viewBox="0 0 ' . $w . ' 1024" aria-hidden="true" focusable="false"><path fill="currentColor" transform="matrix(1 0 0 -1 0 960)" d="' . $d . '"/></svg>';
		}
		if ( 2 === $t ) { // stroke icon
			return '<svg class="fcp-i" viewBox="0 0 ' . $w . ' ' . $h . '" aria-hidden="true" focusable="false"><path fill="none" stroke="currentColor" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round" d="' . $d . '"/></svg>';
		}
		return '<svg class="fcp-i" viewBox="0 0 ' . $w . ' ' . $h . '" aria-hidden="true" focusable="false"><path fill="currentColor" d="' . $d . '"/></svg>';
	}

	/** Strict SVG sanitizer for user supplied icons. */
	public static function sanitize_svg( $svg, $add_class = false ) {
		$svg = (string) $svg;
		if ( ! preg_match( '#<svg[\s\S]*</svg>#i', $svg, $m ) ) {
			return '';
		}
		$svg     = $m[0];
		$svg     = preg_replace( '#<!--.*?-->#s', '', $svg );
		$svg     = preg_replace( '#<(script|style|foreignObject)[\s\S]*?</\1>#i', '', $svg );
		$common  = array(
			'id' => true, 'class' => true, 'fill' => true, 'fill-rule' => true, 'clip-rule' => true, 'fill-opacity' => true,
			'stroke' => true, 'stroke-width' => true, 'stroke-linecap' => true, 'stroke-linejoin' => true,
			'stroke-miterlimit' => true, 'stroke-opacity' => true, 'stroke-dasharray' => true, 'opacity' => true,
			'transform' => true, 'clip-path' => true, 'mask' => true,
		);
		$allowed = array(
			'svg'            => $common + array( 'xmlns' => true, 'viewbox' => true, 'width' => true, 'height' => true, 'preserveaspectratio' => true, 'aria-hidden' => true, 'focusable' => true, 'role' => true ),
			'g'              => $common,
			'path'           => $common + array( 'd' => true ),
			'circle'         => $common + array( 'cx' => true, 'cy' => true, 'r' => true ),
			'ellipse'        => $common + array( 'cx' => true, 'cy' => true, 'rx' => true, 'ry' => true ),
			'rect'           => $common + array( 'x' => true, 'y' => true, 'width' => true, 'height' => true, 'rx' => true, 'ry' => true ),
			'line'           => $common + array( 'x1' => true, 'y1' => true, 'x2' => true, 'y2' => true ),
			'polyline'       => $common + array( 'points' => true ),
			'polygon'        => $common + array( 'points' => true ),
			'defs'           => array(),
			'title'          => array(),
			'clippath'       => array( 'id' => true, 'clippathunits' => true ),
			'mask'           => array( 'id' => true, 'x' => true, 'y' => true, 'width' => true, 'height' => true ),
			'lineargradient' => array( 'id' => true, 'x1' => true, 'y1' => true, 'x2' => true, 'y2' => true, 'gradientunits' => true, 'gradienttransform' => true ),
			'radialgradient' => array( 'id' => true, 'cx' => true, 'cy' => true, 'r' => true, 'fx' => true, 'fy' => true, 'gradientunits' => true, 'gradienttransform' => true ),
			'stop'           => array( 'offset' => true, 'stop-color' => true, 'stop-opacity' => true, 'style' => true ),
		);
		$svg = wp_kses( $svg, $allowed );
		// No javascript: in any remaining attribute.
		$svg = preg_replace( '#(javascript|data):#i', '', $svg );
		// Drop fixed width/height on the root so CSS controls size.
		$svg = preg_replace_callback( '#<svg\b[^>]*>#i', function ( $mm ) use ( $add_class ) {
			$tag = preg_replace( '#\s(width|height)="[^"]*"#i', '', $mm[0] );
			if ( $add_class ) {
				$tag = preg_replace( '#\sclass="[^"]*"#i', '', $tag );
				$tag = str_replace( '<svg', '<svg class="fcp-i" aria-hidden="true" focusable="false"', $tag );
			}
			return $tag;
		}, $svg, 1 );
		return $svg;
	}
}
