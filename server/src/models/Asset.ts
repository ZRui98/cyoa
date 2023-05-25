import {JSONSchemaType} from "ajv"
import { Generated } from "kysely"

export interface Asset {
}

export interface TextAsset extends Asset {
  content: string
};

export interface ExportableAsset extends Asset {
  path: string
}

export interface ManagedExportableAsset extends ExportableAsset {
  managedAssetName: string
}

export const isTextAsset = (x: Asset): x is TextAsset =>
  (x as TextAsset).content !== undefined
export const isExportableAsset = (x: Asset): x is ExportableAsset =>
  (x as ExportableAsset).path !== undefined
export const isManagedExportableAsset = (x: Asset): x is ManagedExportableAsset => 
  (x as ManagedExportableAsset).managedAssetName !== undefined

export const isAudioExportableAsset = (x: Asset): x is ExportableAsset => {
  if (isExportableAsset(x)) {
    return x.path.endsWith('.mp3');
  }
  return false;
}

export const isImgExportableResource = (x: Asset): x is ExportableAsset => {
  if (isExportableAsset(x)) {
    return ['.jpg', '.png'].some(ext => x.path.endsWith(ext));
  }
  return false;
}

export interface AssetMetaData {
  name: string;
  description?: string;
  author: string;
  fileName: string;
}

export interface AssetTable extends AssetMetaData {
  id: Generated<number>
}

export interface AdventureAssetTable {
  id: Generated<number>
  adventureId: number
  assetId: number
}

export const assetSchema: JSONSchemaType<Asset> = {
  "$id": "asset",
  "type": "object",
  "oneOf": [
    {
        properties: {
          "path": { "type": "string" },
          "managedAssetName": {"type": "string"}
        },
        required: ["path"],
        additionalProperties: false
    },
    {
        properties: {"content": { "type": "string" }},
        required: ["content"],
        additionalProperties: false
    }
  ]
} as const;

const ASSET_TYPES = ['IMAGE', 'LIVE', 'TEXT'] as const;
export type AssetType = typeof ASSET_TYPES[number];