import { vec2 } from 'wgpu-matrix';
import { isColliding } from 'collision';
import { createUniformBuffer } from 'web_gpu';
export { EntityType, GameEntity, Enemy, BigEnemy, WaveHandler, BossFight, HitBox, CharacterEntity, ParticleEntity, IntroAnimation };
var EntityType;
(function (EntityType) {
    EntityType[EntityType["None"] = 0] = "None";
    EntityType[EntityType["Bullet"] = 1] = "Bullet";
    EntityType[EntityType["Enemy"] = 2] = "Enemy";
    EntityType[EntityType["Player"] = 3] = "Player";
    EntityType[EntityType["Projectile"] = 4] = "Projectile";
    EntityType[EntityType["BigEnemy"] = 5] = "BigEnemy";
    EntityType[EntityType["HitBox"] = 6] = "HitBox";
    EntityType[EntityType["Particle"] = 7] = "Particle";
    EntityType[EntityType["Intro"] = 8] = "Intro";
    EntityType[EntityType["Explosion"] = 9] = "Explosion";
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
        this.keepOffScreen = false;
        this.x = x;
        this.y = y;
        this.ax = ax;
        this.ay = ay;
        this.vx = vx;
        this.vy = vy;
        this.rect = rect;
        this.type = type;
        this.uniformBuffer = createUniformBuffer();
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
class ParticleEntity extends GameEntity {
    constructor(x = 0, y = 0, vx = 0, vy = 0, ax = 0, ay = 0, rect = { x: 0, y: 0, width: 0, height: 0 }) {
        super(x, y, vx, vy, ax, ay, rect, EntityType.Particle);
        this.color = [1, 1, 1, 1];
        this.fadeRate = 0;
        this.angularVelocity = 1;
        this.rotation = 0;
        this.lifetime = 0;
    }
    Update(deltaTime) {
        super.Update(deltaTime);
        this.rotation += deltaTime * 4 * this.angularVelocity;
        if (this.rotation > Math.PI * 2)
            this.rotation = 0;
        this.color[3] -= deltaTime * this.fadeRate;
        if (this.color[3] < 0) {
            this.color[3] = 0;
            //this.alive = false;
        }
    }
}
// AKA player entity
class CharacterEntity extends GameEntity {
    constructor() {
        super(...arguments);
        this.charHealth = 1;
        this.charShootTimer = 0;
        this.slowTime = 0;
        this.slowRecharging = true;
        this.charFacing = 1;
        this.charShooting = false;
        this.charSwinging = false;
        this.charSwingTime = 0;
        this.charSwingTimeMax = 1.0;
        this.tempAx = 0;
        this.tempAy = 0;
        this.tempVx = 0;
        this.tempVy = 0;
        this.cachedPhys = false;
    }
    Update(deltaTime) {
        if (this.charSwinging && !this.cachedPhys) {
            this.tempAx = this.ax;
            this.tempAy = this.ay;
            this.tempVx = this.vx;
            this.tempVy = this.vy;
            this.cachedPhys = true;
            console.log("char update swing");
        }
        else if (!this.charSwinging && this.cachedPhys) {
            this.ax = this.tempAx;
            this.ay = this.tempAy;
            this.vx = this.tempVx;
            this.vy = this.tempVy;
            this.cachedPhys = false;
        }
        if (this.charSwinging) {
            this.ax = 0;
            this.ay = 0;
            this.vx = 0;
            this.vy = 0;
        }
        //super.Update(deltaTime);
    }
}
class BossFight {
    constructor() {
        this.currentHealth = 1000;
        this.maxHealth = 1000;
    }
}
class HitBox extends GameEntity {
    constructor(x = 0, y = 0, vx = 0, vy = 0, ax = 0, ay = 0, rect = { x: 0, y: 0, width: 0, height: 0 }, worldEntityList, damage = 10) {
        super(x, y, vx, vy, ax, ay, rect, EntityType.HitBox);
        this.worldList = worldEntityList;
        this.damage = damage;
        this.damaged = new Set();
        this.parent = new GameEntity();
        this.localX = x;
        this.localY = y;
    }
    Update(deltaTime) {
        this.x = this.parent.x + this.localX;
        this.y = this.parent.y + this.localY;
        this.rect.x = this.parent.x - this.rect.width / 2;
        this.rect.y = this.parent.y - this.rect.height / 2;
        this.rect.x += Math.sign(this.localX) * this.rect.width;
        for (var entity of this.worldList) {
            if (isColliding(this.rect, entity.rect) && this != entity) {
                this.OnCollision(entity);
            }
        }
    }
    OnCollision(other) {
        console.log("collding");
        if ((other.type == EntityType.BigEnemy || other.type == EntityType.Enemy) && !this.damaged.has(other)) {
            var enemy = other;
            enemy.health -= this.damage;
            this.damaged.add(other);
        }
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
        this.startUp = false;
        this.bossFight = bossFight;
        this.worldList = worldEntityList;
    }
    Start() {
        this.startUp = true;
        this.bossFight.currentHealth = 0;
    }
    Update(deltaTime) {
        this.UpdateInternal(deltaTime);
    }
    UpdateInternal(deltaTime) {
        if (this.startUp) {
            this.bossFight.currentHealth += deltaTime * 1000;
            if (this.bossFight.currentHealth >= this.bossFight.maxHealth) {
                this.bossFight.currentHealth = this.bossFight.maxHealth;
                this.startUp = false;
                var enemy = new BigEnemy(-1.1, 0, 0, 0, 0, 0, { x: 0, y: 0, width: 0.4, height: 0.4 }, this.worldList, 100);
                this.worldList.push(enemy);
                this.spawnedList.push(enemy);
            }
        }
        else {
            this.ChooseWave(deltaTime);
        }
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
function PushNewEntity(worldEntities, dir, rect = { x: 0, y: 0, width: 0.1, height: 0.1 }, type = EntityType.Projectile) {
    worldEntities.push(new GameEntity(rect.x, rect.y, dir[0], dir[1], 0, 0, rect, type));
}
class Enemy extends GameEntity {
    constructor(x = 0, y = 0, vx = 0, vy = 0, ax = 0, ay = 0, rect = { x: 0, y: 0, width: 0, height: 0 }, worldEntities, health = 10, dir = [(Math.random() * 2) - 1, (Math.random() * 2) - 1]) {
        super(x, y, vx, vy, ax, ay, rect, EntityType.Enemy);
        this.health = 0;
        this.maxHealth = 0;
        this.shootDelay = 0;
        this.onCooldown = false;
        this.maxCooldownDelay = 1.5;
        this.flashing = false;
        this.flashingQueue = false;
        this.flashingUpTime = 0.16;
        this.flashTime = 0.0;
        this.flashTimeCooldown = 0.0;
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
        this.flashTime = this.flashingUpTime;
        this.flashTimeCooldown = 0;
        this.hpUniform = createUniformBuffer();
        this.hpUniformBg = createUniformBuffer();
    }
    Update(deltaTime) {
        super.Update(deltaTime);
        this.shootDelay -= deltaTime;
        this.UpdateInternal(deltaTime);
        if (this.health <= 0) {
            this.alive = false;
        }
        if (this.flashing && this.flashTimeCooldown <= 0) {
            this.flashTime -= deltaTime;
            if (this.flashTime <= 0) {
                console.log("Flash time under");
                if (!this.flashingQueue) {
                    this.flashing = false;
                }
                this.flashingQueue = false;
                this.flashTimeCooldown = this.flashingUpTime;
                this.flashTime = this.flashingUpTime;
            }
        }
        else if (this.flashTimeCooldown > 0) {
            this.flashing = false;
            this.flashTimeCooldown -= deltaTime;
        }
    }
    SetFlashing(val) {
        if (this.flashing)
            this.flashingQueue = true;
        this.flashing = val; // && this.flashTimeCooldown <= 0;
    }
    GetFlashing() {
        return this.flashing;
    }
    SpawnProjectile(dir, rect = { x: this.x, y: this.y, width: 0.1, height: 0.1 }, delayReset = Math.PI / 20) {
        PushNewEntity(this.worldEntities, dir, rect);
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
        this.type = EntityType.BigEnemy;
    }
    Update(deltaTime) {
        super.Update(deltaTime);
    }
    UpdateInternal(deltaTime) {
        if (this.shootDelay <= 0) {
            this.loop += deltaTime * 100;
            this.loop %= Math.PI * 2;
            this.SpawnProjectile(this.shootDir, { x: this.x, y: this.y + (Math.sin(this.loop) * 0.1), width: 0.1, height: 0.1 }, Math.PI / 20);
        }
    }
}
class IntroAnimation extends GameEntity {
    constructor(worldEntityList) {
        super(0, 0, 0, 0, 0, 0, { x: 0, y: 0, width: 0, height: 0 }, EntityType.None);
        this.timer = 0;
        this.imgsSpawned = 0;
        this.curImgTime = 0;
        this.timePerImg = 0.05;
        this.totalImgs = 20;
        this.curImgs = 0;
        this.xPos = -1.4;
        this.yPos = 0;
        this.worldEntities = worldEntityList;
    }
    Reset() {
        this.curImgTime = 0.0;
        this.curImgs = 0.0;
    }
    Update(deltaTime) {
        super.Update(deltaTime);
        this.curImgTime += deltaTime;
        if (this.curImgTime >= this.timePerImg && this.curImgs < this.totalImgs) {
            var b = (this.curImgs / this.totalImgs);
            var part = new ParticleEntity(this.xPos, this.yPos, 0, 0, 0, 0, { x: this.xPos, y: this.yPos, width: 0.1 + 1.7 * b, height: 0.1 + 1.7 * b });
            part.type = EntityType.Intro;
            part.keepOffScreen = false;
            part.fadeRate = this.curImgs < this.totalImgs - 1 ? 1.0 : 0.0;
            var a = (1.0 - b);
            part.color = [1.0 * a + b, b, b, 1.0];
            part.angularVelocity = this.curImgs < this.totalImgs - 1 ? 0.5 : 0.0;
            this.worldEntities.push(part);
            this.xPos += 0.05;
            this.curImgTime = 0;
            this.curImgs += 1;
        }
    }
}
