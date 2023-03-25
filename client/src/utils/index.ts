export function getRelativeEvtPos(ev: MouseEvent) {
    const target = ev.currentTarget as HTMLElement;
    const {top, left} = target.getBoundingClientRect();
    const relX = ev.x - left;
    const relY = ev.y - top;
    return {x: relX, y: relY};
}