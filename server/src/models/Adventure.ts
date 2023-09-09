import { JSONSchemaType } from "ajv";
import { Node, nodeSchema } from "./Node";
import { Generated } from "kysely";

export interface AdventureMetaData {
  name: string
  author: string
  description?: string
}

export interface Adventure extends AdventureMetaData {
  nodes: {[key: string] : Node}
  start: string
}

export const isAdventure = (x: AdventureMetaData): x is Adventure => (x as Adventure).start !== undefined;

export interface AdventureTable extends AdventureMetaData {
  id: Generated<number>
  fileName: string
  playCount: number
}

export interface AdventureSummary {
  name: string,
  description?: string,
  playCount: number
};

export const adventureMetadataSchema: JSONSchemaType<AdventureMetaData> = {
  $id: 'adventure_metadata',
  type: 'object',
  properties: {
    name: { type: "string" },
    author: { type: "string" },
    description: { type: "string", nullable: true },
  },
  additionalProperties: false,
  required: ['name', 'author']
} as const;

export const adventureSchema: JSONSchemaType<Adventure> = {
  $id: 'adventure',
  type: "object",
  properties: {
    name: { type: "string" },
    author: { type: "string" },
    description: { type: "string", nullable: true },
    start: { type: "string" },
    nodes: {
      type: "object",
      additionalProperties: nodeSchema,
      required: []
    }
  },
  additionalProperties: false,
  required: ["name", "nodes", "start", "author"]
} as const;