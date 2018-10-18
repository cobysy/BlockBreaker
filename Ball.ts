import { Game } from "./Game";
import { RectBounds } from "./RectBounds";
import { Sprite } from "./Sprite";

export class Ball extends Sprite {
    public static SIZE = 16; // ボールの大きさ(縦,横同じサイズ)
    public static SPEED_FLY = 6.2; // 飛ぶ時の速さ
    public static SPEED_ARRANGEMENT = 5; // 発射場所へ戻る速さ

    private img: HTMLImageElement;
    private vx = 0;
    private vy = 0;  // speed
    private delay = 0; // クリックされてから発射するまでの時間
    private _isPrepareLaunchPos = false; // 発射位置についたか
    private landed = false; // 地面についたか

    constructor(img: HTMLImageElement, x: number, y: number) {
        super();
        this.img = img;
        this.x = x;
        this.y = y;
        this.delay = 0;
        this.landed = true;
    }

    public isLanded() {
        return this.landed;
    }

    public setLanded(landed: boolean) {
        this.landed = landed;
    }

    public setVx(vx: number) {
        this.vx = vx;
    }

    public setVy(vy: number) {
        this.vy = vy;
    }

    public getVx() {
        return this.vx;
    }

    public getVy() {
        return this.vy;
    }

    public invertVx() {
        this.vx = -this.vx;
    }

    public invertVy() {
        this.vy = -this.vy;
    }

    public setDelay(delay: number) {
        this.delay = delay;
    }

    public update(eta: number) {
        if (this.delay > 0) {
            this.delay--;
            return ;
        }

        this.x += this.vx * eta;
        this.y += this.vy * eta;

        // 飛んでいる場合はhogehoge処理
        if (!this.landed) {
            // 画面の縁に触れたなら向きを反転
            if ((this.x < 0)) {
                this.vx = -this.vx;
                this.x = 1;
            } else if (this.x + Ball.SIZE > Game.STATUS_PANEL_X) {
                this.vx = -this.vx;
                this.x = Game.STATUS_PANEL_X - Ball.SIZE - 1; // めり込まないように強制的に移動
            }
            if (this.y < 0) {
                this.vy = -this.vy;
                this.y = 1; // めり込まないように強制的に移動
            }

            // 地面についたらフラグを立てる
            if (Math.trunc(this.y + Ball.SIZE + 1) > Game.FLOOR_Y) {
                this.landed = true;
            }
        }

    }

    public getBounds() {
        return (new RectBounds(this.x, this.y, this.x + Ball.SIZE, this.y + Ball.SIZE));
    }

    public draw(g2d: CanvasRenderingContext2D) {
        // g2d.drawImage(img, (int)x, (int)y, null);
        g2d.drawImage(this.img, Math.trunc(this.x), Math.trunc(this.y));
        // g2d.setColor(java.awt.Color.RED);
    }

    public isPrepareLaunchPos() {
        return this._isPrepareLaunchPos;
    }

    public setisPrepareLaunchPos(prepareLaunchPos: boolean) {
        this._isPrepareLaunchPos = prepareLaunchPos;
    }
}
