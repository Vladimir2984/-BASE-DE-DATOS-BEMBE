<?php
/**
 * BEMBÉ Child Theme - Functions
 * Mejoras de seguridad, rendimiento y funcionalidad
 *
 * @package bembespb-child
 * @version 2.0.0
 * @author MiniMax Agent
 */

// Prevenir acceso directo
if (!defined('ABSPATH')) {
    exit;
}

/**
 * ==========================================================================
 * CONFIGURACIÓN INICIAL
 * ==========================================================================
 */

// Encolar estilos del tema padre y tema hijo
function bembespb_child_enqueue_styles() {
    // Estilo del tema padre
    wp_enqueue_style(
        'bembespb-parent-style',
        get_template_directory_uri() . '/style.css',
        array(),
        wp_get_theme()->parent()->get('Version')
    );

    // Estilo del tema hijo
    wp_enqueue_style(
        'bembespb-child-style',
        get_stylesheet_uri(),
        array('bembespb-parent-style'),
        wp_get_theme()->get('Version')
    );

    // JavaScript moderno
    wp_enqueue_script(
        'bembespb-modern-js',
        get_stylesheet_directory_uri() . '/js/modern.js',
        array('jquery'),
        '2.0.0',
        true
    );

    // Localizar script con datos del sitio
    wp_localize_script('bembespb-modern-js', 'bembespbData', array(
        'ajaxUrl' => admin_url('admin-ajax.php'),
        'nonce' => wp_create_nonce('bembespb_nonce'),
        'phone' => '+79111139958'
    ));
}
add_action('wp_enqueue_scripts', 'bembespb_child_enqueue_styles');

/**
 * ==========================================================================
 * MEJORAS DE SEGURIDAD
 * ==========================================================================
 */

// 1. Ocultar versión de WordPress
remove_action('wp_head', 'wp_generator');
add_filter('the_generator', '__return_empty_string');

// Ocultar versión en scripts y estilos
function bembespb_remove_version_strings($src) {
    if (strpos($src, 'ver=')) {
        $src = remove_query_arg('ver', $src);
    }
    return $src;
}
add_filter('style_loader_src', 'bembespb_remove_version_strings', 9999);
add_filter('script_loader_src', 'bembespb_remove_version_strings', 9999);

// 2. Deshabilitar XML-RPC (previene ataques de fuerza bruta)
add_filter('xmlrpc_enabled', '__return_false');
add_filter('wp_headers', function($headers) {
    unset($headers['X-Pingback']);
    return $headers;
});

// 3. Ocultar errores de login (no revelar si el usuario existe)
function bembespb_hide_login_errors() {
    return 'Ошибка авторизации. Проверьте данные и попробуйте снова.';
}
add_filter('login_errors', 'bembespb_hide_login_errors');

// 4. Limitar intentos de login
function bembespb_limit_login_attempts($user, $username, $password) {
    $ip = $_SERVER['REMOTE_ADDR'];
    $transient_key = 'login_attempts_' . md5($ip);
    $attempts = get_transient($transient_key) ?: 0;

    // Máximo 5 intentos en 15 minutos
    if ($attempts >= 5) {
        return new WP_Error('too_many_attempts',
            'Слишком много попыток входа. Попробуйте через 15 минут.');
    }

    return $user;
}
add_filter('authenticate', 'bembespb_limit_login_attempts', 30, 3);

// Incrementar contador de intentos fallidos
function bembespb_track_failed_login($username) {
    $ip = $_SERVER['REMOTE_ADDR'];
    $transient_key = 'login_attempts_' . md5($ip);
    $attempts = get_transient($transient_key) ?: 0;
    set_transient($transient_key, $attempts + 1, 15 * MINUTE_IN_SECONDS);
}
add_action('wp_login_failed', 'bembespb_track_failed_login');

// Resetear contador en login exitoso
function bembespb_reset_login_attempts($username, $user) {
    $ip = $_SERVER['REMOTE_ADDR'];
    $transient_key = 'login_attempts_' . md5($ip);
    delete_transient($transient_key);
}
add_action('wp_login', 'bembespb_reset_login_attempts', 10, 2);

// 5. Agregar headers de seguridad HTTP
function bembespb_security_headers() {
    if (!is_admin()) {
        header('X-Content-Type-Options: nosniff');
        header('X-Frame-Options: SAMEORIGIN');
        header('X-XSS-Protection: 1; mode=block');
        header('Referrer-Policy: strict-origin-when-cross-origin');
        header("Permissions-Policy: geolocation=(), microphone=(), camera=()");
    }
}
add_action('send_headers', 'bembespb_security_headers');

// 6. Deshabilitar edición de archivos desde el admin
if (!defined('DISALLOW_FILE_EDIT')) {
    define('DISALLOW_FILE_EDIT', true);
}

// 7. Ocultar información del autor
function bembespb_disable_author_archives() {
    if (is_author()) {
        wp_redirect(home_url(), 301);
        exit;
    }
}
add_action('template_redirect', 'bembespb_disable_author_archives');

// 8. Proteger wp-config.php y otros archivos sensibles
function bembespb_protect_files() {
    global $wp;
    $protected = array('wp-config', 'readme', 'license', 'wp-includes');

    foreach ($protected as $file) {
        if (stripos($_SERVER['REQUEST_URI'], $file) !== false) {
            wp_die('Acceso denegado', 'Error de seguridad', array('response' => 403));
        }
    }
}
add_action('init', 'bembespb_protect_files');

// 9. Deshabilitar REST API para usuarios no autenticados (parcialmente)
function bembespb_restrict_rest_api($result) {
    if (!is_user_logged_in()) {
        $restricted = array('/wp/v2/users', '/wp/v2/settings');
        foreach ($restricted as $endpoint) {
            if (strpos($_SERVER['REQUEST_URI'], $endpoint) !== false) {
                return new WP_Error('rest_forbidden', 'Acceso no autorizado.', array('status' => 403));
            }
        }
    }
    return $result;
}
add_filter('rest_authentication_errors', 'bembespb_restrict_rest_api');

/**
 * ==========================================================================
 * MEJORAS DE RENDIMIENTO
 * ==========================================================================
 */

// 1. Deshabilitar emojis de WordPress (mejora rendimiento)
function bembespb_disable_emojis() {
    remove_action('wp_head', 'print_emoji_detection_script', 7);
    remove_action('admin_print_scripts', 'print_emoji_detection_script');
    remove_action('wp_print_styles', 'print_emoji_styles');
    remove_action('admin_print_styles', 'print_emoji_styles');
    remove_filter('the_content_feed', 'wp_staticize_emoji');
    remove_filter('comment_text_rss', 'wp_staticize_emoji');
    remove_filter('wp_mail', 'wp_staticize_emoji_for_email');
    add_filter('tiny_mce_plugins', function($plugins) {
        return is_array($plugins) ? array_diff($plugins, array('wpemoji')) : array();
    });
}
add_action('init', 'bembespb_disable_emojis');

// 2. Eliminar scripts y estilos innecesarios
function bembespb_remove_unnecessary_scripts() {
    // Gutenberg block CSS (si no se usa)
    wp_dequeue_style('wp-block-library');
    wp_dequeue_style('wp-block-library-theme');

    // Classic theme styles
    wp_dequeue_style('classic-theme-styles');

    // Dashicons para usuarios no logueados
    if (!is_user_logged_in()) {
        wp_dequeue_style('dashicons');
    }
}
add_action('wp_enqueue_scripts', 'bembespb_remove_unnecessary_scripts', 100);

// 3. Lazy loading para imágenes
function bembespb_add_lazy_loading($content) {
    if (is_admin()) return $content;

    return preg_replace_callback(
        '/<img([^>]+)>/i',
        function($matches) {
            $img = $matches[0];
            if (strpos($img, 'loading=') === false) {
                $img = str_replace('<img', '<img loading="lazy"', $img);
            }
            return $img;
        },
        $content
    );
}
add_filter('the_content', 'bembespb_add_lazy_loading');
add_filter('post_thumbnail_html', 'bembespb_add_lazy_loading');

// 4. Preconectar a recursos externos
function bembespb_preconnect_resources() {
    echo '<link rel="preconnect" href="https://fonts.googleapis.com">' . "\n";
    echo '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>' . "\n";
    echo '<link rel="dns-prefetch" href="//www.google-analytics.com">' . "\n";
}
add_action('wp_head', 'bembespb_preconnect_resources', 1);

// 5. Agregar async/defer a scripts
function bembespb_async_scripts($tag, $handle, $src) {
    $async_scripts = array('bembespb-modern-js', 'google-analytics');

    if (in_array($handle, $async_scripts)) {
        return str_replace(' src', ' defer src', $tag);
    }

    return $tag;
}
add_filter('script_loader_tag', 'bembespb_async_scripts', 10, 3);

/**
 * ==========================================================================
 * FUNCIONALIDADES ADICIONALES
 * ==========================================================================
 */

// 1. Botón flotante de WhatsApp
function bembespb_whatsapp_button() {
    $phone = '+79111139958';
    $message = urlencode('Здравствуйте! Хочу записаться на занятия в школе BEMBÉ.');
    ?>
    <a href="https://wa.me/<?php echo preg_replace('/[^0-9]/', '', $phone); ?>?text=<?php echo $message; ?>"
       class="whatsapp-float"
       target="_blank"
       rel="noopener noreferrer"
       aria-label="Написать в WhatsApp">
        <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
        </svg>
    </a>
    <?php
}
add_action('wp_footer', 'bembespb_whatsapp_button');

// 2. Actualizar copyright automáticamente
function bembespb_dynamic_copyright($content) {
    $current_year = date('Y');
    $content = preg_replace('/© 20\d{2}/', '© ' . $current_year, $content);
    return $content;
}
add_filter('the_content', 'bembespb_dynamic_copyright');

// 3. Shortcode para el año actual
function bembespb_current_year_shortcode() {
    return date('Y');
}
add_shortcode('current_year', 'bembespb_current_year_shortcode');

// 4. Agregar soporte para WebP
function bembespb_webp_upload_mimes($mimes) {
    $mimes['webp'] = 'image/webp';
    return $mimes;
}
add_filter('upload_mimes', 'bembespb_webp_upload_mimes');

// 5. Mejorar el SEO básico
function bembespb_seo_meta_tags() {
    if (!is_singular()) return;

    global $post;
    $description = wp_trim_words(strip_tags($post->post_content), 25, '...');

    echo '<meta name="description" content="' . esc_attr($description) . '">' . "\n";
    echo '<meta property="og:title" content="' . esc_attr(get_the_title()) . '">' . "\n";
    echo '<meta property="og:description" content="' . esc_attr($description) . '">' . "\n";
    echo '<meta property="og:type" content="website">' . "\n";
    echo '<meta property="og:url" content="' . esc_url(get_permalink()) . '">' . "\n";

    if (has_post_thumbnail()) {
        echo '<meta property="og:image" content="' . esc_url(get_the_post_thumbnail_url(null, 'large')) . '">' . "\n";
    }
}
add_action('wp_head', 'bembespb_seo_meta_tags', 5);

// 6. Registrar widget de horario
function bembespb_register_widgets() {
    register_sidebar(array(
        'name' => 'Horario en Sidebar',
        'id' => 'schedule-sidebar',
        'description' => 'Widget para mostrar el horario de clases',
        'before_widget' => '<div class="widget schedule-widget">',
        'after_widget' => '</div>',
        'before_title' => '<h3 class="widget-title">',
        'after_title' => '</h3>',
    ));
}
add_action('widgets_init', 'bembespb_register_widgets');

// 7. AJAX para formulario de contacto
function bembespb_handle_contact_form() {
    check_ajax_referer('bembespb_nonce', 'nonce');

    $name = sanitize_text_field($_POST['name'] ?? '');
    $phone = sanitize_text_field($_POST['phone'] ?? '');
    $message = sanitize_textarea_field($_POST['message'] ?? '');

    if (empty($name) || empty($phone)) {
        wp_send_json_error(array('message' => 'Пожалуйста, заполните все обязательные поля.'));
    }

    // Enviar email
    $to = get_option('admin_email');
    $subject = 'Новая заявка с сайта BEMBÉ';
    $body = "Имя: $name\nТелефон: $phone\nСообщение: $message";
    $headers = array('Content-Type: text/plain; charset=UTF-8');

    if (wp_mail($to, $subject, $body, $headers)) {
        wp_send_json_success(array('message' => 'Спасибо! Мы свяжемся с вами в ближайшее время.'));
    } else {
        wp_send_json_error(array('message' => 'Произошла ошибка. Пожалуйста, попробуйте позже.'));
    }
}
add_action('wp_ajax_bembespb_contact', 'bembespb_handle_contact_form');
add_action('wp_ajax_nopriv_bembespb_contact', 'bembespb_handle_contact_form');

/**
 * ==========================================================================
 * PERSONALIZACIÓN DEL ADMIN
 * ==========================================================================
 */

// Logo personalizado en login
function bembespb_login_logo() {
    ?>
    <style>
        #login h1 a {
            background-image: url(<?php echo get_stylesheet_directory_uri(); ?>/assets/img/logo.png);
            background-size: contain;
            width: 200px;
            height: 80px;
        }
        .login {
            background: linear-gradient(135deg, #1D1D1D 0%, #2D2D2D 100%);
        }
        .login form {
            border-radius: 12px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.3);
        }
        .login input[type="submit"] {
            background: linear-gradient(135deg, #E63946 0%, #F4A261 100%);
            border: none;
            border-radius: 25px;
            padding: 10px 20px;
        }
    </style>
    <?php
}
add_action('login_enqueue_scripts', 'bembespb_login_logo');

// Cambiar URL del logo en login
function bembespb_login_logo_url() {
    return home_url();
}
add_filter('login_headerurl', 'bembespb_login_logo_url');

// Mensaje en el footer del admin
function bembespb_admin_footer_text() {
    return 'Escuela de Bailes <strong>BEMBÉ</strong> | Desarrollado con ❤️ | <a href="https://bembespb.ru" target="_blank">Visitar sitio</a>';
}
add_filter('admin_footer_text', 'bembespb_admin_footer_text');

/**
 * ==========================================================================
 * NOTIFICACIONES DE SEGURIDAD
 * ==========================================================================
 */

// Notificar por email cuando hay un login de administrador
function bembespb_notify_admin_login($user_login, $user) {
    if (in_array('administrator', $user->roles)) {
        $ip = $_SERVER['REMOTE_ADDR'];
        $time = current_time('mysql');
        $user_agent = $_SERVER['HTTP_USER_AGENT'];

        $message = "Inicio de sesión de administrador detectado:\n\n";
        $message .= "Usuario: $user_login\n";
        $message .= "IP: $ip\n";
        $message .= "Fecha/Hora: $time\n";
        $message .= "Navegador: $user_agent\n";

        wp_mail(get_option('admin_email'), '[BEMBÉ] Nuevo inicio de sesión de administrador', $message);
    }
}
add_action('wp_login', 'bembespb_notify_admin_login', 10, 2);

// Fin del archivo functions.php
