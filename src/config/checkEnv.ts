import * as dotenv from 'dotenv';
dotenv.config();

const requiredEnvVars = [
    'BACKEND_PORT',
    'ARANGODB_URL',
    'ARANGODB_NAME',
    'ARANGODB_USERNAME',
    'ARANGODB_PASSWORD',
    'REDIS_HOST',
    'REDIS_PORT',
    'SESSION_SECRET'
];

const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
    console.error(`🚨🚨🚨 Missing required environment variables: ${missingEnvVars.join(', ')}`);
    process.exit(1);
}
