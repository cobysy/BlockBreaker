import { RectBounds } from "./RectBounds";
import { Sprite } from "./Sprite";

export class Block extends Sprite {
    public static WIDTH = 70;
    public static HEIGHT = 36;
    public static FONT_SIZE = 20;
    protected img: HTMLImageElement;

    private life: number;

    constructor(img: HTMLImageElement, x: number, y: number, life: number) {
        super();
        this.img = img;
        this.x = x;
        this.y = y;
        this.life = life;
    }

    // 当たり判定矩形を返す
    public getBounds() {
        return (new RectBounds(this.x - 1, this.y - 1, this.x + Block.WIDTH + 1, this.y + Block.HEIGHT + 1));
    }

    // 死んだらtrueを返す
    public addDamage() {
        this.life--;
        if (this.life <= 0) {
            this.vanish();
            return true;
        }

        return false;
    }

    // 音を鳴らす(現在は鳴らさない仕様)
    // tslint:disable-next-line:no-empty
    public soundPlay() { }

    public vanish() {
        super.vanish();
        this.soundPlay();
    }

    public update(eta: number) {
    }

    public draw(g2d: CanvasRenderingContext2D) {
        // g2d.drawImage(img, (int)x, (int)y, null);
        g2d.drawImage(this.img, Math.trunc(this.x), Math.trunc(this.y));
        this.drawHP(g2d);
    }

    private drawHP(g2d: CanvasRenderingContext2D) {
        const s = this.life.toString();
        g2d.font = "bold " + Block.FONT_SIZE + "px sans-serif";
        g2d.fillStyle = "lightgray";

        // 文字列を中心に描画する
        const mea = g2d.measureText(s);
        // g2d.globalCompositeOperation = "destination-out";
        g2d.fillText(s, (this.x + Block.WIDTH / 2) - (mea.width / 2),
                         this.y + 2 * Block.HEIGHT / 3);
        // g2d.globalCompositeOperation = "source-over";
    }
}
