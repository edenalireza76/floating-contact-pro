<?php
/**
 * Contact channels / social networks catalogue and link builder.
 */

defined( 'ABSPATH' ) || exit;

class FCP_Networks {

	/**
	 * kind: phone | user | url | email | text
	 * pattern placeholders: {v} raw value, {u} username (no @), {intl} international digits, {msg} encoded prefilled message
	 */
	public static function all() {
		$n = array(
			// تماس
			'phone'       => array( 'phone', 'تماس تلفنی', 'fas:phone', '#16a34a', 'tel:{v}', 'تماس' ),
			'mobile'      => array( 'phone', 'موبایل', 'fas:mobile-screen-button', '#0ea5e9', 'tel:{v}', 'تماس' ),
			'support'     => array( 'phone', 'پشتیبانی / مشاوره', 'fas:headset', '#c59d5f', 'tel:{v}', 'تماس' ),
			'sms'         => array( 'phone', 'پیامک', 'fas:comment-sms', '#6366f1', 'sms:{v}{smsbody}', 'تماس' ),
			'email'       => array( 'email', 'ایمیل', 'fas:envelope', '#ea4335', 'mailto:{v}{subject}', 'تماس' ),
			// پیام‌رسان‌های داخلی
			'eitaa'       => array( 'user', 'ایتا', 'efa:eitaa', '#ef7f1a', 'https://eitaa.com/{u}', 'پیام‌رسان ایرانی' ),
			'bale'        => array( 'user', 'بله', 'efa:bale', '#3bb27a', 'https://ble.ir/{u}', 'پیام‌رسان ایرانی' ),
			'rubika'      => array( 'user', 'روبیکا', 'efa:rubika', '#8a2be2', 'https://rubika.ir/{u}', 'پیام‌رسان ایرانی' ),
			'soroush'     => array( 'user', 'سروش پلاس', 'efa:soroush', '#1e88e5', 'https://splus.ir/{u}', 'پیام‌رسان ایرانی' ),
			'gap'         => array( 'user', 'گپ', 'efa:gap', '#00a3e0', 'https://gap.im/{u}', 'پیام‌رسان ایرانی' ),
			'igap'        => array( 'user', 'آی‌گپ', 'fas:comment-dots', '#0c9fd8', 'https://igap.net/{u}', 'پیام‌رسان ایرانی' ),
			'bisphone'    => array( 'user', 'بیسفون', 'efa:bisphone', '#00b2b3', 'https://bisphone.com/{u}', 'پیام‌رسان ایرانی' ),
			'aparat'      => array( 'user', 'آپارات', 'efa:aparat', '#ed145b', 'https://www.aparat.com/{u}', 'شبکه اجتماعی ایرانی' ),
			'cloob'       => array( 'user', 'کلوب', 'efa:cloob', '#f7941d', 'https://www.cloob.com/{u}', 'شبکه اجتماعی ایرانی' ),
			'neshan'      => array( 'url', 'نشان (مسیریابی)', 'efa:neshan', '#1f6feb', '{v}', 'نقشه' ),
			'balad'       => array( 'url', 'بلد (مسیریابی)', 'fas:location-dot', '#2a7cf6', '{v}', 'نقشه' ),
			// پیام‌رسان‌های خارجی
			'whatsapp'    => array( 'phone', 'واتساپ', 'fab:whatsapp', '#25d366', 'https://wa.me/{intl}{text}', 'پیام‌رسان' ),
			'telegram'    => array( 'user', 'تلگرام', 'fab:telegram', '#229ed9', 'https://t.me/{u}', 'پیام‌رسان' ),
			'messenger'   => array( 'user', 'مسنجر', 'fab:facebook-messenger', '#0084ff', 'https://m.me/{u}', 'پیام‌رسان' ),
			'viber'       => array( 'phone', 'وایبر', 'fab:viber', '#7360f2', 'viber://chat?number=%2B{intl}', 'پیام‌رسان' ),
			'skype'       => array( 'user', 'اسکایپ', 'fab:skype', '#00aff0', 'skype:{u}?chat', 'پیام‌رسان' ),
			'discord'     => array( 'url', 'دیسکورد', 'fab:discord', '#5865f2', '{v}', 'پیام‌رسان' ),
			// شبکه‌های اجتماعی
			'instagram'   => array( 'user', 'اینستاگرام', 'fab:instagram', '#e1306c', 'https://instagram.com/{u}', 'شبکه اجتماعی' ),
			'youtube'     => array( 'user', 'یوتیوب', 'fab:youtube', '#ff0000', 'https://youtube.com/@{u}', 'شبکه اجتماعی' ),
			'linkedin'    => array( 'user', 'لینکدین', 'fab:linkedin-in', '#0a66c2', 'https://www.linkedin.com/in/{u}', 'شبکه اجتماعی' ),
			'x'           => array( 'user', 'ایکس (توییتر)', 'fab:x-twitter', '#111111', 'https://x.com/{u}', 'شبکه اجتماعی' ),
			'facebook'    => array( 'user', 'فیسبوک', 'fab:facebook-f', '#1877f2', 'https://facebook.com/{u}', 'شبکه اجتماعی' ),
			'threads'     => array( 'user', 'تردز', 'fab:threads', '#111111', 'https://www.threads.net/@{u}', 'شبکه اجتماعی' ),
			'tiktok'      => array( 'user', 'تیک‌تاک', 'fab:tiktok', '#111111', 'https://www.tiktok.com/@{u}', 'شبکه اجتماعی' ),
			'pinterest'   => array( 'user', 'پینترست', 'fab:pinterest-p', '#e60023', 'https://pinterest.com/{u}', 'شبکه اجتماعی' ),
			'snapchat'    => array( 'user', 'اسنپ‌چت', 'fab:snapchat', '#f7d000', 'https://snapchat.com/add/{u}', 'شبکه اجتماعی' ),
			'github'      => array( 'user', 'گیت‌هاب', 'fab:github', '#24292f', 'https://github.com/{u}', 'شبکه اجتماعی' ),
			'behance'     => array( 'user', 'بیهنس', 'fab:behance', '#1769ff', 'https://www.behance.net/{u}', 'شبکه اجتماعی' ),
			'dribbble'    => array( 'user', 'دریبل', 'fab:dribbble', '#ea4c89', 'https://dribbble.com/{u}', 'شبکه اجتماعی' ),
			'twitch'      => array( 'user', 'توییچ', 'fab:twitch', '#9146ff', 'https://twitch.tv/{u}', 'شبکه اجتماعی' ),
			'spotify'     => array( 'url', 'اسپاتیفای', 'fab:spotify', '#1db954', '{v}', 'شبکه اجتماعی' ),
			// نقشه و لینک
			'google_maps' => array( 'text', 'گوگل مپ', 'fas:map-location-dot', '#34a853', 'https://www.google.com/maps/search/?api=1&query={enc}', 'نقشه' ),
			'waze'        => array( 'text', 'ویز', 'fab:waze', '#33ccff', 'https://waze.com/ul?q={enc}', 'نقشه' ),
			'website'     => array( 'url', 'وب‌سایت', 'fas:globe', '#334155', '{v}', 'لینک' ),
			'faq'         => array( 'url', 'سوالات متداول', 'fas:circle-question', '#0ea5e9', '{v}', 'لینک' ),
			'tracking'    => array( 'url', 'پیگیری سفارش', 'fas:truck-fast', '#f97316', '{v}', 'لینک' ),
			'booking'     => array( 'url', 'رزرو نوبت', 'fas:calendar-check', '#8b5cf6', '{v}', 'لینک' ),
			'download'    => array( 'url', 'دانلود کاتالوگ', 'fas:file-arrow-down', '#0f766e', '{v}', 'لینک' ),
			'custom'      => array( 'url', 'لینک دلخواه', 'fas:link', '#475569', '{v}', 'لینک' ),
		);

		$out = array();
		foreach ( $n as $key => $r ) {
			$out[ $key ] = array(
				'kind'    => $r[0],
				'label'   => $r[1],
				'icon'    => $r[2],
				'color'   => $r[3],
				'pattern' => $r[4],
				'group'   => $r[5],
			);
		}
		return apply_filters( 'fcp_networks', $out );
	}

	/** Convert Persian/Arabic digits to Latin. */
	public static function latin_digits( $s ) {
		return strtr( (string) $s, array(
			'۰' => '0', '۱' => '1', '۲' => '2', '۳' => '3', '۴' => '4', '۵' => '5', '۶' => '6', '۷' => '7', '۸' => '8', '۹' => '9',
			'٠' => '0', '١' => '1', '٢' => '2', '٣' => '3', '٤' => '4', '٥' => '5', '٦' => '6', '٧' => '7', '٨' => '8', '٩' => '9',
		) );
	}

	/** Build final href for a contact item. */
	public static function href( $item, $country_code = '98' ) {
		$all = self::all();
		$net = isset( $all[ $item['network'] ] ) ? $all[ $item['network'] ] : $all['custom'];
		$v   = trim( self::latin_digits( isset( $item['value'] ) ? $item['value'] : '' ) );
		if ( '' === $v ) {
			return '';
		}

		// A full URL / scheme typed by the user always wins.
		if ( preg_match( '#^(https?:|tel:|mailto:|sms:|viber:|skype:|tg:|whatsapp:|intent:|/|\#)#i', $v ) ) {
			return $v;
		}

		$msg    = isset( $item['message'] ) ? trim( $item['message'] ) : '';
		$digits = preg_replace( '/[^0-9+]/', '', $v );
		$intl   = ltrim( $digits, '+' );
		if ( 0 === strpos( $intl, '00' ) ) {
			$intl = substr( $intl, 2 );
		} elseif ( 0 === strpos( $intl, '0' ) && '+' !== substr( $digits, 0, 1 ) ) {
			$intl = preg_replace( '/[^0-9]/', '', $country_code ) . substr( $intl, 1 );
		}

		$map = array(
			'{v}'       => 'phone' === $net['kind'] ? $digits : $v,
			'{u}'       => ltrim( $v, '@' ),
			'{intl}'    => $intl,
			'{enc}'     => rawurlencode( $v ),
			'{text}'    => '' !== $msg ? '?text=' . rawurlencode( $msg ) : '',
			'{smsbody}' => '' !== $msg ? '?body=' . rawurlencode( $msg ) : '',
			'{subject}' => '' !== $msg ? '?subject=' . rawurlencode( $msg ) : '',
		);
		$href = strtr( $net['pattern'], $map );

		// URL-type network but user typed a bare domain.
		if ( '{v}' === $net['pattern'] && ! preg_match( '#^[a-z]+:#i', $href ) ) {
			$href = 'https://' . ltrim( $href, '/' );
		}
		return $href;
	}
}
