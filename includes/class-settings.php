<?php
/**
 * Storage, defaults and sanitizing of widget instances.
 */

defined( 'ABSPATH' ) || exit;

class FCP_Settings {

	public static function global_defaults() {
		return array(
			'country_code'   => '98',
			'bp_tablet'      => 1024,
			'bp_mobile'      => 767,
		);
	}

	public static function get_global() {
		$g = get_option( FCP_GLOBAL_OPTION, array() );
		return wp_parse_args( is_array( $g ) ? $g : array(), self::global_defaults() );
	}

	public static function device_defaults() {
		return array(
			'desktop' => array(),
			'tablet'  => array(),
			'mobile'  => array(),
		);
	}

	public static function defaults() {
		return array(
			'id'          => '',
			'name'        => 'دکمه تماس جدید',
			'enabled'     => true,
			'layout'      => 'panel',
			'template'    => '',
			'header'      => array(
				'show'     => true,
				'title'    => 'نیاز به مشاوره تخصصی دارید؟',
				'subtitle' => 'تماس با مشاوران فروش',
				'avatar'   => '',
				'agent'    => '',
				'role'     => '',
				'message'  => '',
				'time'     => '',
				'online'   => true,
				'icon'     => '',
			),
			'items'       => array(),
			'socials'     => array(
				'show'  => true,
				'title' => 'شبکه‌های اجتماعی:',
				'items' => array(),
				'shape' => 'rounded',
			),
			'cta'         => array(
				'show' => false,
				'text' => 'شروع گفتگو',
				'icon' => 'fab:whatsapp',
				'link' => '',
				'item' => '',
			),
			'trigger'     => array(
				'icon'        => 'fas:phone-volume',
				'close_icon'  => 'fas:xmark',
				'label'       => '',
				'label_show'  => false,
				'shape'       => 'circle',
				'pulse'       => true,
				'animate'     => 'rotate',
				'badge_show'  => false,
				'badge_text'  => '1',
				'greet_show'  => false,
				'greet_text'  => 'سلام 👋 سوالی دارید؟',
				'greet_delay' => 4,
				'auto_open'   => 0,
				'open_on'     => 'click',
				'tooltip'     => '',
			),
			'opts'        => array(
				'item_style'   => 'card',
				'close_style'  => 'outside',
				'show_value'   => true,
				'value_ltr'    => true,
				'dial_labels'  => 'always',
				'tabs_expand'  => 'hover',
				'pill_labels'  => false,
				'bar_mode'     => 'icons',
				'chat_mode'    => 'button',
				'columns'      => 2,
				'overlay'      => false,
				'close_outside'=> true,
			),
			'position'    => array(
				'desktop' => array( 'place' => 'bottom-right', 'x' => 24, 'y' => 24 ),
				'tablet'  => array( 'place' => '', 'x' => '', 'y' => '' ),
				'mobile'  => array( 'place' => '', 'x' => 16, 'y' => 16 ),
			),
			'size'        => array(
				'desktop' => array( 'trigger' => 60, 'icon' => 26, 'panel' => 340, 'font' => 14, 'item_icon' => 44, 'radius' => 18, 'gap' => 10, 'social' => 38, 'title' => 17 ),
				'tablet'  => array( 'trigger' => '', 'icon' => '', 'panel' => '', 'font' => '', 'item_icon' => '', 'radius' => '', 'gap' => '', 'social' => '', 'title' => '' ),
				'mobile'  => array( 'trigger' => 56, 'icon' => 24, 'panel' => 310, 'font' => '', 'item_icon' => 40, 'radius' => '', 'gap' => '', 'social' => '', 'title' => 16 ),
			),
			'colors'      => array(
				'trigger_bg'    => '#22c55e',
				'trigger_color' => '#ffffff',
				'close_bg'      => '#0b3d6b',
				'close_color'   => '#ffffff',
				'panel_bg'      => '#ffffff',
				'header_bg'     => '#0b4a7a',
				'header_bg2'    => '#0b3d6b',
				'header_text'   => '#ffffff',
				'item_bg'       => '#f4f7fb',
				'item_border'   => '#e2e8f0',
				'item_title'    => '#475569',
				'item_value'    => '#0b4a7a',
				'icon_bg'       => '#2f3e4c',
				'icon_color'    => '#f5c518',
				'social_bg'     => '#2f3e4c',
				'social_color'  => '#f5c518',
				'cta_bg'        => '#22c55e',
				'cta_color'     => '#ffffff',
				'badge_bg'      => '#ef4444',
				'label_bg'      => '#ffffff',
				'label_color'   => '#1e293b',
			),
			'style'       => array(
				'font'          => 'inherit',
				'shadow'        => 'lg',
				'animation'     => 'slide',
				'persian_digits'=> true,
				'dir'           => 'rtl',
				'network_colors'=> false,
				'gradient'      => true,
				'glass'         => false,
				'border_width'  => 1,
			),
			'display'     => array(
				'desktop'        => true,
				'tablet'         => true,
				'mobile'         => true,
				'rules'          => array( array( 'mode' => 'include', 'type' => 'all', 'value' => '' ) ),
				'users'          => 'all',
				'delay'          => 0,
				'scroll'         => 0,
				'sched_on'       => false,
				'sched_days'     => array( 6, 0, 1, 2, 3 ),
				'sched_from'     => '09:00',
				'sched_to'       => '18:00',
				'sched_outside'  => 'hide',
				'sched_note'     => 'خارج از ساعت کاری؛ پیام بگذارید تا با شما تماس بگیریم.',
				'hide_in_editor' => true,
			),
			'advanced'    => array(
				'z'               => 9990,
				'custom_css'      => '',
				'analytics'       => true,
				'woodmart_offset' => true,
				'class'           => '',
			),
		);
	}

	public static function item_defaults() {
		return array(
			'id'         => '',
			'enabled'    => true,
			'network'    => 'phone',
			'label'      => '',
			'sub'        => '',
			'value'      => '',
			'message'    => '',
			'icon'       => '',
			'color'      => '',
			'icon_color' => '',
			'bg'         => '',
			'new_tab'    => true,
		);
	}

	/* ---------------------------------------------------------------- storage */

	public static function all() {
		$list = get_option( FCP_OPTION, array() );
		return is_array( $list ) ? $list : array();
	}

	public static function get( $id ) {
		$all = self::all();
		return isset( $all[ $id ] ) ? self::fill( $all[ $id ] ) : null;
	}

	/** Deep-merge saved data over defaults so new options always exist. */
	public static function fill( $inst ) {
		return self::merge( self::defaults(), (array) $inst );
	}

	private static function merge( $def, $in ) {
		foreach ( $def as $k => $v ) {
			if ( ! array_key_exists( $k, $in ) ) {
				$in[ $k ] = $v;
			} elseif ( is_array( $v ) && is_array( $in[ $k ] ) && self::is_assoc( $v ) ) {
				$in[ $k ] = self::merge( $v, $in[ $k ] );
			}
		}
		return $in;
	}

	private static function is_assoc( $a ) {
		return array() === $a ? false : array_keys( $a ) !== range( 0, count( $a ) - 1 );
	}

	/* ------------------------------------------------------------- sanitizing */

	public static function sanitize( $in ) {
		$def = self::defaults();
		$out = self::clean( $def, is_array( $in ) ? $in : array() );

		$out['id'] = preg_replace( '/[^a-z0-9_]/', '', strtolower( (string) ( $in['id'] ?? '' ) ) );
		if ( '' === $out['id'] ) {
			$out['id'] = 'fcp' . strtolower( wp_generate_password( 6, false ) );
		}

		$layouts       = array( 'panel', 'chat', 'speeddial', 'tabs', 'pill', 'cta', 'bubble', 'bar' );
		$out['layout'] = in_array( $out['layout'], $layouts, true ) ? $out['layout'] : 'panel';

		$out['items']            = self::clean_items( $in['items'] ?? array() );
		$out['socials']['items'] = self::clean_items( $in['socials']['items'] ?? array() );

		$rules = array();
		foreach ( (array) ( $in['display']['rules'] ?? array() ) as $r ) {
			$rules[] = array(
				'mode'  => ( ( $r['mode'] ?? '' ) === 'exclude' ) ? 'exclude' : 'include',
				'type'  => sanitize_key( $r['type'] ?? 'all' ),
				'value' => sanitize_text_field( $r['value'] ?? '' ),
			);
		}
		$out['display']['rules'] = $rules;

		$days = array();
		foreach ( (array) ( $in['display']['sched_days'] ?? array() ) as $d ) {
			$d = (int) $d;
			if ( $d >= 0 && $d <= 6 ) {
				$days[] = $d;
			}
		}
		$out['display']['sched_days'] = array_values( array_unique( $days ) );

		// CSS: strip tags only; admins only can save (capability checked).
		$out['advanced']['custom_css'] = wp_strip_all_tags( (string) ( $in['advanced']['custom_css'] ?? '' ) );
		$out['header']['avatar']       = esc_url_raw( (string) ( $in['header']['avatar'] ?? '' ) );
		$out['header']['message']      = sanitize_textarea_field( (string) ( $in['header']['message'] ?? '' ) );
		$out['display']['sched_note']  = sanitize_textarea_field( (string) ( $in['display']['sched_note'] ?? '' ) );
		$out['advanced']['class']      = sanitize_html_class( (string) ( $in['advanced']['class'] ?? '' ) );
		return $out;
	}

	/** Type-driven recursive cleaner based on the default value's type. */
	private static function clean( $def, $in, $num_strings = false ) {
		$out = array();
		foreach ( $def as $k => $dv ) {
			$v = array_key_exists( $k, $in ) ? $in[ $k ] : $dv;
			if ( is_bool( $dv ) ) {
				$out[ $k ] = filter_var( $v, FILTER_VALIDATE_BOOLEAN );
			} elseif ( is_int( $dv ) || is_float( $dv ) ) {
				$out[ $k ] = is_numeric( $v ) ? $v + 0 : $dv;
			} elseif ( is_array( $dv ) && self::is_assoc( $dv ) ) {
				$out[ $k ] = self::clean( $dv, is_array( $v ) ? $v : array(), $num_strings || in_array( $k, array( 'size', 'position' ), true ) );
			} elseif ( is_array( $dv ) ) {
				$out[ $k ] = $dv; // lists are handled explicitly by the caller
			} else {
				// strings; in device maps '' means "inherit"
				$out[ $k ] = ( $num_strings && is_numeric( $v ) ) ? $v + 0 : sanitize_text_field( (string) $v );
			}
		}
		return $out;
	}

	private static function clean_items( $items ) {
		$out = array();
		$nets = FCP_Networks::all();
		foreach ( (array) $items as $it ) {
			if ( ! is_array( $it ) ) {
				continue;
			}
			$c            = self::clean( self::item_defaults(), $it );
			$c['message'] = sanitize_textarea_field( (string) ( $it['message'] ?? '' ) );
			$c['id']      = $c['id'] ? sanitize_key( $c['id'] ) : 'i' . strtolower( wp_generate_password( 6, false ) );
			if ( ! isset( $nets[ $c['network'] ] ) ) {
				$c['network'] = 'custom';
			}
			$out[] = $c;
		}
		return $out;
	}

	/* --------------------------------------------------- front-end payload */

	/** Add hrefs and the inline-SVG icon map that the renderer needs. */
	public static function payload( $inst ) {
		$inst  = self::fill( $inst );
		$g     = self::get_global();
		$nets  = FCP_Networks::all();
		$icons = array();

		$use = function ( $key ) use ( &$icons ) {
			if ( $key && ! isset( $icons[ $key ] ) ) {
				$icons[ $key ] = FCP_Icons::render( $key );
			}
		};

		foreach ( array( 'items', 'socials' ) as $grp ) {
			$list = 'items' === $grp ? $inst['items'] : $inst['socials']['items'];
			$res  = array();
			foreach ( $list as $it ) {
				if ( empty( $it['enabled'] ) ) {
					continue;
				}
				$net        = $nets[ $it['network'] ] ?? $nets['custom'];
				$it['icon'] = $it['icon'] ? $it['icon'] : $net['icon'];
				$it['href'] = FCP_Networks::href( $it, $g['country_code'] );
				$it['ncolor'] = $net['color'];
				if ( '' === $it['label'] ) {
					$it['label'] = $net['label'];
				}
				$use( $it['icon'] );
				$res[] = $it;
			}
			if ( 'items' === $grp ) {
				$inst['items'] = $res;
			} else {
				$inst['socials']['items'] = $res;
			}
		}

		// CTA target: a linked item or a custom link.
		if ( $inst['cta']['item'] ) {
			foreach ( $inst['items'] as $it ) {
				if ( $it['id'] === $inst['cta']['item'] ) {
					$inst['cta']['href'] = $it['href'];
				}
			}
		}
		if ( empty( $inst['cta']['href'] ) ) {
			$inst['cta']['href'] = $inst['cta']['link'] ? esc_url_raw( $inst['cta']['link'] ) : ( $inst['items'][0]['href'] ?? '' );
		}

		$use( $inst['trigger']['icon'] );
		$use( $inst['trigger']['close_icon'] );
		$use( $inst['cta']['icon'] );
		$use( $inst['header']['icon'] );
		$use( 'fas:xmark' );

		unset( $inst['display']['rules'] );
		$inst['icons'] = $icons;
		$inst['bp']    = array( 'tablet' => (int) $g['bp_tablet'], 'mobile' => (int) $g['bp_mobile'] );
		$inst['tz']    = (float) get_option( 'gmt_offset', 0 );
		return $inst;
	}
}
