import { Block } from './Block';
import { RectBounds } from './RectBounds';

export class BonusPanel extends Block {
    // スーパークラスのフィールドを隠蔽
    public static WIDTH = 40;

    constructor(img: HTMLImageElement, x: number, y: number, life: number)
    {
        super(img, x, y, life);
    }

    public soundPlay()
    {
        //new MP3Player(Game.url_coin, false);
    }

    public getBounds()
    {
        return new RectBounds(this.x, this.y, this.x+BonusPanel.WIDTH, this.y + BonusPanel.HEIGHT);
    }

    public draw(g2d: CanvasRenderingContext2D)
    {
        // g2d.drawImage(this.img, (int)this.x, (int)this.y, null);
        g2d.drawImage(this.img, Math.trunc(this.x), Math.trunc(this.y));
    }
}