export abstract class Sprite {

    public static update(list: Sprite[]) {
        try {
            list.slice().forEach((s, index) => {
                if (s.vanished) {
                    list.splice(index, 1);
                } else {
                    s.update(1);
                }
            });
        } catch (e) {
            console.error(e);
        }
    }

    public static draw(list: Sprite[], g2d: CanvasRenderingContext2D) {
            list.slice().forEach((s, index) => {
                try {
                    if (s.vanished) {
                    list.splice(index, 1);
                    } else if (s.visible) {
                        s.draw(g2d);
                    }
                } catch (e) {
                    console.error(e);
                }
            });
    }
    protected x = 0;
    protected y = 0;
    private vanished = false;
    private visible = true;

    public abstract update(eta: number): void;

    public abstract draw(g2d: CanvasRenderingContext2D): void;

    public isVanished() {
        return this.vanished;
    }
    public vanish() {
        this.vanished = true;
        this.visible = false;
    }

    public isVisible() {
        return this.visible;
    }
    public setVisible(visible: boolean) {
        this.visible = visible;
    }

    public getX() {
        return this.x;
    }
    public setX(x: number) {
        this.x = x;
    }
    public addX(vx: number) {
        return (this.x += vx);
    }

    public getY() {
        return this.y;
    }
    public setY(y: number) {
        this.y = y;
    }
    public addY(vy: number) {
        return (this.y += vy);
    }
}
