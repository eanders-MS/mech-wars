namespace mech {
    export class Vertex {
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

        public clone(): Vertex {
            return new Vertex(this.pos, this.uv);
        }
    }
}