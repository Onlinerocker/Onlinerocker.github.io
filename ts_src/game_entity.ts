import { Rect } from 'collision';
import { vec2 } from 'wgpu-matrix'
import { isColliding } from 'collision';
export {EntityType, GameEntity, Enemy, BigEnemy, WaveHandler, BossFight, HitBox, CharacterEntity, ParticleEntity}

enum EntityType
{
    None = 0,
    Bullet,
    Enemy,
    Player,
    Projectile,
    BigEnemy,
    HitBox,
    Particle,
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
    keepOffScreen: boolean = false;

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

    public Update(deltaTime: number)
    {
        // maybe we separate this to a physics update function
        this.vx += this.ax * deltaTime;
        this.vy += this.ay * deltaTime;
        this.x += this.vx * deltaTime;
        this.y += this.vy * deltaTime;
        this.rect.x = this.x - (this.rect.width/2);
        this.rect.y = this.y - (this.rect.height/2);
    }
}

class ParticleEntity extends GameEntity
{
    color: [number, number, number, number] = [1, 1, 1, 1];
    fadeRate: number = 0;
    angularVelocity: number = 1;
    rotation: number = 0;
    lifetime: number = 0;

    constructor(x: number = 0, y: number = 0, vx: number = 0, vy: number = 0, 
        ax: number = 0, ay: number = 0, rect: Rect = {x: 0, y: 0, width: 0, height: 0})
    {
        super(x, y, vx, vy, ax, ay, rect, EntityType.Particle);
    }

    public Update(deltaTime: number) 
    {
        super.Update(deltaTime);

        this.rotation += deltaTime*4;
        if (this.rotation > Math.PI * 2) this.rotation = 0;

        this.color[3] -= deltaTime * this.fadeRate;
        if (this.color[3] < 0)
        {
            this.color[3] = 0;
            //this.alive = false;
        }
    }
}

// AKA player entity
class CharacterEntity extends GameEntity
{
    charHealth: number = 1;
    charShootTimer: number = 0;
    slowTime: number = 0;
    slowRecharging: boolean = true;
    charFacing: number = 1;
    charShooting: boolean = false;
    charSwinging: boolean = false;
    charSwingTime: number = 0;
    charSwingTimeMax: number = 1.0;

    private tempAx: number = 0;
    private tempAy: number = 0;
    private tempVx: number = 0;
    private tempVy: number = 0;
    private cachedPhys: boolean = false;

    public Update(deltaTime: number)
    {
        if (this.charSwinging && !this.cachedPhys)
        {
            this.tempAx = this.ax;
            this.tempAy = this.ay;
            this.tempVx = this.vx;
            this.tempVy = this.vy;

            this.cachedPhys = true;
            console.log("char update swing");
        }
        else if (!this.charSwinging && this.cachedPhys)
        {
            this.ax = this.tempAx;
            this.ay = this.tempAy;
            this.vx = this.tempVx;
            this.vy = this.tempVy;
            this.cachedPhys = false;
        }
        if (this.charSwinging)
        {
            this.ax = 0;
            this.ay = 0;
            this.vx = 0;
            this.vy = 0;
        }

        //super.Update(deltaTime);
    }
}

class BossFight
{
    currentHealth: number = 1000;
    maxHealth: number = 1000;
}

class HitBox extends GameEntity
{
    damage: number;
    parent: GameEntity;
    private worldList: Array<GameEntity>;
    private damaged: Set<GameEntity>; // maybe we don't want this sometimes
    private localX: number;
    private localY: number;

    constructor(x: number = 0, y: number = 0, vx: number = 0, vy: number = 0, 
        ax: number = 0, ay: number = 0, rect: Rect = {x: 0, y: 0, width: 0, height: 0}, 
        worldEntityList: Array<GameEntity>, damage: number = 10)
    {
        super(x, y, vx, vy, ax, ay, rect, EntityType.HitBox);
        this.worldList = worldEntityList;
        this.damage = damage;
        this.damaged = new Set();
        this.parent = new GameEntity();
        this.localX = x;
        this.localY = y;
    }

    public Update(deltaTime: number): void 
    {
        this.x = this.parent.x + this.localX;
        this.y = this.parent.y + this.localY;
        this.rect.x = this.parent.x - this.rect.width/2;
        this.rect.y = this.parent.y - this.rect.height/2;
        this.rect.x += Math.sign(this.localX)*this.rect.width;
        for (var entity of this.worldList)
        {
            if (isColliding(this.rect, entity.rect) && this != entity)
            {
                this.OnCollision(entity);
            }
        }
    }

    public OnCollision(other: GameEntity)
    {
        console.log("collding");
        if ((other.type == EntityType.BigEnemy || other.type == EntityType.Enemy) && !this.damaged.has(other))
        {
            var enemy: Enemy = (other as Enemy);
            enemy.health -= this.damage;
            this.damaged.add(other);
        }
    } 
}

class WaveHandler extends GameEntity
{
    bossFight: BossFight;

    private spawnedList: Array<GameEntity> = new Array();
    private lastSpawnPoint: number = 0;
    private worldList: Array<GameEntity>;
    private enemySpawnPoints = [[1, 0.65], [-1, -0.75], [-1, 0.65], [1, -0.75]];
    private enemySpawnPointDirs = [[-1, 0], [1, 0], [0, -1], [0, 1]];
    private spawnDelay: number = 0;
    private maxSpawnDelay: number = 2.0;
    private pendingSpawn: number = 0;
    private startUp: boolean = false;

    constructor(bossFight: BossFight, startPoint: number, worldEntityList: Array<GameEntity>)
    {
        super(0, 0, 0, 0, 0, 0, {x: 0, y: 0, width: 0, height: 0}, EntityType.None);
        this.bossFight = bossFight;
        this.worldList = worldEntityList;
    }

    public Start()
    {
        this.startUp = true;
        this.bossFight.currentHealth = 0;
    }

    public Update(deltaTime: number): void 
    {
        this.UpdateInternal(deltaTime);
    }

    public UpdateInternal(deltaTime: number)
    {
        if (this.startUp)
        {
            this.bossFight.currentHealth += deltaTime * 1000;
            if (this.bossFight.currentHealth >= this.bossFight.maxHealth)
            {
                this.bossFight.currentHealth = this.bossFight.maxHealth;
                this.startUp = false;

                var enemy: BigEnemy = new BigEnemy(-1.1, 0, 0, 0, 0, 0, {x:0, y:0, width:0.4, height:0.4}, this.worldList, 100);
                this.worldList.push(enemy);
                this.spawnedList.push(enemy);
            }
        }
        else
        {
            this.ChooseWave(deltaTime);
        }
    }

    public ChooseWave(deltaTime: number)
    {
        if (this.bossFight.currentHealth <= 0)
        {

        }
        else if (this.bossFight.currentHealth <= 50)
        {
            this.RunWave3(deltaTime);
        }
        else if (this.bossFight.currentHealth <= 250)
        {
            this.RunWave4(deltaTime);
        }
        else if (this.bossFight.currentHealth <= 300)
        {
            this.RunWave3(deltaTime);
        }
        else if (this.bossFight.currentHealth <= 500)
        {
            this.RunWave4(deltaTime);
        }
        else if (this.bossFight.currentHealth <= 650)
        {
            this.RunWave3(deltaTime);
        }
        else if (this.bossFight.currentHealth <= 750)
        {
            this.RunWave2(deltaTime);
        }
        else if (this.bossFight.currentHealth <= 1000)
        {
            this.RunWave1(deltaTime);
        }
        // other waves go here
    }

    public SpawnSpiralEnemy()
    {
        var inc = Math.floor(Math.random() * 3 + 1);
        this.lastSpawnPoint += inc;
        this.lastSpawnPoint %= 4;
        var point = this.enemySpawnPoints[this.lastSpawnPoint];
        var newEnemyDir = this.enemySpawnPointDirs[this.lastSpawnPoint];
        var enemy: Enemy = new Enemy(point[0], point[1], 0, 0, 0, 0, {x:0, y:0, width:0.2, height:0.2}, this.worldList, 10, [newEnemyDir[0], newEnemyDir[1]]);
        this.spawnedList.push(enemy);
        this.worldList.push(enemy);
    }

    public RunWave1(deltaTime: number)
    {
        var amtAlive = 0;
        for (var e of this.spawnedList)
        {
            if (e.alive)
            {
                ++amtAlive;
            }
        }
        if (amtAlive == 0)
        {
            this.spawnedList.splice(0, this.spawnedList.length);
            this.SpawnSpiralEnemy();
        }
    }

    public RunWave2(deltaTime: number)
    {
        var amtAlive = 0;
        for (var e of this.spawnedList)
        {
            if (e.alive)
            {
                ++amtAlive;
            }
        }
        if (amtAlive == 0)
        {
            this.spawnedList.splice(0, this.spawnedList.length);
            var inc = Math.floor(Math.random() * 3 + 1);
            this.lastSpawnPoint += inc;
            this.lastSpawnPoint %= 4;
            var point = this.enemySpawnPoints[this.lastSpawnPoint];
            var newEnemyDir = this.enemySpawnPointDirs[this.lastSpawnPoint];
            var enemy: BigEnemy = new BigEnemy(1.1, -0.27, 0, 0, 0, 0, {x:0, y:0, width:0.4, height:0.4}, this.worldList, 100);
            enemy.shootDir = [-1,0];
            this.spawnedList.push(enemy);
            this.worldList.push(enemy);
            console.log("wave 2");
        }
    }

    public RunWave3(deltaTime: number)
    {
        var amtAlive = 0;
        for (var e of this.spawnedList)
        {
            if (e.alive)
            {
                ++amtAlive;
            }
        }
        if (amtAlive == 0)
        {
            if (this.spawnDelay > 0)
            {
                this.spawnDelay -= deltaTime;
                if (this.spawnDelay > 0)
                {
                    return;
                }
            }
            if (this.pendingSpawn == 0 && Math.random() < 0.5)
            {
                this.pendingSpawn = 2;
                this.spawnDelay = this.maxSpawnDelay;
                return;
            }
            this.spawnedList.splice(0, this.spawnedList.length);
            if (this.spawnDelay <= 0 && this.pendingSpawn == 2)
            {
                this.SpawnSpiralEnemy();
                this.SpawnSpiralEnemy();
                this.pendingSpawn = 0;
            }
            else
                this.SpawnSpiralEnemy();
        }
    }

    public RunWave4(deltaTime: number)
    {
        var amtAlive = 0;
        for (var e of this.spawnedList)
        {
            if (e.alive)
            {
                ++amtAlive;
            }
        }
        if (amtAlive == 0)
        {
            this.spawnedList.splice(0, this.spawnedList.length);
            var inc = Math.floor(Math.random() * 3 + 1);
            this.lastSpawnPoint += inc;
            this.lastSpawnPoint %= 4;
            var enemy: BigEnemy = new BigEnemy(1.1, -0.27, 0, 0, 0, 0, {x:0, y:0, width:0.4, height:0.4}, this.worldList, 100);
            enemy.shootDir = [-1,0];
            this.spawnedList.push(enemy);
            this.worldList.push(enemy);

            var enemy1: BigEnemy = new BigEnemy(-1.1, 0.6, 0, 0, 0, 0, {x:0, y:0, width:0.4, height:0.4}, this.worldList, 100);
            enemy1.shootDir = [1,0];
            this.spawnedList.push(enemy1);
            this.worldList.push(enemy1);
            
        }
    }
}

class Enemy extends GameEntity
{
    health: number = 0;
    maxHealth: number = 0;
    worldEntities: Array<GameEntity>;
    shootDelay: number = 0;
    dir: Float32Array;
    startingDir: Float32Array;
    onCooldown: boolean = false;
    cooldownDelay: number;
    maxCooldownDelay: number = 1.5;
    private flashing: boolean = false;
    private flashingQueue: boolean = false;
    private flashingUpTime: number = 0.16;
    flashTime: number = 0.0;
    flashTimeCooldown: number = 0.0;

    constructor(x: number = 0, y: number = 0, vx: number = 0, vy: number = 0, 
        ax: number = 0, ay: number = 0, rect: Rect = {x: 0, y: 0, width: 0, height: 0},
        worldEntities: Array<GameEntity>, health: number = 10, dir: [number,number] = [(Math.random()*2) - 1, (Math.random()*2) - 1])
    {
        super(x,y,vx,vy,ax,ay,rect,EntityType.Enemy);
        this.health = health;
        this.maxHealth = health;
        this.worldEntities = worldEntities;
        var projVx = dir[0];
        var projVy = dir[1];
        this.dir = vec2.create(projVx, projVy);
        this.startingDir = vec2.copy(this.dir);
        vec2.normalize(this.dir, this.dir);
        vec2.mul(this.dir, [1,1], this.dir);
        this.cooldownDelay = this.maxCooldownDelay;

        this.flashTime = this.flashingUpTime;
        this.flashTimeCooldown = 0;
    }

    public Update(deltaTime: number) 
    {
        super.Update(deltaTime);
        this.shootDelay -= deltaTime;
        this.UpdateInternal(deltaTime);
        if (this.health <= 0)
        {
            this.alive = false;
        }
        if (this.flashing && this.flashTimeCooldown <= 0)
        {
            this.flashTime -= deltaTime;
            if (this.flashTime <= 0)
            {
                console.log("Flash time under");
                if (!this.flashingQueue)
                {
                    this.flashing = false;
                }
                this.flashingQueue = false; 
                
                this.flashTimeCooldown = this.flashingUpTime;
                this.flashTime = this.flashingUpTime;
            }
        }
        else if (this.flashTimeCooldown > 0)
        {
            this.flashing = false;
            this.flashTimeCooldown -= deltaTime;
        }
        
    }

    public SetFlashing(val: boolean)
    {
        if (this.flashing) this.flashingQueue = true;
        this.flashing = val;// && this.flashTimeCooldown <= 0;
    }

    public GetFlashing()
    {
        return this.flashing;
    }

    public SpawnProjectile(dir: [number,number], rect: Rect = {x:this.x, y:this.y, width:0.1, height:0.1}, delayReset = Math.PI/20)
    {
        this.worldEntities.push(new GameEntity(rect.x,rect.y,
            dir[0], dir[1], 0, 0, rect, 
            EntityType.Projectile));
        this.shootDelay = delayReset;
    }

    public UpdateInternal(deltaTime: number)
    {
        if (this.onCooldown)
        {
            this.cooldownDelay -= deltaTime;
            if (this.cooldownDelay <= 0)
            {
                this.onCooldown = false;
            }
            else
            {
                return;
            }
        }

        let dir = this.dir;
        let prevDir = vec2.copy(dir);
        vec2.rotate(dir, [0,0,1], Math.PI * deltaTime * 0.5, dir);
        if (vec2.dot(this.dir, this.startingDir) > 0 && 
            vec2.dot(vec2.sub(this.startingDir, prevDir),vec2.sub(this.startingDir, this.dir)) < 0)
        {
            this.onCooldown = true;
            this.cooldownDelay = this.maxCooldownDelay;
        }
        if (this.shootDelay <= 0)
        {
            this.SpawnProjectile([dir[0], dir[1]]);
        }
    }
}

class BigEnemy extends Enemy
{
    loop: number = 0;
    shootDir: [number, number] = [1,0]

    constructor(x: number = 0, y: number = 0, vx: number = 0, vy: number = 0, 
        ax: number = 0, ay: number = 0, rect: Rect = {x: 0, y: 0, width: 0, height: 0},
        worldEntities: Array<GameEntity>, health: number = 10)
    {
        super(x,y,vx,vy,ax,ay,rect,worldEntities,health);
        this.type = EntityType.BigEnemy;
    }

    public Update(deltaTime: number)
    {
        super.Update(deltaTime);
    }

    public UpdateInternal(deltaTime: number)
    {
        if (this.shootDelay <= 0)
        {
            this.loop += deltaTime*100;
            this.loop %= Math.PI*2;
            this.SpawnProjectile(this.shootDir, {x:this.x, y:this.y + (Math.sin(this.loop)*0.1), width: 0.1, height:0.1}, Math.PI/20);
        }
    }

}