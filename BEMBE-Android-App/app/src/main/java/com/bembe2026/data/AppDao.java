package com.bembe2026.data;

import androidx.lifecycle.LiveData;
import androidx.room.Dao;
import androidx.room.Delete;
import androidx.room.Insert;
import androidx.room.OnConflictStrategy;
import androidx.room.Query;
import androidx.room.Update;

import java.util.List;

/**
 * Data Access Object para operaciones de base de datos
 */
@Dao
public interface AppDao {
    
    // ===== STUDENTS =====
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    void insertStudent(StudentEntity student);
    
    @Update
    void updateStudent(StudentEntity student);
    
    @Delete
    void deleteStudent(StudentEntity student);
    
    @Query("SELECT * FROM students ORDER BY surname ASC, name ASC")
    LiveData<List<StudentEntity>> getAllStudentsLive();
    
    @Query("SELECT * FROM students ORDER BY surname ASC, name ASC")
    List<StudentEntity> getAllStudents();
    
    @Query("SELECT * FROM students WHERE id = :studentId")
    LiveData<StudentEntity> getStudentById(String studentId);
    
    @Query("SELECT * FROM students WHERE id = :studentId")
    StudentEntity getStudentByIdSync(String studentId);
    
    @Query("DELETE FROM students")
    void deleteAllStudents();
    
    @Query("SELECT COUNT(*) FROM students")
    int getStudentCount();
    
    @Query("SELECT * FROM students WHERE surname LIKE :query OR name LIKE :query ORDER BY surname ASC")
    List<StudentEntity> searchStudents(String query);
    
    // ===== TEACHERS =====
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    void insertTeacher(TeacherEntity teacher);
    
    @Update
    void updateTeacher(TeacherEntity teacher);
    
    @Delete
    void deleteTeacher(TeacherEntity teacher);
    
    @Query("SELECT * FROM teachers ORDER BY name ASC")
    LiveData<List<TeacherEntity>> getAllTeachersLive();
    
    @Query("SELECT * FROM teachers ORDER BY name ASC")
    List<TeacherEntity> getAllTeachers();
    
    @Query("DELETE FROM teachers")
    void deleteAllTeachers();
    
    // ===== BACKUPS =====
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    void insertBackup(BackupEntity backup);
    
    @Query("SELECT * FROM backups ORDER BY timestamp DESC LIMIT 1")
    BackupEntity getLatestBackup();
    
    @Query("SELECT * FROM backups WHERE backupDate = :date")
    BackupEntity getBackupByDate(String date);
    
    @Query("SELECT * FROM backups ORDER BY timestamp DESC LIMIT :limit")
    List<BackupEntity> getRecentBackups(int limit);
    
    @Query("DELETE FROM backups WHERE timestamp < :cutoffTime")
    void deleteOldBackups(long cutoffTime);
    
    @Query("SELECT COUNT(*) FROM backups")
    int getBackupCount();
    
    // ===== BULK OPERATIONS =====
    @Query("DELETE FROM students")
    void clearStudents();
    
    @Query("DELETE FROM teachers")
    void clearTeachers();
    
    @Query("DELETE FROM backups")
    void clearBackups();
}
