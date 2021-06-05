namespace mech {
    export class Vertex {
        private pos_: Vec2;
        private uv_: Vec2;

        public get pos() { return this.pos_; }
        public set pos(v) { this.pos_.copyFrom(v); }
        public get uv() { return this.uv_; }
        public set uv(v) { this.uv_.copyFrom(v); }

        constructor(pos: Vec2 = null, uv: Vec2 = null) {
            this.pos_ = pos ? pos.clone() : new Vec2();
            this.uv_ = uv ? uv.clone() : new Vec2();
        }

        public clone(): Vertex {
            return new Vertex(this.pos, this.uv);
        }
    }

    export class VertexF {
        private pos_: Vec2F;
        private uv_: Vec2F;

        public get pos() { return this.pos_; }
        public set pos(v) { this.pos_.copyFrom(v); }
        public get uv() { return this.uv_; }
        public set uv(v) { this.uv_.copyFrom(v); }

        constructor(pos: Vec2F = null, uv: Vec2F = null) {
            this.pos_ = pos ? pos.clone() : new Vec2F();
            this.uv_ = uv ? uv.clone() : new Vec2F();
        }

        public clone(): VertexF {
            return new VertexF(this.pos, this.uv);
        }
    }
}