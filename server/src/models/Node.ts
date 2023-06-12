import {JSONSchemaType} from "ajv"
import { Asset, assetSchema } from "./Asset"

export interface Node {
  name: string,
  assets?: Asset[],
  links: Edge[]
}

export interface Edge {
  prompt: string,
  next: string
}

export const edgeSchema: JSONSchemaType<Edge> = {
  $id: "edge",
  type: "object",
  properties: {
    prompt: { type: "string" },
    next: { type: "string" }
  },
  required: ["prompt", "next"],
  additionalProperties: false
} as const;

export const nodeSchema: JSONSchemaType<Node> = {
  $id: "node",
  type: "object",
  properties: {
    name: {type: 'string'},
    links: {
      type: 'array',
      items: edgeSchema,
    },
    assets: {
      type: 'array',
      items: assetSchema,
      nullable: true,
    }
  },
  required: ["links", "name"],
  additionalProperties: false
} as const;