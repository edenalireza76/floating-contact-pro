<?php
/**
 * Remove all plugin data on uninstall.
 */
defined( 'WP_UNINSTALL_PLUGIN' ) || exit;
foreach ( array( 'fcp_instances', 'fcp_global', 'fcp_custom_icons', 'fcp_icon_cache' ) as $opt ) {
	delete_option( $opt );
}
