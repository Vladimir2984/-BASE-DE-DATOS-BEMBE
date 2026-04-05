/**
 * Utilidades de base de datos - Inicialización de Supabase
 */

const createTablesSQL = `
-- Tabla de usuarios
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255),
  role VARCHAR(50) DEFAULT 'user',
  client_id VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabla principal de datos de la aplicación
CREATE TABLE IF NOT EXISTS app_data (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  data_type VARCHAR(50) NOT NULL,
  data JSONB NOT NULL,
  version INTEGER DEFAULT 1,
  checksum VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, data_type)
);

-- Historial de cambios
CREATE TABLE IF NOT EXISTS data_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  data_type VARCHAR(50) NOT NULL,
  old_data JSONB,
  new_data JSONB NOT NULL,
  change_type VARCHAR(50) NOT NULL,
  changed_at TIMESTAMP DEFAULT NOW(),
  client_info JSONB
);

-- Backups
CREATE TABLE IF NOT EXISTS backups (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  backup_data JSONB NOT NULL,
  backup_type VARCHAR(50) DEFAULT 'auto',
  checksum VARCHAR(255) NOT NULL,
  size_bytes INTEGER,
  created_at TIMESTAMP DEFAULT NOW(),
  metadata JSONB
);

-- Sesiones activas para sincronización
CREATE TABLE IF NOT EXISTS active_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  client_type VARCHAR(50),
  client_version VARCHAR(50),
  last_sync TIMESTAMP DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Índices para mejor rendimiento
CREATE INDEX IF NOT EXISTS idx_app_data_user_type ON app_data(user_id, data_type);
CREATE INDEX IF NOT EXISTS idx_data_history_user_time ON data_history(user_id, changed_at DESC);
CREATE INDEX IF NOT EXISTS idx_backups_user_time ON backups(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_sessions_user_active ON active_sessions(user_id, is_active);
`;

async function initDatabase(supabase) {
  console.log('📊 Verificando conexión con Supabase...');
  
  try {
    // Verificar conexión
    const { data: ping, error: pingError } = await supabase
      .from('users')
      .select('count')
      .limit(1);
    
    if (pingError && pingError.code === '42P01') {
      console.log('⚠️  Tablas no existen, creando...');
      await createTables(supabase);
    } else if (!pingError) {
      console.log('✅ Base de datos conectada');
    }
    
    return true;
  } catch (error) {
    if (error.message?.includes('relation') || error.code === '42P01') {
      console.log('🔧 Creando tablas en Supabase...');
      await createTables(supabase);
    } else {
      console.error('❌ Error conectando a Supabase:', error.message);
    }
    return false;
  }
}

async function createTables(supabase) {
  try {
    // Supabase usa SQL directo mediante funciones RPC
    // Dividimos en sentencias individuales
    const statements = createTablesSQL
      .split(';')
      .filter(stmt => stmt.trim().length > 0);
    
    for (const statement of statements) {
      if (statement.trim().length > 0) {
        const { error } = await supabase.rpc('exec_sql', { sql: statement + ';' });
        if (error && !error.message?.includes('already')) {
          console.warn(`⚠️  ${error.message}`);
        }
      }
    }
    
    console.log('✅ Tablas creadas exitosamente');
  } catch (error) {
    console.error('Error creando tablas:', error);
    throw error;
  }
}

async function saveData(supabase, userId, dataType, data) {
  const checksum = generateChecksum(data);
  
  const { data: result, error } = await supabase
    .from('app_data')
    .upsert({
      user_id: userId,
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
  return result;
}

async function getData(supabase, userId, dataType) {
  const { data, error } = await supabase
    .from('app_data')
    .select('*')
    .eq('user_id', userId)
    .eq('data_type', dataType)
    .single();
  
  if (error && error.code !== 'PGRST116') throw error;
  return data;
}

function generateChecksum(data) {
  const crypto = require('crypto');
  return crypto
    .createHash('sha256')
    .update(JSON.stringify(data))
    .digest('hex');
}

module.exports = {
  initDatabase,
  saveData,
  getData,
  generateChecksum
};
