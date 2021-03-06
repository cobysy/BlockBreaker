import { Ball } from "./Ball";
import { BallManager} from "./BallManager";
import { BlockManager} from "./BlockManager";
import { GameState, State} from "./GameState";
import { ScoreRenderer} from "./ScoreRenderer";
import { SessionRenderer} from "./SessionRenderer";

export class Game {
    public static WIDTH   = 720;      // ウィンドウサイズ
    public static HEIGHT  = 540;
    public static FLOOR_Y = Game.HEIGHT - 30;  // 床の座標
    public static STATUS_PANEL_X = 520;   // ステータスパネルの座標
    public static img_ball: HTMLImageElement;
    public static img_block: HTMLImageElement;
    public static img_bonusPanel: HTMLImageElement;
    public static img_hexagonBack: HTMLImageElement;
    public static img_floor: HTMLImageElement;
    public static img_glossPanel: HTMLImageElement;
    public static img_gameover: HTMLImageElement;
    public static img_logo: HTMLImageElement;
    public static img_1up: HTMLImageElement;
    public static img_cursor: HTMLImageElement;

    public static main() {
        const game = new Game();
        (async () => {
            game.run();
        })();
    }

    private static RUNCHECK_INTERVAL = 120;
    public static url_menuMP3?: HTMLAudioElement;
    public static url_mainGameMP3?: HTMLAudioElement;
    public static url_explosion?: HTMLAudioElement;
    public static url_coin?: HTMLAudioElement;
    // private static Cursor cursor_DEFAULT, cursor_MY_CROSS;
    private static RESOURCE = "resources/";

    // private final Component     screen;
    private blockManager!: BlockManager;
    private ballManager!: BallManager;
    private scoreRenderer!: ScoreRenderer;
    private sessionRenderer!: SessionRenderer;

    private gameState: GameState;
    private runChecker = Game.RUNCHECK_INTERVAL;

    // private MP3Player mp3Menu, mp3mainGame;

    private static checkImage(url: string) {
        return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.src = url;
        });
    }

    private initResources(): Promise<void> {    // 最初に一度だけ実行: 画像,音声読み込み
        console.log("Game static init");

        return new Promise((resolve) => {
                Promise.all([
                  Game.RESOURCE + "ball.png",
                  Game.RESOURCE + "block-dark.png",
                  Game.RESOURCE + "bonusPanel.png",
                  Game.RESOURCE + "hexagon-back.jpeg",
                  Game.RESOURCE + "floor.png",
                  Game.RESOURCE + "gloss-panel.png",
                  Game.RESOURCE + "gameover.jpg",
                  Game.RESOURCE + "logo.jpeg",
                  Game.RESOURCE + "1UP.png",
                  Game.RESOURCE + "cursor.png",
                 ].map(Game.checkImage))
            .then((r) => {
                Game.img_ball = r.shift() as HTMLImageElement;
                Game.img_block = r.shift() as HTMLImageElement;
                Game.img_bonusPanel = r.shift() as HTMLImageElement;
                Game.img_hexagonBack = r.shift() as HTMLImageElement;
                Game.img_floor = r.shift() as HTMLImageElement;
                Game.img_glossPanel = r.shift() as HTMLImageElement;
                Game.img_gameover = r.shift() as HTMLImageElement;
                Game.img_logo = r.shift() as HTMLImageElement;
                Game.img_1up = r.shift() as HTMLImageElement;

                // マウスカーソル
                Game.img_cursor = r.shift() as HTMLImageElement;
                resolve();
            });
        });
        // url_menuMP3     = Game.class.getResource(RESOURCE + "dance.MP3");
        // url_mainGameMP3 = Game.class.getResource(RESOURCE + "digitalworld.MP3");
        // url_explosion   = Game.class.getResource(RESOURCE + "explosion.MP3");
        // url_coin        = Game.class.getResource(RESOURCE + "coin.MP3");
    }

    private getTimestamp = () => 0;

    // private Game(final BufferingRenderer renderer)
    constructor() {
        this.gameState = new GameState();
    }

    public async run() {
        await this.initResources();
        await this.runAfterResourcesLoaded();
    }

    private async runAfterResourcesLoaded() {
        this.blockManager = new BlockManager(Game.img_block);
        this.ballManager = new BallManager(Game.img_ball, () => {
                return this.blockManager.getBlocks();
            });
        this.scoreRenderer = new ScoreRenderer();
        this.sessionRenderer = new SessionRenderer();

        const canvas = document.getElementById("gamecanvas") as HTMLCanvasElement;
        canvas.width = Game.WIDTH;
        canvas.height = Game.HEIGHT;

        // 初期のカーソル
        canvas.style.cursor = "url('" + Game.img_cursor.src + "'), auto";

        // マウスやキーのイベントリスナーの設定
        this.eventListenInit(canvas);

        if (window.performance.now) {
            console.log("Using high performance timer");
            this.getTimestamp = () => window.performance.now();
        } else {
            if ((window.performance as any).webkitNow) {
                console.log("Using webkit high performance timer");
                this.getTimestamp = () => (window.performance as any).webkitNow();
            } else {
                console.log("Using low performance timer");
                this.getTimestamp = () => new Date().getTime();
            }
        }

        // engine
        const g2d = canvas.getContext("2d") as CanvasRenderingContext2D;

        await this.initialize();

        const gameloop = () => {
            this.update();
            this.render(g2d);
            requestAnimationFrame(gameloop);
        };

        requestAnimationFrame(gameloop);
    }

    public async initialize() {
        this.gameState.init();
        this.ballManager.init();
        await this.blockManager.init();
        this.scoreRenderer.init();
        this.sessionRenderer.init();
        console.log("Game#initialied()   state: " + this.gameState.state);

        // mp3Menu = new MP3Player(url_menuMP3, true); //タイトル画面の時のBGMをループ再生(別スレッド)
    }

    public update() {
        this.gameState = this.ballManager.update(this.gameState);
        this.gameState = this.blockManager.update(this.gameState);
        this.gameState = this.scoreRenderer.update(this.gameState);

        // スscoreRenderer(テータスパネル描画)のターン数やボール数,スコアを更新
        this.scoreRenderer.setWaveCount(this.gameState.getWaveCount());
        this.scoreRenderer.setBallCount(this.ballManager.getBallCount() );
        this.scoreRenderer.setScore(this.gameState.getScore());
        // gameStateのボール数を更新
        this.gameState.setBallCount(this.ballManager.getBallCount());

        this.sessionRenderer.update(this.gameState);

        // もしGameOverでBGMがまだなっていたら止める
        // if (this.gameState.state == State.GAMEOVER) { // && mp3mainGame != null) {
        //      this.mp3mainGame.stop();
        //      this.mp3mainGame = null;
        // }

        // デバック用
        if (--this.runChecker < 0) {
            this.runChecker = Game.RUNCHECK_INTERVAL;
            console.log("[RUNNING] update()" + "\tstate: " + this.gameState.state);
        }
    }

    public render(g2d: CanvasRenderingContext2D) {
        g2d.drawImage(Game.img_hexagonBack, 0, 0);
        this.ballManager.draw(g2d);
        this.blockManager.draw(g2d);

        g2d.drawImage(Game.img_floor, 0, Game.FLOOR_Y);
        this.scoreRenderer.draw(g2d);

        switch (this.gameState.state) {
            case State.MAIN_MENU:
            case State.GAMEOVER:
            case State.RETURNABLE_TO_MENU:
                this.sessionRenderer.draw(g2d, this.gameState);
                break;
        }

        // デバック用
//        if (--runChecker < 0) {
//            runChecker = RUNCHECK_INTERVAL;
//            System.out.println("[RUNNING] render()");
//        }
    }

    private eventListenInit(canvas: HTMLCanvasElement) {
        canvas.addEventListener("mousedown", (e: any) => {
            e.preventDefault();

            const rect = canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            // CLICK_WAITの時にマウスの左ボタンがクリックされたら gameState を変更
            console.log("mouse: " + x + ", " + y + "   state: " + this.gameState.state);

            switch (this.gameState.state) {
                // タイトル画面でクリックされたらBGMを変更し,gameStateを変える
                case State.MAIN_MENU:
                    this.gameState.state = State.CLICK_WAIT;
                    break;

                // クリック待ち状態でクリックされた
                case State.CLICK_WAIT:
                    // ボタン,クリック位置の判定
                    if ( y < Game.FLOOR_Y - (Ball.SIZE + 25)
                            && x < Game.STATUS_PANEL_X) {
                        this.gameState.state = State.NOW_CLICKED;
                        this.gameState.mousePos.x = x;
                        this.gameState.mousePos.y = y;
                    }
                    break;

                // GameOverの後
                case State.RETURNABLE_TO_MENU:
                    this.gameState.state = State.MAIN_MENU;
                    this.initialize();
                    break;
            }
        });

        document.addEventListener("keyup", (e) => {
            const key = e.key || e.keyCode;
            if (e.keyCode == 32) {
                if (this.gameState.state != State.CLICK_WAIT) {
                    this.gameState.keyPressed_space = true;
                }
            } else if (key == "Shift") {
                // 初期のカーソル
                if ((canvas.style.cursor || "").includes("url")) {
                    canvas.style.cursor = "";
                } else {
                    canvas.style.cursor = "url('" + Game.img_cursor.src + "'), auto";
                }
            }
        });
    }

    // private void eventListenInit(final Component screen)
    // {
    //     this.screen.addMouseListener(new MouseAdapter()
    //     {
    //         @Override
    //         public void mouseClicked(MouseEvent ev)
    //         {
    //             // CLICK_WAITの時にマウスの左ボタンがクリックされたら gameState を変更
    //             System.out.println("mouse: " + ev.getX() + ", " + ev.getY() + "   state: " + gameState);
    //             Game.this.screen.requestFocus();

    //             switch (gameState.state) {
    //                 // タイトル画面でクリックされたらBGMを変更し,gameStateを変える
    //                 case MAIN_MENU:
    //                     gameState.state = GameState.State.CLICK_WAIT;
    //                     if (mp3Menu != null) {
    //                         mp3Menu.stop();
    //                     }
    //                     mp3mainGame = new MP3Player(url_mainGameMP3, true);
    //                     break;
    //                 // クリック待ち状態でクリックされた
    //                 case CLICK_WAIT:
    //                     //ボタン,クリック位置の判定
    //                     if ( (ev.getButton() == MouseEvent.BUTTON1)
    //                             && ev.getY() < FLOOR_Y - (Ball.SIZE + 25)
    //                             && ev.getX() < STATUS_PANEL_X)
    //                     {
    //                         gameState.state = GameState.State.NOW_CLICKED;
    //                         gameState.mousePos.x = ev.getX();
    //                         gameState.mousePos.y = ev.getY();
    //                     }
    //                     break;

    //                 // GameOverの後
    //                 case RETURNABLE_TO_MENU:
    //                     gameState.state = GameState.State.MAIN_MENU;
    //                     initialize();
    //                     break;
    //             }
    //         }
    //     });

    //     // スペースキーが押されたか
    //     this.screen.addKeyListener(new KeyAdapter()
    //     {
    //         @Override
    //         public void keyPressed(KeyEvent ev)
    //         {
    //             switch (ev.getKeyCode()) {
    //                 case KeyEvent.VK_SPACE:
    //                     if (gameState.state != GameState.State.CLICK_WAIT) {
    //                         gameState.keyPressed_space = true;
    //                     }
    //                     break;
    //             }
    //         }

    //         @Override
    //         public void keyReleased(KeyEvent ev)
    //         {
    //             switch (ev.getKeyCode()) {
    //                 case KeyEvent.VK_SPACE:
    //                     gameState.keyPressed_space = false;
    //                     break;
    //                 case KeyEvent.VK_SHIFT: //シフトキーが押されたらマウスカーソルの画像をトグル
    //                     if (screen.getCursor().equals(cursor_DEFAULT)) {
    //                         screen.setCursor(cursor_MY_CROSS);
    //                     } else {
    //                         screen.setCursor(cursor_DEFAULT);
    //                     }
    //             }
    //         }
    //     });
    // }
}
