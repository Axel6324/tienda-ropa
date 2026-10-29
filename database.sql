-- Estructura de la tienda: crea solo las tablas e índices que faltan.
-- No contiene clientes, ventas, contraseñas ni instrucciones para borrar datos.

CREATE TABLE IF NOT EXISTS customers (
  id TEXT PRIMARY KEY NOT NULL,
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  phone TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL DEFAULT '',
  document TEXT NOT NULL DEFAULT '',
  address TEXT NOT NULL DEFAULT '',
  notes TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS customers_user_name_idx ON customers(user_id, name);
CREATE TABLE IF NOT EXISTS store_settings (
  user_id TEXT PRIMARY KEY NOT NULL,
  data_json TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS sales (
  seq INTEGER PRIMARY KEY AUTOINCREMENT,
  id TEXT NOT NULL UNIQUE,
  user_id TEXT NOT NULL,
  request_id TEXT NOT NULL,
  customer_id TEXT NOT NULL REFERENCES customers(id),
  customer_json TEXT NOT NULL,
  items_json TEXT NOT NULL,
  store_json TEXT NOT NULL,
  subtotal_cents INTEGER NOT NULL CHECK (subtotal_cents >= 0),
  discount_cents INTEGER NOT NULL DEFAULT 0 CHECK (discount_cents >= 0),
  tax_rate REAL NOT NULL DEFAULT 0,
  tax_cents INTEGER NOT NULL DEFAULT 0 CHECK (tax_cents >= 0),
  total_cents INTEGER NOT NULL CHECK (total_cents >= 0),
  paid_cents INTEGER NOT NULL CHECK (paid_cents >= 0),
  currency TEXT NOT NULL,
  payment_method TEXT NOT NULL CHECK (payment_method IN ('cash', 'card', 'transfer')),
  notes TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'completed' CHECK (status IN ('completed', 'cancelled')),
  created_at TEXT NOT NULL,
  cancelled_at TEXT,
  UNIQUE(user_id, request_id)
);
CREATE INDEX IF NOT EXISTS sales_user_date_idx ON sales(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS sales_user_customer_idx ON sales(user_id, customer_id);

CREATE TABLE IF NOT EXISTS auth_sessions (
  token_hash TEXT PRIMARY KEY NOT NULL,
  credential_hash TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  expires_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS auth_sessions_expiry_idx ON auth_sessions(expires_at);

CREATE TABLE IF NOT EXISTS auth_login_limits (
  key_hash TEXT PRIMARY KEY NOT NULL,
  window_start INTEGER NOT NULL,
  attempts INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS auth_login_limits_window_idx ON auth_login_limits(window_start);

