import waitPort from "wait-port";
import { Sequelize } from "sequelize";
import config from "../config.js";

export const sequelize = new Sequelize(config.database.name, config.database.username, config.database.password, {
    host: config.database.host,
    dialect: 'postgres'
});

export async function dbConnect() {
    try {
        await waitPort({ 
            host: config.database.host, 
            port: parseInt(config.database.port),
            timeout: 10000,
            waitForDns: true,
        })

        await sequelize.authenticate()
        console.log("Database Authorized")
    }
    catch (error) {
        console.error("Database Falied: ", error)
        process.exit(1)
    }
}