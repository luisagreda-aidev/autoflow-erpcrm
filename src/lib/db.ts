// @/lib/db.ts
// This module exports the db instance, types, and functions that interact with the database.
// It should only be imported and used in server-side code (Server Components, Server Actions, API routes).

import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

// Define the path for the SQLite database file
// Ensure the directory exists
const dbDir = path.resolve(process.cwd(), '.database');
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}
const dbPath = path.join(dbDir, 'autoflow.db');


// Initialize the database connection
// verbose: console.log helps in debugging SQL queries
let db: Database.Database;
try {
    db = new Database(dbPath, { verbose: console.log });
    console.log(`Database connected successfully at ${dbPath}`);
} catch (error) {
    console.error("Failed to connect to database:", error);
    throw new Error("Database connection failed.");
}


// ---- Schema Definition ----
// Use IF NOT EXISTS to prevent errors on restart
const createVehicleTable = `
CREATE TABLE IF NOT EXISTS vehicles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    make TEXT NOT NULL,
    model TEXT NOT NULL,
    year INTEGER NOT NULL,
    vin TEXT NOT NULL UNIQUE,
    price REAL NOT NULL,
    mileage REAL NOT NULL,
    status TEXT NOT NULL CHECK(status IN ('En preparación', 'Disponible', 'Reservado', 'Vendido', 'Comprado')),
    color TEXT,
    engine TEXT,
    transmission TEXT NOT NULL CHECK(transmission IN ('Manual', 'Automática')),
    features TEXT, -- Store as JSON string array '["feature1", "feature2"]'
    condition TEXT,
    documentation TEXT,
    entryDate TEXT NOT NULL, -- Store as ISO 8601 string
    cost REAL, -- Allow NULL
    imageUrl TEXT, -- Keep for fallback/single image URL
    images TEXT, -- Store as JSON string array of image URLs/Data URIs '["url1", "url2"]'
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
);
`;

// Trigger for updatedAt on vehicles
const createVehicleUpdateTrigger = `
CREATE TRIGGER IF NOT EXISTS update_vehicle_timestamp
AFTER UPDATE ON vehicles
FOR EACH ROW
BEGIN
    UPDATE vehicles SET updatedAt = CURRENT_TIMESTAMP WHERE id = OLD.id;
END;
`;

// Schema for Leads
const createLeadTable = `
CREATE TABLE IF NOT EXISTS leads (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    source TEXT,
    status TEXT NOT NULL CHECK(status IN ('Nuevo', 'Contactado', 'Seguimiento', 'Perdido', 'Convertido')) DEFAULT 'Nuevo',
    assignedTo TEXT, -- Could reference a users table later
    notes TEXT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
);
`;

// Trigger for updatedAt on leads
const createLeadUpdateTrigger = `
CREATE TRIGGER IF NOT EXISTS update_lead_timestamp
AFTER UPDATE ON leads
FOR EACH ROW
BEGIN
    UPDATE leads SET updatedAt = CURRENT_TIMESTAMP WHERE id = OLD.id;
END;
`;


// Execute schema setup within a transaction
db.transaction(() => {
    try {
        db.exec(createVehicleTable);
        db.exec(createVehicleUpdateTrigger);
        db.exec(createLeadTable);
        db.exec(createLeadUpdateTrigger);
        console.log("Database schema initialized/verified.");
    } catch (error) {
        console.error("Error initializing database schema:", error);
        // If schema fails, the transaction will roll back.
        throw new Error("Failed to initialize database schema.");
    }
})();


// ---- Database Operations ----

// Note: These functions are intended for server-side use only.
// They should be called from Server Components or Server Actions.

export interface Vehicle {
  id: number;
  make: string;
  model: string;
  year: number;
  vin: string;
  price: number;
  mileage: number;
  status: "En preparación" | "Disponible" | "Reservado" | "Vendido" | "Comprado";
  color?: string | null;
  engine?: string | null;
  transmission: "Manual" | "Automática";
  features: string; // JSON string '["feature1", "feature2"]'
  condition?: string | null;
  documentation?: string | null;
  entryDate: string; // ISO 8601 string
  cost?: number | null;
  imageUrl?: string | null; // Fallback image URL
  images: string; // JSON string '["url1", "url2"]'
  createdAt?: string;
  updatedAt?: string;
}

export interface Lead {
    id: number;
    name: string;
    email?: string | null;
    phone?: string | null;
    source?: string | null;
    status: "Nuevo" | "Contactado" | "Seguimiento" | "Perdido" | "Convertido";
    assignedTo?: string | null;
    notes?: string | null;
    createdAt?: string;
    updatedAt?: string;
}


// --- Vehicle Operations ---

/**
 * Adds a new vehicle to the database.
 * Should only be called from server-side code (e.g., Server Actions).
 * @param vehicleData - Object containing vehicle details (without id).
 * @returns The id of the newly inserted vehicle.
 */
export function _addVehicleInternal(vehicleData: Omit<Vehicle, 'id' | 'createdAt' | 'updatedAt'>): number {
  const stmt = db.prepare(`
    INSERT INTO vehicles (
      make, model, year, vin, price, mileage, status, color, engine,
      transmission, features, condition, documentation, entryDate, cost, imageUrl, images
    ) VALUES (
      @make, @model, @year, @vin, @price, @mileage, @status, @color, @engine,
      @transmission, @features, @condition, @documentation, @entryDate, @cost, @imageUrl, @images
    )
  `);

  try {
    // Ensure features and images are valid JSON strings if provided, default to '[]'
    const dataToInsert = {
        ...vehicleData,
        features: typeof vehicleData.features === 'string' ? vehicleData.features : JSON.stringify(vehicleData.features || []),
        images: typeof vehicleData.images === 'string' ? vehicleData.images : JSON.stringify(vehicleData.images || []),
        cost: vehicleData.cost === undefined ? null : vehicleData.cost // Handle undefined cost
    };

    const info = stmt.run(dataToInsert);
    // Explicitly cast info.lastInsertRowid to number
    return Number(info.lastInsertRowid);
  } catch (error: any) {
    // Handle potential unique constraint error for VIN
    if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      console.error(`Constraint Error: VIN '${vehicleData.vin}' already exists.`);
      throw new Error(`Error: El VIN '${vehicleData.vin}' ya existe en la base de datos.`);
    }
     if (error.code === 'SQLITE_CONSTRAINT_CHECK') {
        console.error("Check constraint failed:", error.message);
        // Be more specific if possible, e.g., check error message for column name
        throw new Error("Error: Uno de los valores proporcionados no es válido (ej. estado, transmisión).");
    }
    console.error("Error adding vehicle:", error);
    throw new Error("Error al añadir el vehículo a la base de datos.");
  }
}


/**
 * Retrieves all vehicles from the database.
 * Should only be called from server-side code.
 * @returns An array of vehicle objects.
 */
export function _getAllVehiclesInternal(): Vehicle[] {
    const stmt = db.prepare('SELECT * FROM vehicles ORDER BY createdAt DESC');
    try {
        const vehicles = stmt.all() as Vehicle[];
        return vehicles;
    } catch (error) {
        console.error("Error fetching vehicles:", error);
        throw new Error("Error al obtener los vehículos de la base de datos.");
    }
}


/**
 * Retrieves a single vehicle by its ID.
 * Should only be called from server-side code.
 * @param id - The ID of the vehicle.
 * @returns The vehicle object or undefined if not found.
 */
export function _getVehicleByIdInternal(id: number): Vehicle | undefined {
  const stmt = db.prepare('SELECT * FROM vehicles WHERE id = ?');
  try {
      const vehicle = stmt.get(id) as Vehicle | undefined;
      return vehicle;
  } catch (error) {
      console.error(`Error fetching vehicle with ID ${id}:`, error);
      throw new Error("Error al obtener el vehículo de la base de datos.");
  }
}

/**
 * Updates an existing vehicle.
 * Should only be called from server-side code.
 * @param id - The ID of the vehicle to update.
 * @param updates - An object containing the fields to update.
 * @returns true if the update was successful, false otherwise.
 */
export function _updateVehicleInternal(id: number, updates: Partial<Omit<Vehicle, 'id' | 'createdAt' | 'updatedAt'>>): boolean {
  // Ensure features and images are stringified if they are arrays
  const updatesWithStringifiedJson = { ...updates };
  if (updates.features && typeof updates.features !== 'string') {
    updatesWithStringifiedJson.features = JSON.stringify(updates.features);
  }
  if (updates.images && typeof updates.images !== 'string') {
    updatesWithStringifiedJson.images = JSON.stringify(updates.images);
  }
  if (updates.cost === undefined && 'cost' in updates) { // Only set to null if cost was explicitly provided as undefined
      updatesWithStringifiedJson.cost = null;
  }


  // Build the SET part of the SQL query dynamically
  const setClauses = Object.keys(updatesWithStringifiedJson)
    .map(key => `${key} = @${key}`)
    .join(', ');

  if (!setClauses) {
    console.warn("No updates provided for vehicle ID:", id);
    return false; // Nothing to update
  }

  const stmt = db.prepare(`UPDATE vehicles SET ${setClauses} WHERE id = @id`);

  try {
    const info = stmt.run({ ...updatesWithStringifiedJson, id });
    return info.changes > 0; // Returns true if at least one row was changed
  } catch (error: any) {
     // Handle potential unique constraint error for VIN if updated
    if (error.code === 'SQLITE_CONSTRAINT_UNIQUE' && updates.vin) {
      throw new Error(`Error: El VIN '${updates.vin}' ya existe en la base de datos.`);
    }
     if (error.code === 'SQLITE_CONSTRAINT_CHECK') {
        console.error("Check constraint failed:", error.message);
        throw new Error("Error: Uno de los valores proporcionados para actualizar no es válido (ej. estado, transmisión).");
    }
    console.error(`Error updating vehicle with ID ${id}:`, error);
    throw new Error("Error al actualizar el vehículo en la base de datos.");
  }
}

/**
 * Deletes a vehicle by its ID.
 * Should only be called from server-side code.
 * @param id - The ID of the vehicle to delete.
 * @returns true if the deletion was successful, false otherwise.
 */
export function _deleteVehicleInternal(id: number): boolean {
  const stmt = db.prepare('DELETE FROM vehicles WHERE id = ?');
  try {
    const info = stmt.run(id);
    return info.changes > 0; // Returns true if at least one row was deleted
  } catch (error) {
    console.error(`Error deleting vehicle with ID ${id}:`, error);
    throw new Error("Error al eliminar el vehículo de la base de datos.");
  }
}

// --- Lead Operations ---

/**
 * Adds a new lead to the database.
 * Should only be called from server-side code.
 * @param leadData - Object containing lead details.
 * @returns The id of the newly inserted lead.
 */
export function _addLeadInternal(leadData: Omit<Lead, 'id' | 'createdAt' | 'updatedAt'>): number {
  const stmt = db.prepare(`
    INSERT INTO leads (name, email, phone, source, status, assignedTo, notes)
    VALUES (@name, @email, @phone, @source, @status, @assignedTo, @notes)
  `);
  try {
    // Ensure optional fields are handled correctly (use null if empty/undefined)
    const dataToInsert = {
        name: leadData.name,
        email: leadData.email || null,
        phone: leadData.phone || null,
        source: leadData.source || null,
        status: leadData.status || 'Nuevo',
        assignedTo: leadData.assignedTo || null,
        notes: leadData.notes || null,
    };
    const info = stmt.run(dataToInsert);
    return Number(info.lastInsertRowid);
  } catch (error: any) {
     if (error.code === 'SQLITE_CONSTRAINT_CHECK') {
         console.error("Check constraint failed:", error.message);
         throw new Error(`Error: Valor inválido para el estado del lead: ${leadData.status}`);
     }
    console.error("Error adding lead:", error);
    throw new Error("Error al añadir el lead a la base de datos.");
  }
}

/**
 * Retrieves all leads from the database.
 * Should only be called from server-side code.
 * @returns An array of lead objects.
 */
export function _getAllLeadsInternal(): Lead[] {
    const stmt = db.prepare('SELECT * FROM leads ORDER BY createdAt DESC');
    try {
        const leads = stmt.all() as Lead[];
        return leads;
    } catch (error) {
        console.error("Error fetching leads:", error);
        throw new Error("Error al obtener los leads de la base de datos.");
    }
}

// TODO: Implement _getLeadByIdInternal, _updateLeadInternal, _deleteLeadInternal

// ---- Utility ----

/**
 * Closes the database connection.
 * Should only be called from server-side code.
 * It's intended to be called during process shutdown events.
 */
export function closeDb() {
  if (db && db.open) {
    db.close();
    console.log("Database connection closed.");
  }
}

// Graceful shutdown handling (runs only on the server)
let isClosing = false;
const shutdown = () => {
  if (!isClosing) {
    isClosing = true;
    console.log("Closing database connection due to process exit...");
    closeDb();
    process.exit(0); // Exit process after closing DB
  }
};

if (typeof process !== 'undefined' && process.on) {
    process.on('exit', closeDb);
    process.on('SIGINT', shutdown); // Close on Ctrl+C
    process.on('SIGTERM', shutdown); // Close on termination signal
    process.on('SIGUSR2', shutdown); // Close on nodemon restart
}

// Re-export internal functions as async Server Actions if needed elsewhere
// Example:
// export async function addVehicle(vehicleData: Omit<Vehicle, 'id' | 'createdAt' | 'updatedAt'>): Promise<number> {
//    'use server';
//    return _addVehicleInternal(vehicleData);
// }
// Do this for all functions that need to be callable as Server Actions from client components.
// Keep internal sync functions for server-to-server calls.

// Export internal functions directly for use in other server-side modules (like reports.ts)
export { db }; // Export db instance only for server-side modules
