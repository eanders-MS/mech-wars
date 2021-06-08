namespace mech {
    let idSeq = 0;

    export class Sprite {
        private id_: number;
        private xfrm_: Affine;

        //% blockCombine block="id" callInDebugger
        public get id() { return this.id_; }
        //% blockCombine block="xfrm" callInDebugger
        public get xfrm() { return this.xfrm_; }

        constructor(public scene: Scene) {
            this.id_ = idSeq++;
            this.xfrm_ = new Affine();
            this.xfrm_.parent = scene.xfrm;
        }

        /* virtual */ update() {
        }

        /* virtual */ draw() {
        }
    }

    const IMAGE_SPRITE_TRI0_INDICES = [0, 3, 2];
    const IMAGE_SPRITE_TRI1_INDICES = [2, 1, 0];

    export class ImageSprite extends Sprite {
        img: Image;
        verts: Vertex[];
        tri0: gpu.DrawTexturedTri;
        tri1: gpu.DrawTexturedTri;

        /**
         * Quad layout:
         * (i:0,uv:0,0) (i:1,uv:1,0)
         *   +------------+
         *   |\__         |
         *   |   \__      |
         *   |      \__   |
         *   |         \__|
         *   +------------+
         * (i:3,uv:0,1) (i:2,uv:1,1)
         */

        constructor(scene: Scene, imgName: string) {
            super(scene);
            this.img = helpers.getImageByName(imgName);
            const left = Fx8(-(this.img.width >> 1));
            const right = Fx8(this.img.width >> 1);
            const top = Fx8(-(this.img.height >> 1));
            const bottom = Fx8(this.img.height >> 1);
            const pts = [
                new Vec2(left,  top),
                new Vec2(right, top),
                new Vec2(right, bottom),
                new Vec2(left,  bottom),
            ];
            const uvs = [
                new Vec2(Fx.zeroFx8, Fx.zeroFx8),
                new Vec2(Fx.oneFx8, Fx.zeroFx8),
                new Vec2(Fx.oneFx8, Fx.oneFx8),
                new Vec2(Fx.zeroFx8, Fx.oneFx8),
            ];
            this.verts = [
                new Vertex(pts[0], uvs[0], true),
                new Vertex(pts[1], uvs[1], true),
                new Vertex(pts[2], uvs[2], true),
                new Vertex(pts[3], uvs[3], true),
            ];
            const vs = new gpu.BasicVertexShader(this.verts);
            this.tri0 = new gpu.DrawTexturedTri(vs, IMAGE_SPRITE_TRI0_INDICES, this.img);
            this.tri1 = new gpu.DrawTexturedTri(vs, IMAGE_SPRITE_TRI1_INDICES, this.img);
        }

        /* override */ update() {
        }

        /* override */ draw() {
            this.tri0.xfrm = this.xfrm;
            this.tri1.xfrm = this.xfrm;
            this.tri0.enqueue();
            this.tri1.enqueue();
        }
    }
}