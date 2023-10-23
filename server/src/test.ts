import Ajv from 'ajv';

const schema = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  $id: 'resource',
  type: 'object',
  oneOf: [
    {
      properties: { path: { type: 'string' } },
      required: ['path'],
      additionalProperties: false,
    },
    {
      properties: { content: { type: 'string' } },
      required: ['content'],
      additionalProperties: false,
    },
  ],
};

const ajv = new Ajv({ allErrors: true });
const validate = ajv.compile(schema);

const obj = {
  content: 'true',
};

const valid = validate(obj);

console.log(valid); // true
console.log(validate.errors); // null
