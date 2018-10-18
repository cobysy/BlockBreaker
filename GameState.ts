import { Point } from './Point';
import { BallManager } from './BallManager';

// ゲームの状態
 export enum State
 {
     MAIN_MENU,
     CLICK_WAIT,
     NOW_CLICKED,
     BALL_FLYING,
     BLOCK_DOWN,
     GAMEOVER,
     RETURNABLE_TO_MENU
 }

export class GameState {
    public state: State;
    public mousePos = new Point(); //クリックされた位置
    public keyPressed_space = false; //スペースキーが押されていればtrue
    public bonusPos: Point[] = [];

    private waveCount = 0; //ターン数
    private ballCount = 0; //ボールの数
    private score = 0;     //スコア

    public init()
    {
        this.state = State.MAIN_MENU;
        this.keyPressed_space = false;
        this.waveCount = 1;
        this.ballCount = BallManager.DEFAULT_BALL_COUNT;
        this.score = 0;
        this.bonusPos = [];
    }

    public countUpWave()
    {
        this.waveCount++;
    }
    public getWaveCount()
    {
        return this.waveCount;
    }
    public getBallCount()
    {
        return this.ballCount;
    }
    public setBallCount(n: number)
    {
        this.ballCount = n;
    }

    public getScore()
    {
        return this.score;
    }
    public addScore(n: number)
    {
        this.score += n;
    }


    public toString()
    {
        return this.state.toString() + " / " + this.mousePos.toString();
    }
}