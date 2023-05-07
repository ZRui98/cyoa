import Ajv from "ajv";
import { adventureSchema } from "./Adventure"
import { resourceSchema } from "./Resource";

const ajv = new Ajv();

const schema = ajv.compile(resourceSchema);

export default schema;