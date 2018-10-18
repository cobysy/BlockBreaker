import { Ball } from "./Ball";
import { Block } from "./Block";
import { BonusPanel } from "./BonusPanel";
import { EightPointsCollisionState } from "./EightPointsCollisionState";
import { Game } from "./Game";
import { GameState, State } from "./GameState";
import { Point } from "./Point";
import { Location, RectBounds } from "./RectBounds";
import { Sprite } from "./Sprite";

export class BallManager {
    public static  DEFAULT_BALL_COUNT = 3;     // ボールの数の初期値
    private static DEFAULT_START_POS_X = Game.STATUS_PANEL_X / 2;     // 初期の発射位置
    private static DEFAULT_START_POS_Y = Game.FLOOR_Y - Ball.SIZE;
    private static SCALE_KEY_PRESSED_SPEED = 1.6;  // スペースキーが押された時に何倍速にするか
    private static MOVE_VALUE_ON_HIT = 3;
    // static
    private img_ball: HTMLImageElement;

    private balls: Ball[];

    private preLaunchPos: Point; // 次の発射位置
    private anyLanded = false;  // ボールが1つでも着地したらtrue
    private blocks: Block[]; // 当たり判定するblockのリスト
    private num_newBall = 0;    // ターン終了時にリストに追加するボールの数
    private visibleBall?: Ball;

    constructor(src: HTMLImageElement, list: Block[]) {
        this.img_ball = src;
        this.blocks = list;
        this.balls = [];
        this.preLaunchPos = new Point(BallManager.DEFAULT_START_POS_X, BallManager.DEFAULT_START_POS_Y);
    }

    public init() {
        // ボール配列を初期化
        this.balls = [];
        this.num_newBall = 0;
        // 初期発射位置
        this.preLaunchPos.x = BallManager.DEFAULT_START_POS_X;
        this.preLaunchPos.y = BallManager.DEFAULT_START_POS_Y;
        // リストにボールを追加
        this.addNewBall(BallManager.DEFAULT_BALL_COUNT);
        this.visibleBall = this.balls[0];
        console.log("init() BallManager");
    }

    public getBallCount() {
        return this.balls.length + this.num_newBall;
    }

    public draw(g2d: CanvasRenderingContext2D) {
        if (this.visibleBall) {
            this.visibleBall.draw(g2d);
        }
        Sprite.draw(this.balls, g2d);
    }

    public update(gameState: GameState) {
        switch (gameState.state) {
            case State.NOW_CLICKED:
                this.prepareLaunch(gameState); // ボールの発射準備(向きの設定等)
                gameState.state = State.BALL_FLYING;
                break;
            case State.BALL_FLYING:
                gameState =  this.ballMove(gameState);
                break;
        }
        return gameState;
    }

    // =========================================================================================================
    private addNewBall(n: number) {
        for (let i = 0; i < n; ++i) {
            this.balls.push(new Ball(this.img_ball, this.preLaunchPos.x, this.preLaunchPos.y));
        }
    }

    private prepareLaunch(gameState: GameState) {
        console.log("prepareLaunch");
        this.anyLanded = false;
        /*マウスに向けて飛ぶように速度(向き)を算出 */
        // ボールの左上の座標
        const nextX = gameState.mousePos.x - Ball.SIZE / 2;
        const nextY = gameState.mousePos.y - Ball.SIZE / 2;

        // 角度計算
        const rad = Math.atan2(nextY - this.preLaunchPos.y,
                nextX - this.preLaunchPos.x);

        // x方向の速度
        const vx = Ball.SPEED_FLY * Math.cos(rad);
        // y方向の速度
        const vy = Ball.SPEED_FLY * Math.sin(rad);

        this.balls.forEach((b, i) => {
            b.setDelay(i * 8);
            b.setLanded(false);
            b.setVisible(true);
            // 速度設定
            b.setVx(vx);
            b.setVy(vy);
            b.setisPrepareLaunchPos(false);
        });
    }

    // ボールが発射位置についているか
    private isPrepareLaunchPosision(b: Ball) {
        const xdiff = Math.abs(Math.trunc(b.getX()) - this.preLaunchPos.x); // x方向のズレの距離
        if (xdiff <= Ball.SPEED_ARRANGEMENT) {
            b.setX(this.preLaunchPos.x); // 距離が近いなら強制的に移動
        }
        return Math.trunc(b.getX()) == this.preLaunchPos.x && Math.trunc(b.getY()) == this.preLaunchPos.y;
    }

    private ballMove(gameState: GameState) {
        let allisPreLaunchPos = true;
        const speedEta = gameState.keyPressed_space ? BallManager.SCALE_KEY_PRESSED_SPEED : 1.0;

        this.balls.forEach((v) => {
            if (v.isLanded()) {
                if (!this.anyLanded) { // まだ誰も着地していない時
                    this.anyLanded = true;
                    this.visibleBall = v; // 地面に最初についたボールをvisibleBallにする
                    this.preLaunchPos.x = Math.trunc(v.getX());
                    this.preLaunchPos.y = Game.FLOOR_Y - Ball.SIZE;
                }
                v.setVy(0);
                v.setY(this.preLaunchPos.y);
                this.moveToPreLaunchPos(v);
            } else {
                const cnt = this.colideJudge(v, gameState);
                gameState.addScore(cnt * 100);
            }
            allisPreLaunchPos = allisPreLaunchPos && v.isPrepareLaunchPos();
            v.update(speedEta);
        });

        // すべてのボールが発射位置についたか
        if (allisPreLaunchPos) {
            console.log("all is PreLaunchPos.");
            gameState.state = State.BLOCK_DOWN;
            this.addNewBall(this.num_newBall);
            this.num_newBall = 0;
        }

        return gameState;
    }

    private moveToPreLaunchPos(v: Ball) {
        if (this.isPrepareLaunchPosision(v)) {
            v.setVx(0); // 止める
            v.setisPrepareLaunchPos(true);
            v.setVisible(false);
        } else {
            if (Math.trunc(v.getX()) < this.preLaunchPos.x) { // 定位置よりも左にある
                v.setVx(Ball.SPEED_ARRANGEMENT);
            } else {
                v.setVx(-(Ball.SPEED_ARRANGEMENT));
            }
        }
    }

    // 壊したブロックの数を返す
    private colideJudge(v: Ball, gameState: GameState) {
        // 壊した数(スター:+2,  ブロック:+1)
        let breakCount = 0;

        const eightPoints = new EightPointsCollisionState();
        const ballBounds = v.getBounds();

        for (const b of this.blocks) {
            // block の当たり判定矩形を取得
            const blockBounds = b.getBounds();

            if (ballBounds.collision(blockBounds)) { // 触れた時
                if (b instanceof BonusPanel) { // スターパネルか?
                    this.num_newBall++;
                    b.vanish();
                    breakCount += 2;
                    gameState.bonusPos.push(new Point(Math.trunc(b.getX()), Math.trunc(b.getY()))); // 1UP表示のQueue
                } else {
                    eightPoints.orAll(RectBounds.getEightPointsCollisionState(ballBounds, blockBounds));
                    if (b.addDamage()) { // もし破壊したら
                        breakCount++;
                    }
                }
            }
        }
        // ボールの反射方向を計算,設定
        this.checkHitBlock(v, eightPoints);
        return breakCount;
    }

    private checkHitBlock(v: Ball, eightPoints: EightPointsCollisionState) {
        const location
                = eightPoints.whereCollisionAt();
        if (location != Location.NIL) {
            this.onHitBlock(v, location);
        }
    }

    private onHitBlock(v: Ball, location: Location) {
        switch (location) {
            case Location.RIGHT:
            case Location.LEFT:
                v.invertVx();
                break;
            case Location.TOP:
            case Location.BOTTOM:
                v.invertVy();
                break;

            case Location.RIGHT_BOTTOM:  // 右下が当たったので左へ向ける,上下の方向は反転
                if (v.getVx() > 0) { v.invertVx(); }
                v.setVy(-1 * Math.abs(v.getVy()));
                break;
            case Location.LEFT_BOTTOM:
                if (v.getVx() < 0) { v.invertVx(); }
                v.setVy(-1 * Math.abs(v.getVy()));
                break;

            case Location.RIGHT_TOP:
                if (v.getVx() > 0) { v.invertVx(); }
                v.setVy(Math.abs(v.getVy()));
                break;
            case Location.LEFT_TOP:
                if (v.getVx() < 0) { v.invertVx(); }
                v.setVy(Math.abs(v.getVy()));
                break;
        }
        // ボールが貫通しないように余分に移動させる
        v.update(1);
    }

}
