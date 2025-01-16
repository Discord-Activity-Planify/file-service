import { dbConnect, sequelize } from './database.js';
import { FileStorage } from './models/FileStorage.js'

export async function initDB() {
    await dbConnect();
    // await sequelize.drop();
    await FileStorage.sync();
}