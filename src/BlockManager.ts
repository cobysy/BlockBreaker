import { BallManager } from "./BallManager";
import { Block } from "./Block";
import { BonusPanel } from "./BonusPanel";
import { Game } from "./Game";
import { GameState, State } from "./GameState";
import { Sprite } from "./Sprite";

export class BlockManager {
    private static NUM_BLOCK_COLOR = 4;   // ブロックの色の種類
    private static MARGIN_X = 1;          // ブロックの周りの空間
    private static MARGIN_Y = 1;          // 下の空間の幅
    private static OFFSET_X = 40;         // ブロックのオフセット
    private static OFFSET_Y = 0;
    private static NUM_BLOCK_HORIZONTAL = 6;  // 横一行のブロック数
    private static NUM_BLOCK_VERTICAL = 5;    // 縦一列のブロック数
    private static DEFAULT_BLOCK_DOWN_SPEED = 4.2; // ブロックが降りてくる初期のスピード
    private static VALUE_DOWN_SPEED_SLOW = 0.22; // 降りるスピードの減速定数
    private static BONUS_PROBABILITY = 70;    // スターが1行の中に出る確率
    private static NUM_VOID = 3;          // 空白の数

    private static img_blocks: HTMLImageElement[] = [];
    private blocks: Block[] = [];

    private blockDownSpeed = 0.0;
    private delay = 0;
    private movedDist = 0.0;

    constructor(private src_img: HTMLImageElement) {
    }

    private initResources(): Promise<void> {
        return new Promise((resolve) => {
            for (let i = 0; i < BlockManager.NUM_BLOCK_COLOR; i++) {
                const canvas = document.createElement("canvas");
                canvas.width = Block.WIDTH;
                canvas.height = Block.HEIGHT;
                const context = canvas.getContext("2d")!;
                context.drawImage(this.src_img, 0, 0);

                // カラフルなブロックの生成
                context.globalCompositeOperation = "overlay";
                if (i == 0) { context.fillStyle = "rgb(180, 0, 0)"; }
                else if (i == 1) { context.fillStyle = "rgb(0, 180, 0)"; }
                else if (i == 2) { context.fillStyle = "rgb(0, 0, 220)"; }
                else if (i == 3) { context.fillStyle = "rgb(150, 150, -20)"; }
                context.fillRect(0, 0, Block.WIDTH, Block.HEIGHT);
                const cp = new Image();
                cp.src = canvas.toDataURL();
                BlockManager.img_blocks.push(cp);

                resolve();
            }
        });
    }

    public async init() {
        if (!BlockManager.img_blocks.length) {
            await this.initResources();
        }

        this.blocks = [];

        for (let i = 0; i < BlockManager.NUM_BLOCK_VERTICAL; ++i) {
            const y = BlockManager.OFFSET_Y + i * (Block.HEIGHT + BlockManager.MARGIN_Y);
            this.blocks.push(...this.createHorizontalBlockArray(
                    y,
                    this.calcNUM_VOID(),
                    BlockManager.BONUS_PROBABILITY + 20,
                    BallManager.DEFAULT_BALL_COUNT));
        }

        // 上部の見えない部分のブロックを生成, フィールド初期化
        this.initDown(BallManager.DEFAULT_BALL_COUNT);
        console.log("init() BlockManager : num_blocks_count = " + this.blocks.length);
    }

    public update(gameState: GameState) {
        // BLOCK_DOWNの時のみ処理
        switch (gameState.state) {
            case State.BLOCK_DOWN:
                gameState = this.blockDown(gameState);
        }
        return gameState;
    }

    public draw(g2d: CanvasRenderingContext2D) {
        Sprite.draw(this.blocks, g2d);
    }

    public getBlocks(): Block[] {
        return this.blocks;
    }

    private blockDown(gameState: GameState) {
        if (this.delay > 0) {
            this.delay--;
        } else if (Math.trunc(this.movedDist) >= Block.HEIGHT + BlockManager.MARGIN_Y) {
            // 次のblockDown() に向けて初期化
            this.initDown(gameState.getBallCount());
            // gamestate更新
            gameState.state = State.CLICK_WAIT;
            gameState.countUpWave();
            gameState.addScore( (gameState.getWaveCount() % 10  == 0) ?
                    300 : (gameState.getWaveCount() % 5 == 0) ?
                    100 : 50);
        } else {  // まだスピードがあるならすべてのブロックに対しY座標を更新
            this.blocks.forEach((e) => {
                e.addY(this.blockDownSpeed);
                // 床に触れたらゲームオーバー
                if (!(e instanceof BonusPanel) && e.getY() + Block.HEIGHT > Game.FLOOR_Y) {
                    gameState.state = State.GAMEOVER;
                    // new MP3Player(Game.url_explosion, false);
                    return gameState;
                }
            });
            this.movedDist += this.blockDownSpeed; // ブロックの下がった距離に加算
            this.blockDownSpeed -= BlockManager.VALUE_DOWN_SPEED_SLOW;
            // もしスピードが0未満になったら
            if (this.blockDownSpeed < 0) { this.blockDownSpeed = 0.25; }
        }
        return gameState;
    }

    private initDown(ballCount: number) {
        this.blockDownSpeed = BlockManager.DEFAULT_BLOCK_DOWN_SPEED;
        this.delay = 15;
        this.movedDist = 0;
        this.blocks.push(...this.createHorizontalHideArray(this.calcNUM_VOID(), ballCount));
    }

    // 空白のブロックの数
    private calcNUM_VOID() {
        if (this.blocks.length < 11) {
            return BlockManager.NUM_VOID - 1;
        } else if (Math.trunc(Math.random() * 10) < 2) {
            return BlockManager.NUM_VOID + 1;
        } else {
            return BlockManager.NUM_VOID;
        }
    }

    // 上部の目に見えないところのブロックを生成
    private createHorizontalHideArray(num_void: number, ballCount: number) {
        return this.createHorizontalBlockArray(-1 * (Block.HEIGHT + BlockManager.MARGIN_Y) , this.calcNUM_VOID(), BlockManager.BONUS_PROBABILITY, ballCount);
    }

    private createHorizontalBlockArray(y: number, num_void: number, bonusProbab: number, ballCount: number) {
        if (num_void > BlockManager.NUM_BLOCK_HORIZONTAL) {
            throw new Error('IllegalArgumentException("num_void is larger than NUM_BLOCK_HORIZONTAL")');
        }

        // return用のブロックリスト
        const list = [];
        const is_void: boolean[] = [];
        let bonusPos = -1; // スターの位置(左から何番目の配列か)

        {
            const voidPoslist: number[] = [];
            let r: number;
            // 空にする場所を決める
            for (let i = 0; i < num_void; ++i) {
                do {
                    r = Math.trunc(Math.random() * BlockManager.NUM_BLOCK_HORIZONTAL);
                } while (is_void[r] == true);
                is_void[r] = true;
                voidPoslist.push(r);
            }
            // ボーナスパネルを置くか,　置くならどこの場所に置くかを決める
            if (Math.trunc(Math.random() * 100) < bonusProbab) {
                bonusPos = voidPoslist[Math.trunc(Math.random() * voidPoslist.length)];
            }
        }
        for (let i = 0; i < BlockManager.NUM_BLOCK_HORIZONTAL; ++i) {
            if (is_void[i]) {
                if (i == bonusPos) {    // 空白で,bonusPosならスターパネルを入れる
                    const x = Math.trunc(BlockManager.OFFSET_X + i * (Block.WIDTH + BlockManager.MARGIN_X) + (Block.WIDTH - BonusPanel.WIDTH) / 2);
                    list.push(new BonusPanel(Game.img_bonusPanel, x, y, 1));
                }
            } else {
                const x = BlockManager.OFFSET_X + i * (Block.WIDTH + BlockManager.MARGIN_X);
                const HP = 1 + ballCount + Math.trunc(Math.random() * ballCount);
                list.push(new Block(BlockManager.img_blocks[Math.trunc(Math.random() * BlockManager.NUM_BLOCK_COLOR)], x, y, HP));
            }
        }

        return list;
    }
}
