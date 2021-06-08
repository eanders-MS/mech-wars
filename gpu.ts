namespace mech.gpu {

    let frameId = 0;
    let commands: DrawCommand[] = [];

    export class VertexShader {
        frameId: number;
        public verts: Vertex[];
        constructor(protected src: Vertex[]) {
            this.frameId = -1;
            this.verts = src.map(v => v.clone());
        }
        public transform(frameId: number, xfrm: Affine): void { }
    }

    export class BasicVertexShader extends VertexShader {
        public transform(frameId: number, xfrm: Affine): void {
            if (this.frameId === frameId) { return; }
            this.frameId = frameId;
            this.src.forEach((v, i) => {
                xfrm.transformToRef(v.pos, this.verts[i].pos);
            });
        }
    }

    export interface DrawCommand {
        bounds: Bounds;
        xfrm: Affine;
        vs: VertexShader;
        enqueue(): void;
        transform(frameId: number): void;
        shade(p: Vec2): number;
    }

    export class DrawTexturedTri implements DrawCommand {
        bounds: Bounds;
        public xfrm: Affine;
        // Cached values
        private area: Fx8;
        private vArea: Vec2;
        // Temp vars
        private min: Vec2;
        private max: Vec2;
        private uv0: Vec2;
        private uv1: Vec2;
        private uv2: Vec2;
        private uv: Vec2;

        constructor(
            public vs: VertexShader,
            public tri: number[],
            public tex: Image
        ) {
            this.bounds = Bounds.Zero();
            this.area = Vec2.Cross(
                this.vs.verts[this.tri[0]].pos,
                this.vs.verts[this.tri[1]].pos,
                this.vs.verts[this.tri[2]].pos);
            this.vArea = new Vec2(this.area, this.area);
            this.min = new Vec2();
            this.max = new Vec2();
            this.uv0 = new Vec2();
            this.uv1 = new Vec2();
            this.uv2 = new Vec2();
            this.uv = new Vec2();
        }
        public enqueue() {
            if (this.area == Fx.zeroFx8) return;
            commands.push(this);
        }
        public transform(frameId: number): void {
            this.vs.transform(frameId, this.xfrm);
            const p0 = this.vs.verts[this.tri[0]].pos;
            const p1 = this.vs.verts[this.tri[1]].pos;
            const p2 = this.vs.verts[this.tri[2]].pos;
            const pts = [p0, p1, p2];
            Vec2.MinOfToRef(pts, this.min);
            Vec2.MaxOfToRef(pts, this.max);
            this.bounds.from({ min: this.min, max: this.max });
        }

        public shade(/* const */p: Vec2): number {
            const v0 = this.vs.verts[this.tri[0]];
            const v1 = this.vs.verts[this.tri[1]];
            const v2 = this.vs.verts[this.tri[2]];

            // Point in triangle?
            const w0 = Vec2.Cross(v1.pos, v2.pos, p);
            if (w0 < Fx.zeroFx8) return 0;
            const w1 = Vec2.Cross(v2.pos, v0.pos, p);
            if (w1 < Fx.zeroFx8) return 0;
            const w2 = Vec2.Cross(v0.pos, v1.pos, p);
            if (w2 < Fx.zeroFx8) return 0;

            // Get uv coordinates at point.
            Vec2.ScaleToRef(v0.uv, w0, this.uv0);
            Vec2.ScaleToRef(v1.uv, w1, this.uv1);
            Vec2.ScaleToRef(v2.uv, w2, this.uv2);
            Vec2.AddToRef(Vec2.AddToRef(this.uv0, this.uv1, this.uv), this.uv2, this.uv);
            Vec2.DivToRef(this.uv, this.vArea, this.uv);

            // Sample the texture.
            const u = Math.floor(Fx.toFloat(this.uv.u) * (this.tex.width + 1));
            const v = Math.floor(Fx.toFloat(this.uv.v) * (this.tex.height + 1));
            return this.tex.getPixel(u, v);
        }
    }

    export function exec() {
        ++frameId;
        commands.forEach(cmd => {
            cmd.transform(frameId);
        });
        commands.forEach(cmd => {
            // Get bounds, and clip to screen.
            const left = fx.clamp(cmd.bounds.left, Screen.SCREEN_LEFT_FX8, Screen.SCREEN_RIGHT_FX8);
            const top = fx.clamp(cmd.bounds.top, Screen.SCREEN_TOP_FX8, Screen.SCREEN_BOTTOM_FX8);
            const right = fx.clamp(Fx.add(cmd.bounds.left, cmd.bounds.width), Screen.SCREEN_LEFT_FX8, Screen.SCREEN_RIGHT_FX8);
            const bottom = fx.clamp(Fx.add(cmd.bounds.top, cmd.bounds.height), Screen.SCREEN_TOP_FX8, Screen.SCREEN_BOTTOM_FX8);
            // Loop over bounded pixels, rendering them.
            const p = new Vec2(left, top);
            for (; p.y <= bottom; p.y = Fx.add(p.y, Fx.oneFx8)) {
                p.x = cmd.bounds.left;
                for (; p.x <= right; p.x = Fx.add(p.x, Fx.oneFx8)) {
                    const color = cmd.shade(p);
                    if (color) {
                        screen.setPixel(
                            Math.floor(Fx.toFloat(p.x)) + Screen.SCREEN_HALF_WIDTH,
                            Math.floor(Fx.toFloat(p.y)) + Screen.SCREEN_HALF_HEIGHT,
                            color);
                    }
                }
            }
        });
        commands = [];
    }
}