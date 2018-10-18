import { CornerCollisionState } from "./CornerCollisionState";
import { Location } from "./RectBounds";

export class EightPointsCollisionState extends CornerCollisionState {
    public top = false;
    public bottom = false;
    public left = false;
    public right = false;

    constructor(
        a = false, b = false, c = false, d = false,
        top = false, bottom = false, left = false, right = false) {
        super(a, b, c, d);
        this.top = top;
        this.bottom = bottom;
        this.left = left;
        this.right = right;
    }

    public orAll(rhs: EightPointsCollisionState) {
        super.orAll(rhs);
        this.top    = this.top || rhs.top;
        this.bottom = this.bottom || rhs.bottom;
        this.left   = this.left || rhs.left;
        this.right  = this.right || rhs.right;
    }

    public whereCollisionAt() {
        let location
                = super.whereCollisionAt();

        switch (location) {
            case Location.LEFT_BOTTOM:
                if (!(this.left && this.bottom)) {
                    if (this.left) { location = Location.LEFT; } else if (this.bottom) { location = Location.BOTTOM; }
                }
                break;

            case Location.RIGHT_BOTTOM:
                if (!(this.right && this.bottom)) {
                    if (this.right) { location = Location.RIGHT; } else if (this.bottom) { location = Location.BOTTOM; }
                }
                break;

            case Location.LEFT_TOP:
                if (!(this.left && this.top)) {
                    if (this.left) { location = Location.LEFT; } else if (this.top) { location = Location.TOP; }
                }
                break;

            case Location.RIGHT_TOP:
                if (!(this.right && this.top)) {
                    if (this.right) { location = Location.RIGHT; } else if (this.top) { location = Location.TOP; }
                }
                break;
        }
        return (location);
    }
}
