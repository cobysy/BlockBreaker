import { Sprite } from './Sprite';
import { RectBounds } from './RectBounds';

export class Block extends Sprite {
    public static WIDTH = 70;
    public static HEIGHT = 36;
    public static FONT_SIZE = 28;

    private life: number;
    protected img: HTMLImageElement;

    constructor(img: HTMLImageElement, x: number, y: number, life: number)
    {
        super();
        this.img = img;
        this.x = x;
        this.y = y;
        this.life = life;
    }

    //当たり判定矩形を返す
    public getBounds()
    {
        return (new RectBounds(this.x-1, this.y-1, this.x+Block.WIDTH+1, this.y+Block.HEIGHT+1));
    }

    //死んだらtrueを返す
    public addDamage()
    {
        this.life--;
        if (this.life <= 0) {
            this.vanish();
            return true;
        }

        return false;
    }

    // 音を鳴らす(現在は鳴らさない仕様)
    public soundPlay()
    { }

    public vanish()
    {
        super.vanish();
        this.soundPlay();
    }

    public update(eta: number)
    {
    }

    public draw(g2d: CanvasRenderingContext2D)
    {
        // g2d.drawImage(img, (int)x, (int)y, null);
        g2d.drawImage(this.img, Math.trunc(x), Math.trunc(y));
        // drawHP(g2d);
    }

    private drawHP(g2d: CanvasRenderingContext2D)
    {
        // RenderingHints defaultHints = g2d.getRenderingHints();
        // g2d.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);

        // {
        //     String HP = String.valueOf(this.life);

        //     Font font = new Font(Font.MONOSPACED, Font.BOLD, FONT_SIZE);
        //     g2d.setFont(font);
        //     g2d.setColor(Color.BLACK);

        //     // 文字列を中心に描画する
        //     FontMetrics metrics = g2d.getFontMetrics();
        //     Rectangle rect = metrics.getStringBounds(HP, g2d).getBounds();
        //     final int HPx = ((int)this.x + Block.WIDTH / 2) - (rect.width / 2);
        //     final int HPy = ((int)this.y + Block.HEIGHT / 2) + metrics.getAscent() / 2;
        //     g2d.drawString(HP, HPx, HPy);
        // }

        // g2d.setRenderingHints(defaultHints);
    }
}