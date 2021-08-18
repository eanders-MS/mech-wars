namespace mech {
    export class TitleScene extends affine.Scene {
        mechSprite: affine.ImageSprite;
        warsSprite: affine.ImageSprite;
        mechAnimIn: affine.Animation<affine.Vec2>;
        warsAnimIn: affine.Animation<affine.Vec2>;
        mechAnimOut: affine.Animation<Fx8>;
        warsAnimOut: affine.Animation<Fx8>;

        constructor() {
            super();
            this.color = 11;

            this.mechSprite = new affine.ImageSprite(this, "imgTitleMech");
            this.mechSprite.xfrm.localPos.x = Fx8(affine.Screen.SCREEN_LEFT - (this.mechSprite.img.width >> 1));
            this.mechSprite.xfrm.localPos.y = Fx8(affine.Screen.SCREEN_TOP + (this.mechSprite.img.height >> 1) + 5);

            this.warsSprite = new affine.ImageSprite(this, "imgTitleWars");
            this.warsSprite.xfrm.localPos.x = Fx8(affine.Screen.SCREEN_RIGHT + (this.warsSprite.img.width >> 1));
            this.warsSprite.xfrm.localPos.y = Fx8(Fx.toFloat(this.mechSprite.xfrm.localPos.y) + this.mechSprite.img.height + 2);

            this.mechAnimIn = new affine.Animation<affine.Vec2>((value: affine.Vec2) => this.mechAnimPosCallback(value));
            this.mechAnimIn.addFrame(new affine.EaseFrame_Vec2(
                new affine.EaseFrameOpts<affine.Vec2>(
                /*duration:*/ 0.25,
                /*startValue:*/ this.mechSprite.xfrm.localPos,
                /*endValue:*/ new affine.Vec2(Fx8(-14), this.mechSprite.xfrm.localPos.y),
                /*relative:*/ undefined,
                /*curve:*/ easing.easeIn(affine.easing.curves.sq5))
            ));
            this.mechAnimOut = new affine.Animation((value: Fx8) => this.mechAnimScaleCallback(value));
            this.mechAnimOut.addFrame(new affine.EaseFrame_Fx8(
                new affine.EaseFrameOpts<Fx8>(
                /*duration:*/ 0.75,
                /*startValue:*/ this.mechSprite.xfrm.localScl.x,
                /*endValue:*/ Fx8(5),
                /*relative:*/ undefined,
                /*curve:*/ easing.linear())
            ));

            this.warsAnimIn = new affine.Animation((value: affine.Vec2) => this.warsAnimPosCallback(value));
            this.warsAnimIn.addFrame(new affine.EaseFrame_Vec2(
                new affine.EaseFrameOpts<affine.Vec2>(
                /*duration:*/ 0.35,
                /*startValue:*/ this.warsSprite.xfrm.localPos,
                /*endValue:*/ new affine.Vec2(Fx8(11), this.warsSprite.xfrm.localPos.y),
                /*relative:*/ undefined,
                /*curve:*/ easing.easeIn(affine.easing.curves.sq5))
            ));

            this.warsAnimOut = new affine.Animation((value: Fx8) => this.warsAnimScaleCallback(value));
            this.warsAnimOut.addFrame(new affine.EaseFrame_Fx8(
                new affine.EaseFrameOpts<Fx8>(
                /*duration:*/ 0.75,
                /*startValue:*/ this.warsSprite.xfrm.localScl.x,
                /*endValue:*/ Fx8(8),
                /*relative:*/ undefined,
                /*curve:*/ easing.linear())
            ));

            this.mechAnimIn.start();
            this.mechSprite.xfrm.localRot = 0;
            setTimeout(() => this.warsAnimIn.start(), 250);
            setTimeout(() => this.mechAnimOut.start(), 750);
            setTimeout(() => this.warsAnimOut.start(), 1250);
        }

        private mechAnimPosCallback(value: affine.Vec2) {
            this.mechSprite.xfrm.localPos.copyFrom(value);
        }

        private mechAnimScaleCallback(value: Fx8) {
            this.mechSprite.xfrm.localScl.set(value, value);
        }

        private warsAnimPosCallback(value: affine.Vec2) {
            this.warsSprite.xfrm.localPos.copyFrom(value);
        }

        private warsAnimScaleCallback(value: Fx8) {
            this.warsSprite.xfrm.localScl.set(value, value);
        }

        /* override */ update(dt: number) {
            this.mechAnimIn.update();
            this.warsAnimIn.update();
            this.mechAnimOut.update();
            this.warsAnimOut.update();
            //this.mechSprite.xfrm.localRot += 1;
            //this.warsSprite.xfrm.localRot -= 1.3;
        }

        /* override */ draw() {
            this.mechSprite.draw();
            this.warsSprite.draw();
        }
    }
}