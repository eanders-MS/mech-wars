namespace mech {
    export class ArenaScene extends Scene {
        mechs: ImageSprite[];
        root: Affine;

        constructor() {
            super();
            this.root = new Affine();
            this.mechs = [];

            for (let i = 0; i < 20; ++i) {
                const mech = new ImageSprite(this, "testMech0");
                mech.xfrm.parent = this.root;
                mech.xfrm.localPos = new Vec2(
                    fx.randomRange(Fx8(-70), Fx8(70)),
                    fx.randomRange(Fx8(-50), Fx8(50)),
                );
                mech.data["rot_rate"] = Math.randomRange(-5, 5);
                mech.xfrm.localScl = Fx8(1 * Math.random() + 1);
                this.mechs.push(mech);
            }
            //this.mech0.xfrm.localScl = Fx8(3);
        }

        /* override */ startup() {
            controller.setRepeatDefault(10, 10);
            controller.A.onEvent(ControllerButtonEvent.Pressed, () => this.handleAPressed());
            controller.A.onEvent(ControllerButtonEvent.Repeated, () => this.handleAPressed());
            controller.A.onEvent(ControllerButtonEvent.Released, () => this.handleAReleased());
            controller.B.onEvent(ControllerButtonEvent.Pressed, () => this.handleBPressed());
            controller.B.onEvent(ControllerButtonEvent.Repeated, () => this.handleBPressed());
            controller.B.onEvent(ControllerButtonEvent.Released, () => this.handleBReleased());
            /*
            controller.left.onEvent(ControllerButtonEvent.Pressed, () => this.handlePressed(Button.Left));
            controller.left.onEvent(ControllerButtonEvent.Repeated, () => this.handlePressed(Button.Left));
            controller.left.onEvent(ControllerButtonEvent.Released, () => this.handleReleased(Button.Left));
            controller.right.onEvent(ControllerButtonEvent.Pressed, () => this.handlePressed(Button.Right));
            controller.right.onEvent(ControllerButtonEvent.Repeated, () => this.handlePressed(Button.Right));
            controller.right.onEvent(ControllerButtonEvent.Released, () => this.handleReleased(Button.Right));
            controller.up.onEvent(ControllerButtonEvent.Pressed, () => this.handlePressed(Button.Up));
            controller.up.onEvent(ControllerButtonEvent.Repeated, () => this.handlePressed(Button.Up));
            controller.up.onEvent(ControllerButtonEvent.Released, () => this.handleReleased(Button.Up));
            controller.down.onEvent(ControllerButtonEvent.Pressed, () => this.handlePressed(Button.Down));
            controller.down.onEvent(ControllerButtonEvent.Repeated, () => this.handlePressed(Button.Down));
            controller.down.onEvent(ControllerButtonEvent.Released, () => this.handleReleased(Button.Down));
            */
        }

        handleAPressed() {
            if (this.root.localScl < Fx8(5))
                this.root.localScl = Fx.mul(this.root.localScl, Fx8(1.25));
        }

        handleAReleased() {

        }

        handleBPressed() {
            if (this.root.localScl > Fx8(0.1))
                this.root.localScl = Fx.div(this.root.localScl, Fx8(1.25));
        }

        handleBReleased() {

        }


        /* override */ update(dt: number) {
            this.mechs.forEach(mech => mech.xfrm.localRot += mech.data["rot_rate"]);
        }

        /* override */ draw() {
            this.mechs.forEach(mech => mech.draw());
        }
    }
}