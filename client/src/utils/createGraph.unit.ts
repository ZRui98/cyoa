import type { Graph } from '../store/adventure';
import { getWidthAndHeight } from './createGraph';
import { expect, test } from 'vitest';

/**
 * @group unit
 */

// test('should get correct in and out degrees for graph', () => {
//   const graph: Graph = {
//     start: '0',
//     nodes: {
//       '0': {
//         name: '0',
//         links: [{next: '1'}]
//       },
//       '1': {
//         name: '1',
//         links: [{next: '2'}]
//       },
//       '2': {
//         name: '2',
//         links: [{next: '0'},{next: '3'}]
//       },
//       '3': {
//         name: '3',
//         links: [{next: '1'}]
//       },
//     }
//   };
//   const degrees = getDegrees(graph);

//   expect(degrees).toStrictEqual({
//     '0': {in: 1, out: 1},
//     '1': {in: 2, out: 1},
//     '2': {in: 2, out: 1},
//     '3': {in: 1, out: 1},
//   });
// });
