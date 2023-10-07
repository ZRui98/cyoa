import type { Graph } from '../store/adventure';
import { getWidthAndHeight } from './createGraph';

/**
 * @group unit
 */
describe('createGraph', () => {
  it('should parse simple full tree', () => {
    const simpleGraph = {
      '1': {
        name: '',
        resources: [],
        links: [
          { prompt: '', next: '2' },
          { prompt: '', next: '3' },
        ],
      },
      '2': {
        name: '',
        resources: [],
        links: [
          { prompt: '', next: '4' },
          { prompt: '', next: '5' },
        ],
      },
      '3': {
        name: '',
        resources: [],
        links: [
          { prompt: '', next: '6' },
          { prompt: '', next: '7' },
        ],
      },
      '4': {
        name: '',
        resources: [],
        links: [],
      },
      '5': {
        name: '',
        resources: [],
        links: [],
      },
      '6': {
        name: '',
        resources: [],
        links: [],
      },
      '7': {
        name: '',
        resources: [],
        links: [],
      },
    };
    const response = getWidthAndHeight({ start: '1', nodes: simpleGraph });
    expect(response.layers).toEqual([['1'], ['2', '3'], ['4', '5', '6', '7']]);
  });

  it('should remove duplicates', () => {
    const duplicateGraph = {
      '1': {
        name: '',
        resources: [],
        links: [
          { prompt: '', next: '2' },
          { prompt: '', next: '3' },
        ],
      },
      '2': {
        name: '',
        resources: [],
        links: [
          { prompt: '', next: '4' },
          { prompt: '', next: '5' },
        ],
      },
      '3': {
        name: '',
        resources: [],
        links: [
          { prompt: '', next: '5' },
          { prompt: '', next: '6' },
        ],
      },
      '4': {
        name: '',
        resources: [],
        links: [],
      },
      '5': {
        name: '',
        resources: [],
        links: [],
      },
      '6': {
        name: '',
        resources: [],
        links: [],
      },
    };

    const response = getWidthAndHeight({ start: '1', nodes: duplicateGraph });
    expect(response).toEqual([['1'], ['2', '3'], ['4', '5', '6']]);
  });

  it('should keep nodes with duplicates as low as possible', () => {
    const duplicateLowGraph = {
      '1': {
        name: '',
        links: [
          { prompt: '', next: '2' },
          { prompt: '', next: '3' },
        ],
      },
      '2': {
        name: '',
        links: [
          { prompt: '', next: '4' },
          { prompt: '', next: '5' },
        ],
      },
      '3': {
        name: '',
        links: [
          { prompt: '', next: '6' },
          { prompt: '', next: '7' },
        ],
      },
      '4': {
        name: '',
        links: [],
      },
      '5': {
        name: '',
        links: [{ prompt: '', next: '7' }],
      },
      '6': {
        name: '',
        links: [],
      },
      '7': {
        name: '',
        links: [],
      },
    };
    const response = getWidthAndHeight({ start: '1', nodes: duplicateLowGraph });
    expect(response.layers).toEqual([['1'], ['2', '3'], ['4', '5', '6', '7']]);
  });

  it('should render when graph has a cycle', () => {
    const duplicateLowGraph = {
      '1': {
        name: '',
        resources: [],
        links: [
          { prompt: '', next: '2' },
          { prompt: '', next: '3' },
        ],
      },
      '2': {
        name: '',
        resources: [],
        links: [
          { prompt: '', next: '4' },
          { prompt: '', next: '5' },
        ],
      },
      '3': {
        name: '',
        resources: [],
        links: [
          { prompt: '', next: '6' },
          { prompt: '', next: '7' },
        ],
      },
      '4': {
        name: '',
        resources: [],
        links: [],
      },
      '5': {
        name: '',
        resources: [],
        links: [{ prompt: '', next: '7' }],
      },
      '6': {
        name: '',
        resources: [],
        links: [],
      },
      '7': {
        name: '',
        resources: [],
        links: [],
      },
    };
    const response = getWidthAndHeight({ start: '1', nodes: duplicateLowGraph });
    expect(response.layers).toEqual([['1'], ['2', '3'], ['4', '5', '6', '7']]);
  });

  it.only('should not throw error if there is no cycle', () => {
    const duplicateLowGraph = {
      '1': {
        name: '',
        resources: [],
        links: [
          { prompt: '', next: '2' },
          { prompt: '', next: '3' },
          { prompt: '', next: '7' },
        ],
      },
      '2': {
        name: '',
        resources: [],
        links: [{ prompt: '', next: '4' }],
      },
      '3': {
        name: '',
        resources: [],
        links: [{ prompt: '', next: '2' }],
      },
      '4': {
        name: '',
        resources: [],
        links: [
          { prompt: '', next: '5' },
          { prompt: '', next: '6' },
        ],
      },
      '5': {
        name: '',
        resources: [],
        links: [{ prompt: '', next: '7' }],
      },
      '6': {
        name: '',
        resources: [],
        links: [{ prompt: '', next: '7' }],
      },
      '7': {
        name: '',
        resources: [],
        links: [],
      },
    };
    const { layers, edgeLayers } = getWidthAndHeight({ start: '1', nodes: duplicateLowGraph });
    expect(layers).toEqual([['1'], ['2', '3'], ['4'], ['5', '6'], ['7']]);
    expect(edgeLayers).toEqual([['1'], ['2', '3'], ['4'], ['5', '6'], ['7']]);
  });
});
