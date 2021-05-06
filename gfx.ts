// our little mini gpu
namespace mech.gfx {

    function sortVertices(tri: number[], verts: Vec2[]): number[] {
        const sorted = tri.slice();
        while (true) {
            if (verts[tri[1]].y < verts[tri[0]].y) { tri.push(tri.shift()); continue; }
            if (verts[tri[2]].y < verts[tri[0]].y) { tri.push(tri.shift()); continue; }
            break;
        }
        return sorted;
    }

    function drawTexturedTri(img: Image, verts: Vec2[], tri: number[], tex: Image) {
        // tri indices are already sorted by height.
        const mid = tri[1];

    }

    /**
     * Render a textured rectangle of any rotation and scale. Assumptions:
     * p0..p3 are clockwise image vertices
     * p0 is the upper-left image vertex in non-rotated space
     */
    export function drawTexturedRect(img: Image, p0: Vec2, p1: Vec2, p2: Vec2, p3: Vec2, tex: Image) {
        const verts = [p0, p1, p2, p3];
        const tri0 = sortVertices([0, 1, 2], verts);
        const tri1 = sortVertices([2, 3, 1], verts);
        drawTexturedTri(img, verts, tri0, tex);
        drawTexturedTri(img, verts, tri1, tex);
    }

    // Sub-pixel step helps reduce artifacts when rendering sprites that are both rotated and scaled.
    const LINE_STEP = 0.5;

    /**
     * Draws a line, texture-mapping from hthe src image.
     */
    export function mapLine(img: Image, p0: Vec2, p1: Vec2, line: Image, count: number) {
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