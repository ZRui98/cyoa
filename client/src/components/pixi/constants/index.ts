export const NODE_WIDTH = 250;
export const NODE_HEIGHT = 130;
export const MIN_DIST_BETWEEN_NODES_X = 100;
export const MIN_DIST_BETWEEN_NODES_Y = 155;

export const Direction = {
  UP: 90,
  DOWN: 270,
  LEFT: 180,
  RIGHT: 0,
} as const;

export type Direction = (typeof Direction)[keyof typeof Direction];

export const LOREM_IPSUM = `Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Arcu dui vivamus arcu felis bibendum ut tristique et egestas. Nunc scelerisque viverra mauris in aliquam sem fringilla. Nec tincidunt praesent semper feugiat nibh sed pulvinar. Ridiculus mus mauris vitae ultricies leo integer malesuada. Massa tincidunt dui ut ornare lectus. Felis imperdiet proin fermentum leo vel orci porta. Odio aenean sed adipiscing diam donec adipiscing tristique. Enim ut tellus elementum sagittis vitae et leo. Vulputate enim nulla aliquet porttitor lacus luctus accumsan tortor.
Praesent tristique magna sit amet purus gravida quis. Donec ultrices tincidunt arcu non sodales neque. Accumsan in nisl nisi scelerisque. Tincidunt ornare massa eget egestas purus. Sed adipiscing diam donec adipiscing tristique risus nec feugiat in. Neque ornare aenean euismod elementum nisi quis. Sit amet mattis vulputate enim nulla aliquet porttitor lacus. Aliquam nulla facilisi cras fermentum odio. Malesuada fames ac turpis egestas sed tempus urna et pharetra. Ullamcorper sit amet risus nullam eget felis eget nunc. Etiam dignissim diam quis enim lobortis scelerisque fermentum dui. Tincidunt id aliquet risus feugiat in ante metus. Pulvinar pellentesque habitant morbi tristique senectus et netus et malesuada. Eleifend mi in nulla posuere sollicitudin aliquam ultrices. Et ligula ullamcorper malesuada proin libero nunc consequat interdum varius. At volutpat diam ut venenatis tellus in metus vulputate. Velit sed ullamcorper morbi tincidunt ornare massa eget egestas purus.`;
