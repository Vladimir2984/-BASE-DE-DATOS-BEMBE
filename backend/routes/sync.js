/**
 * Rutas de sincronización - Sincronización en tiempo real
 * POST /api/sync - Sincronizar datos
 * GET /api/sync/changes - Obtener cambios desde última sincronización
 */

const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const supabase = require('../utils/supabase');
const { generateChecksum } = require('../utils/database');

const router = express.Router();

// ==================== SINCRONIZACIÓN COMPLETA ====================
router.post('/', authenticateToken, async (req, res, next) => {
  try {
    const { localData, lastSync, clientInfo } = req.body;

    if (!localData) {
      return res.status(400).json({
        error: 'localData es requerido',
        code: 'MISSING_DATA'
      });
    }

    const userId = req.user.id;

    // Obtener datos del servidor
    const { data: serverData, error } = await supabase
      .from('app_data')
      .select('*')
      .eq('user_id', userId);

    if (error) throw error;

    // Convertir a formato usable
    const serverDataMap = {};
    serverData?.forEach(record => {
      serverDataMap[record.data_type] = record;
    });

    // Detectar conflictos y resolver
    const dataTypes = ['students', 'teachers', 'renters', 'debtRecords', 'history', 'schedule', 'prices'];
    const results = {};
    const conflicts = [];

    for (const dataType of dataTypes) {
      const localRecord = localData[dataType];
      const serverRecord = serverDataMap[dataType];

      if (localRecord !== undefined) {
        const localChecksum = generateChecksum(localRecord);
        
        // Si hay datos en servidor, verificar si hay conflicto
        if (serverRecord && serverRecord.checksum !== localChecksum) {
          // Conflicto detectado - usar última versión
          const serverNewer = new Date(serverRecord.updated_at) > new Date(lastSync);
          
          if (serverNewer) {
            conflicts.push({
              type: dataType,
              resolution: 'server_wins',
              data: serverRecord.data
            });
            results[dataType] = 'server_wins';
          } else {
            // Guardar versión local (más reciente)
            await supabase
              .from('app_data')
              .upsert({
                user_id: userId,
                data_type: dataType,
                data: localRecord,
                checksum: localChecksum,
                updated_at: new Date().toISOString()
              }, {
                onConflict: 'user_id,data_type'
              });
            results[dataType] = 'local_wins';
          }
        } else if (!serverRecord) {
          // No hay datos en servidor, guardar local
          await supabase
            .from('app_data')
            .upsert({
              user_id: userId,
              data_type: dataType,
              data: localRecord,
              checksum: localChecksum,
              updated_at: new Date().toISOString()
            }, {
              onConflict: 'user_id,data_type'
            });
          results[dataType] = 'uploaded';
        } else {
          results[dataType] = 'synced';
        }
      } else if (serverRecord) {
        // No hay datos locales, usar datos del servidor
        conflicts.push({
          type: dataType,
          resolution: 'server_wins',
          data: serverRecord.data
        });
        results[dataType] = 'downloaded';
      }
    }

    // Actualizar sesión activa
    await supabase
      .from('active_sessions')
      .upsert({
        user_id: userId,
        client_type: clientInfo?.type || req.headers['x-client-type'] || 'web',
        client_version: clientInfo?.version || req.headers['x-client-version'] || '3.0.0',
        last_sync: new Date().toISOString(),
        is_active: true
      }, {
        onConflict: 'user_id,client_type'
      });

    res.json({
      success: true,
      message: 'Sincronización completada',
      results,
      conflicts,
      serverData: conflicts.length > 0 
        ? conflicts.reduce((acc, c) => {
            acc[c.type] = c.data;
            return acc;
          }, {})
        : null,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    next(error);
  }
});

// ==================== OBTENER CAMBIOS ====================
router.get('/changes', authenticateToken, async (req, res, next) => {
  try {
    const { since } = req.query;

    if (!since) {
      return res.status(400).json({
        error: 'Parámetro "since" es requerido',
        code: 'MISSING_PARAMETER'
      });
    }

    const { data: changes, error } = await supabase
      .from('data_history')
      .select('*')
      .eq('user_id', req.user.id)
      .gte('changed_at', since)
      .order('changed_at', { ascending: true })
      .limit(100);

    if (error) throw error;

    res.json({
      success: true,
      changes: changes || [],
      count: changes?.length || 0,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    next(error);
  }
});

// ==================== REGISTRAR SESIÓN ====================
router.post('/session', authenticateToken, async (req, res, next) => {
  try {
    const { clientType, clientVersion } = req.body;

    const { data, error } = await supabase
      .from('active_sessions')
      .upsert({
        user_id: req.user.id,
        client_type: clientType || 'web',
        client_version: clientVersion || '3.0.0',
        last_sync: new Date().toISOString(),
        is_active: true
      }, {
        onConflict: 'user_id,client_type'
      })
      .select()
      .single();

    if (error) throw error;

    res.json({
      success: true,
      session: data,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    next(error);
  }
});

module.exports = router;
