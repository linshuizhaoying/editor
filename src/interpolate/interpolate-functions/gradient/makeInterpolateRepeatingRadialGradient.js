import { makeInterpolateRadialGradient } from "./makeInterpolateRadialGradient";
import { RepeatingRadialGradient } from "@property-parser/image-resource/RepeatingRadialGradient";

export function makeInterpolateRepeatingRadialGradient (layer, property, s, e) {

    var func = makeInterpolateRadialGradient(layer, property, s, e);

    return (rate, t) => {
        var obj = func(rate, t);
        return new RepeatingRadialGradient({
            radialType: obj.radialType,
            radialPosition: obj.radialPosition,
            colorsteps: obj.colorsteps
        })
    } 
}
