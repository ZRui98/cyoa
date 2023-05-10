import {JSONSchemaType} from "ajv"

export interface Resource {
}

export interface TextResource extends Resource {
  content: string
};

export interface ExportableResource extends Resource {
  path: string
}

export const isTextResource = (x: Resource): x is TextResource =>
  (x as TextResource).content !== undefined
export const isExportableResource = (x: Resource): x is ExportableResource =>
  (x as ExportableResource).path !== undefined
export const isAudioExportableResource = (x: Resource): x is ExportableResource => {
  if (isExportableResource(x)) {
    return x.path.endsWith('.mp3');
  }
  return false;
}

export const isImgExportableResource = (x: Resource): x is ExportableResource => {
  if (isExportableResource(x)) {
    return ['.jpg', '.png'].some(ext => x.path.endsWith(ext));
  }
  return false;
}

export const resourceSchema: JSONSchemaType<Resource> = {
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "resource",
  "type": "object",
  "oneOf": [
    {
        properties: {"path": { "type": "string" }},
        required: ["path"],
        additionalProperties: false
    },
    {
        properties: {"content": { "type": "string" }},
        required: ["content"],
        additionalProperties: false
    }
  ]
};

const RESOURCE_TYPES = ['IMAGE', 'LIVE', 'TEXT'] as const;
export type ResourceType = typeof RESOURCE_TYPES[number];