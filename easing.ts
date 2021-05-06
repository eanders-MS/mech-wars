namespace mech.easing.curves {
    // Curve formulas from https://easings.net/
    // Only "ease in" curves should appear here. "ease out" and "ease in-out" are derived programmatically from these.
    export function sine(t: number): number {
        return 1 - Math.cos((t * Math.PI) / 2);
    }
    export function sq1(t: number): number {
        return t;
    }
    export function sq2(t: number): number {
        return t * t;
    }
    export function sq3(t: number): number {
        return t * t * t;
    }
    export function sq4(t: number): number {
        return t * t * t * t;
    }
    export function sq5(t: number): number {
        return t * t * t * t * t;
    }
    export function expo(t: number): number {
        return t === 0 ? 0 : Math.pow(2, 10 * t - 10);
    }
    export function circ(t: number): number {
        return 1.0 - Math.sqrt(1.0 - Math.pow(t, 2));
    }
    export function back(t: number): number {
        const c1 = 1.70158;
        const c3 = c1 + 1;
        return c3 * t * t * t - c1 * t * t;
    }
    export function elastic(t: number): number {
        const c4 = (2 * Math.PI) / 3;
        return t === 0
            ? 0
            : t === 1
            ? 1
            : -Math.pow(2, 10 * t - 10) * Math.sin((t * 10 - 10.75) * c4);        
    }
}

function lerp(a: number, b: number, t: number): number {
    return a + (b - a) * t;
}
function flip(t: number): number {
    return 1 - t;
}
function spikef(t: number, fn: (t: number) => number): number {
    if (t < 0.5) return fn(t / 0.5);
    return fn(flip(t) / 0.5);
}

namespace mech.easing {
    export function linear(): (a: number, b: number, t: number) => number {
        return lerp;
    }
    export function snap(pct: number): (a: number, b: number, t: number) => number {
        return (a, b, t) => {
            return t < pct ? a : b;
        }
    }
    export function easeIn(fn: (t: number) => number): (a: number, b: number, t: number) => number {
        return (a, b, t) => lerp(a, b, fn(t));
    }
    export function easeOut(fn: (t: number) => number): (a: number, b: number, t: number) => number {
        return (a, b, t) => lerp(a, b, flip(fn(flip(t))));
    }
    export function easeInOut(fn: (t: number) => number): (a: number, b: number, t: number) => number {
        return (a, b, t) => {
            t = lerp(fn(t), flip(fn(flip(t))), t);
            return lerp(a, b, t);
        }
    }
    export function spike(fn: (t: number) => number): (a: number, b: number, t: number) => number {
        return (a, b, t) => lerp(a, b, spikef(t, fn));
    }
}
