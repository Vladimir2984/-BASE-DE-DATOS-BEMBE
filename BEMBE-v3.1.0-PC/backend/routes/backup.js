/**
 * Rutas de backup - Gestión de respaldos
 * POST /api/backup - Crear backup
 * GET /api/backup - Listar backups
 * GET /api/backup/:id - Restaurar backup
 * DELETE /api/backup/:id - Eliminar backup
 */

const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const supabase = require('../utils/supabase');
const { generateChecksum } = require('../utils/database');

const router = express.Router();

// ==================== CREAR BACKUP ====================
router.post('/', authenticateToken, async (req, res, next) => {
  try {
    const { data, backupType, metadata } = req.body;

    if (!data) {
      return res.status(400).json({
        error: 'Datos del backup requeridos',
        code: 'MISSING_DATA'
      });
    }

    const checksum = generateChecksum(data);
    const sizeBytes = Buffer.byteLength(JSON.stringify(data), 'utf8');

    const { data: backup, error } = await supabase
      .from('backups')
      .insert({
        user_id: req.user.id,
        backup_data: data,
        backup_type: backupType || 'manual',
        checksum: checksum,
        size_bytes: sizeBytes,
        metadata: metadata || {},
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({
      success: true,
      message: 'Backup creado exitosamente',
      backup: {
        id: backup.id,
        backup_type: backup.backup_type,
        checksum: backup.checksum,
        size_bytes: backup.size_bytes,
        created_at: backup.created_at
      }
    });

  } catch (error) {
    next(error);
  }
});

// ==================== LISTAR BACKUPS ====================
router.get('/', authenticateToken, async (req, res, next) => {
  try {
    const { limit = 10, type } = req.query;

    let query = supabase
      .from('backups')
      .select('id, backup_type, checksum, size_bytes, created_at, metadata')
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false })
      .limit(parseInt(limit));

    if (type) {
      query = query.eq('backup_type', type);
    }

    const { data: backups, error } = await query;

    if (error) throw error;

    res.json({
      success: true,
      backups: backups || [],
      count: backups?.length || 0
    });

  } catch (error) {
    next(error);
  }
});

// ==================== OBTENER/RESTAURAR BACKUP ====================
router.get('/:id', authenticateToken, async (req, res, next) => {
  try {
    const { id } = req.params;

    const { data: backup, error } = await supabase
      .from('backups')
      .select('*')
      .eq('id', id)
      .eq('user_id', req.user.id)
      .single();

    if (error || !backup) {
      return res.status(404).json({
        error: 'Backup no encontrado',
        code: 'BACKUP_NOT_FOUND'
      });
    }

    // Verificar integridad
    const currentChecksum = generateChecksum(backup.backup_data);
    const isValid = currentChecksum === backup.checksum;

    res.json({
      success: true,
      backup: {
        id: backup.id,
        data: backup.backup_data,
        backup_type: backup.backup_type,
        checksum: backup.checksum,
        isValid,
        size_bytes: backup.size_bytes,
        created_at: backup.created_at,
        metadata: backup.metadata
      }
    });

  } catch (error) {
    next(error);
  }
});

// ==================== ELIMINAR BACKUP ====================
router.delete('/:id', authenticateToken, async (req, res, next) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('backups')
      .delete()
      .eq('id', id)
      .eq('user_id', req.user.id);

    if (error) throw error;

    res.json({
      success: true,
      message: 'Backup elimininado'
    });

  } catch (error) {
    next(error);
  }
});

// ==================== BACKUP AUTOMÁTICO ====================
router.post('/auto', authenticateToken, async (req, res, next) => {
  try {
    const { data } = req.body;

    if (!data) {
      return res.status(400).json({
        error: 'Datos requeridos para backup automático',
        code: 'MISSING_DATA'
      });
    }

    const today = new Date().toISOString().split('T')[0];
    const checksum = generateChecksum(data);
    const sizeBytes = Buffer.byteLength(JSON.stringify(data), 'utf8');

    // Verificar si ya existe backup de hoy
    const { data: existingBackup } = await supabase
      .from('backups')
      .select('id')
      .eq('user_id', req.user.id)
      .eq('backup_type', 'auto')
      .gte('created_at', today)
      .single();

    if (existingBackup) {
      // Actualizar backup existente
      await supabase
        .from('backups')
        .update({
          backup_data: data,
          checksum: checksum,
          size_bytes: sizeBytes,
          created_at: new Date().toISOString()
        })
        .eq('id', existingBackup.id);

      return res.json({
        success: true,
        message: 'Backup automático actualizado',
        updated: true
      });
    }

    // Crear nuevo backup
    await supabase
      .from('backups')
      .insert({
        user_id: req.user.id,
        backup_data: data,
        backup_type: 'auto',
        checksum: checksum,
        size_bytes: sizeBytes,
        created_at: new Date().toISOString()
      });

    res.json({
      success: true,
      message: 'Backup automático creado',
      created: true
    });

  } catch (error) {
    next(error);
  }
});

module.exports = router;
