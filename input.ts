namespace mech {
    export enum Button {
        A,
        B,
        Left,
        Right,
        Up,
        Down,
        COUNT
    }

    export type ButtonEventHandler = () => void;

    export class InputHandler {
        public currButtons: number[];
        public prevButtons: number[];
        private pressedHandlers: { [button: number]: ButtonEventHandler };
        private downHandlers: { [button: number]: ButtonEventHandler };
        private releasedHandlers: { [button: number]: ButtonEventHandler };

        constructor() {
            this.currButtons = [];
            this.prevButtons = [];
            this.pressedHandlers = {};
            this.downHandlers = {};
            this.releasedHandlers = {};
            this.clear();
        }

        public onPressed(button: Button, handler: ButtonEventHandler) {
            this.pressedHandlers[button] = handler;
        }
        public onDown(button: Button, handler: ButtonEventHandler) {
            this.downHandlers[button] = handler;
        }
        public onReleased(button: Button, handler: ButtonEventHandler) {
            this.releasedHandlers[button] = handler;
        }

        public clear() {
            for (let i = 0; i < Button.COUNT; ++i) { this.currButtons[i] = 0; }
            for (let i = 0; i < Button.COUNT; ++i) { this.prevButtons[i] = 0; }
        }

        public update() {
            for (let i = 0; i < Button.COUNT; ++i) {
                if (this.currButtons[i]) {
                    if (this.prevButtons[i]) {
                        this.callDownHandler(i);
                    } else {
                        this.callPressedHandler(i);
                        this.callDownHandler(i);
                    }
                } else {
                    if (this.prevButtons[i]) {
                        this.callReleasedHandler(i);
                    }
                }
            }

            for (let i = 0; i < Button.COUNT; ++i) {
                this.prevButtons[i] = this.currButtons[i];
            }
        }

        private callPressedHandler(button: Button) {
            this.pressedHandlers[button] && this.pressedHandlers[button]();
        }
        private callDownHandler(button: Button) {
            this.downHandlers[button] && this.downHandlers[button]();
        }
        private callReleasedHandler(button: Button) {
            this.releasedHandlers[button] && this.releasedHandlers[button]();
        }
    }

    export class Input {
        private handler: InputHandler;
        constructor() {
            controller.setRepeatDefault(0, 0);
            controller.A.onEvent(ControllerButtonEvent.Pressed, () => this.handlePressed(Button.A));
            controller.A.onEvent(ControllerButtonEvent.Repeated, () => this.handlePressed(Button.A));
            controller.A.onEvent(ControllerButtonEvent.Released, () => this.handleReleased(Button.A));
            controller.B.onEvent(ControllerButtonEvent.Pressed, () => this.handlePressed(Button.B));
            controller.B.onEvent(ControllerButtonEvent.Repeated, () => this.handlePressed(Button.B));
            controller.B.onEvent(ControllerButtonEvent.Released, () => this.handleReleased(Button.B));
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
        }

        public setHandler(handler: InputHandler) {
            this.handler = handler;
            this.handler && this.handler.clear();
        }

        public update() {
            this.handler && this.handler.update();
        }

        handlePressed(button: Button) {
            this.handler && (this.handler.currButtons[button] += 1);
        }

        handleReleased(button: Button) {
            this.handler && (this.handler.currButtons[button] = 0);
        }
    }
}