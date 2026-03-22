<?php
/**
 * Plugin Name: Starry Background Transition
 * Description: Muestra una animación de estrellas antes de cargar la interfaz
 * Version: 1.1
 * Author: BEMBE Team
 * License: GPL v2 or later
 */

if (!defined('ABSPATH')) {
    exit;
}

define('STARRY_PLUGIN_URL', plugin_dir_url(__FILE__));
define('STARRY_PLUGIN_PATH', plugin_dir_path(__FILE__));
define('STARRY_VERSION', '1.1');

define('STARRY_DEFAULT_NUM_STARS', 2000);
define('STARRY_DEFAULT_STAR_COLOR', '#ffffff');
define('STARRY_DEFAULT_FADE_SPEED', 0.008);
define('STARRY_DEFAULT_ANIMATION_DURATION', 3000);

include_once(STARRY_PLUGIN_PATH . 'starry-background-shortcodes.php');

function starry_get_options() {
    return array(
        'enabled' => get_option('starry_enabled', true),
        'num_stars' => get_option('starry_num_stars', STARRY_DEFAULT_NUM_STARS),
        'star_color' => get_option('starry_star_color', STARRY_DEFAULT_STAR_COLOR),
        'fade_speed' => get_option('starry_fade_speed', STARRY_DEFAULT_FADE_SPEED),
        'animation_duration' => get_option('starry_animation_duration', STARRY_DEFAULT_ANIMATION_DURATION),
    );
}

function starry_load_assets() {
    if (is_admin()) {
        return;
    }

    $options = starry_get_options();

    if (!$options['enabled']) {
        return;
    }

    wp_enqueue_style('starry-css', STARRY_PLUGIN_URL . 'assets/css/styles.css', array(), STARRY_VERSION);
    wp_enqueue_script('three-js', 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js', array(), '1.0', true);
    wp_enqueue_script('starry-js', STARRY_PLUGIN_URL . 'assets/js/starry-animation.js', array('three-js'), STARRY_VERSION, true);

    wp_localize_script('starry-js', 'starry_vars', array(
        'plugin_url' => STARRY_PLUGIN_URL,
        'num_stars' => absint($options['num_stars']),
        'star_color' => sanitize_hex_color($options['star_color']),
        'fade_speed' => floatval($options['fade_speed']),
        'animation_duration' => absint($options['animation_duration']),
    ));
}
add_action('wp_enqueue_scripts', 'starry_load_assets');

function starry_add_overlay() {
    $options = starry_get_options();

    if (!is_admin() && $options['enabled']) {
        echo '<div id="starry-overlay"></div>';
    }
}
add_action('wp_body_open', 'starry_add_overlay');

function starry_register_settings() {
    register_setting('starry_settings_group', 'starry_enabled', array('type' => 'boolean', 'sanitize_callback' => 'rest_sanitize_boolean'));
    register_setting('starry_settings_group', 'starry_num_stars', 'absint');
    register_setting('starry_settings_group', 'starry_star_color', 'sanitize_hex_color');
    register_setting('starry_settings_group', 'starry_fade_speed', 'floatval');
    register_setting('starry_settings_group', 'starry_animation_duration', 'absint');
}
add_action('admin_init', 'starry_register_settings');

function starry_add_admin_menu() {
    add_options_page(
        'Starry Background Settings',
        'Starry Background',
        'manage_options',
        'starry-background',
        'starry_settings_page'
    );
}
add_action('admin_menu', 'starry_add_admin_menu');

function starry_settings_page() {
    if (!current_user_can('manage_options')) {
        return;
    }

    $options = starry_get_options();
    ?>
    <div class="wrap">
        <h1><?php echo esc_html(get_admin_page_title()); ?></h1>
        <form method="post" action="options.php">
            <?php settings_fields('starry_settings_group'); ?>
            <table class="form-table">
                <tr>
                    <th scope="row">Activar animación</th>
                    <td>
                        <label for="starry_enabled">
                            <input type="checkbox" id="starry_enabled" name="starry_enabled" value="1" <?php checked($options['enabled'], true); ?>>
                            Mostrar animación de estrellas
                        </label>
                    </td>
                </tr>
                <tr>
                    <th scope="row">Número de estrellas</th>
                    <td>
                        <input type="number" id="starry_num_stars" name="starry_num_stars" value="<?php echo esc_attr($options['num_stars']); ?>" min="100" max="5000" step="100">
                        <p class="description">Recomendado: 1000-3000 para mejor rendimiento</p>
                    </td>
                </tr>
                <tr>
                    <th scope="row">Color de estrellas</th>
                    <td>
                        <input type="color" id="starry_star_color" name="starry_star_color" value="<?php echo esc_attr($options['star_color']); ?>">
                    </td>
                </tr>
                <tr>
                    <th scope="row">Velocidad de desvanecimiento</th>
                    <td>
                        <input type="number" id="starry_fade_speed" name="starry_fade_speed" value="<?php echo esc_attr($options['fade_speed']); ?>" min="0.001" max="0.1" step="0.001">
                        <p class="description">Valor menor = desvanecimiento más lento</p>
                    </td>
                </tr>
                <tr>
                    <th scope="row">Duración de animación (ms)</th>
                    <td>
                        <input type="number" id="starry_animation_duration" name="starry_animation_duration" value="<?php echo esc_attr($options['animation_duration']); ?>" min="1000" max="10000" step="500">
                        <p class="description">Tiempo total de la animación en milisegundos</p>
                    </td>
                </tr>
            </table>
            <?php submit_button(); ?>
        </form>
    </div>
    <?php
}
