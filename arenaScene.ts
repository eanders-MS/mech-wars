namespace mech {
    export class ArenaScene extends Scene {
        mech0: ImageSprite;

        constructor() {
            super();
            this.mech0 = new ImageSprite(this, "testMech0");
            //this.mech0.xfrm.localScl = Fx8(3);
        }

        /* override */ update(dt: number) {
            this.mech0.xfrm.localRot += 2;
        }

        /* override */ draw() {
            this.mech0.draw();
        }
    }
}