import { Location } from './RectBounds';

export class CornerCollisionState {
   constructor(
        public leftTop = false, 
        public rightTop = false,
        public leftBtm = false,
        public rightBtm = false)
    {}

    public toString() {
        return ("LT: "+ this.leftTop + " RT: " + this.rightTop + " LB: "+this.leftBtm + " RB: "+this.rightBtm );
    }

    //引数のフィールドとORをとる
    public orAll(rhs: CornerCollisionState) {
        this.leftTop    = this.leftTop || rhs.leftTop;
        this.rightTop   = this.rightTop || rhs.rightTop;
        this.leftBtm    = this.leftBtm || rhs.leftBtm;
        this.rightBtm   = this.rightBtm || rhs.rightBtm;
    }

    // 4隅の衝突状態によってどこが衝突しているかを返す
    public whereCollisionAt() {
        if (this.leftTop && this.rightTop) {  // 左上と右上がブロック内
            return Location.TOP;
        }
        else if (this.leftBtm && this.rightBtm) {  // 左下と右下がブロック内
            return Location.BOTTOM;
        }
        else if (this.leftTop && this.leftBtm) {   // 左上と左下がブロック内
            return Location.LEFT;
        }
        else if (this.rightTop && this.rightBtm) { // 右上と右下がブロック内
            return Location.RIGHT;
        }

        else if (this.leftTop) {  // 左上
            return Location.LEFT_TOP;
        }
        else if (this.rightTop) { // 右上
            return Location.RIGHT_TOP;
        }
        else if (this.leftBtm) {  // 左下
            return Location.LEFT_BOTTOM;
        }
        else if (this.rightBtm) { // 右下
            return Location.RIGHT_BOTTOM;
        }
        else
            return Location.NIL;
    }
}