/**
 * Rutas de datos - CRUD principal
 * GET /api/data - Obtener todos los datos
 * POST /api/data - Guardar datos
 * PUT /api/data/:type - Actualizar tipo específico
 */

const express = require('express');
const { authenticateToken, optionalAuth } = require('../middleware/auth');
const supabase = require('../utils/supabase');
const { generateChecksum } = require('../utils/database');

const router = express.Router();

// ==================== OBTENER DATOS ====================
router.get('/', optionalAuth, async (req, res, next) => {
  try {
    const userId = req.user?.id || 'anonymous';
    
    const { data, error } = await supabase
      .from('app_data')
      .select('*')
      .eq('user_id', userId);

    if (error) throw error;

    // Transformar a formato de la app
    const appData = {
      students: [],
      teachers: [],
      renters: [],
      debtRecords: [],
      history: [],
      schedule: {},
      prices: [],
      lastSync: new Date().toISOString()
    };

    data.forEach(record => {
      appData[record.data_type] = record.data;
    });

    res.json({
      success: true,
      data: appData,
      checksum: generateChecksum(appData),
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    next(error);
  }
});

// ==================== GUARDAR DATOS ====================
router.post('/', authenticateToken, async (req, res, next) => {
  try {
    const { dataType, data } = req.body;

    if (!dataType || !data) {
      return res.status(400).json({
        error: 'dataType y data son requeridos',
        code: 'MISSING_FIELDS'
      });
    }

    const validTypes = ['students', 'teachers', 'renters', 'debtRecords', 'history', 'schedule', 'prices'];
    if (!validTypes.includes(dataType)) {
      return res.status(400).json({
        error: 'Tipo de dato inválido',
        code: 'INVALID_TYPE',
        validTypes
      });
    }

    const checksum = generateChecksum(data);

    // Guardar en Supabase
    const { data: result, error } = await supabase
      .from('app_data')
      .upsert({
        user_id: req.user.id,
        data_type: dataType,
        data: data,
        checksum: checksum,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id,data_type'
      })
      .select()
      .single();

    if (error) throw error;

    // Registrar en historial
    await supabase
      .from('data_history')
      .insert({
        user_id: req.user.id,
        data_type: dataType,
        new_data: data,
        change_type: 'update',
        client_info: {
          type: req.headers['x-client-type'] || 'web',
          version: req.headers['x-client-version'] || '3.0.0'
        }
      });

    res.json({
      success: true,
      message: 'Datos guardados exitosamente',
      data: result,
      checksum,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    next(error);
  }
});

// ==================== ACTUALIZAR DATOS COMPLETOS ====================
router.put('/full', authenticateToken, async (req, res, next) => {
  try {
    const fullData = req.body;

    if (!fullData || typeof fullData !== 'object') {
      return res.status(400).json({
        error: 'Datos completos requeridos',
        code: 'MISSING_DATA'
      });
    }

    const dataTypes = ['students', 'teachers', 'renters', 'debtRecords', 'history', 'schedule', 'prices'];
    const results = {};

    for (const dataType of dataTypes) {
      if (fullData[dataType] !== undefined) {
        const checksum = generateChecksum(fullData[dataType]);
        
        await supabase
          .from('app_data')
          .upsert({
            user_id: req.user.id,
            data_type: dataType,
            data: fullData[dataType],
            checksum: checksum,
            updated_at: new Date().toISOString()
          }, {
            onConflict: 'user_id,data_type'
          });

        results[dataType] = { success: true, checksum };
      }
    }

    res.json({
      success: true,
      message: 'Todos los datos actualizados',
      results,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    next(error);
  }
});

// ==================== ELIMINAR DATOS ====================
router.delete('/:type', authenticateToken, async (req, res, next) => {
  try {
    const { type } = req.params;

    const { error } = await supabase
      .from('app_data')
      .delete()
      .eq('user_id', req.user.id)
      .eq('data_type', type);

    if (error) throw error;

    res.json({
      success: true,
      message: `Datos de ${type} eliminados`,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    next(error);
  }
});

module.exports = router;
