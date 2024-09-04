export { EntityType, GameEntity, Enemy };
var EntityType;
(function (EntityType) {
    EntityType[EntityType["None"] = 0] = "None";
    EntityType[EntityType["Bullet"] = 1] = "Bullet";
    EntityType[EntityType["Enemy"] = 2] = "Enemy";
    EntityType[EntityType["Player"] = 3] = "Player";
})(EntityType || (EntityType = {}));
// TODO: move rects to game
class GameEntity {
    constructor(x = 0, y = 0, vx = 0, vy = 0, ax = 0, ay = 0, rect = { x: 0, y: 0, width: 0, height: 0 }, type = EntityType.None) {
        this.x = 0;
        this.y = 0;
        this.vx = 0;
        this.vy = 0;
        this.ax = 0;
        this.ay = 0;
        this.rect = { x: 0, y: 0, width: 0, height: 0 };
        this.alive = true;
        this.type = EntityType.None;
        this.x = x;
        this.y = y;
        this.ax = ax;
        this.ay = ay;
        this.vx = vx;
        this.vy = vy;
        this.rect = rect;
        this.type = type;
    }
    static Copy(other) {
        var obj = new GameEntity();
        obj.x = other.x;
        obj.y = other.y;
        obj.vx = other.vx;
        obj.vy = other.vy;
        obj.ax = other.ax;
        obj.ay = other.ay;
        obj.rect = { x: other.rect.x, y: other.rect.y, width: other.rect.width, height: other.rect.height };
        obj.alive = other.alive;
        obj.type = other.type;
        return obj;
    }
}
class Enemy extends GameEntity {
    constructor(x = 0, y = 0, vx = 0, vy = 0, ax = 0, ay = 0, rect = { x: 0, y: 0, width: 0, height: 0 }, health = 10) {
        super(x, y, vx, vy, ax, ay, rect, EntityType.Enemy);
        this.health = 0;
        this.health = health;
    }
}
