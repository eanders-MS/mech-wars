namespace mech {
    const INPUT_PRIORITY = 10;
    const UPDATE_PRIORITY = 20;
    const RENDER_PRIORITY = 30;
    const SCREEN_PRIORITY = 100;

    export class Screen {
        public static SCREEN_HALF_WIDTH = screen.width >> 1;
        public static SCREEN_HALF_HEIGHT = screen.height >> 1;
        public static SCREEN_HALF_SIZE = Vec2.N(Screen.SCREEN_HALF_WIDTH, Screen.SCREEN_HALF_HEIGHT);
        public static SCREEN_LEFT = -(screen.width >> 1);
        public static SCREEN_RIGHT = screen.width >> 1;
        public static SCREEN_TOP = -(screen.height >> 1);
        public static SCREEN_BOTTOM = screen.height >> 1;
    }

    export class Scene {
        private xfrm_: Affine;
        private image_: Image;
        private color_: number;

        //% blockCombine block="xfrm" callInDebugger
        public get xfrm() { return this.xfrm_; }
        //% blockCombine block="image" callInDebugger
        public get image() { return this.image_; }
        //% blockCombine block="color" callInDebugger
        public get color() { return this.color_; }
        public set color(v) { this.color_ = v; }

        constructor() {
            this.xfrm_ = new Affine();
            this.color_ = 12;
            this.image_ = image.create(screen.width, screen.height);
        }

        /* virtual */ update(dt: number) {
        }

        /* virtual */ draw() {
        }

        /* virtual */ startup() {
            // Called when the scene is pushed to the scene manaager.
            // ** Will be called at most one time during the scene's lifetime. **
        }

        /* virtual */ shutdown() {
            // Called when the scene is popped from the scene manager.
            // ** Will be called at most one time during the scene's lifetime. **
        }

        /* virtual */ activate() {
            // Called when the scene becomes the current scene, either by
            // being pushed or the previously current scene popped.
            // ** Can be called multiple times during the scene's lifetime. **
        }

        /* virtual */ deactivate() {
            // Called when the scene is no longer the active scene, either
            // by being popped or a new scene pushed.
            // ** Can be called multiple times during the scene's lifetime. **
        }

        __init() {
            // Hook into the runtime for frame callbacks.
            control.eventContext().registerFrameHandler(INPUT_PRIORITY, () => {
                controller.__update(control.eventContext().deltaTime);
            });
            control.eventContext().registerFrameHandler(UPDATE_PRIORITY, () => {
                this.update(control.eventContext().deltaTime); 
            });
            control.eventContext().registerFrameHandler(RENDER_PRIORITY, () => {
                this.image_.fill(0);
                this.draw();
                screen.fill(this.color_);
                screen.drawTransparentImage(this.image_, 0, 0);
            });
            control.eventContext().registerFrameHandler(SCREEN_PRIORITY, control.__screen.update);
        }
    }

    class SceneManager {
        private scenes: Scene[];

        constructor() {
            this.scenes = [];
        }

        public currScene() {
            if (this.scenes.length) {
                return this.scenes[this.scenes.length - 1];
            }
            return undefined;
        }

        public replaceScene(scene: Scene) {
            if (this.scenes.length) {
                this.popScene();
            }
            this.pushScene(scene);
        }

        public pushScene(scene: Scene) {
            const currScene = this.currScene();
            if (currScene) {
                currScene.deactivate();
            }
            control.pushEventContext();
            this.scenes.push(scene);
            scene.startup();
            scene.activate();
            scene.__init();
        }

        public popScene() {
            const prevScene = this.scenes.pop();
            if (prevScene) {
                prevScene.deactivate();
                prevScene.shutdown();
                control.popEventContext();
            }
            const currScene = this.currScene();
            if (currScene) {
                currScene.activate();
            }
        }
    }

    const sceneMgr = new SceneManager();
    export function sceneManager() { return sceneMgr; }
}