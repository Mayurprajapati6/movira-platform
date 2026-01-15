// This file contains all the basic configuration logic for the app server to work
import dotenv from 'dotenv';

type ServerConfig = {
    PORT: number,
    JWT_SECRET: string,
    JWT_REFRESH_SECRET: string,
    JWT_REFRESH_SECRET_EXPIRES_IN: string,
    JWT_ACCESS_SECRET_EXPIRES_IN: string,
}

function loadEnv() {
    dotenv.config();
    console.log(`Environment variables loaded`);
}

loadEnv();

export const serverConfig: ServerConfig = {
    PORT: Number(process.env.PORT) || 3001,
    JWT_SECRET: process.env.JWT_SECRET || "",
    JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || "",
    JWT_REFRESH_SECRET_EXPIRES_IN: process.env.JWT_REFRESH_SECRET_EXPIRES_IN || "",
    JWT_ACCESS_SECRET_EXPIRES_IN: process.env.JWT_ACCESS_SECRET_EXPIRES_IN || "",
};