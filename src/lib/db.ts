// @/lib/db.ts
'use server';

import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

// Define the path for the SQLite database file
const dbPath = path.resolve(process.cwd(), 'autoflow.db');

// Ensure the directory exists (though usually CWD exists)
// const dbDir = path.dirname(dbPath);
// if (!fs.existsSync(dbDir)) {
//   fs.mkdirSync(dbDir, { recursive: true });
// }

// Initialize the database connection
// verbose: console.log helps in debugging SQL queries
export const db = new Database(dbPath, { verbose: console.log }); // Export db instance

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

// Trigger for updatedAt
const createVehicleUpdateTrigger = `
CREATE TRIGGER IF NOT EXISTS update_vehicle_timestamp
AFTER UPDATE ON vehicles
FOR EACH ROW
BEGIN
    UPDATE vehicles SET updatedAt = CURRENT_TIMESTAMP WHERE id = OLD.id;
END;
`;

// Execute schema setup
db.exec(createVehicleTable);
db.exec(createVehicleUpdateTrigger);

// ---- Database Operations ----

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


// --- Vehicle Operations ---

/**
 * Adds a new vehicle to the database.
 * @param vehicleData - Object containing vehicle details (without id).
 * @returns The id of the newly inserted vehicle.
 */
export async function addVehicle(vehicleData: Omit<Vehicle, 'id' | 'createdAt' | 'updatedAt'>): Promise<number> {
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
      throw new Error(`Error: El VIN '${vehicleData.vin}' ya existe en la base de datos.`);
    }
    console.error("Error adding vehicle:", error);
    throw new Error("Error al añadir el vehículo a la base de datos.");
  }
}


/**
 * Retrieves all vehicles from the database.
 * @returns An array of vehicle objects.
 */
export async function getAllVehicles(): Promise<Vehicle[]> {
    const stmt = db.prepare('SELECT * FROM vehicles ORDER BY createdAt DESC');
    try {
        const vehicles = stmt.all() as Vehicle[];
        // No need to parse JSON here, do it on the client where needed
        return vehicles;
    } catch (error) {
        console.error("Error fetching vehicles:", error);
        throw new Error("Error al obtener los vehículos de la base de datos.");
    }
}


/**
 * Retrieves a single vehicle by its ID.
 * @param id - The ID of the vehicle.
 * @returns The vehicle object or undefined if not found.
 */
export async function getVehicleById(id: number): Promise<Vehicle | undefined> {
  const stmt = db.prepare('SELECT * FROM vehicles WHERE id = ?');
  try {
      const vehicle = stmt.get(id) as Vehicle | undefined;
      // No need to parse JSON here
      return vehicle;
  } catch (error) {
      console.error(`Error fetching vehicle with ID ${id}:`, error);
      throw new Error("Error al obtener el vehículo de la base de datos.");
  }
}

/**
 * Updates an existing vehicle.
 * @param id - The ID of the vehicle to update.
 * @param updates - An object containing the fields to update.
 * @returns true if the update was successful, false otherwise.
 */
export async function updateVehicle(id: number, updates: Partial<Omit<Vehicle, 'id' | 'createdAt' | 'updatedAt'>>): Promise<boolean> {
  // Ensure features and images are stringified if they are arrays
  const updatesWithStringifiedJson = { ...updates };
  if (updates.features && typeof updates.features !== 'string') {
    updatesWithStringifiedJson.features = JSON.stringify(updates.features);
  }
  if (updates.images && typeof updates.images !== 'string') {
    updatesWithStringifiedJson.images = JSON.stringify(updates.images);
  }
  if (updates.cost === undefined) {
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
    console.error(`Error updating vehicle with ID ${id}:`, error);
    throw new Error("Error al actualizar el vehículo en la base de datos.");
  }
}

/**
 * Deletes a vehicle by its ID.
 * @param id - The ID of the vehicle to delete.
 * @returns true if the deletion was successful, false otherwise.
 */
export async function deleteVehicle(id: number): Promise<boolean> {
  const stmt = db.prepare('DELETE FROM vehicles WHERE id = ?');
  try {
    const info = stmt.run(id);
    return info.changes > 0; // Returns true if at least one row was deleted
  } catch (error) {
    console.error(`Error deleting vehicle with ID ${id}:`, error);
    throw new Error("Error al eliminar el vehículo de la base de datos.");
  }
}

// --- Lead/Customer Operations (Placeholder) ---
// TODO: Implement Lead/Customer schema and functions

// --- Sales Process Operations (Placeholder) ---
// TODO: Implement Sales schema and functions

// ---- Utility ----
/**
 * Closes the database connection.
 * Call this when the application is shutting down.
 * NOTE: This function is NOT marked async and is not a Server Action itself.
 * It's intended to be called during process shutdown events.
 */
function closeDb() { // Removed 'export'
  if (db && db.open) {
    db.close();
    console.log("Database connection closed.");
  }
}

// Graceful shutdown handling
let isClosing = false;
const shutdown = () => {
  if (!isClosing) {
    isClosing = true;
    console.log("Closing database connection due to process exit...");
    closeDb();
    process.exit(0);
  }
};

process.on('exit', closeDb); // Close on normal exit
process.on('SIGINT', shutdown); // Close on Ctrl+C
process.on('SIGTERM', shutdown); // Close on termination signal
process.on('SIGUSR2', shutdown); // Close on nodemon restart
