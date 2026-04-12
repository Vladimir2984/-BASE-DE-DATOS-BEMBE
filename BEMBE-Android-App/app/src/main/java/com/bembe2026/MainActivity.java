package com.bembe2026;

import android.annotation.SuppressLint;
import android.app.Activity;
import android.content.Intent;
import android.content.res.AssetManager;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.util.Log;
import android.view.View;
import android.webkit.WebChromeClient;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.ProgressBar;
import android.widget.Toast;

import androidx.activity.result.ActivityResultLauncher;
import androidx.activity.result.contract.ActivityResultContracts;
import androidx.appcompat.app.AppCompatActivity;
import androidx.core.content.FileProvider;

import java.io.File;
import java.io.IOException;
import java.io.InputStream;

/**
 * Actividad Principal de BEMBE v3.0
 * Carga la aplicación web desde assets y proporciona puente nativo para archivos
 * 
 * MEJORAS v3.0:
 * - Comunicación bidireccional JS-Nativo simplificada
 * - Seguridad mejorada en WebView
 * - Manejo de errores robusto
 */
public class MainActivity extends AppCompatActivity {

    private static final String TAG = "BEMBE_MainActivity";
    private static final String ASSET_HTML_FILE = "CODIGO_OK.html";

    private WebView webView;
    private ProgressBar progressBar;
    private FileHandlerInterface fileHandler;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        webView = findViewById(R.id.webView);
        progressBar = findViewById(R.id.progressBar);

        // Inicializar manejador de archivos
        fileHandler = new FileHandlerInterface(webView, this);

        // Configurar WebView con seguridad mejorada
        setupWebView();

        // Cargar la aplicación
        loadApplication();
    }

    /**
     * Configura el WebView con las opciones necesarias y seguridad mejorada
     */
    @SuppressLint({"SetJavaScriptEnabled", "AddJavascriptInterface"})
    private void setupWebView() {
        WebSettings settings = webView.getSettings();

        // Habilitar JavaScript (requerido para la aplicación)
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setDatabaseEnabled(true);
        settings.setAllowFileAccess(true);
        settings.setAllowContentAccess(true);
        
        // PERMITIR acceso a archivos universales para que el sistema OTA remoto por JS funcione y pueda comunicarse con APIs externas
        settings.setAllowFileAccessFromFileURLs(true);
        settings.setAllowUniversalAccessFromFileURLs(true);

        // Configurar almacenamiento local
        settings.setDomStorageEnabled(true);
        settings.setCacheMode(WebSettings.LOAD_DEFAULT);

        // Habilitar zoom
        settings.setSupportZoom(true);
        settings.setBuiltInZoomControls(true);
        settings.setDisplayZoomControls(false);

        // Configurar user agent para identificar la app
        settings.setUserAgentString(settings.getUserAgentString() + " BEMBE-Android/3.0");
        
        // Mejorar seguridad: mix content mode seguro
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
            settings.setMixedContentMode(WebSettings.MIXED_CONTENT_NEVER_ALLOW);
        }

        // WebView Client para manejar navegación interna con seguridad
        webView.setWebViewClient(new WebViewClient() {
            @Override
            public boolean shouldOverrideUrlLoading(WebView view, String url) {
                // Solo permitir carga de archivos locales
                if (url.startsWith("file:///android_asset/")) {
                    return false; // Permitir carga local
                }
                
                // Abrir enlaces externos en el navegador del sistema
                if (url.startsWith("http://") || url.startsWith("https://")) {
                    try {
                        Intent intent = new Intent(Intent.ACTION_VIEW, Uri.parse(url));
                        intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                        startActivity(intent);
                    } catch (Exception e) {
                        Log.e(TAG, "Error abriendo URL externa", e);
                    }
                    return true;
                }
                
                // Bloquear otros esquemas (javascript:, data:, etc.)
                Log.w(TAG, "URL bloqueada: " + url);
                return true;
            }

            @Override
            public void onPageFinished(WebView view, String url) {
                super.onPageFinished(view, url);
                progressBar.setVisibility(View.GONE);
                Log.d(TAG, "Página cargada correctamente: " + url);
                
                // Inyectar callbacks nativos (NO sobrescribe funciones)
                injectNativeCallbacks();
            }
            
            @Override
            public void onReceivedSslError(android.webkit.WebView view, 
                                          android.webkit.SslErrorHandler handler, 
                                          android.net.http.SslError error) {
                // RECHAZAR errores SSL por seguridad
                Log.e(TAG, "Error SSL: " + error.getPrimaryError());
                handler.cancel();
                Toast.makeText(MainActivity.this, 
                    "Error de seguridad SSL. Carga bloqueada.", 
                    Toast.LENGTH_LONG).show();
            }
        });

        // WebChromeClient para progreso y logs
        webView.setWebChromeClient(new WebChromeClient() {
            @Override
            public void onProgressChanged(WebView view, int newProgress) {
                progressBar.setProgress(newProgress);
                if (newProgress == 100) {
                    progressBar.setVisibility(View.GONE);
                } else {
                    progressBar.setVisibility(View.VISIBLE);
                }
            }

            @Override
            public boolean onConsoleMessage(android.webkit.ConsoleMessage consoleMessage) {
                // Log de consola del WebView
                String message = consoleMessage.message() + " -- From line "
                    + consoleMessage.lineNumber() + " of " + consoleMessage.sourceId();
                
                switch (consoleMessage.messageLevel()) {
                    case ERROR:
                        Log.e("BEMBE_WebView", message);
                        break;
                    case WARNING:
                        Log.w("BEMBE_WebView", message);
                        break;
                    default:
                        Log.d("BEMBE_WebView", message);
                        break;
                }
                return true;
            }
        });

        // Añadir interfaz JavaScript para manejo de archivos
        webView.addJavascriptInterface(fileHandler, "AndroidFileHandler");
    }
    
    /**
     * Inyecta SOLO callbacks nativos, NO sobrescribe funciones existentes
     * El archivo HTML ya llama directamente a AndroidFileHandler.exportData() e importData()
     */
    private void injectNativeCallbacks() {
        String script = 
            "(function() { " +
            "  console.log('BEMBE: Callbacks nativos inicializados'); " +
            "  " +
            "  // Callbacks que Android llamará después de completar operaciones " +
            "  window.onExportSuccess = function(fileName) { " +
            "    showToast('📥 Datos exportados: ' + fileName); " +
            "  }; " +
            "  window.onExportError = function(error) { " +
            "    showToast('❌ Error al exportar: ' + error); " +
            "  }; " +
            "  window.onImportError = function(error) { " +
            "    showToast('❌ Error al importar: ' + error); " +
            "  }; " +
            "  window.onImportCancelled = function(reason) { " +
            "    showToast('⚠️ Importación cancelada: ' + reason); " +
            "  }; " +
            "  window.onBackupCreated = function(fileName) { " +
            "    console.log('Backup creado:', fileName); " +
            "  }; " +
            "  " +
            "  // Función que Android llamará cuando el archivo esté listo para importar " +
            "  window.onFileSelected = function(fileInfo) { " +
            "    console.log('Archivo seleccionado:', fileInfo); " +
            "  }; " +
            "  " +
            "  console.log('BEMBE: Callbacks listos'); " +
            "})();";
        
        webView.evaluateJavascript(script, null);
    }

    /**
     * Carga la aplicación en el WebView
     */
    private void loadApplication() {
        progressBar.setVisibility(View.VISIBLE);

        // Intentar cargar desde assets
        try {
            AssetManager assets = getAssets();
            InputStream is = assets.open(ASSET_HTML_FILE);
            is.close();

            // El archivo existe en assets
            webView.loadUrl("file:///android_asset/" + ASSET_HTML_FILE);
            Log.d(TAG, "Cargando aplicación desde assets: " + ASSET_HTML_FILE);

        } catch (IOException e) {
            Log.e(TAG, "No se encontró el archivo HTML en assets", e);
            Toast.makeText(this, "Error: No se encontró el archivo de la aplicación",
                Toast.LENGTH_LONG).show();

            // Mostrar página de error
            webView.loadData(
                "<html><body style='background:#020a18;color:#fbbf24;text-align:center;padding:50px;'>" +
                "<h1>✦ BEMBE ✦</h1>" +
                "<p>Error: No se encontró el archivo de la aplicación</p>" +
                "<p>Por favor, reinstale la aplicación</p>" +
                "</body></html>",
                "text/html; charset=utf-8", "UTF-8"
            );
        }
    }

    @Override
    public void onBackPressed() {
        if (webView.canGoBack()) {
            webView.goBack();
        } else {
            // Confirmar antes de salir
            new androidx.appcompat.app.AlertDialog.Builder(this)
                .setTitle("✦ BEMBE ✦")
                .setMessage("¿Salir de la aplicación?")
                .setPositiveButton("Salir", (dialog, which) -> finish())
                .setNegativeButton("Cancelar", null)
                .show();
        }
    }

    @Override
    protected void onResume() {
        super.onResume();
        webView.onResume();
    }

    @Override
    protected void onPause() {
        super.onPause();
        webView.onPause();
    }

    @Override
    protected void onDestroy() {
        super.onDestroy();
        webView.destroy();
    }
}
