// Delay one frame in order to ensure all static initializers have completed.
let app: mech.App;
setTimeout(() => app = new mech.App(), 1);
