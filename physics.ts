namespace mech {
    export class Body {
        enabled: boolean;
        bumpCanMove: boolean;
        v: affine.Vec2;
        private mass_: Fx8;
        private radius_: Fx8;
        private friction_: Fx8;
        private vf: affine.Vec2;
        private restitution_: Fx8; 

        //% blockCombine block="xfrm" callInDebugger
        get xfrm() { return this.sprite.xfrm; }

        //% blockCombine block="radius" callInDebugger
        get radius() { return this.radius_; }

        //% blockCombine block="mass" callInDebugger
        get mass() { return this.mass_; }
        set mass(v) { this.mass_ = v; }

        //% blockCombine block="friction" callInDebugger
        get friction() { return this.friction_; }
        set friction(v) {
            this.friction_ = v;
            this.vf = new affine.Vec2(Fx.sub(Fx.oneFx8, v), Fx.sub(Fx.oneFx8, v));
        }

        //% blockCombine block="restitution" callInDebugger
        get restitution() { return this.restitution_; }
        set restitution(v) { this.restitution_ = v; }

        constructor(public sprite: affine.Sprite, public onCollision: (other: affine.Sprite) => void) {
            this.v = new affine.Vec2();
            this.enabled = false;
            this.bumpCanMove = true;
            this.mass = Fx.oneFx8;
            this.friction = Fx.zeroFx8;
            this.restitution = Fx.oneFx8;
        }

        applyFriction() {
            if (this.friction_ === Fx.zeroFx8) { return; }
            affine.Vec2.MulToRef(this.v, this.vf, this.v);
        }

        applyVelocity() {
            this.xfrm.localPos.x = Fx.add(this.xfrm.localPos.x, this.v.x);
            this.xfrm.localPos.y = Fx.sub(this.xfrm.localPos.y, this.v.y);
        }

        // Pass negative maxSpeed for no maximum.
        public applyImpulse(v: affine.Vec2, maxSpeed: Fx8) {
            affine.Vec2.AddToRef(this.v, v, this.v);
            if (maxSpeed >= Fx.zeroFx8 && this.v.magSq() > Fx.mul(maxSpeed, maxSpeed)) {
                affine.Vec2.SetLengthToRef(this.v, maxSpeed, this.v);
            }
        }

        public stopMoving() {
            this.v.x = Fx.zeroFx8;
            this.v.y = Fx.zeroFx8;
        }
    };

    export class Physics {
        bodies: Body[];
        deadBodies: Body[];

        constructor() {
            this.bodies = [];
            this.deadBodies = [];
        }
        
        public addBody(body: Body) {
            this.bodies.push(body);
            body.enabled = true;
        }

        public removeBody(body: Body) {
            body.enabled = false;
            this.deadBodies.push(body);
        }

        public simulate() {
            if (this.deadBodies.length) {
                this.bodies = this.bodies.filter(elem => !this.deadBodies.find(dead => elem === dead));
                this.deadBodies = [];
            }

            for (let i = 0; i < this.bodies.length; ++i) {
                const body1 = this.bodies[i];
                if (!body1.enabled) { continue; }
                for (let j = i + 1; j < this.bodies.length; ++j) {
                    const body2 = this.bodies[j];
                    if (!body2.enabled) { continue; }
                    this.checkCollision(body1, body2);
                }
            }

            for (const body of this.bodies) {
                if (!body.enabled) { continue; }
                body.applyFriction();
                body.applyVelocity();
            }
        }

        private checkCollision(body1: Body, body2: Body) {
            const minDist = Fx.add(body1.radius, body2.radius);
            const minDistSq = Fx.mul(minDist, minDist);
            const vDiff = affine.Vec2.SubToRef(body2.xfrm.worldPos, body1.xfrm.worldPos, new affine.Vec2());
            const distSq = vDiff.magSq();
            // Not colliding?
            if (distSq > minDistSq) { return; }
            const dist = Fx8(Math.sqrt(Fx.toFloat(distSq)));
            const vNormCollision = affine.Vec2.ScaleToRef(vDiff, dist, new affine.Vec2());
            const vRelVelocity = affine.Vec2.SubToRef(body1.v, body2.v, new affine.Vec2());
            let speed = Fx.abs(affine.Vec2.MulToRef(vRelVelocity, vNormCollision, new affine.Vec2()).magSq());
            speed = Fx.mul(speed, Fx.min(body1.restitution, body2.restitution));
            const impulse = Fx.div(Fx.mul(Fx8(2), speed), Fx.add(body1.mass, body2.mass));
            if (body1.bumpCanMove) {
                body1.v.x = Fx.sub(body1.v.x, Fx.mul(impulse, Fx.mul(body2.mass, vNormCollision.x)));
                body1.v.y = Fx.sub(body1.v.y, Fx.mul(impulse, Fx.mul(body2.mass, vNormCollision.y)));
            }
            if (body2.bumpCanMove) {
                body2.v.x = Fx.add(body2.v.x, Fx.mul(impulse, Fx.mul(body1.mass, vNormCollision.x)));
                body2.v.y = Fx.add(body2.v.y, Fx.mul(impulse, Fx.mul(body1.mass, vNormCollision.y)));
            }
            body1.onCollision(body2.sprite);
            body2.onCollision(body1.sprite);
        }

        public debugDraw(ofs: affine.Vec2) {
            const img = scene.backgroundImage();
            for (let i = 0; i < this.bodies.length; ++i) {
                const body = this.bodies[i];
                if (!body.enabled) { continue; }
                img.drawCircle(
                    Fx.toInt(Fx.sub(body.xfrm.worldPos.x, ofs.x)),
                    Fx.toInt(Fx.sub(body.xfrm.worldPos.y, ofs.y)),
                    Fx.toFloat(body.radius),
                    constants.DBG_DRAW_PHYSICS_COLOR);
            }
        }
    }
}
