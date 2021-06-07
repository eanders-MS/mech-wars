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

    const IMAGE_SPRITE_INDICES = [0, 3, 2, 1];

    export class ImageSprite extends Sprite {
        img: Image;
        pts: Vec2[];
        verts: Vertex[];
        cmd: gpu.DrawTexturedQuad;

        /**
         * Quad layout:
         * (i:0, uv:0,0)   (i:1, uv:1,0)
         *   +---------------+
         *   |               |
         *   |               |
         *   |               |
         *   |               |
         *   +---------------+
         * (i:3, uv:0,1)    (i:2, uv:1,1)
         */

        constructor(scene: Scene, imgName: string) {
            super(scene);
            this.img = helpers.getImageByName(imgName);
            const left = Fx8(-(this.img.width >> 1));
            const right = Fx8(this.img.width >> 1);
            const top = Fx8(-(this.img.height >> 1));
            const bottom = Fx8(this.img.height >> 1);
            this.pts = [
                new Vec2(left,  top),
                new Vec2(right, top),
                new Vec2(right, bottom),
                new Vec2(left,  bottom),
            ];
            this.verts = [
                new Vertex(this.pts[0].clone(), new Vec2(Fx.zeroFx8, Fx.zeroFx8), true),
                new Vertex(this.pts[1].clone(), new Vec2(Fx.oneFx8, Fx.zeroFx8), true),
                new Vertex(this.pts[2].clone(), new Vec2(Fx.oneFx8, Fx.oneFx8), true),
                new Vertex(this.pts[3].clone(), new Vec2(Fx.zeroFx8, Fx.oneFx8), true),
            ];
            this.cmd = new gpu.DrawTexturedQuad(this.verts, IMAGE_SPRITE_INDICES, this.img);
        }

        /* override */ update() {
            // TODO: Set transform matrix on the draw cmd.
        }

        /* override */ draw() {
            // TODO: Transform should be done on the "gpu", using a transform matrix.
            this.xfrm.transformToRef(this.pts[0], this.verts[0].pos);
            this.xfrm.transformToRef(this.pts[1], this.verts[1].pos);
            this.xfrm.transformToRef(this.pts[2], this.verts[2].pos);
            this.xfrm.transformToRef(this.pts[3], this.verts[3].pos);
            this.cmd.enqueue();
        }
    }
}