namespace mech {
    /**
     * An `Affine` is a set of transforms to be performed on a Vec2: translation, rotation, and scale.
     * An Affine can have a parent tranform.
     */
    export class Affine {
        private localPos_: Vec2;
        private localRot_: number;
        private localScl_: Fx8;
        private parent_: Affine;
        private dirty_: boolean;
        private worldPos_: Vec2;
        private worldRot_: number;
        private worldScl_: Fx8;
        public tag: string;

        //% blockCombine block="dirty" callInDebugger
        public get dirty(): boolean {
            return this.dirty_ || this.localPos_.dirty || (this.parent && this.parent.dirty);
        }

        //% blockCombine block="worldPos" callInDebugger
        public get worldPos() {
            if (this.dirty) { this.recalc(); }
            //return new Vec2(this.world_.m[2], this.world_.m[5]);
            return this.worldPos_;
        }
        //% blockCombine block="worldRot" callInDebugger
        public get worldRot() {
            if (this.dirty) { this.recalc(); }
            return this.worldRot_;
        }
        //% blockCombine block="worldScl" callInDebugger
        public get worldScl() {
            if (this.dirty) { this.recalc(); }
            return this.worldScl_;
        }

        //% blockCombine block="localPos" callInDebugger
        public get localPos(): Vec2 { return this.localPos_; }
        public set localPos(v: Vec2) {
            this.localPos_.copyFrom(v);
            this.dirty_ = true;
        }

        //% blockCombine block="localRot" callInDebugger
        public get localRot() { return this.localRot_; }
        public set localRot(v: number) {
            this.localRot_ = v;
            this.dirty_ = true;
        }

        //% blockCombine block="localScl" callInDebugger
        public get localScl() { return this.localScl_; }
        public set localScl(v: Fx8) {
            this.localScl_ = v;
            this.dirty_ = true;
        }

        //% blockCombine block="parent" callInDebugger
        public get parent() { return this.parent_; }
        public set parent(p: Affine) {
            this.parent_ = p;
            this.dirty_ = true;
        }

        //% blockCombine block="root" callInDebugger
        public get root() { 
            let node = this.parent;
            while (node && node.parent) {
                node = node.parent;
            }
            return node;
        }

        constructor() {
            this.localPos_ = new Vec2();
            this.localRot_ = 0;
            this.localScl_ = Fx.oneFx8;
            this.worldPos_ = new Vec2();
            this.worldRot_ = 0;
            this.worldScl_ = Fx.oneFx8;
            this.dirty_ = true;
        }

        public copyFrom(src: Affine): this {
            this.localPos.copyFrom(src.localPos);
            this.localRot = src.localRot;
            this.localScl = src.localScl;
            return this;
        }

        public clone(): Affine {
            const aff = new Affine();
            aff.copyFrom(this);
            return aff;
        }

        public recalc(force = false) {
            if (this.dirty || force) {
                this.dirty_ = false;
                if (this.parent) {
                    const ppos = this.parent.worldPos;
                    const prot = this.parent.worldRot;
                    const pscl = this.parent.worldScl;
                    this.worldScl_ = Fx.mul(this.localScl, pscl);
                    this.worldRot_ = prot + this.localRot_;
                    // Yes, I know I *could* use a 3x3 matrix for this.
                    Vec2.ScaleToRef(this.localPos, this.worldScl_, this.worldPos_);
                    Vec2.RotateToRef(this.worldPos_, this.parent.worldRot, this.worldPos_);
                    Vec2.TranslateToRef(this.worldPos_, ppos, this.worldPos_);
                } else {
                    this.worldScl_ = this.localScl_;
                    this.worldRot_ = this.localRot_;
                    Vec2.ScaleToRef(this.localPos, this.worldScl_, this.worldPos_);
                }
            }
        }

        public transformToRef(v: Vec2, ref: Vec2): Vec2 {
            // Yes, I know I *could* use a 3x3 matrix for this.
            Vec2.ScaleToRef(v, this.worldScl, ref);
            Vec2.RotateToRef(ref, this.worldRot, ref);
            Vec2.TranslateToRef(ref, this.worldPos, ref);
            return ref;
        }
    }
}