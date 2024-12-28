import swaggerJSDoc, { Options } from 'swagger-jsdoc';
import path from 'path';
import yaml from 'yaml';
import fs from 'fs';

const options: Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'WinnerTakesItAll',
      version: '1.0.0',
      description: 'API documentation of the WinnerTakesItAll project',
    },
    servers: [
      { url: `http://localhost:${process.env.BACKEND_PORT}`, description: 'Local server' },
    ],
  },
  apis: [path.join(__dirname, '../routes/**/*.js')],
};

const swaggerSpec: any = swaggerJSDoc(options);

// Merge the YAML components into the swagger components
const yamlFile = fs.readFileSync(path.join(__dirname, '../../schemas.yaml'), 'utf8');
const yamlComponents = yaml.parse(yamlFile);

swaggerSpec.components = {
  ...swaggerSpec.components,
  ...yamlComponents.components,
};

//Save the swaggerSpec to root
fs.writeFileSync(path.join(__dirname, '../../swaggerSpec.json'), JSON.stringify(swaggerSpec, null, 2));

export default swaggerSpec;
