import { JSONSchemaType } from "ajv";
import { Node, nodeSchema } from "./Node";
import { Generated, Insertable, Selectable, Updateable } from "kysely";

export interface Adventure {
  name: string
  author: string,
  description?: string,
  nodes: {[key: string] : Node}
  start: string
}

export interface AdventureTable {
  id: Generated<number>
  name: string
  author: string
  description?: string
  filePath: string
  playCount: number
}

export type AdventureRow = Selectable<AdventureTable>
export type InsertableAdventureRow = Insertable<AdventureTable>
export type UpdateableAdventureRow = Updateable<AdventureTable>

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
}