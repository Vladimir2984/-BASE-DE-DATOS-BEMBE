<?php
/**
 * Shortcodes para la sección de clases de baile
 */

function salsa_image_shortcode($atts) {
    $atts = shortcode_atts(array(
        'src' => 'https://bembespb.ru/wp-content/uploads/2026/03/DDD54.png',
        'alt' => 'Clases de salsa y bachata',
        'layout' => 'image-left',
    ), $atts, 'salsa_image');

    $layout_class = 'content-section--image-left';
    if ($atts['layout'] === 'right') {
        $layout_class = 'content-section--image-right';
    } elseif ($atts['layout'] === 'top') {
        $layout_class = 'content-section--image-top';
    }

    $image = wp_get_attachment_image($atts['src'], 'medium', false, array(
        'class' => 'content-section__image',
        'alt' => esc_attr($atts['alt']),
    ));

    if (!$image) {
        $image = '<img src="' . esc_url($atts['src']) . '" alt="' . esc_attr($atts['alt']) . '" class="content-section__image" loading="lazy">';
    }

    return '<div class="content-section ' . esc_attr($layout_class) . '">
        ' . $image . '
        <div class="content-section__text">';
}
add_shortcode('salsa_image', 'salsa_image_shortcode');

function salsa_image_close_shortcode() {
    return '</div></div>';
}
add_shortcode('salsa_image_close', 'salsa_image_close_shortcode');

function salsa_content_shortcode($atts, $content = null) {
    return '<div class="content-section__text">' . do_shortcode($content) . '</div>';
}
add_shortcode('salsa_content', 'salsa_content_shortcode');
