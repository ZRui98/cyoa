import { Point } from "pixi.js";
import { writable } from 'svelte/store';

export interface EditorState {
    drawingEdge: Point[]
}

function createEditorState() {
    const state = writable<EditorState | undefined>(undefined);
  
    return {
      ...state,
    };
}