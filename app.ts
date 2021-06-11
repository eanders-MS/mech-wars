namespace mech {
    export class App {
        sceneMgr: SceneManager;

        constructor() {
            this.sceneMgr = new SceneManager();
            //this.sceneMgr.pushScene(new TitleScene())
            this.sceneMgr.pushScene(new ArenaScene())
        }
    }
}