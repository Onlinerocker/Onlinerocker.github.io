import { vec2 } from 'wgpu-matrix';
export { EntityType, GameEntity, Enemy, BigEnemy, WaveHandler, BossFight };
var EntityType;
(function (EntityType) {
    EntityType[EntityType["None"] = 0] = "None";
    EntityType[EntityType["Bullet"] = 1] = "Bullet";
    EntityType[EntityType["Enemy"] = 2] = "Enemy";
    EntityType[EntityType["Player"] = 3] = "Player";
    EntityType[EntityType["Projectile"] = 4] = "Projectile";
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
    Update(deltaTime) {
        // maybe we separate this to a physics update function
        this.vx += this.ax * deltaTime;
        this.vy += this.ay * deltaTime;
        this.x += this.vx * deltaTime;
        this.y += this.vy * deltaTime;
        this.rect.x = this.x - (this.rect.width / 2);
        this.rect.y = this.y - (this.rect.height / 2);
    }
}
class BossFight {
    constructor() {
        this.currentHealth = 1000;
        this.maxHealth = 1000;
    }
}
class WaveHandler extends GameEntity {
    constructor(bossFight, startPoint, worldEntityList) {
        super(0, 0, 0, 0, 0, 0, { x: 0, y: 0, width: 0, height: 0 }, EntityType.None);
        this.spawnedList = new Array();
        this.lastSpawnPoint = 0;
        this.enemySpawnPoints = [[1, 0.65], [-1, -0.75], [-1, 0.65], [1, -0.75]];
        this.enemySpawnPointDirs = [[-1, 0], [1, 0], [0, -1], [0, 1]];
        this.spawnDelay = 0;
        this.maxSpawnDelay = 2.0;
        this.pendingSpawn = 0;
        this.bossFight = bossFight;
        this.worldList = worldEntityList;
    }
    Start() {
        var enemy = new BigEnemy(-1.1, 0, 0, 0, 0, 0, { x: 0, y: 0, width: 0.4, height: 0.4 }, this.worldList, 100);
        this.worldList.push(enemy);
        this.spawnedList.push(enemy);
    }
    Update(deltaTime) {
        this.UpdateInternal(deltaTime);
    }
    UpdateInternal(deltaTime) {
        this.ChooseWave(deltaTime);
    }
    ChooseWave(deltaTime) {
        if (this.bossFight.currentHealth <= 0) {
        }
        else if (this.bossFight.currentHealth <= 50) {
            this.RunWave3(deltaTime);
        }
        else if (this.bossFight.currentHealth <= 250) {
            this.RunWave4(deltaTime);
        }
        else if (this.bossFight.currentHealth <= 300) {
            this.RunWave3(deltaTime);
        }
        else if (this.bossFight.currentHealth <= 500) {
            this.RunWave4(deltaTime);
        }
        else if (this.bossFight.currentHealth <= 650) {
            this.RunWave3(deltaTime);
        }
        else if (this.bossFight.currentHealth <= 750) {
            this.RunWave2(deltaTime);
        }
        else if (this.bossFight.currentHealth <= 1000) {
            this.RunWave1(deltaTime);
        }
        // other waves go here
    }
    SpawnSpiralEnemy() {
        var inc = Math.floor(Math.random() * 3 + 1);
        this.lastSpawnPoint += inc;
        this.lastSpawnPoint %= 4;
        var point = this.enemySpawnPoints[this.lastSpawnPoint];
        var newEnemyDir = this.enemySpawnPointDirs[this.lastSpawnPoint];
        var enemy = new Enemy(point[0], point[1], 0, 0, 0, 0, { x: 0, y: 0, width: 0.2, height: 0.2 }, this.worldList, 10, [newEnemyDir[0], newEnemyDir[1]]);
        this.spawnedList.push(enemy);
        this.worldList.push(enemy);
    }
    RunWave1(deltaTime) {
        var amtAlive = 0;
        for (var e of this.spawnedList) {
            if (e.alive) {
                ++amtAlive;
            }
        }
        if (amtAlive == 0) {
            this.spawnedList.splice(0, this.spawnedList.length);
            this.SpawnSpiralEnemy();
        }
    }
    RunWave2(deltaTime) {
        var amtAlive = 0;
        for (var e of this.spawnedList) {
            if (e.alive) {
                ++amtAlive;
            }
        }
        if (amtAlive == 0) {
            this.spawnedList.splice(0, this.spawnedList.length);
            var inc = Math.floor(Math.random() * 3 + 1);
            this.lastSpawnPoint += inc;
            this.lastSpawnPoint %= 4;
            var point = this.enemySpawnPoints[this.lastSpawnPoint];
            var newEnemyDir = this.enemySpawnPointDirs[this.lastSpawnPoint];
            var enemy = new BigEnemy(1.1, -0.27, 0, 0, 0, 0, { x: 0, y: 0, width: 0.4, height: 0.4 }, this.worldList, 100);
            enemy.shootDir = [-1, 0];
            this.spawnedList.push(enemy);
            this.worldList.push(enemy);
            console.log("wave 2");
        }
    }
    RunWave3(deltaTime) {
        var amtAlive = 0;
        for (var e of this.spawnedList) {
            if (e.alive) {
                ++amtAlive;
            }
        }
        if (amtAlive == 0) {
            if (this.spawnDelay > 0) {
                this.spawnDelay -= deltaTime;
                if (this.spawnDelay > 0) {
                    return;
                }
            }
            if (this.pendingSpawn == 0 && Math.random() < 0.5) {
                this.pendingSpawn = 2;
                this.spawnDelay = this.maxSpawnDelay;
                return;
            }
            this.spawnedList.splice(0, this.spawnedList.length);
            if (this.spawnDelay <= 0 && this.pendingSpawn == 2) {
                this.SpawnSpiralEnemy();
                this.SpawnSpiralEnemy();
                this.pendingSpawn = 0;
            }
            else
                this.SpawnSpiralEnemy();
        }
    }
    RunWave4(deltaTime) {
        var amtAlive = 0;
        for (var e of this.spawnedList) {
            if (e.alive) {
                ++amtAlive;
            }
        }
        if (amtAlive == 0) {
            this.spawnedList.splice(0, this.spawnedList.length);
            var inc = Math.floor(Math.random() * 3 + 1);
            this.lastSpawnPoint += inc;
            this.lastSpawnPoint %= 4;
            var enemy = new BigEnemy(1.1, -0.27, 0, 0, 0, 0, { x: 0, y: 0, width: 0.4, height: 0.4 }, this.worldList, 100);
            enemy.shootDir = [-1, 0];
            this.spawnedList.push(enemy);
            this.worldList.push(enemy);
            var enemy1 = new BigEnemy(-1.1, 0.6, 0, 0, 0, 0, { x: 0, y: 0, width: 0.4, height: 0.4 }, this.worldList, 100);
            enemy1.shootDir = [1, 0];
            this.spawnedList.push(enemy1);
            this.worldList.push(enemy1);
        }
    }
}
class Enemy extends GameEntity {
    constructor(x = 0, y = 0, vx = 0, vy = 0, ax = 0, ay = 0, rect = { x: 0, y: 0, width: 0, height: 0 }, worldEntities, health = 10, dir = [(Math.random() * 2) - 1, (Math.random() * 2) - 1]) {
        super(x, y, vx, vy, ax, ay, rect, EntityType.Enemy);
        this.health = 0;
        this.maxHealth = 0;
        this.shootDelay = 0;
        this.onCooldown = false;
        this.maxCooldownDelay = 1.5;
        this.health = health;
        this.maxHealth = health;
        this.worldEntities = worldEntities;
        var projVx = dir[0];
        var projVy = dir[1];
        this.dir = vec2.create(projVx, projVy);
        this.startingDir = vec2.copy(this.dir);
        vec2.normalize(this.dir, this.dir);
        vec2.mul(this.dir, [1, 1], this.dir);
        this.cooldownDelay = this.maxCooldownDelay;
    }
    Update(deltaTime) {
        super.Update(deltaTime);
        this.shootDelay -= deltaTime;
        this.UpdateInternal(deltaTime);
    }
    SpawnProjectile(dir, rect = { x: this.x, y: this.y, width: 0.1, height: 0.1 }, delayReset = Math.PI / 20) {
        this.worldEntities.push(new GameEntity(rect.x, rect.y, dir[0], dir[1], 0, 0, rect, EntityType.Projectile));
        this.shootDelay = delayReset;
    }
    UpdateInternal(deltaTime) {
        if (this.onCooldown) {
            this.cooldownDelay -= deltaTime;
            if (this.cooldownDelay <= 0) {
                this.onCooldown = false;
            }
            else {
                return;
            }
        }
        let dir = this.dir;
        let prevDir = vec2.copy(dir);
        vec2.rotate(dir, [0, 0, 1], Math.PI * deltaTime * 0.5, dir);
        if (vec2.dot(this.dir, this.startingDir) > 0 &&
            vec2.dot(vec2.sub(this.startingDir, prevDir), vec2.sub(this.startingDir, this.dir)) < 0) {
            this.onCooldown = true;
            this.cooldownDelay = this.maxCooldownDelay;
        }
        if (this.shootDelay <= 0) {
            this.SpawnProjectile([dir[0], dir[1]]);
        }
    }
}
class BigEnemy extends Enemy {
    constructor(x = 0, y = 0, vx = 0, vy = 0, ax = 0, ay = 0, rect = { x: 0, y: 0, width: 0, height: 0 }, worldEntities, health = 10) {
        super(x, y, vx, vy, ax, ay, rect, worldEntities, health);
        this.loop = 0;
        this.shootDir = [1, 0];
    }
    Update(deltaTime) {
        super.Update(deltaTime);
    }
    UpdateInternal(deltaTime) {
        if (this.shootDelay <= 0) {
            this.loop += deltaTime * 100;
            //this.loop %= Math.PI*2;
            this.SpawnProjectile(this.shootDir, { x: this.x, y: this.y + (Math.sin(this.loop) * 0.1), width: 0.1, height: 0.1 }, Math.PI / 20);
        }
    }
}
