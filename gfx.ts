// our mini gpu
namespace mech.gfx {
    const _ScanLine = image.create(screen.width, 1);
    const _TriIndices: number[] = [];
    const _TriIndicesA: number[] = [];
    const _TriIndicesB: number[] = [];

    function _sortTriIndices(tri: number[], verts: Vertex[]): number[] {
        // Rotate until index zero is at the top.
        while (verts[tri[1]].pos.y < verts[tri[0]].pos.y || verts[tri[2]].pos.y < verts[tri[0]].pos.y) {
            tri.push(tri.shift());
        }
        // If the top is flat, ensure index zero is leftmost.
        if (verts[tri[0]].pos.y === verts[tri[1]].pos.y && verts[tri[0]].pos.x > verts[tri[1]].pos.x) {
            tri.push(tri.shift());
            tri.push(tri.shift());
        } else if (verts[tri[0]].pos.y === verts[tri[2]].pos.y && verts[tri[0]].pos.x > verts[tri[2]].pos.x) {
            tri.push(tri.shift());
            tri.push(tri.shift());
        }
        return tri;
    }

    function _drawTexturedTri(target: Image, verts: Vertex[], tri: number[], tex: Image) {
        // Assumption: vertex at index zero the topmost, leftmost.
        if (verts[tri[0]].pos.y === verts[tri[1]].pos.y) {
            // top is flat
        }
    }

    /**
     * Render a textured triangle.
     */
    export function drawTexturedTriangle(target: Image, verts: Vertex[], tri: number[], tex: Image) {
        tri = _sortTriIndices(tri, verts);
        if (verts[tri[0]].pos.y === verts[tri[1]].pos.y ||
            verts[tri[0]].pos.y === verts[tri[2]].pos.y ||
            verts[tri[1]].pos.y === verts[tri[2]].pos.y)
        {
            // triangle has a horizontal edge. no need to subdivide.
            _drawTexturedTri(target, verts, tri, tex);
        } else {
            // subdivide the triangle.
        }
        // debug draw lines
        target.drawLine(Fx.toInt(verts[tri[0]].pos.x), Fx.toInt(verts[tri[0]].pos.y), Fx.toInt(verts[tri[1]].pos.x), Fx.toInt(verts[tri[1]].pos.y), 15);
        target.drawLine(Fx.toInt(verts[tri[1]].pos.x), Fx.toInt(verts[tri[1]].pos.y), Fx.toInt(verts[tri[2]].pos.x), Fx.toInt(verts[tri[2]].pos.y), 15);
        target.drawLine(Fx.toInt(verts[tri[2]].pos.x), Fx.toInt(verts[tri[2]].pos.y), Fx.toInt(verts[tri[0]].pos.x), Fx.toInt(verts[tri[0]].pos.y), 15);
    }

    /**
     * Render a textured polygon.
     */
    export function drawTexturedPolygon(target: Image, verts: Vertex[], indices: number[], tex: Image) {
        if (indices.length % 3 !== 0) { throw "hmm."; }
        for (let i = 0; i < indices.length; i += 3) {
            _TriIndices[0] = indices[i + 0];
            _TriIndices[1] = indices[i + 1];
            _TriIndices[2] = indices[i + 2];
            drawTexturedTriangle(target, verts, _TriIndices, tex);
        }
    }
}