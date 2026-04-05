# BEMBE Android App - ProGuard Rules
# Optimización y ofuscación para builds de producción

# ===== Mantener clases de modelo =====
-keep class com.bembe2026.data.** { *; }
-keep class com.bembe2026.security.** { *; }

# ===== Room Database =====
-keep class * extends androidx.room.RoomDatabase
-keep @androidx.room.Entity class *
-dontwarn androidx.room.paging.**

# ===== Gson =====
-keepattributes Signature
-keepattributes *Annotation*
-keep class com.google.gson.** { *; }
-keep class * implements com.google.gson.TypeAdapterFactory
-keep class * implements com.google.gson.JsonSerializer
-keep class * implements com.google.gson.JsonDeserializer

# Mantener clases de modelo para Gson
-keep class com.bembe2026.data.** { *; }

# ===== AndroidX =====
-keep class androidx.** { *; }
-keep public class * extends androidx.appcompat.app.AppCompatActivity
-keep public class * extends android.app.Application
-keep public class * extends android.service.notification.NotificationListenerService

# ===== WebView Interface =====
-keepclassmembers class * {
    @android.webkit.JavascriptInterface <methods>;
}

# ===== Mantener métodos nativos =====
-keepclasseswithmembernames,includedescriptorclasses class * {
    native <methods>;
}

# ===== Security Crypto =====
-keep class androidx.security.crypto.** { *; }

# ===== Logging - remover logs en producción =====
-assumenosideeffects class android.util.Log {
    public static boolean isLoggable(java.lang.String, int);
    public static int v(...);
    public static int i(...);
    public static int w(...);
    public static int d(...);
    public static int e(...);
}

# ===== Eliminar código no usado =====
-optimizations !code/simplification/arithmetic,!code/allocation/variable
-optimizationpasses 5
-dontusemixedcaseclassnames
-dontskipnonpubliclibraryclasses
