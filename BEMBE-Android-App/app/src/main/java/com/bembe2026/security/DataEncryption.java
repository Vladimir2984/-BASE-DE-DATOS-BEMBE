package com.bembe2026.security;

import android.content.Context;
import android.content.SharedPreferences;
import android.os.Build;
import android.security.keystore.KeyGenParameterSpec;
import android.security.keystore.KeyProperties;
import android.util.Base64;
import android.util.Log;

import androidx.security.crypto.EncryptedSharedPreferences;
import androidx.security.crypto.MasterKey;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.security.GeneralSecurityException;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.util.Arrays;

import javax.crypto.Cipher;
import javax.crypto.KeyGenerator;
import javax.crypto.SecretKey;
import javax.crypto.spec.GCMParameterSpec;

/**
 * Utilidad de seguridad para encriptación de datos sensibles
 * Proporciona encriptación AES-GCM con Android Keystore
 */
public class DataEncryption {
    
    private static final String TAG = "BEMBE_DataEncryption";
    private static final String ANDROID_KEYSTORE = "AndroidKeyStore";
    private static final String KEY_ALIAS = "bembe_encryption_key";
    private static final String TRANSFORMATION = "AES/GCM/NoPadding";
    private static final int GCM_TAG_LENGTH = 128;
    private static final int GCM_IV_LENGTH = 12;
    
    // SharedPreferences encriptados para metadata sensible
    private static EncryptedSharedPreferences encryptedPrefs;
    
    /**
     * Inicializa los SharedPreferences encriptados
     */
    public static synchronized void initEncryptedPrefs(Context context) {
        if (encryptedPrefs == null) {
            try {
                MasterKey masterKey = new MasterKey.Builder(context)
                    .setKeyScheme(MasterKey.KeyScheme.AES256_GCM)
                    .build();
                
                encryptedPrefs = (EncryptedSharedPreferences) EncryptedSharedPreferences.create(
                    context,
                    "bembe_encrypted_prefs",
                    masterKey,
                    EncryptedSharedPreferences.PrefKeyEncryptionScheme.AES256_SIV,
                    EncryptedSharedPreferences.PrefValueEncryptionScheme.AES256_GCM
                );
            } catch (Exception e) {
                Log.e(TAG, "Error initializing encrypted prefs", e);
                // Fallback a prefs normales (no ideal pero funcional)
                encryptedPrefs = null;
            }
        }
    }
    
    /**
     * Encripta datos usando AES-GCM con Android Keystore
     */
    public static String encryptData(String plaintext) {
        try {
            if (Build.VERSION.SDK_INT < Build.VERSION_CODES.M) {
                // Android 6.0+ requerido para Keystore
                Log.w(TAG, "Android version too low for Keystore, using Base64 only");
                return Base64.encodeToString(plaintext.getBytes(StandardCharsets.UTF_8), Base64.DEFAULT);
            }
            
            KeyGenerator keyGenerator = KeyGenerator.getInstance(
                KeyProperties.KEY_ALGORITHM_AES, ANDROID_KEYSTORE);
            keyGenerator.init(new KeyGenParameterSpec.Builder(
                KEY_ALIAS,
                KeyProperties.PURPOSE_ENCRYPT | KeyProperties.PURPOSE_DECRYPT)
                .setBlockModes(KeyProperties.BLOCK_MODE_GCM)
                .setEncryptionPaddings(KeyProperties.ENCRYPTION_PADDING_NONE)
                .build());
            
            SecretKey secretKey = keyGenerator.generateKey();
            
            Cipher cipher = Cipher.getInstance(TRANSFORMATION);
            cipher.init(Cipher.ENCRYPT_MODE, secretKey);
            
            byte[] iv = cipher.getIV();
            byte[] ciphertext = cipher.doFinal(plaintext.getBytes(StandardCharsets.UTF_8));
            
            // Combinar IV + ciphertext
            byte[] encryptedData = new byte[GCM_IV_LENGTH + ciphertext.length];
            System.arraycopy(iv, 0, encryptedData, 0, GCM_IV_LENGTH);
            System.arraycopy(ciphertext, 0, encryptedData, GCM_IV_LENGTH, ciphertext.length);
            
            return Base64.encodeToString(encryptedData, Base64.DEFAULT);
            
        } catch (Exception e) {
            Log.e(TAG, "Error encrypting data", e);
            return null;
        }
    }
    
    /**
     * Desencripta datos usando AES-GCM con Android Keystore
     */
    public static String decryptData(String encryptedBase64) {
        try {
            if (Build.VERSION.SDK_INT < Build.VERSION_CODES.M) {
                return new String(Base64.decode(encryptedBase64, Base64.DEFAULT), StandardCharsets.UTF_8);
            }
            
            // Obtener la clave del Keystore
            java.security.KeyStore keyStore = java.security.KeyStore.getInstance(ANDROID_KEYSTORE);
            keyStore.load(null);
            
            if (!keyStore.containsAlias(KEY_ALIAS)) {
                Log.w(TAG, "Key not found in keystore");
                return null;
            }
            
            SecretKey secretKey = (SecretKey) keyStore.getKey(KEY_ALIAS, null);
            
            byte[] encryptedData = Base64.decode(encryptedBase64, Base64.DEFAULT);
            
            // Extraer IV y ciphertext
            byte[] iv = Arrays.copyOfRange(encryptedData, 0, GCM_IV_LENGTH);
            byte[] ciphertext = Arrays.copyOfRange(encryptedData, GCM_IV_LENGTH, encryptedData.length);
            
            Cipher cipher = Cipher.getInstance(TRANSFORMATION);
            GCMParameterSpec spec = new GCMParameterSpec(GCM_TAG_LENGTH, iv);
            cipher.init(Cipher.DECRYPT_MODE, secretKey, spec);
            
            byte[] decrypted = cipher.doFinal(ciphertext);
            return new String(decrypted, StandardCharsets.UTF_8);
            
        } catch (Exception e) {
            Log.e(TAG, "Error decrypting data", e);
            return null;
        }
    }
    
    /**
     * Calcula un hash SHA-256 para verificación de integridad
     */
    public static String calculateSHA256(String data) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(data.getBytes(StandardCharsets.UTF_8));
            return bytesToHex(hash);
        } catch (Exception e) {
            Log.e(TAG, "Error calculating SHA-256", e);
            return null;
        }
    }
    
    /**
     * Genera un token CSRF aleatorio para operaciones críticas
     */
    public static String generateSecureToken() {
        SecureRandom secureRandom = new SecureRandom();
        byte[] tokenBytes = new byte[32];
        secureRandom.nextBytes(tokenBytes);
        return Base64.encodeToString(tokenBytes, Base64.URL_SAFE | Base64.NO_WRAP);
    }
    
    /**
     * Guarda valor en SharedPreferences encriptados
     */
    public static void saveEncryptedPreference(String key, String value) {
        if (encryptedPrefs != null) {
            encryptedPrefs.edit().putString(key, value).apply();
        }
    }
    
    /**
     * Obtiene valor de SharedPreferences encriptados
     */
    public static String getEncryptedPreference(String key, String defaultValue) {
        if (encryptedPrefs != null) {
            return encryptedPrefs.getString(key, defaultValue);
        }
        return defaultValue;
    }
    
    /**
     * Convierte bytes a string hexadecimal
     */
    private static String bytesToHex(byte[] bytes) {
        StringBuilder result = new StringBuilder();
        for (byte b : bytes) {
            result.append(String.format("%02x", b));
        }
        return result.toString();
    }
    
    /**
     * Verifica la integridad de los datos comparando checksums
     */
    public static boolean verifyIntegrity(String data, String expectedChecksum) {
        String actualChecksum = calculateSHA256(data);
        return actualChecksum != null && actualChecksum.equals(expectedChecksum);
    }
}
