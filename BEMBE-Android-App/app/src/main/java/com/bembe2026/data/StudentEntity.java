package com.bembe2026.data;

import androidx.annotation.NonNull;
import androidx.room.Entity;
import androidx.room.PrimaryKey;

/**
 * Entidad Student para Room Database
 * Proporciona persistencia nativa además del localStorage del WebView
 */
@Entity(tableName = "students")
public class StudentEntity {
    
    @PrimaryKey
    @NonNull
    private String id;
    
    private String surname;
    private String name;
    private String phone;
    private String birthDate;
    private String registerDate;
    private String hours;
    private String start;
    private String end;
    private double cost;
    private long lastModified;
    
    public StudentEntity() {
        this.lastModified = System.currentTimeMillis();
    }
    
    public StudentEntity(String id, String surname, String name, String phone, 
                        String birthDate, String registerDate, String hours, 
                        String start, String end, double cost) {
        this.id = id;
        this.surname = surname;
        this.name = name;
        this.phone = phone;
        this.birthDate = birthDate;
        this.registerDate = registerDate;
        this.hours = hours;
        this.start = start;
        this.end = end;
        this.cost = cost;
        this.lastModified = System.currentTimeMillis();
    }
    
    // Getters and Setters
    @NonNull
    public String getId() { return id; }
    public void setId(@NonNull String id) { this.id = id; }
    
    public String getSurname() { return surname; }
    public void setSurname(String surname) { this.surname = surname; }
    
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    
    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }
    
    public String getBirthDate() { return birthDate; }
    public void setBirthDate(String birthDate) { this.birthDate = birthDate; }
    
    public String getRegisterDate() { return registerDate; }
    public void setRegisterDate(String registerDate) { this.registerDate = registerDate; }
    
    public String getHours() { return hours; }
    public void setHours(String hours) { this.hours = hours; }
    
    public String getStart() { return start; }
    public void setStart(String start) { this.start = start; }
    
    public String getEnd() { return end; }
    public void setEnd(String end) { this.end = end; }
    
    public double getCost() { return cost; }
    public void setCost(double cost) { this.cost = cost; }
    
    public long getLastModified() { return lastModified; }
    public void setLastModified(long lastModified) { this.lastModified = lastModified; }
}
