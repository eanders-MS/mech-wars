// our mini gpu
namespace mech.gfx {
    const _TriIndices: number[] = [];

    function _sampleTextureF(tex: Image, uv: Vec2F): number {
        // TODO: support wrap modes
        const u = Math.floor(uv.u * (tex.width - 1));
        const v = Math.floor(uv.v * (tex.height - 1));
        return tex.getPixel(u, v);
    }

    function _sortTriIndicesF(tri: number[], verts: VertexF[]): number[] {
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

    function _drawTexturedTriF(target: Image, verts: VertexF[], tri: number[], tex: Image) {
        // Assumption: vertex at index zero the topmost, leftmost.
        const A = verts[tri[0]];
        const B = verts[tri[1]];
        const C = verts[tri[2]];

        // Left and right line segments.
        let L0: VertexF, L1: VertexF, R0: VertexF, R1: VertexF, T0: VertexF, T1: VertexF;
        if (A.pos.y === B.pos.y) {
            // top is flat
            L0 = A; L1 = C;
            R0 = B; R1 = C;
            T0 = A; T1 = B;
        } else if (B.pos.y === C.pos.y) {
            // bottom is flat
            L0 = A; L1 = C;
            R0 = A; R1 = B;
            T0 = C; T1 = B;
        } else {
            throw "hey.";
        }
        const h = L1.pos.y - L0.pos.y;
        const vh = new Vec2F(h, h);
        const ih = Math.floor(h);
        const L = L0.clone(), R = R0.clone();
        const lPosDiff = Vec2F.SubToRef(L1.pos, L0.pos, new Vec2F());
        const rPosDiff = Vec2F.SubToRef(R1.pos, R0.pos, new Vec2F());
        const lPosStep = Vec2F.DivToRef(lPosDiff, vh, new Vec2F());
        const rPosStep = Vec2F.DivToRef(rPosDiff, vh, new Vec2F());
        const lUvDiff = Vec2F.SubToRef(L1.uv, L0.uv, new Vec2F());
        const rUvDiff = Vec2F.SubToRef(R1.uv, R0.uv, new Vec2F());
        const lUvStep = Vec2F.DivToRef(lUvDiff, vh, new Vec2F());
        const rUvStep = Vec2F.DivToRef(rUvDiff, vh, new Vec2F());

        for (let y = L0.pos.y; y < L1.pos.y; y = y + 1) {
            const iy = Math.floor(y);
            const uv = L.uv.clone();
            const xDiffHorz = R.pos.x - L.pos.x;
            const uvDiffHorz = Vec2F.SubToRef(R.uv, L.uv, new Vec2F());
            const uvStepHorz = Vec2F.DivToRef(uvDiffHorz, new Vec2F(xDiffHorz, xDiffHorz), new Vec2F());
            for (let x = L.pos.x; x < R.pos.x; x = x + 1) {
                const ix = Math.floor(x);
                const cc = _sampleTextureF(tex, uv);
                target.setPixel(ix, iy, cc);
                Vec2F.AddToRef(uv, uvStepHorz, uv);
            }

            //const lx = Fx.toInt(L.pos.x);
            //const ly = Fx.toInt(L.pos.y);
            //const rx = Fx.toInt(R.pos.x);
            //const ry = Fx.toInt(R.pos.y);
            //target.setPixel(lx, ly, 15);
            //target.setPixel(rx, ry, 15);

            Vec2F.AddToRef(L.pos, lPosStep, L.pos);
            Vec2F.AddToRef(R.pos, rPosStep, R.pos);
            Vec2F.AddToRef(L.uv, lUvStep, L.uv);
            Vec2F.AddToRef(R.uv, rUvStep, R.uv);

        }
        target.drawLine(Math.floor(A.pos.x), Math.floor(A.pos.y), Math.floor(B.pos.x), Math.floor(B.pos.y), 15);
        target.drawLine(Math.floor(B.pos.x), Math.floor(B.pos.y), Math.floor(C.pos.x), Math.floor(C.pos.y), 15);
        target.drawLine(Math.floor(C.pos.x), Math.floor(C.pos.y), Math.floor(A.pos.x), Math.floor(A.pos.y), 15);
    }

    /**
     * Render a textured triangle.
     */
    export function drawTexturedTriangleF(target: Image, verts: VertexF[], tri: number[], tex: Image) {
        // Sort indices so that tri[0] is topmost, and leftmost secondarily.
        // Indices are CLOCKWISE.
        tri = _sortTriIndicesF(tri, verts);
        const A = verts[tri[0]];
        const B = verts[tri[1]];
        const C = verts[tri[2]];
        if (A.pos.y === B.pos.y) {
            // Top is flat.
            _drawTexturedTriF(target, verts, tri, tex);
        } else if (B.pos.y === C.pos.y) {
            // Bottom is flat.
            _drawTexturedTriF(target, verts, tri, tex);
        } else {
            ///
            // Subdivide the triangle, creating two triangles that share a horizontal edge.
            // Note: The line segment M-T is always horizontal.
            ///
            let M: VertexF;          // M is the middle vertex, vertically.
            let S: VertexF;          // S is the bottom-most vertex.
            let tri0: number[];     // indices to define triangle 1.
            let tri1: number[];     // indices to define triangle 2.
            if (B.pos.y < C.pos.y) {
                ///
                // M is right of A.
                ///
                //  A
                //  |\
                //  | \
                //  |  \
                // T|___\ B(M)
                //  |   /
                //  |  /
                //  | /
                //  |/
                //  C(S)
                ///
                M = B;
                S = C;
                // Order the triangle vertices
                tri0 = [2, 0, 1];   // M,T,A -> A,M,T
                tri1 = [1, 0, 2];   // M,T,S -> T,M,S
            } else {
                ///
                // M is left of A.
                ///
                //         A
                //        /|
                //       / |
                //      /  |
                // C(M)/___|T
                //     \   |
                //      \  |
                //       \ |
                //        \|
                //         B(S)
                ///
                M = C;
                S = B;
                // Order the triangle vertices
                tri0 = [2, 1, 0];   // M,T,A -> A,T,M
                tri1 = [0, 1, 2];   // M,T,S -> M,T,S
            }
            // Define a horizontal line thru M. Length isn't important.
            const horz = new LineSegmentF(
                new Vec2F(0, M.pos.y),
                new Vec2F(Screen.SCREEN_WIDTH, M.pos.y),
                true);
            // Find T: The intersection of a horizontal line thru M and line segment A-S.
            const cut = LineSegmentF.CalcIntersection(new LineSegmentF(A.pos, S.pos, true), horz);
            const T = new VertexF();
            T.pos.x = cut.pos.x;
            T.pos.y = M.pos.y;  // Lock T's vertical coordinate to M's. The intersection check can drift slightly but this will always be the correct value.
            ///
            // Find T's uv coords.
            ///
            // Find how far T is along A-S, as a percentage.
            const uvPct =
                Vec2F.DivToRef(
                    Vec2F.SubToRef(T.pos, A.pos, new Vec2F()),
                    Vec2F.SubToRef(S.pos, A.pos, new Vec2F()),
                    new Vec2F());
            // Calc T's uv as a percentage of the total distance.
            T.uv =
                Vec2F.MulToRef(
                    Vec2F.SubToRef(S.uv, A.uv, new Vec2F()),
                    uvPct,
                    new Vec2F());

            ///
            // Draw the triangles.
            ///
            _drawTexturedTriF(target, [M, T, A], tri0, tex);
            _drawTexturedTriF(target, [M, T, S], tri1, tex);
        }
    }

    /**
     * Render a textured polygon.
     */
    export function drawTexturedPolygonF(target: Image, verts: VertexF[], indices: number[], tex: Image) {
        if (indices.length % 3 !== 0) { throw "hmm."; }
        for (let i = 0; i < indices.length; i += 3) {
            _TriIndices[0] = indices[i + 0];
            _TriIndices[1] = indices[i + 1];
            _TriIndices[2] = indices[i + 2];
            drawTexturedTriangleF(target, verts, _TriIndices, tex);
        }
    }
}