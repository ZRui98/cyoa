import Ajv, {JSONSchemaType} from "ajv"
import { Resource, resourceSchema } from "./Resource"

export interface Node {
  name: string,
  resources: Resource[],
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
}

export const nodeSchema: JSONSchemaType<Node> = {
  $id: "node",
  type: "object",
  properties: {
    name: {type: 'string'},
    links: {
      type: 'array',
      items: edgeSchema,
    },
    resources: {
      type: 'array',
      items: resourceSchema,
    }
  },
  required: ["links", "resources", "name"]
}