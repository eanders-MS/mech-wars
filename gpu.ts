namespace mech.gpu {

    let currTex: Image;
    let commands: DrawCommand[] = [];
    const qtree = new QuadTree(Screen.SCREEN_BOUNDS, 3, 16);

    export class Vert_PosUv {
        private pos_: Vec2;
        private uv_: Vec2;

        public get pos() { return this.pos_; }
        public set pos(v) { this.pos_.copyFrom(v); }
        public get uv() { return this.uv_; }
        public set uv(v) { this.uv_.copyFrom(v); }

        constructor(pos: Vec2 = null, uv: Vec2 = null, ref = false) {
            this.pos_ = pos ? ref ? pos : pos.clone() : new Vec2();
            this.uv_ = uv ? ref ? uv : uv.clone() : new Vec2();
        }
    }

    export class Frag_Uv {
        private uv_: Vec2;
        public get uv() { return this.uv_; }
        public set uv(v) { this.uv_.copyFrom(v); }
        constructor(uv: Vec2 = null, ref = false) {
            this.uv_ = uv ? ref ? uv : uv.clone() : new Vec2();
        }
    }

    export function texturedVertShader(vert: Vert_PosUv, fragOut: Frag_Uv, posOut: Vec2): void {
        fragOut.uv.copyFrom(vert.uv);
        posOut.copyFrom(vert.pos);
    }

    export function texturedFragShader(frag: Frag_Uv): number {
        const u = Math.floor(Fx.toFloat(frag.uv.u) * (currTex.width - 1));
        const v = Math.floor(Fx.toFloat(frag.uv.v) * (currTex.height - 1));
        return currTex.getPixel(u, v);
    }

    export interface DrawCommand {
        bounds: Bounds;
        enqueue(): void;
        color(p: Vec2): number;
    }

    export class DrawTexturedQuad implements DrawCommand {
        public bounds: Bounds;
        private tri0: DrawTexturedTri;
        private tri1: DrawTexturedTri;
        constructor(
            public verts: Vertex[],
            public quad: number[],  // Counter-clockwise verts that make up the quad.
            public tex: Image
        ) {
            this.tri0 = new DrawTexturedTri(this.verts, [this.quad[0], this.quad[1], this.quad[2]], this.tex);
            this.tri1 = new DrawTexturedTri(this.verts, [this.quad[2], this.quad[3], this.quad[0]], this.tex);
        }
        public enqueue() {
            this.tri0.enqueue();
            this.tri1.enqueue();
        }
        public color(p: Vec2): number {
            // noop
            return 0;
        }
    }

    export class DrawTexturedTri implements DrawCommand {
        public bounds: Bounds;
        private min: Vec2;
        private max: Vec2;
        private pts: Vec2[];
        private area: Fx8;
        constructor(
            public verts: Vertex[],
            public tri: number[],
            public tex: Image
        ) {
            this.bounds = Bounds.Zero();
            this.min = new Vec2();
            this.max = new Vec2();
            this.pts = this.verts.map(v => v.pos);
            this.area = Vec2.Cross(this.pts[tri[0]], this.pts[tri[1]], this.pts[tri[2]]);
        }
        public enqueue() {
            if (this.area == Fx.zeroFx8) return;
            Vec2.MinOfToRef(this.pts, this.min);
            Vec2.MaxOfToRef(this.pts, this.max);
            this.bounds.from({ min: this.min, max: this.max });
            qtree.insert(this.bounds, this);
            commands.push(this);
        }
        public color(/* const */p: Vec2): number {
            const v0 = this.verts[this.tri[0]];
            const v1 = this.verts[this.tri[1]];
            const v2 = this.verts[this.tri[2]];
            const w0 = Vec2.Cross(v1.pos, v2.pos, p);
            if (w0 < Fx.zeroFx8) return 0;
            const w1 = Vec2.Cross(v2.pos, v0.pos, p);
            if (w1 < Fx.zeroFx8) return 0;
            const w2 = Vec2.Cross(v0.pos, v1.pos, p);
            if (w2 < Fx.zeroFx8) return 0;

            const uv0 = Vec2.ScaleToRef(v0.uv, w0, new Vec2());
            const uv1 = Vec2.ScaleToRef(v1.uv, w1, new Vec2());
            const uv2 = Vec2.ScaleToRef(v2.uv, w2, new Vec2());
            const uva = Vec2.AddToRef(Vec2.AddToRef(uv0, uv1, new Vec2()), uv2, new Vec2());
            const uv = Vec2.DivToRef(uva, new Vec2(this.area, this.area), new Vec2());

            const u = Math.floor(Fx.toFloat(uv.u) * (this.tex.width - 1));
            const v = Math.floor(Fx.toFloat(uv.v) * (this.tex.height - 1));
            return this.tex.getPixel(u, v);
        }
    }

    const X_STEP = 32;
    const Y_STEP = 24;
    const X_STEP_FX8 = Fx8(X_STEP);
    const Y_STEP_FX8 = Fx8(Y_STEP);

    export function exec() {
        // Loop over every pixel group, rendering overlapping sections of objects.
        const bounds = Bounds.Zero();
        bounds.width = X_STEP_FX8;
        bounds.height = Y_STEP_FX8;
        const p = new Vec2();
        for (let py = Screen.SCREEN_TOP_FX8; py < Screen.SCREEN_BOTTOM_FX8; py = Fx.add(py, Y_STEP_FX8)) {
            bounds.top = py;
            for (let px = Screen.SCREEN_LEFT_FX8; px < Screen.SCREEN_RIGHT_FX8; px = Fx.add(px, X_STEP_FX8)) {
                bounds.left = px;
                const cmds = qtree.query(bounds);
                if (!cmds.length) continue;
                for (let y = Fx.zeroFx8; y < Y_STEP_FX8; y = Fx.add(y, Fx.oneFx8)) {
                    p.y = Fx.add(py, y);
                    for (let x = Fx.zeroFx8; x < X_STEP_FX8; x = Fx.add(x, Fx.oneFx8)) {
                        p.x = Fx.add(px, x);
                        for (let i = 0; i < cmds.length; ++i) {
                            const cmd = cmds[i];
                            if (!cmd.bounds.contains(p)) continue;
                            const color = cmd.color(p);
                            if (color) {
                                Scene.image.setPixel(
                                    Fx.toInt(p.x) + Screen.SCREEN_HALF_WIDTH,
                                    Fx.toInt(p.y) + Screen.SCREEN_HALF_HEIGHT,
                                    color);
                                break;
                            }
                        }
                    }
                }
            }
        }

        commands = [];
        qtree.clear();
    }
}