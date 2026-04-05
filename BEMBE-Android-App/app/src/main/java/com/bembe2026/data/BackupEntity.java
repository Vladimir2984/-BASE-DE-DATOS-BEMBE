package com.bembe2026.data;

import androidx.annotation.NonNull;
import androidx.room.Entity;
import androidx.room.PrimaryKey;

/**
 * Entidad para respaldos automáticos en Room Database
 */
@Entity(tableName = "backups")
public class BackupEntity {
    
    @PrimaryKey
    @NonNull
    private String backupDate; // YYYY-MM-DD
    
    @NonNull
    private String jsonData;
    
    private long timestamp;
    private String checksum;
    private String source; // "auto", "manual_export", "import"
    
    public BackupEntity() {
        this.timestamp = System.currentTimeMillis();
    }
    
    public BackupEntity(@NonNull String backupDate, @NonNull String jsonData, String checksum, String source) {
        this.backupDate = backupDate;
        this.jsonData = jsonData;
        this.checksum = checksum;
        this.source = source;
        this.timestamp = System.currentTimeMillis();
    }
    
    @NonNull
    public String getBackupDate() { return backupDate; }
    public void setBackupDate(@NonNull String backupDate) { this.backupDate = backupDate; }
    
    @NonNull
    public String getJsonData() { return jsonData; }
    public void setJsonData(@NonNull String jsonData) { this.jsonData = jsonData; }
    
    public long getTimestamp() { return timestamp; }
    public void setTimestamp(long timestamp) { this.timestamp = timestamp; }
    
    public String getChecksum() { return checksum; }
    public void setChecksum(String checksum) { this.checksum = checksum; }
    
    public String getSource() { return source; }
    public void setSource(String source) { this.source = source; }
}
