import { CornerCollisionState } from "./CornerCollisionState";
import { EightPointsCollisionState } from "./EightPointsCollisionState";

export class RectBounds {

    public static getCornerCollisionState(me: RectBounds, target: RectBounds) {
        return new CornerCollisionState(
                target.contains(me.ax, me.ay),
                target.contains(me.bx, me.ay),
                target.contains(me.ax, me.by),
                target.contains(me.bx, me.by),
        );
    }

    public static getEightPointsCollisionState(me: RectBounds, target: RectBounds) {
        const centerX = Math.trunc((me.ax + me.bx) / 2);
        const centerY = Math.trunc((me.ay + me.by) / 2);

        return new EightPointsCollisionState(
                target.contains(me.ax, me.ay),
                target.contains(me.bx, me.ay),
                target.contains(me.ax, me.by),
                target.contains(me.bx, me.by),
                target.contains(centerX, me.ay),   // top
                target.contains(centerX, me.by),   // bottom
                target.contains(me.ax, centerY),   // left
                target.contains(me.by, centerY),    // right
        );
    }

    public static whereCollisionAt(me: RectBounds, target: RectBounds) {
        const corner
                = RectBounds.getCornerCollisionState(me, target);
        return corner.whereCollisionAt();
    }
    /**
     * 左上の座標を(ax,ay), 右下の座標を(bx,by)とする矩形を生成します。<br>
     * 右上と左下の座標位置関係を満たす必要があり, (ax < bx)かつ(ay < by)でなければなりません。
     * @param ax 左上の x座標
     * @param ay 左上の y座標
     * @param bx 右下の x座標
     * @param by 左下の y座標
     * @throws IllegalArgumentException 右上・左下の位置関係が満たされない, すなわち(ax >= bx)または(ay >= by)となった時
     */
    constructor(private ax: number, private ay: number, private bx: number, private by: number) {
        if (ax >= bx || ay >= by) {
            throw new Error("IllegalArgument");
        }
    }

    // 自分の矩形と引数の矩形が衝突してるか
    public collision(r: RectBounds) {
        return ((this.ax < r.bx) && (r.ax < this.bx)
                && (this.ay < r.by) && (r.ay < this.by));
    }

    // 矩形内に引数の座標が入るか
    public contains(x: number, y: number) {
        return ((x >= this.ax) && (y >= this.ay) && (x <= this.bx) && (y <= this.by));
    }

    // =================================================================================================================
}

 // どこが衝突しているかの列挙体
export enum Location {
     NIL, TOP, BOTTOM, LEFT, RIGHT,
     RIGHT_TOP, RIGHT_BOTTOM, LEFT_TOP, LEFT_BOTTOM,
 }
