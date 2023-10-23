import Ajv from 'ajv';
import { adventureMetadataSchema, adventureSchema } from './Adventure';

const ajv = new Ajv();

const schema = ajv.addSchema(adventureMetadataSchema).compile(adventureSchema);

export default schema;
