<?php
/**
 * Plugin Name:       دکمه‌های تماس شناور پرو | Floating Contact Pro
 * Description:       دکمه‌های تماس و شبکه‌های اجتماعی شناور با ۲۰+ قالب آماده، آیکون‌های Font Awesome و آیکون‌های ایرانی (ایتا، بله، روبیکا، سروش…)، تنظیمات کامل موقعیت و اندازه برای دسکتاپ/تبلت/موبایل و شرایط نمایش. سازگار با المنتور پرو، وودمارت، هلو المنتور و سایر قالب‌ها.
 * Version:           1.0.0
 * Requires at least: 5.8
 * Requires PHP:      7.4
 * Author:            Raykapack Tech Team
 * License:           GPL-2.0-or-later
 * Text Domain:       floating-contact-pro
 */

defined( 'ABSPATH' ) || exit;

define( 'FCP_VERSION', '1.0.0' );
define( 'FCP_FILE', __FILE__ );
define( 'FCP_DIR', plugin_dir_path( __FILE__ ) );
define( 'FCP_URL', plugin_dir_url( __FILE__ ) );
define( 'FCP_OPTION', 'fcp_instances' );
define( 'FCP_GLOBAL_OPTION', 'fcp_global' );

require_once FCP_DIR . 'includes/class-networks.php';
require_once FCP_DIR . 'includes/class-icons.php';
require_once FCP_DIR . 'includes/class-settings.php';
require_once FCP_DIR . 'includes/class-conditions.php';
require_once FCP_DIR . 'includes/class-frontend.php';

if ( is_admin() ) {
	require_once FCP_DIR . 'includes/class-admin.php';
	FCP_Admin::init();
}

FCP_Frontend::init();

add_action( 'elementor/widgets/register', function ( $widgets_manager ) {
	require_once FCP_DIR . 'includes/class-elementor-widget.php';
	$widgets_manager->register( new FCP_Elementor_Widget() );
} );

register_activation_hook( __FILE__, function () {
	if ( false === get_option( FCP_OPTION ) ) {
		update_option( FCP_OPTION, array(), false );
	}
} );

add_filter( 'plugin_action_links_' . plugin_basename( __FILE__ ), function ( $links ) {
	array_unshift( $links, '<a href="' . esc_url( admin_url( 'admin.php?page=fcp' ) ) . '">تنظیمات</a>' );
	return $links;
} );
