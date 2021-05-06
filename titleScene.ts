namespace mech {
    export class TitleScene extends Scene {
        mechSprite: ImageSprite;
        warsSprite: ImageSprite;
        mechAnimIn: Animation;
        warsAnimIn: Animation;

        constructor() {
            super();
            this.color = 11;

            this.mechSprite = new ImageSprite(this, "imgTitleMech");
            this.mechSprite.xfrm.localPos.x = Fx8(Screen.SCREEN_LEFT - (this.mechSprite.img.width >> 1));
            this.mechSprite.xfrm.localPos.y = Fx8(Screen.SCREEN_TOP + (this.mechSprite.img.height >> 1) + 5);

            this.warsSprite = new ImageSprite(this, "imgTitleWars");
            this.warsSprite.xfrm.localPos.x = Fx8(Screen.SCREEN_RIGHT + (this.warsSprite.img.width >> 1));
            this.warsSprite.xfrm.localPos.y = Fx8(Fx.toFloat(this.mechSprite.xfrm.localPos.y) + this.mechSprite.img.height + 2);

            this.mechAnimIn = new Animation((value: Vec2) => this.mechAnimCallback(value));
            this.mechAnimIn.addFrame(new EaseFrame({
                duration: 0.25,
                startValue: this.mechSprite.xfrm.localPos,
                endValue: new Vec2(Fx8(-14), this.mechSprite.xfrm.localPos.y),
                curve: easing.easeIn(easing.curves.sq5)
            }));

            this.warsAnimIn = new Animation((value: Vec2) => this.warsAnimCallback(value));
            this.warsAnimIn.addFrame(new EaseFrame({
                duration: 0.35,
                startValue: this.warsSprite.xfrm.localPos,
                endValue: new Vec2(Fx8(11), this.warsSprite.xfrm.localPos.y),
                curve: easing.easeIn(easing.curves.sq5)
            }));

            this.mechAnimIn.start();
            setTimeout(() => this.warsAnimIn.start(), 250);
        }

        private mechAnimCallback(value: Vec2) {
            this.mechSprite.xfrm.localPos.copyFrom(value)
        }

        private warsAnimCallback(value: Vec2) {
            this.warsSprite.xfrm.localPos.copyFrom(value);
        }

        /* override */ update(dt: number) {
            this.mechAnimIn.update();
            this.warsAnimIn.update();
        }

        /* override */ draw() {
            this.mechSprite.draw();
            this.warsSprite.draw();
        }
    }
}