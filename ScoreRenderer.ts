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
    private ballCount = 0;
    private waveCount = 1;
    private score = 0;
    private bonusPoses: OneUP[] = [];

    constructor() {
        this.init();
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

        // g2d.drawImage(img, Game.STATUS_PANEL_X, 0, WIDTH, HEIGHT, null);

        // // 初期の設定を保存し,他のクラスが安全な描画を出来るようにする
        // final RenderingHints  defaultRenderingHints = g2d.getRenderingHints();
        // final Font defaultFont = g2d.getFont();
        // g2d.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);

        // // 文字列の色は白
        // g2d.setColor(Color.WHITE);

        // //WAVE数の描画
        // {
        //     g2d.setFont(new Font(Font.MONOSPACED, Font.BOLD, 24));
        //     g2d.drawString("WAVE:", Game.STATUS_PANEL_X + 20, BOTTOM_Y_STRING_WAVE);

        //     g2d.setFont(new Font(Font.MONOSPACED, Font.BOLD, 40));
        //     String S = String.valueOf(waveCount);
        //     FontMetrics metrics = g2d.getFontMetrics();
        //     Rectangle rect = metrics.getStringBounds(S, g2d).getBounds();
        //     final int x = Game.STATUS_PANEL_X + (WIDTH / 2) - (rect.width / 2);
        //     final int y = BOTTOM_Y_STRING_WAVE + metrics.getAscent() + 10;
        //     g2d.drawString(S, x, y);
        // }
        // //BALLの数の描画
        // {
        //     g2d.setFont(new Font(Font.MONOSPACED, Font.BOLD, 24));
        //     g2d.drawString("BALL  :", Game.STATUS_PANEL_X + 20, BOTTOM_Y_STRING_BALL);
        //     g2d.drawImage(Game.img_ball, Game.STATUS_PANEL_X + 76, BOTTOM_Y_STRING_BALL - Ball.SIZE, null);

        //     g2d.setFont(new Font(Font.MONOSPACED, Font.BOLD, 40));
        //     String S = String.valueOf(ballCount);
        //     FontMetrics metrics = g2d.getFontMetrics();
        //     Rectangle rect = metrics.getStringBounds(S, g2d).getBounds();
        //     final int x = Game.STATUS_PANEL_X + (WIDTH / 2) - (rect.width / 2);
        //     final int y = BOTTOM_Y_STRING_BALL + metrics.getAscent() + 10;
        //     g2d.drawString(S, x, y);
        // }
        // //SCOREの描画
        // {
        //     g2d.setFont(new Font(Font.MONOSPACED, Font.BOLD, 24));
        //     g2d.drawString("SCORE:", Game.STATUS_PANEL_X + 20, BOTTOM_Y_STRING_SCORE);

        //     g2d.setFont(new Font(Font.MONOSPACED, Font.BOLD, 40));
        //     String S = String.valueOf(score);
        //     FontMetrics metrics = g2d.getFontMetrics();
        //     Rectangle rect = metrics.getStringBounds(S, g2d).getBounds();
        //     final int x = Game.STATUS_PANEL_X + (WIDTH / 2) - (rect.width / 2);
        //     final int y = BOTTOM_Y_STRING_SCORE + metrics.getAscent() + 10;
        //     g2d.drawString(S, x, y);
        // }
        // g2d.setRenderingHints(defaultRenderingHints);
        // g2d.setFont(defaultFont);
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
