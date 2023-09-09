import {JSONSchemaType} from "ajv"
import { Generated } from "kysely"

export interface Asset {
}

export interface TextAsset extends Asset {
  content: string
};

export interface FileAsset extends Asset {
  path: string
}

export interface AudioAsset extends FileAsset {
  autoplay?: boolean
}

export interface ImageAsset extends FileAsset {
  width?: number
  height?: number
}

export interface ManagedExportableAsset extends FileAsset {
  managedAssetName: string
}

export interface ManagedAudioExportableAsset extends AudioAsset, FileAsset {
  html5: boolean
}

export const isTextAsset = (x: Asset): x is TextAsset =>
  (x as TextAsset).content !== undefined

export const isFileAsset = (x: Asset): x is FileAsset =>
  (x as FileAsset).path !== undefined

export const isManagedExportableAsset = (x: Asset): x is ManagedExportableAsset => 
  (x as ManagedExportableAsset).managedAssetName !== undefined

export const isAudioExportableAsset = (x: Asset): x is AudioAsset => {
  if (isFileAsset(x)) {
    return hasAudioFileExtension(x.path);
  }
  return false;
}

export const hasAudioFileExtension =(fileName: string): boolean => 
  ['.mp3'].some(ext => fileName.endsWith(ext));

export const isImgExportableAsset = (x: Asset): x is ImageAsset => {
  if (isFileAsset(x)) {
    return hasImgFileExtension(x.path);
  }
  return false;
}

export const hasImgFileExtension =(fileName: string): boolean => 
  ['.jpg', '.png'].some(ext => fileName.endsWith(ext));

export interface AssetMetaData {
  name: string;
  description?: string;
  author: string;
  fileName: string;
}

export interface AssetTable extends AssetMetaData {
  id: Generated<number>;
}

export interface AssetResponse extends Omit<AssetTable, 'id'> {
  id: number,
  path: string;
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

export const AssetType = { MANAGED: 'MANAGED', FILE: 'FILE', TEXT: 'TEXT'} as const;
export type AssetType = typeof AssetType[keyof typeof AssetType];