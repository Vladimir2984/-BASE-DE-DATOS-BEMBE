/**
 * Rutas de autenticación
 * POST /api/auth/register - Registro de usuario
 * POST /api/auth/login - Login
 * POST /api/auth/verify - Verificar token
 */

const express = require('express');
const bcrypt = require('bcryptjs');
const { body, validationResult } = require('express-validator');
const { generateToken, authenticateToken } = require('../middleware/auth');
const supabase = require('../utils/supabase');

const router = express.Router();

// ==================== REGISTRO ====================
router.post('/register', [
  body('email').isEmail().normalizeEmail().withMessage('Email inválido'),
  body('password').isLength({ min: 8 }).withMessage('Mínimo 8 caracteres'),
  body('name').optional().trim().isLength({ max: 100 })
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Datos inválidos',
        details: errors.array().map(e => e.msg),
        code: 'VALIDATION_ERROR'
      });
    }

    const { email, password, name, clientId } = req.body;

    // Verificar si usuario ya existe
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    if (existingUser) {
      return res.status(409).json({
        error: 'Email ya registrado',
        code: 'EMAIL_EXISTS'
      });
    }

    // Encriptar contraseña
    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(password, salt);

    // Crear usuario
    const { data: user, error } = await supabase
      .from('users')
      .insert({
        email,
        password_hash: passwordHash,
        name: name || email.split('@')[0],
        role: 'user',
        client_id: clientId || 'web'
      })
      .select('id, email, name, role, created_at')
      .single();

    if (error) throw error;

    // Generar token
    const token = generateToken({
      id: user.id,
      email: user.email,
      role: user.role,
      clientId: clientId
    });

    res.status(201).json({
      message: 'Usuario creado exitosamente',
      user,
      token,
      expiresIn: '30 días'
    });

  } catch (error) {
    next(error);
  }
});

// ==================== LOGIN ====================
router.post('/login', [
  body('email').isEmail().normalizeEmail().withMessage('Email requerido'),
  body('password').notEmpty().withMessage('Contraseña requerida')
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Datos inválidos',
        details: errors.array().map(e => e.msg),
        code: 'VALIDATION_ERROR'
      });
    }

    const { email, password, clientId } = req.body;

    // Buscar usuario
    const { data: user, error: findError } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (findError || !user) {
      return res.status(401).json({
        error: 'Credenciales inválidas',
        code: 'INVALID_CREDENTIALS'
      });
    }

    // Verificar contraseña
    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) {
      return res.status(401).json({
        error: 'Credenciales inválidas',
        code: 'INVALID_CREDENTIALS'
      });
    }

    // Actualizar última sincronización
    await supabase
      .from('active_sessions')
      .upsert({
        user_id: user.id,
        client_type: getClientType(req.headers['x-client-type']),
        client_version: req.headers['x-client-version'] || '3.0.0',
        last_sync: new Date().toISOString(),
        is_active: true
      }, {
        onConflict: 'user_id,client_type'
      });

    // Generar token
    const token = generateToken({
      id: user.id,
      email: user.email,
      role: user.role,
      clientId: clientId || 'web'
    });

    res.json({
      message: 'Login exitoso',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      },
      token,
      expiresIn: '30 días'
    });

  } catch (error) {
    next(error);
  }
});

// ==================== VERIFICAR TOKEN ====================
router.get('/verify', authenticateToken, async (req, res) => {
  try {
    const { data: user } = await supabase
      .from('users')
      .select('id, email, name, role, created_at, updated_at')
      .eq('id', req.user.id)
      .single();

    if (!user) {
      return res.status(404).json({
        error: 'Usuario no encontrado',
        code: 'USER_NOT_FOUND'
      });
    }

    res.json({
      valid: true,
      user
    });
  } catch (error) {
    res.status(500).json({
      error: 'Error verificando token',
      code: 'VERIFY_ERROR'
    });
  }
});

// ==================== CAMBIAR CONTRASEÑA ====================
router.post('/change-password', authenticateToken, [
  body('currentPassword').notEmpty().withMessage('Contraseña actual requerida'),
  body('newPassword').isLength({ min: 8 }).withMessage('Mínimo 8 caracteres')
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Datos inválidos',
        details: errors.array().map(e => e.msg),
        code: 'VALIDATION_ERROR'
      });
    }

    const { currentPassword, newPassword } = req.body;

    // Verificar contraseña actual
    const { data: user } = await supabase
      .from('users')
      .select('password_hash')
      .eq('id', req.user.id)
      .single();

    const isValid = await bcrypt.compare(currentPassword, user.password_hash);
    if (!isValid) {
      return res.status(401).json({
        error: 'Contraseña actual incorrecta',
        code: 'INVALID_PASSWORD'
      });
    }

    // Encriptar nueva contraseña
    const salt = await bcrypt.genSalt(12);
    const newPasswordHash = await bcrypt.hash(newPassword, salt);

    // Actualizar
    await supabase
      .from('users')
      .update({ 
        password_hash: newPasswordHash,
        updated_at: new Date().toISOString()
      })
      .eq('id', req.user.id);

    res.json({
      message: 'Contraseña actualizada exitosamente'
    });

  } catch (error) {
    next(error);
  }
});

// Helpers
function getClientType(headerValue) {
  if (!headerValue) return 'web';
  if (headerValue.toLowerCase().includes('android')) return 'android';
  if (headerValue.toLowerCase().includes('ios')) return 'ios';
  return 'web';
}

module.exports = router;
