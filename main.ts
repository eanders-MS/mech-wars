// Delay one frame in order to ensure all static initializers have completed.
setTimeout(() => mech.sceneManager().pushScene(new mech.TitleScene()), 1);
