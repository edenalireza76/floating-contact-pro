<?php
/**
 * Server-side display rules (page targeting + user state).
 * Device, schedule, delay and scroll rules run in the browser so they keep
 * working behind full-page caches.
 */

defined( 'ABSPATH' ) || exit;

class FCP_Conditions {

	public static function types() {
		return array(
			'all'          => 'کل سایت',
			'front'        => 'صفحه اصلی',
			'blog'         => 'صفحه نوشته‌ها (بلاگ)',
			'singular'     => 'همه صفحات تکی (نوشته/برگه/محصول)',
			'post_type'    => 'نوع پست خاص (نامک، مثلا page یا product)',
			'ids'          => 'نوشته/برگه/محصول خاص (شناسه‌ها)',
			'terms'        => 'دسته/برچسب خاص و محتوای آن (شناسه‌ها)',
			'archive'      => 'همه آرشیوها',
			'search'       => 'نتایج جستجو',
			'404'          => 'صفحه ۴۰۴',
			'woo_shop'     => 'ووکامرس: فروشگاه و دسته‌ها',
			'woo_product'  => 'ووکامرس: صفحه محصول',
			'woo_cart'     => 'ووکامرس: سبد خرید',
			'woo_checkout' => 'ووکامرس: تسویه حساب',
			'woo_account'  => 'ووکامرس: حساب کاربری',
			'url'          => 'آدرس شامل عبارت',
		);
	}

	public static function passes( $inst ) {
		$d = $inst['display'];

		if ( 'guests' === $d['users'] && is_user_logged_in() ) {
			return false;
		}
		if ( 'logged' === $d['users'] && ! is_user_logged_in() ) {
			return false;
		}

		$rules    = (array) $d['rules'];
		$includes = array_filter( $rules, function ( $r ) { return 'include' === $r['mode']; } );
		$excludes = array_filter( $rules, function ( $r ) { return 'exclude' === $r['mode']; } );

		foreach ( $excludes as $r ) {
			if ( self::match( $r ) ) {
				return false;
			}
		}
		if ( empty( $includes ) ) {
			return true;
		}
		foreach ( $includes as $r ) {
			if ( self::match( $r ) ) {
				return true;
			}
		}
		return false;
	}

	private static function ids( $v ) {
		return array_filter( array_map( 'intval', preg_split( '/[\s,،]+/', (string) $v ) ) );
	}

	public static function match( $r ) {
		$v   = trim( (string) $r['value'] );
		$woo = function_exists( 'is_woocommerce' );
		switch ( $r['type'] ) {
			case 'all':
				return true;
			case 'front':
				return is_front_page();
			case 'blog':
				return is_home();
			case 'singular':
				return is_singular();
			case 'post_type':
				$types = array_filter( array_map( 'trim', explode( ',', $v ) ) );
				return $types && ( is_singular( $types ) || is_post_type_archive( $types ) );
			case 'ids':
				$ids = self::ids( $v );
				return $ids && is_singular() && in_array( (int) get_queried_object_id(), $ids, true );
			case 'terms':
				$ids = self::ids( $v );
				if ( ! $ids ) {
					return false;
				}
				if ( is_category() || is_tag() || is_tax() ) {
					return in_array( (int) get_queried_object_id(), $ids, true );
				}
				if ( is_singular() ) {
					$post = get_queried_object();
					foreach ( get_object_taxonomies( $post->post_type ) as $tax ) {
						$terms = wp_get_post_terms( $post->ID, $tax, array( 'fields' => 'ids' ) );
						if ( ! is_wp_error( $terms ) && array_intersect( $ids, array_map( 'intval', $terms ) ) ) {
							return true;
						}
					}
				}
				return false;
			case 'archive':
				return is_archive();
			case 'search':
				return is_search();
			case '404':
				return is_404();
			case 'woo_shop':
				return $woo && ( is_shop() || is_product_taxonomy() );
			case 'woo_product':
				return $woo && is_product();
			case 'woo_cart':
				return $woo && is_cart();
			case 'woo_checkout':
				return $woo && is_checkout();
			case 'woo_account':
				return $woo && is_account_page();
			case 'url':
				return '' !== $v && false !== stripos( rawurldecode( $_SERVER['REQUEST_URI'] ?? '' ), $v ); // phpcs:ignore
		}
		return false;
	}
}
