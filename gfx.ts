// our mini gpu
namespace mech.gfx {
    const _TriIndices: number[] = [];

    function _sampleTexture(tex: Image, uv: Vec2): number {
        // TODO: support wrap modes
        const u = Math.floor(Fx.toFloat(uv.u) * (tex.width - 1));
        const v = Math.floor(Fx.toFloat(uv.v) * (tex.height - 1));
        return tex.getPixel(u, v);
    }

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
        const A = verts[tri[0]];
        const B = verts[tri[1]];
        const C = verts[tri[2]];

        // Left and right line segments.
        let L0: Vertex, L1: Vertex, R0: Vertex, R1: Vertex, T0: Vertex, T1: Vertex;
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
        const h = Fx.sub(L1.pos.y, L0.pos.y);
        const vh = new Vec2(h, h);
        const ih = Fx.toInt(h);
        const L = L0.clone(), R = R0.clone();
        const lPosDiff = Vec2.SubToRef(L1.pos, L0.pos, new Vec2());
        const rPosDiff = Vec2.SubToRef(R1.pos, R0.pos, new Vec2());
        const lPosStep = Vec2.DivToRef(lPosDiff, vh, new Vec2());
        const rPosStep = Vec2.DivToRef(rPosDiff, vh, new Vec2());
        const lUvDiff = Vec2.SubToRef(L1.uv, L0.uv, new Vec2());
        const rUvDiff = Vec2.SubToRef(R1.uv, R0.uv, new Vec2());
        const lUvStep = Vec2.DivToRef(lUvDiff, vh, new Vec2());
        const rUvStep = Vec2.DivToRef(rUvDiff, vh, new Vec2());

        for (let y = L0.pos.y; y < L1.pos.y; y = Fx.add(y, Fx.oneFx8)) {
            const iy = Fx.toInt(y);
            const uv = L.uv.clone();
            const xDiff = Fx.sub(R.pos.x, L.pos.x);
            if (xDiff) {
                const uvDiff = Vec2.SubToRef(R.uv, L.uv, new Vec2());
                const uvStep = Vec2.DivToRef(uvDiff, new Vec2(xDiff, xDiff), new Vec2());
                for (let x = L.pos.x; x < R.pos.x; x = Fx.add(x, Fx.oneFx8)) {
                    const ix = Fx.toInt(x);
                    const cc = _sampleTexture(tex, uv);
                    target.setPixel(ix, iy, cc);
                    Vec2.AddToRef(uv, uvStep, uv);
                }
            }
            Vec2.AddToRef(L.pos, lPosStep, L.pos);
            Vec2.AddToRef(R.pos, rPosStep, R.pos);
            Vec2.AddToRef(L.uv, lUvStep, L.uv);
            Vec2.AddToRef(R.uv, rUvStep, R.uv);

        }
        target.drawLine(Fx.toInt(A.pos.x), Fx.toInt(A.pos.y), Fx.toInt(B.pos.x), Fx.toInt(B.pos.y), 15);
        target.drawLine(Fx.toInt(B.pos.x), Fx.toInt(B.pos.y), Fx.toInt(C.pos.x), Fx.toInt(C.pos.y), 15);
        target.drawLine(Fx.toInt(C.pos.x), Fx.toInt(C.pos.y), Fx.toInt(A.pos.x), Fx.toInt(A.pos.y), 15);
    }

    /**
     * Render a textured triangle.
     */
    export function drawTexturedTriangle(target: Image, verts: Vertex[], tri: number[], tex: Image) {
        // Sort indices so that tri[0] is topmost, and leftmost secondarily.
        // Indices are CLOCKWISE.
        tri = _sortTriIndices(tri, verts);
        const A = verts[tri[0]];
        const B = verts[tri[1]];
        const C = verts[tri[2]];
        if (A.pos.y === B.pos.y) {
            // Top is flat.
            _drawTexturedTri(target, verts, tri, tex);
        } else if (B.pos.y === C.pos.y) {
            // Bottom is flat.
            _drawTexturedTri(target, verts, tri, tex);
        } else {
            ///
            // Subdivide the triangle, creating two triangles that share a horizontal edge.
            // Note: The line segment M-T is always horizontal.
            ///
            let M: Vertex;          // M is the middle vertex, vertically.
            let S: Vertex;          // S is the bottom-most vertex.
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
            const horz = new LineSegment(
                new Vec2(Fx.zeroFx8, M.pos.y),
                new Vec2(Screen.SCREEN_WIDTH_FX8, M.pos.y),
                true);
            // Find T: The intersection of a horizontal line thru M and line segment A-S.
            const cut = LineSegment.CalcIntersection(new LineSegment(A.pos, S.pos, true), horz);
            const T = new Vertex();
            T.pos.x = cut.pos.x;
            T.pos.y = M.pos.y;  // Lock T's vertical coordinate to M's. The intersection check can drift slightly but this will always be the correct value.
            ///
            // Find T's uv coords.
            ///
            // Find how far T is along A-S, as a percentage.
            const TA = Vec2.SubToRef(T.pos, A.pos, new Vec2());
            const SA = Vec2.SubToRef(S.pos, A.pos, new Vec2());
            const TAm = TA.mag();
            const SAm = SA.mag();
            const pct = Fx.div(TAm, SAm);
            // Calc T's uv as a percentage of the total distance.
            const SAuv = Vec2.SubToRef(S.uv, A.uv, new Vec2());
            const puv = Vec2.ScaleToRef(
                SAuv,
                pct,
                new Vec2());
            T.uv = Vec2.AddToRef(
                puv,
                A.uv,
                new Vec2());
            ///
            // Draw the triangles.
            ///
            _drawTexturedTri(target, [M, T, A], tri0, tex);
            _drawTexturedTri(target, [M, T, S], tri1, tex);
        }
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