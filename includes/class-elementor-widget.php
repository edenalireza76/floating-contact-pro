<?php
/**
 * Elementor widget: place a contact widget (or only its contacts / socials)
 * inline anywhere – footer templates, WoodMart HTML blocks, Theme Builder…
 */

defined( 'ABSPATH' ) || exit;

class FCP_Elementor_Widget extends \Elementor\Widget_Base {

	public function get_name() {
		return 'fcp-inline';
	}

	public function get_title() {
		return 'دکمه‌های تماس / شبکه‌های اجتماعی';
	}

	public function get_icon() {
		return 'eicon-share';
	}

	public function get_categories() {
		return array( 'general' );
	}

	public function get_keywords() {
		return array( 'contact', 'social', 'whatsapp', 'تماس', 'شبکه اجتماعی', 'واتساپ', 'ایتا' );
	}

	public function get_style_depends() {
		return array( 'fcp-front' );
	}

	public function get_script_depends() {
		return array( 'fcp-render' );
	}

	protected function register_controls() {
		$opts = array();
		foreach ( FCP_Settings::all() as $id => $inst ) {
			$opts[ $id ] = $inst['name'] ?? $id;
		}

		$this->start_controls_section( 'content', array( 'label' => 'تنظیمات' ) );

		$this->add_control( 'instance', array(
			'label'       => 'ویجت تماس',
			'type'        => \Elementor\Controls_Manager::SELECT,
			'options'     => $opts,
			'default'     => $opts ? array_key_first( $opts ) : '',
			'description' => $opts ? 'ظاهر و آیتم‌ها از تنظیمات افزونه خوانده می‌شود.' : 'ابتدا از منوی «دکمه‌های تماس» یک ویجت بسازید.',
		) );

		$this->add_control( 'part', array(
			'label'   => 'چه چیزی نمایش داده شود؟',
			'type'    => \Elementor\Controls_Manager::SELECT,
			'default' => 'socials',
			'options' => array(
				'socials' => 'فقط آیکون‌های شبکه اجتماعی',
				'items'   => 'فقط آیتم‌های تماس',
				'all'     => 'کل پنل (هدر + تماس‌ها + شبکه‌ها)',
			),
		) );

		$this->add_responsive_control( 'align', array(
			'label'     => 'چینش',
			'type'      => \Elementor\Controls_Manager::CHOOSE,
			'options'   => array(
				'flex-start' => array( 'title' => 'شروع', 'icon' => 'eicon-h-align-right' ),
				'center'     => array( 'title' => 'وسط', 'icon' => 'eicon-h-align-center' ),
				'flex-end'   => array( 'title' => 'پایان', 'icon' => 'eicon-h-align-left' ),
			),
			'selectors' => array( '{{WRAPPER}} .fcp-inline .fcp-socials__list, {{WRAPPER}} .fcp-inline' => 'justify-content: {{VALUE}};' ),
		) );

		$this->end_controls_section();
	}

	protected function render() {
		$s = $this->get_settings_for_display();
		if ( empty( $s['instance'] ) ) {
			if ( \Elementor\Plugin::$instance->editor->is_edit_mode() ) {
				echo '<p style="padding:12px;border:1px dashed #ccc">ابتدا از پیشخوان › دکمه‌های تماس یک ویجت بسازید.</p>';
			}
			return;
		}
		echo FCP_Frontend::shortcode( array( 'id' => $s['instance'], 'part' => $s['part'] ) ); // phpcs:ignore
	}
}
