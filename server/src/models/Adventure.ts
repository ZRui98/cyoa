import { JSONSchemaType } from "ajv";
import { Node, nodeSchema } from "./Node";
import { Generated } from "kysely";

interface AdventureMetaData {
  name: string
  author: string
  description?: string
}

export interface Adventure extends AdventureMetaData {
  nodes: {[key: string] : Node}
  start: string
}

export interface AdventureTable extends AdventureMetaData {
  id: Generated<number>
  fileName: string
  playCount: number
}

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
  required: ["name", "nodes", "start", "author"]
} as const;