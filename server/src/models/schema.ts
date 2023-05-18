import Ajv from "ajv";
import { adventureSchema } from "./Adventure"
import { assetSchema } from "./Asset";

const ajv = new Ajv();

const schema = ajv.compile(assetSchema);

export default schema;