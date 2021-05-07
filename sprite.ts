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

    const indices = [0, 1, 2, 0, 2, 3];

    export class ImageSprite extends Sprite {
        static lineSz = 2 * screen.width;
        static line: Image = image.create(ImageSprite.lineSz, 1);
        img: Image;
        pts: Vec2[];
        verts: Vertex[];

        constructor(scene: Scene, imgName: string) {
            super(scene);
            this.img = helpers.getImageByName(imgName);
            const max = Math.max(this.img.width, this.img.height);
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
                new Vertex(this.xfrm.transformToRef(this.pts[0], new Vec2()), new Vec2(Fx.zeroFx8, Fx.zeroFx8)),
                new Vertex(this.xfrm.transformToRef(this.pts[1], new Vec2()), new Vec2(Fx.oneFx8, Fx.zeroFx8)),
                new Vertex(this.xfrm.transformToRef(this.pts[2], new Vec2()), new Vec2(Fx.oneFx8, Fx.oneFx8)),
                new Vertex(this.xfrm.transformToRef(this.pts[3], new Vec2()), new Vec2(Fx.zeroFx8, Fx.oneFx8)),
            ];
        }

        /* override */ draw() {
            // TODO: Only update vertices if transform changed.
            this.verts[0].pos = this.xfrm.transformToRef(this.pts[0], new Vec2()).add(Scene.SCENE_OFFSET).floor();
            this.verts[1].pos = this.xfrm.transformToRef(this.pts[1], new Vec2()).add(Scene.SCENE_OFFSET).floor();
            this.verts[2].pos = this.xfrm.transformToRef(this.pts[2], new Vec2()).add(Scene.SCENE_OFFSET).floor();
            this.verts[3].pos = this.xfrm.transformToRef(this.pts[3], new Vec2()).add(Scene.SCENE_OFFSET).floor();
            gfx.drawTexturedPolygon(Scene.image, this.verts, indices, this.img);
        }
    }
}