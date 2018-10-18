import { Game } from "./Game";
import { GameState, State } from "./GameState";

export class SessionRenderer {
    // GameOverの画像についてのhogehoge
    private static DEFAULT_OPACITY = 0.2; // フェードインの最初の透明度(0に近いほど透明)
    private static FADE_IN_SPEED   = 0.005; // 不透明になっていく定数
    private static FIRST_IMG_Y     = -80; // フェードインの最初のy座標
    private static END_IMG_Y       = -55;  // フェードインの最後のy座標
    private static IMG_VY          = 0.14;   // フェードインの下へ降りてくる速さ
    private static DELAY           = 70;    // フェードインが終わった後の間
    private static TEXT_Y          = 460;  // "YOUR SCORE"の下のy座標
    // タイトル画面の揺れる文字についてのhogehoge
    private static MIN_TOP_TXET_Y = 454;  // 上
    private static MAX_BOTTOM_TEXT_Y = SessionRenderer.TEXT_Y; // 下
    private static VAULE_TEXT_Y_ADD = 0.14; // 揺れる速さ
    private static TEXT_MENU = "Click to start";

    private opacity = SessionRenderer.DEFAULT_OPACITY;
    private img_y = SessionRenderer.FIRST_IMG_Y;
    private delay = SessionRenderer.DELAY;
    private text_y =  SessionRenderer.TEXT_Y;
    private isText_y_up = false;

    constructor() {
        this.init();
    }

    public init() {
        this.opacity = SessionRenderer.DEFAULT_OPACITY;
        this.img_y = SessionRenderer.FIRST_IMG_Y;
        this.delay = SessionRenderer.DELAY;
        this.text_y = SessionRenderer.TEXT_Y;
        this.isText_y_up = false;
        console.log("init() SessionRenderer");
    }

    public update(gameState: GameState) {
        switch (gameState.state) {
            case State.MAIN_MENU:
                this.textMove(); // 文字を揺らす
                break;
            case State.GAMEOVER:
                if (this.img_y < SessionRenderer.END_IMG_Y) { // 画像を下へ移動しながらフェードイン
                    this.img_y += SessionRenderer.IMG_VY;
                    this.opacity += SessionRenderer.FADE_IN_SPEED;
                    if (this.opacity > 1.0) { this.opacity = 1.0; }
                } else { // フェードインが終わったなら
                    if (this.delay > 0) {
                        --this.delay;    // 間を空ける
                    } else {
                        console.log("---RETURNABLE");
                        gameState.state = State.RETURNABLE_TO_MENU;
                    }
                }
                break;
        }
        return gameState;
    }

    public draw(g2d: CanvasRenderingContext2D, gameState: GameState) {
        switch (gameState.state) {
            case State.MAIN_MENU:
                this.drawMainMenu(g2d);
                break;
            case State.GAMEOVER:
                this.drawGameOver(g2d);
                break;
            case State.RETURNABLE_TO_MENU:
                this.drawGameOver(g2d);
                this.drawScore(g2d, gameState.getScore());
                break;
        }
    }

    // タイトル画面の文字列を揺らす
    private textMove() {
        if (this.isText_y_up) {
            if (this.text_y > SessionRenderer.MIN_TOP_TXET_Y) {
                this.text_y -= SessionRenderer.VAULE_TEXT_Y_ADD;
            } else {
                this.isText_y_up = false;
            }
        } else {
            if (this.text_y < SessionRenderer.MAX_BOTTOM_TEXT_Y) {
                this.text_y += SessionRenderer.VAULE_TEXT_Y_ADD;
            } else {
                this.isText_y_up = true;
            }
        }
    }

    // フェードインが終わった後に描画する。最終的な結果を表示
    private drawScore(g2d: CanvasRenderingContext2D, score: number) {

        g2d.font = "bold 20px sans-serif";
        g2d.fillStyle = "white";

        g2d.fillText("Click to MAIN-MENU...", 420, 520);

        // "YOUR SCORE"の描画
        {
            const s = "YOUR SCORE";
            g2d.font = "bold 20px sans-serif";
            const mea = g2d.measureText(s);
            g2d.fillText(s, Game.WIDTH / 2 - mea.width / 2, 370);
        }
        // 実際のスコアの数値を描画
        {
            const s = score.toString();
            g2d.font = "bold 75px sans-serif";
            const mea = g2d.measureText(s);
            g2d.fillText(s, Game.WIDTH / 2 - mea.width / 2, 460);
        }
    }

    private drawMainMenu(g2d: CanvasRenderingContext2D) {
        g2d.drawImage(Game.img_logo, 0, 0);

        // 揺れる文字を描画
        {
            g2d.font = "bold 20px sans-serif";
            g2d.fillStyle = "white";

            const mea = g2d.measureText(SessionRenderer.TEXT_MENU);
            const x = Game.WIDTH / 2 - mea.width / 2; // 中心
            g2d.fillText(SessionRenderer.TEXT_MENU, x, this.text_y);
        }
    }

    // GameOverの画像をフェードインして描画
    private drawGameOver(g2d: CanvasRenderingContext2D) {
        // 初期の設定を保存(透明度)
        g2d.save();

        // // 透明にするためのインスタンスを取得
        g2d.globalAlpha = this.opacity;
        g2d.drawImage(Game.img_gameover, 0, this.img_y);

        g2d.restore();
    }
}
