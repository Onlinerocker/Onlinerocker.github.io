import { Rect } from "collision";
export {EntityType, GameEntity, Enemy}

enum EntityType
{
    None = 0,
    Bullet,
    Enemy,
    Player,
}

// TODO: move rects to game
class GameEntity
{
    x: number = 0;
    y: number = 0;
    vx: number = 0;
    vy: number = 0;
    ax: number = 0;
    ay: number = 0;
    rect: Rect = {x: 0, y: 0, width: 0, height: 0};
    alive: boolean = true;
    type: EntityType = EntityType.None;

    constructor(x: number = 0, y: number = 0, vx: number = 0, vy: number = 0, 
        ax: number = 0, ay: number = 0, rect: Rect = {x: 0, y: 0, width: 0, height: 0}, 
        type: EntityType = EntityType.None)
    {
        this.x = x;
        this.y = y;
        this.ax = ax;
        this.ay = ay;
        this.vx = vx;
        this.vy = vy;
        this.rect = rect;
        this.type = type;
    }

    static Copy(other: GameEntity): GameEntity
    {
        var obj: GameEntity = new GameEntity();
        obj.x = other.x;
        obj.y = other.y;
        obj.vx = other.vx;
        obj.vy = other.vy;
        obj.ax = other.ax;
        obj.ay = other.ay;
        obj.rect = {x: other.rect.x, y:other.rect.y, width: other.rect.width, height: other.rect.height};
        obj.alive = other.alive;
        obj.type = other.type;
        return obj;
    }
}

class Enemy extends GameEntity
{
    health: number = 0;

    constructor(x: number = 0, y: number = 0, vx: number = 0, vy: number = 0, 
        ax: number = 0, ay: number = 0, rect: Rect = {x: 0, y: 0, width: 0, height: 0},
        health: number = 10)
    {
        super(x,y,vx,vy,ax,ay,rect,EntityType.Enemy);
        this.health = health;
    }
}