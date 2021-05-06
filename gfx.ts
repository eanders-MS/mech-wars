namespace mech {

    // Sub-pixel step helps reduce artifacts when rendering sprites that are both rotated and scaled.
    const LINE_STEP = 0.5;

    export class gfx {
        /**
         * Draws a line, texture-mapping from hthe src image.
         */
        public static mapLine(img: Image, p0: Vec2, p1: Vec2, line: Image, count: number) {
            let x0 = Fx.toFloat(p0.x);
            let y0 = Fx.toFloat(p0.y);
            const x1 = Fx.toFloat(p1.x);
            const y1 = Fx.toFloat(p1.y);
            const distX = Math.abs(x1 - x0);
            const dx =  distX;
            const sx = x0 < x1 ? LINE_STEP : -LINE_STEP;
            const distY = Math.abs(y1 - y0);
            const dy = -distY;
            const sy = y0 < y1 ? LINE_STEP : -LINE_STEP;
            let err = dx + dy;
            const xMajor = distX > distY;
            let lineCurr = 0;
            let lineStep = xMajor ? LINE_STEP * count / distX : LINE_STEP * count / distY;
            while (true) {
                const color = line.getPixel(Math.floor(lineCurr), 0);
                if (color &&
                x0 >= 0 && x0 <= screen.width &&
                y0 >= 0 && y0 <= screen.height
                ) {
                    img.setPixel(Math.floor(x0), Math.round(y0), color);
                }
                if (Math.abs(x1 - x0) < LINE_STEP && Math.abs(y1 - y0) < LINE_STEP) break;
                let e2 = 2 * err;
                if (e2 >= dy) {
                    err = err + dy;
                    x0 = x0 + sx;
                    if (xMajor) lineCurr += lineStep;
                }
                if (e2 <= dx) {
                    err = err + dx;
                    y0 = y0 + sy;
                    if (!xMajor) lineCurr += lineStep;
                }
            }
        }
    }
}