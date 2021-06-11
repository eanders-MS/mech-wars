namespace mech {
    let id_sequence = 0;

    export type ThingHandler = (comp: Thing) => void;

    export interface IKindable {
        kind: string;
    }

    export class Thing implements IKindable {
        private id_: number;
        private data_: any;

        get id() { return this.id_; }
        get data(): any {
            if (!this.data_) { this.data_ = {}; }
            return this.data_;
        }

        constructor(public kind: string) {
            this.id_ = id_sequence++;
        }

        /* virtual */ update() { }
        /* virtual */ draw() { }
    }

    export interface IPlaceable {
        xfrm: Affine;
    }

    export interface ISizable {
        width: Fx8;
        height: Fx8;
    }

    export class Placeable extends Thing implements IPlaceable {
        private xfrm_: Affine;
        public get xfrm() { return this.xfrm_; }
        constructor(parent?: IPlaceable) {
            super("placeable");
            this.xfrm_ = new Affine();
            this.xfrm_.parent = parent && parent.xfrm;
        }
    }
}