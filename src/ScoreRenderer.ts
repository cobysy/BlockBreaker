import { Ball } from "./Ball";
import { Block } from "./Block";
import { BonusPanel } from "./BonusPanel";
import { Game } from "./Game";
import { GameState } from "./GameState";
import { Sprite } from "./Sprite";

class OneUP extends Sprite {
    private static OPACITY_SUBTRACT_VALUE = 0.03; // 1フレーム毎に透明化する値
    private static Y_MOVE_VALUE        = 0.4; // 上へ移動させる値(=vy)
    private img: HTMLImageElement;
    private oparity = 1; // 不透明度

    constructor(img: HTMLImageElement, x: number, y: number) {
        super();
        this.img = img;
        this.x = x;
        this.y = y;
        this.oparity = 1;
    }

    public update(eta: number) {
        this.y -= OneUP.Y_MOVE_VALUE;
        this.oparity -= OneUP.OPACITY_SUBTRACT_VALUE;
        if (this.oparity <= 0) {
            this.vanish();
        }
    }

    public draw(g2d: CanvasRenderingContext2D) {
        // Composite defaultComposite = g2d.getComposite();
        // AlphaComposite composite
        //         = AlphaComposite.getInstance(AlphaComposite.SRC_OVER, (float)this.oparity);

        // g2d.setComposite(composite);
        g2d.drawImage(this.img, Math.trunc(this.x), Math.trunc(this.y));

        // g2d.setComposite(defaultComposite);
    }
}

// tslint:disable-next-line:max-classes-per-file
export class ScoreRenderer {

    private static WIDTH_DIFF = Block.WIDTH - BonusPanel.WIDTH;
    private static WIDTH = 0;
    private static HEIGHT = 0;
    private static BOTTOM_Y_STRING_WAVE = 30;
    private static BOTTOM_Y_STRING_BALL = 160;
    private static BOTTOM_Y_STRING_SCORE = 290;

    private ballCount = 0;
    private waveCount = 1;
    private score = 0;
    private bonusPoses: OneUP[] = [];

    constructor() {
        this.init();
        ScoreRenderer.WIDTH = (Game.WIDTH - Game.STATUS_PANEL_X) + 10; // ステータスパネルの幅
        ScoreRenderer.HEIGHT = Game.HEIGHT + 40; // "WAVE"の文字列の下の座標
    }

    public init() {
        this.ballCount = 0;
        this.waveCount = 1;
        this.score = 0;
        this.bonusPoses = [];
        console.log("init() ScoreRenderer");
    }

    public update(gameState: GameState) {
        Sprite.update(this.bonusPoses);

        const que = gameState.bonusPos;
        while (que.length) {
            const point = que.shift();
            if (point) {
                this.bonusPoses.push(new OneUP(
                        Game.img_1up,
                        point.x - ScoreRenderer.WIDTH_DIFF,
                        point.y,
                        ),
                );
            }
        }
        return gameState;
    }

    public draw(g2d: CanvasRenderingContext2D) {
        Sprite.draw(this.bonusPoses, g2d);

        g2d.drawImage(Game.img_glossPanel, Game.STATUS_PANEL_X, 0, ScoreRenderer.WIDTH, ScoreRenderer.HEIGHT);

        // 初期の設定を保存し,他のクラスが安全な描画を出来るようにする

        // 文字列の色は白
        g2d.fillStyle = "white";

        // WAVE数の描画
        {
            g2d.font = "bold 20px sans-serif";
            g2d.fillText("WAVE:", Game.STATUS_PANEL_X + 20, ScoreRenderer.BOTTOM_Y_STRING_WAVE);

            g2d.font = "bold 32px sans-serif";
            const s = this.waveCount.toString();
            const mea = g2d.measureText(s);
            const x = Game.STATUS_PANEL_X + (ScoreRenderer.WIDTH / 2) - (mea.width / 2);
            const y = ScoreRenderer.BOTTOM_Y_STRING_WAVE + 30;
            g2d.fillText(s, x, y);
        }
        // BALLの数の描画
        {
            g2d.font = "bold 20px sans-serif";
            g2d.fillText("BALL:", Game.STATUS_PANEL_X + 20, ScoreRenderer.BOTTOM_Y_STRING_BALL);
            g2d.drawImage(Game.img_ball, Game.STATUS_PANEL_X + (ScoreRenderer.WIDTH / 2) - (Ball.SIZE / 2), ScoreRenderer.BOTTOM_Y_STRING_BALL - Ball.SIZE);

            g2d.font = "bold 32px sans-serif";
            const s = this.ballCount.toString();
            const mea = g2d.measureText(s);
            const x = Game.STATUS_PANEL_X + (ScoreRenderer.WIDTH / 2) - (mea.width / 2);
            const y = ScoreRenderer.BOTTOM_Y_STRING_BALL + 30;
            g2d.fillText(s, x, y);
        }
        // SCOREの描画
        {
            g2d.font = "bold 20px sans-serif";
            g2d.fillText("SCORE:", Game.STATUS_PANEL_X + 20, ScoreRenderer.BOTTOM_Y_STRING_SCORE);

            g2d.font = "bold 32px sans-serif";
            const s = this.score.toString();
            const mea = g2d.measureText(s);
            const x = Game.STATUS_PANEL_X + (ScoreRenderer.WIDTH / 2) - (mea.width / 2);
            const y = ScoreRenderer.BOTTOM_Y_STRING_SCORE + 30;
            g2d.fillText(s, x, y);
        }
    }

    public getBallCount() {
        return this.ballCount;
    }

    public setBallCount(ballCount: number) {
        this.ballCount = ballCount;
    }

    public getWaveCount() {
        return this.waveCount;
    }

    public setWaveCount(waveCount: number) {
        this.waveCount = waveCount;
    }

    public getScore() {
        return this.score;
    }

    public setScore(score: number) {
        this.score = score;
    }
}
