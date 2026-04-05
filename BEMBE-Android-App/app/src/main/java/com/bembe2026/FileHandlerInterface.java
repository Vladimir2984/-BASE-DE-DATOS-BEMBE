package com.bembe2026;

import android.Manifest;
import android.app.Activity;
import android.content.ContentValues;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.net.Uri;
import android.os.Build;
import android.os.Environment;
import android.provider.MediaStore;
import android.util.Log;
import android.webkit.JavascriptInterface;
import android.webkit.WebView;
import android.widget.Toast;

import androidx.activity.result.ActivityResultLauncher;
import androidx.activity.result.contract.ActivityResultContracts;
import androidx.core.content.ContextCompat;

import com.google.gson.Gson;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.nio.charset.StandardCharsets;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Locale;

/**
 * Manejador SIMPLE y CONFIABLE de Importación/Exportación
 * 
 * EXPORTAR:
 * - Guarda AUTOMÁTICAMENTE en Downloads/BEMBE/
 * - Sin confirmaciones, sin diálogos
 * 
 * IMPORTAR:
 * - Abre selector de archivos
 * - Lee el JSON
 * - Actualiza el sistema AUTOMÁTICAMENTE
 * - Sin confirmaciones adicionales
 */
public class FileHandlerInterface {

    private static final String TAG = "BEMBE_FileHandler";
    private static final String EXPORT_DIR = "BEMBE";
    private static final long MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

    private final WebView webView;
    private final Activity activity;
    private final Gson gson;

    // Launcher para seleccionar archivo
    private final ActivityResultLauncher<Intent> pickFileLauncher;
    
    // Variable temporal para almacenar datos importados
    private String pendingImportData = null;

    public FileHandlerInterface(WebView webView, Activity activity) {
        this.webView = webView;
        this.activity = activity;
        this.gson = new Gson();

        // Launcher para seleccionar archivo JSON
        this.pickFileLauncher = activity.registerForActivityResult(
            new ActivityResultContracts.StartActivityForResult(),
            result -> {
                if (result.getResultCode() == Activity.RESULT_OK && result.getData() != null) {
                    Uri fileUri = result.getData().getData();
                    if (fileUri != null) {
                        processFileAndImport(fileUri);
                    }
                } else {
                    notifyJsCallback("onImportCancelled", "Selección cancelada");
                }
            }
        );
    }

    /**
     * EXPORTAR: Guarda AUTOMÁTICAMENTE en Downloads/BEMBE/
     * Sin confirmaciones, sin preguntas
     */
    @JavascriptInterface
    public void exportData(String jsonData) {
        activity.runOnUiThread(() -> {
            try {
                // Validar JSON
                JsonParser.parseString(jsonData);
                
                // Generar nombre con timestamp
                String timestamp = new SimpleDateFormat("yyyy-MM-dd_HH-mm-ss", Locale.getDefault())
                    .format(new Date());
                String fileName = "bembe_backup_" + timestamp + ".json";

                // Guardar en Downloads/BEMBE/ (Android 10+)
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                    saveToDownloadsModern(jsonData, fileName);
                } else {
                    // Android 9 y anterior
                    saveToDownloadsLegacy(jsonData, fileName);
                }

                // También guardar copia en almacenamiento interno de la app
                saveToInternalStorage(jsonData, fileName);

                Log.d(TAG, "Export exitoso: " + fileName);
                notifyJsCallback("onExportSuccess", fileName);
                showToast("✅ Datos exportados a Downloads/BEMBE/");

            } catch (Exception e) {
                Log.e(TAG, "Error al exportar", e);
                notifyJsCallback("onExportError", e.getMessage());
                showToast("❌ Error al exportar: " + e.getMessage());
            }
        });
    }

    /**
     * IMPORTAR: Abre selector de archivos
     * El resto se hace automáticamente
     */
    @JavascriptInterface
    public void importData() {
        activity.runOnUiThread(() -> {
            try {
                Intent intent = new Intent(Intent.ACTION_GET_CONTENT);
                intent.setType("application/json");
                intent.addCategory(Intent.CATEGORY_OPENABLE);
                pickFileLauncher.launch(Intent.createChooser(intent, "Seleccionar archivo JSON de BEMBE"));
            } catch (Exception e) {
                Log.e(TAG, "Error al abrir selector", e);
                showToast("❌ Error al abrir selector de archivos");
            }
        });
    }

    /**
     * Procesa el archivo seleccionado y actualiza el sistema AUTOMÁTICAMENTE
     */
    private void processFileAndImport(Uri fileUri) {
        activity.runOnUiThread(() -> {
            try {
                // Leer archivo
                String jsonData = readFileContent(fileUri);

                // Validar tamaño
                if (jsonData.length() > MAX_FILE_SIZE) {
                    showToast("❌ Archivo demasiado grande (>10MB)");
                    notifyJsCallback("onImportError", "Archivo demasiado grande");
                    return;
                }

                // Validar JSON
                JsonObject jsonObject = JsonParser.parseString(jsonData).getAsJsonObject();

                // Validar estructura básica
                if (!jsonObject.has("students") || !jsonObject.has("teachers")) {
                    showToast("❌ Archivo JSON inválido");
                    notifyJsCallback("onImportError", "Archivo no tiene estructura válida");
                    return;
                }

                // Almacenar datos para importación
                pendingImportData = jsonData;

                // Llamar a JavaScript para crear respaldo automático
                webView.evaluateJavascript(
                    "(function() { " +
                    "  try { " +
                    "    if (typeof createAutoBackup === 'function') createAutoBackup(); " +
                    "    return true; " +
                    "  } catch(e) { return false; } " +
                    "})();", 
                    null
                );

                // Importar datos automáticamente
                performImport(jsonData);

            } catch (Exception e) {
                Log.e(TAG, "Error al procesar archivo", e);
                showToast("❌ Error al importar: " + e.getMessage());
                notifyJsCallback("onImportError", e.getMessage());
            }
        });
    }

    /**
     * Realiza la importación AUTOMÁTICAMENTE - actualiza TODO el sistema
     */
    private void performImport(String jsonData) {
        try {
            // Construir script que actualiza appData directamente
            String script = 
                "(function() { " +
                "  try { " +
                "    // Parsear datos importados " +
                "    var imported = " + gson.toJson(jsonData) + "; " +
                "    imported = JSON.parse(imported); " +
                "    " +
                "    // Actualizar TODOS los datos del sistema " +
                "    appData = { " +
                "      students: imported.students || [], " +
                "      teachers: imported.teachers || [], " +
                "      renters: imported.renters || [], " +
                "      debtRecords: imported.debtRecords || [], " +
                "      history: imported.history || [], " +
                "      schedule: imported.schedule || {}, " +
                "      prices: imported.prices || appData.prices || [] " +
                "    }; " +
                "    " +
                "    // Guardar en localStorage " +
                "    localStorage.setItem('bembe_app_data', JSON.stringify(appData)); " +
                "    " +
                "    // Actualizar toda la interfaz " +
                "    if (typeof renderAll === 'function') { " +
                "      renderAll(); " +
                "    } else { " +
                "      if (typeof renderStudentList === 'function') renderStudentList(); " +
                "      if (typeof renderTeachers === 'function') renderTeachers(); " +
                "      if (typeof renderDashboard === 'function') renderDashboard(); " +
                "      if (typeof renderCalendar === 'function') renderCalendar(); " +
                "    } " +
                "    " +
                "    // Notificar éxito " +
                "    showToast('✅ Datos importados correctamente'); " +
                "    " +
                "    console.log('BEMBE: Importación completada - ' + appData.students.length + ' estudiantes'); " +
                "    return true; " +
                "  } catch(err) { " +
                "    console.error('BEMBE: Error en import:', err); " +
                "    showToast('❌ Error al importar: ' + err.message); " +
                "    return false; " +
                "  } " +
                "})();";
            
            webView.evaluateJavascript(script, null);
            pendingImportData = null;
            
        } catch (Exception e) {
            Log.e(TAG, "Error al importar datos", e);
            showToast("❌ Error grave al importar");
            notifyJsCallback("onImportError", "Error interno: " + e.getMessage());
        }
    }

    /**
     * Restaura respaldo automático (si existe)
     */
    @JavascriptInterface
    public String restoreAutoBackup() {
        try {
            File backupsDir = new File(activity.getFilesDir(), "Backups");
            if (!backupsDir.exists()) return null;

            String today = new SimpleDateFormat("yyyy-MM-dd", Locale.getDefault()).format(new Date());
            File backupFile = new File(backupsDir, "auto_backup_" + today + ".json");

            if (!backupFile.exists()) return null;

            StringBuilder content = new StringBuilder();
            try (BufferedReader reader = new BufferedReader(
                new InputStreamReader(new FileInputStream(backupFile), StandardCharsets.UTF_8))) {
                String line;
                while ((line = reader.readLine()) != null) {
                    content.append(line);
                }
            }

            return content.toString();

        } catch (Exception e) {
            Log.e(TAG, "Error al restaurar backup", e);
            return null;
        }
    }

    /**
     * Crea respaldo automático antes de importar
     */
    @JavascriptInterface
    public void saveAutoBackup(String jsonData) {
        try {
            String today = new SimpleDateFormat("yyyy-MM-dd", Locale.getDefault()).format(new Date());
            File backupsDir = new File(activity.getFilesDir(), "Backups");
            if (!backupsDir.exists()) backupsDir.mkdirs();

            File backupFile = new File(backupsDir, "auto_backup_" + today + ".json");
            
            // No sobrescribir si ya existe backup de hoy
            if (backupFile.exists()) return;

            try (FileOutputStream fos = new FileOutputStream(backupFile)) {
                fos.write(jsonData.getBytes(StandardCharsets.UTF_8));
            }

            Log.d(TAG, "Backup automático creado: " + today);

        } catch (Exception e) {
            Log.e(TAG, "Error al crear backup", e);
        }
    }

    // ==================== MÉTODOS AUXILIARES ====================

    /**
     * Guarda en Downloads usando MediaStore (Android 10+)
     */
    private void saveToDownloadsModern(String content, String fileName) {
        ContentValues values = new ContentValues();
        values.put(MediaStore.Downloads.DISPLAY_NAME, fileName);
        values.put(MediaStore.Downloads.MIME_TYPE, "application/json");
        values.put(MediaStore.Downloads.RELATIVE_PATH, Environment.DIRECTORY_DOWNLOADS + "/" + EXPORT_DIR);

        Uri uri = activity.getContentResolver().insert(MediaStore.Downloads.EXTERNAL_CONTENT_URI, values);
        if (uri != null) {
            try (OutputStream os = activity.getContentResolver().openOutputStream(uri)) {
                if (os != null) {
                    os.write(content.getBytes(StandardCharsets.UTF_8));
                    Log.d(TAG, "Guardado en Downloads/" + EXPORT_DIR + "/" + fileName);
                }
            } catch (IOException e) {
                Log.e(TAG, "Error guardando en Downloads", e);
            }
        }
    }

    /**
     * Guarda en Downloads para Android 9 y anterior
     */
    private void saveToDownloadsLegacy(String content, String fileName) {
        if (ContextCompat.checkSelfPermission(activity, Manifest.permission.WRITE_EXTERNAL_STORAGE) 
            != PackageManager.PERMISSION_GRANTED) {
            Log.w(TAG, "Sin permiso de escritura, usando almacenamiento interno");
            saveToInternalStorage(content, fileName);
            return;
        }

        File downloadsDir = Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_DOWNLOADS);
        File bembeDir = new File(downloadsDir, EXPORT_DIR);
        if (!bembeDir.exists()) bembeDir.mkdirs();
        
        File exportFile = new File(bembeDir, fileName);
        try (FileOutputStream fos = new FileOutputStream(exportFile)) {
            fos.write(content.getBytes(StandardCharsets.UTF_8));
            Log.d(TAG, "Guardado en Downloads/" + EXPORT_DIR + "/" + fileName);
        } catch (IOException e) {
            Log.e(TAG, "Error guardando en Downloads", e);
        }
    }

    /**
     * Guarda copia en almacenamiento interno de la app
     */
    private void saveToInternalStorage(String content, String fileName) {
        File exportsDir = new File(activity.getFilesDir(), "Exports");
        if (!exportsDir.exists()) exportsDir.mkdirs();

        File exportFile = new File(exportsDir, fileName);
        try (FileOutputStream fos = new FileOutputStream(exportFile)) {
            fos.write(content.getBytes(StandardCharsets.UTF_8));
            Log.d(TAG, "Copia interna guardada: " + fileName);
        } catch (IOException e) {
            Log.e(TAG, "Error guardando copia interna", e);
        }
    }

    /**
     * Lee contenido de archivo URI
     */
    private String readFileContent(Uri fileUri) throws IOException {
        StringBuilder content = new StringBuilder();
        try (BufferedReader reader = new BufferedReader(
            new InputStreamReader(activity.getContentResolver().openInputStream(fileUri), StandardCharsets.UTF_8))) {
            String line;
            while ((line = reader.readLine()) != null) {
                content.append(line);
            }
        }
        return content.toString();
    }

    /**
     * Notifica callback a JavaScript
     */
    private void notifyJsCallback(String functionName, String message) {
        webView.post(() -> {
            String safeMessage = message.replace("\"", "\\\"").replace("\n", " ");
            webView.evaluateJavascript(functionName + "(\"" + safeMessage + "\")", null);
        });
    }

    /**
     * Muestra toast de forma segura
     */
    private void showToast(String message) {
        activity.runOnUiThread(() -> 
            Toast.makeText(activity, message, Toast.LENGTH_LONG).show()
        );
    }
}
