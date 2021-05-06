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

    export class ImageSprite extends Sprite {
        static lineSz = 2 * screen.width;
        static line: Image = image.create(ImageSprite.lineSz, 1);
        img: Image;
        width: Fx8;
        height: Fx8;
        left: Fx8;
        right: Fx8;
        top: Fx8;
        bottom: Fx8;

        constructor(scene: Scene, imgName: string) {
            super(scene);
            this.img = helpers.getImageByName(imgName);
            const max = Math.max(this.img.width, this.img.height);
            this.width = Fx8(this.img.width);
            this.height = Fx8(this.img.height);
            this.left = Fx8(-(this.img.width >> 1));
            this.right = Fx8(this.img.width >> 1);
            this.top = Fx8(-(this.img.height >> 1));
            this.bottom = Fx8(this.img.height >> 1);
        }

        /* override */ draw() {
            const wScl = this.xfrm.worldScl;
            // Scaled dimensions
            const sLeft = Fx.toInt(fx.floor(Fx.mul(this.left, wScl)));
            const sRight = Fx.toInt(fx.floor(Fx.mul(this.right, wScl)));
            const sTop = Fx.toInt(fx.floor(Fx.mul(this.top, wScl)));
            const sBottom = Fx.toInt(fx.floor(Fx.mul(this.bottom, wScl)));
            const sWidth = Fx.toInt(fx.floor(Fx.mul(this.width, wScl)));
            const sHeight = Fx.toInt(fx.floor(Fx.mul(this.height, wScl)));
            // Scale ratio
            const sRatio = Fx.toFloat(this.width) / sWidth;

            const line = ImageSprite.line;
            const lineSz = Math.min(ImageSprite.lineSz, sWidth);
            for (let y = 0; y < sHeight; y += 1) {
                // Get world-transformed line endings.
                const a = Vec2.N(sLeft, sTop + y);
                const b = Vec2.N(sLeft + sWidth, sTop + y);
                Vec2.RotateToRef(a, this.xfrm.worldRot, a);
                Vec2.RotateToRef(b, this.xfrm.worldRot, b);
                Vec2.TranslateToRef(a, this.xfrm.worldPos, a);
                Vec2.TranslateToRef(b, this.xfrm.worldPos, b);
                Vec2.TranslateToRef(a, Screen.SCREEN_HALF_SIZE, a);
                Vec2.TranslateToRef(b, Screen.SCREEN_HALF_SIZE, b);
                if (a.x < Fx.zeroFx8 && b.y < Fx.zeroFx8) { continue; }
                if (a.y < Fx.zeroFx8 && b.y < Fx.zeroFx8) { continue; }
                if (a.x > Fx8(screen.width) && b.x > Fx8(screen.width)) { continue; }
                if (a.y > Fx8(screen.height) && b.y > Fx8(screen.height)) { continue; }
                // Clear enough of the line buffer for this row.
                line.drawLine(0, 0, lineSz, 0, 0);
                // Populate line pixels.
                const sampY = Math.round(y * sRatio);
                for (let x = 0; x < lineSz; x += 1) {
                    const sampX = Math.round(x * sRatio);
                    const color = this.img.getPixel(sampX, sampY);
                    line.setPixel(x, 0, color);
                }
                // Draw line.
                gfx.mapLine(this.scene.image, a, b, line, lineSz);
            }
        }
    }
}