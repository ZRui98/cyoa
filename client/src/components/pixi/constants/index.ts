export const NODE_WIDTH = 250
export const NODE_HEIGHT = 130
export const MIN_DIST_BETWEEN_NODES_X = 100
export const MIN_DIST_BETWEEN_NODES_Y = 155

export const Direction = {
    UP: 'UP',
    DOWN: 'DOWN',
    LEFT: 'LEFT',
    RIGHT: 'RIGHT',
} as const

export type Direction = (typeof Direction)[keyof typeof Direction]
