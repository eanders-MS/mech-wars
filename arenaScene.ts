namespace mech {

    class Mech {
        public base: ImageSprite;
        public rot: Affine;
        public left: ImageSprite;
        public right: ImageSprite;

        public get data(): any { return this.base.data; }

        constructor(scene: Scene, root: Affine) {
            this.base = new ImageSprite(scene, "testMech0");
            this.base.xfrm.parent = root;
            this.base.xfrm.localPos = new Vec2(
                fx.randomRange(Fx8(-70), Fx8(70)),
                fx.randomRange(Fx8(-50), Fx8(50)),
            );
            this.rot = new Affine();
            this.rot.parent = this.base.xfrm;
            this.left = new ImageSprite(scene, "imgTestMechLeft");
            this.left.xfrm.localPos.x = Fx8(-10);
            this.left.xfrm.parent = this.rot;
            this.right = new ImageSprite(scene, "imgTestMechRight");
            this.right.xfrm.localPos.x = Fx8(10);
            this.right.xfrm.parent = this.rot;
            this.base.data["rot_rate"] = Math.randomRange(-15, 15);
            this.base.xfrm.localScl = Fx8(1 * Math.random() + 1);
        }

        public update() {
            this.rot.localRot += this.base.data["rot_rate"];
        }

        public draw() {
            this.base.draw();
            this.left.draw();
            this.right.draw();
        }

    }

    export class ArenaScene extends Scene {
        mechs: Mech[];
        root: Affine;

        constructor() {
            super();
            this.root = new Affine();
            this.mechs = [];

            for (let i = 0; i < 20; ++i) {
                const mech = new Mech(this, this.root);
                this.mechs.push(mech);
            }
        }

        /* override */ startup() {
            controller.setRepeatDefault(10, 10);
            controller.A.onEvent(ControllerButtonEvent.Pressed, () => this.handleAPressed());
            controller.A.onEvent(ControllerButtonEvent.Repeated, () => this.handleAPressed());
            controller.A.onEvent(ControllerButtonEvent.Released, () => this.handleAReleased());
            controller.B.onEvent(ControllerButtonEvent.Pressed, () => this.handleBPressed());
            controller.B.onEvent(ControllerButtonEvent.Repeated, () => this.handleBPressed());
            controller.B.onEvent(ControllerButtonEvent.Released, () => this.handleBReleased());
            controller.left.onEvent(ControllerButtonEvent.Pressed, () => this.handleLeftPressed());
            controller.left.onEvent(ControllerButtonEvent.Repeated, () => this.handleLeftPressed());
            controller.left.onEvent(ControllerButtonEvent.Released, () => this.handleLeftReleased());
            controller.right.onEvent(ControllerButtonEvent.Pressed, () => this.handleRightPressed());
            controller.right.onEvent(ControllerButtonEvent.Repeated, () => this.handleRightPressed());
            controller.right.onEvent(ControllerButtonEvent.Released, () => this.handleRightReleased());
            controller.up.onEvent(ControllerButtonEvent.Pressed, () => this.handleUpPressed());
            controller.up.onEvent(ControllerButtonEvent.Repeated, () => this.handleUpPressed());
            controller.up.onEvent(ControllerButtonEvent.Released, () => this.handleUpReleased());
            controller.down.onEvent(ControllerButtonEvent.Pressed, () => this.handleDownPressed());
            controller.down.onEvent(ControllerButtonEvent.Repeated, () => this.handleDownPressed());
            controller.down.onEvent(ControllerButtonEvent.Released, () => this.handleDownReleased());
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

        handleLeftPressed() {
            this.root.localPos.x = Fx.sub(this.root.localPos.x, Fx.div(Fx8(5), this.root.localScl));
        }
        handleLeftReleased() {
        }

        handleRightPressed() {
            this.root.localPos.x = Fx.add(this.root.localPos.x, Fx.div(Fx8(5), this.root.localScl));
        }
        handleRightReleased() {
        }

        handleUpPressed() {
            this.root.localPos.y = Fx.sub(this.root.localPos.y, Fx.div(Fx8(5), this.root.localScl));
        }
        handleUpReleased() {
        }

        handleDownPressed() {
            this.root.localPos.y = Fx.add(this.root.localPos.y, Fx.div(Fx8(5), this.root.localScl));
        }
        handleDownReleased() {
        }

        /* override */ update(dt: number) {
            this.mechs.forEach(mech => mech.update());
        }

        /* override */ draw() {
            this.mechs.forEach(mech => mech.draw());
        }
    }
}