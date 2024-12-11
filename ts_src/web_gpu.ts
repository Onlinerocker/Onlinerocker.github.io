// main.ts

// CHICKEN MACHINE GUN BATTLE ARENA ALIEN EXTERMINATION SIMULATOR 2024

import {vec4, vec3, mat4, Vec2, vec2} from 'wgpu-matrix';
import { parseBitmapFont, GlyphInfo, getGlyphUv, fillGlyphVertexBuffer } from 'font'
import { Rect, isColliding, moveAndHandleCollision } from 'collision';
import { BigEnemy, Enemy, GameEntity, EntityType, WaveHandler, BossFight, HitBox, CharacterEntity, ParticleEntity, IntroAnimation } from 'game_entity';
import { blankTexture, drawProgressBar, loadUIAssets, ScreenText, glyphs } from 'game_ui';

export { drawSprite, createTexture, createUniformBuffer, ratio, createVertexBuffer }

interface WebGpuObj
{
    device: GPUDevice,
    context: GPUCanvasContext,
    format: GPUTextureFormat
}

var WebGpuObj: WebGpuObj;
var Pipeline: GPURenderPipeline;
var PipelineBg: GPURenderPipeline;
//var SpritePosition: Float32Array;
var LastFrameMS: number;
var WDown: boolean;
var ADown: boolean;
var SDown: boolean;
var DDown: boolean;
var SpaceDown: boolean;
var lmbDown: boolean;
var ShiftLeftDown: boolean;
var mouseX: number;
var mouseY: number;

var charEntity: CharacterEntity;
var charHealth: number = 1;
var charShootTimer: number = 0;
var slowTime: number = 0;
var slowRecharging: boolean = true;
var charFacing: number = 1;
var charShooting: boolean = false;
var charSwingTime: number = 0;
var charSwingTimeMax: number = 1.0;
var charSwingEntity: HitBox;

var canvas: HTMLCanvasElement;
const Width:number = 800;
const Height: number = 600;
var ratio: number;

var gabeTexture: GPUTexture;
var animeGirlTexture: GPUTexture;
var fontTexture: GPUTexture;
var charTexture: GPUTexture;
var bulletTexture: GPUTexture;
var bigEnemyTexture: GPUTexture;
var smallEnemyTexture: GPUTexture;
var introTexture: GPUTexture;
var chickTexture: GPUTexture;
var explosionTexture: GPUTexture;
var groundTexture: GPUTexture;

//var glyphs: Map<string, GlyphInfo>;
//var glyphBuffers: Map<string, GPUBuffer> = new Map();

var lastFpsCalc: number = 0;
var displayText: string = "";

var accTime: number = 0;

var entities: Array<GameEntity> = new Array();
var deadEntities: Array<number> = new Array();

var globalTime: number = 0;

var bossFight: BossFight = new BossFight();
var lastSpawnPoint = 0;
var enemySpawnPoints = [[1, 0.75], [-1, -0.75], [-1, 0.75], [1, -0.75]];
var enemySpawnPointDirs = [[-1, 0], [1, 0], [0, -1], [0, 1]];

async function initWebGPU() 
{
    if (!navigator.gpu) {
        throw new Error("WebGPU not supported on this browser.");
    }

    const adapter = await navigator.gpu.requestAdapter();
    if (!adapter) {
        throw new Error("No appropriate GPUAdapter found.");
    }

    const device = await adapter.requestDevice();
    canvas = document.getElementById("canvas") as HTMLCanvasElement;
    canvas.addEventListener('mousedown', e => handleMouseDown(e) );
    //canvas.addEventListener('click', (e) => { console.log("hi"); e.preventDefault(); e.stopPropagation(); return false;});
    canvas.addEventListener('mouseup', e => handleMouseUp(e));
    canvas.addEventListener('mousemove', e => handleMouseMove(e))
    canvas.width = Width * devicePixelRatio;
    canvas.height = Height * devicePixelRatio; 
    ratio = canvas.width / canvas.height;
    const context = canvas.getContext("webgpu") as GPUCanvasContext;
    const format = navigator.gpu.getPreferredCanvasFormat();

    context.configure({
        device: device,
        format: format,
        alphaMode: 'premultiplied'
    });

    return { device, context, format };
}

function createRenderPipeline(device: GPUDevice, format: GPUTextureFormat, shaderModule: GPUShaderModule)
{
    return device.createRenderPipeline(
        {
            layout: "auto",
            vertex: 
            {
                module: shaderModule,
                entryPoint: "vertexMain",
                buffers:
                [
                    {
                        arrayStride: 4*10,
                        attributes:
                        [
                            // pos
                            {
                                shaderLocation: 0,
                                offset: 0,
                                format: 'float32x4' // 16 bytes
                            },
                            // color
                            {
                                shaderLocation: 1,
                                offset: 16,
                                format: 'float32x4' // 16 bytes
                            },
                            // uv
                            {
                                shaderLocation: 2,
                                offset: 32,
                                format: 'float32x2' // 8 bytes
                            },
                        ]
                    }
                ]
            },
            fragment: 
            {
                module: shaderModule,
                entryPoint: "fragmentMain",
                targets: 
                [{ 
                    format: format,             
                    blend: 
                    {
                        color: 
                        {
                            operation: 'add',
                            srcFactor: 'src-alpha',
                            dstFactor: 'one-minus-src-alpha' //color = src_alpha + dst (1 - src_alpha)
                        },
                        alpha: 
                        {
                            operation: 'add',
                            srcFactor: 'one',
                            dstFactor: 'one-minus-src-alpha' //alpha = src_alpha + dst (1 - src_alpha)
                        },
                    },
                }],
                
            },
            primitive: 
            {
                topology: "triangle-list",
            },
    });
}

async function createPipelineBackground(device: GPUDevice, format: GPUTextureFormat)
{
    const shaderModule = device.createShaderModule({
        code: `
            struct Uniforms
            {
                modelViewMatrix: mat4x4f,
                color: vec4f,
                time: f32,
            }
            @group(0) @binding(0) var<uniform> uniforms: Uniforms;

            struct VertexOutput 
            {
                @builtin(position) position : vec4f,
                @location(0) color: vec4f,
                @location(1) uv: vec2f
            }

            @vertex
            fn vertexMain(@location(0) position : vec4f, @location(1) color: vec4f, @location(2) uv: vec2f) -> VertexOutput 
            {
                var out: VertexOutput;
                out.position = uniforms.modelViewMatrix * vec4<f32>(position.xy, 0.0, 1.0);
                out.color = color;
                out.uv = uv;
                return out;
            }

            @group(0) @binding(1) var mySampler: sampler;
            @group(0) @binding(2) var myTexture: texture_2d<f32>;
            
            fn lerpColor(c: vec3f, c1: vec3f, val: f32) -> vec3f
            {
                return val*c + (1.0-val)*c1;
            }

            fn fog(fragCoord: vec2f) -> vec3f
            {
                var iTime = uniforms.time;
                var uv = fragCoord;
                uv *= 8.0;
                //Add distortion
                for(var i = 1.0; i < 5.0; i+=1.0){ 
                    uv.y += iTime*0.1;
                    uv.x += 0.5*sin(iTime*0.1 + uv.y * i);
                    uv.y += cos(iTime*0.1 + uv.x * i);
                }
            
                var val = 0.5 + 0.5*cos(0.0*iTime + uv.x);
                var col = lerpColor(vec3f(0.5,0.3,0.7), vec3f(0.1,0.1,0.1),val);
            
                return col;
            }

            @fragment
            fn fragmentMain(@location(0) color: vec4f, @location(1) uv: vec2f) -> @location(0) vec4<f32> 
            {
                var r = textureSampleBaseClampToEdge(myTexture, mySampler, uv);
                var colorOut = fog(uv);
                return vec4f(colorOut, 1.0);
            }
        `,
    });
    
    const pipeline = createRenderPipeline(device, format, shaderModule);
    return pipeline;
}

async function createPipeline(device: GPUDevice, format: GPUTextureFormat) 
{
    const shaderModule = device.createShaderModule({
        code: `
            struct Uniforms
            {
                modelViewMatrix: mat4x4f,
                color: vec4f,
                time: f32,
            }
            @group(0) @binding(0) var<uniform> uniforms: Uniforms;

            struct VertexOutput 
            {
                @builtin(position) position : vec4f,
                @location(0) color: vec4f,
                @location(1) uv: vec2f
            }

            @vertex
            fn vertexMain(@location(0) position : vec4f, @location(1) color: vec4f, @location(2) uv: vec2f) -> VertexOutput 
            {
                var out: VertexOutput;
                out.position = uniforms.modelViewMatrix * vec4<f32>(position.xy, 0.0, 1.0);
                out.color = color;
                out.uv = uv;
                return out;
            }

            @group(0) @binding(1) var mySampler: sampler;
            @group(0) @binding(2) var myTexture: texture_2d<f32>;
            
            @fragment
            fn fragmentMain(@location(0) color: vec4f, @location(1) uv: vec2f) -> @location(0) vec4<f32> 
            {
                var samp = textureSampleBaseClampToEdge(myTexture, mySampler, uv);
                samp *= color * uniforms.color;
                return samp;
            }
        `,
    });
    
    const pipeline = createRenderPipeline(device, format, shaderModule);
    return pipeline;
}

function killPlayer()
{
    charEntity.alive = false;
    createRandomParticles(charEntity.x, charEntity.y, 6, 3, 0.1, [1, 0, 0, 1], true);
    entities.push(new IntroAnimation(entities));
    music.pause();
}

function updateWorld(deltaTime: number, b: Rect)
{    
    let isShootingKeybind = lmbDown;
    let isSwingingKeybind = ShiftLeftDown;

    charShooting = isShootingKeybind;
    if (!charEntity.charSwinging && isSwingingKeybind)
    {
        charEntity.charSwinging = true;
        var swingRect = new Rect();
        swingRect.height = charEntity.rect.height;
        swingRect.width = charEntity.rect.width*2;
        swingRect.x = charEntity.x - swingRect.width/2;
        swingRect.y = charEntity.y - swingRect.height/2;
        swingRect.x -= charFacing*swingRect.width;
        charSwingEntity = new HitBox(-charFacing*swingRect.width, 0, 0, 0, 0, 0, swingRect, entities);
        charSwingEntity.parent = charEntity;
        entities.push(charSwingEntity);
    }
    else if (charEntity.charSwinging)
    {
        charSwingTime += deltaTime;
        if (charSwingTime >= charSwingTimeMax)
        {
            charSwingTime = 0;
            charEntity.charSwinging = false;
            charSwingEntity.alive = false;
        }
    }

    if (!Number.isNaN(deltaTime))
    {
        charEntity.vy += charEntity.ay * deltaTime;
    }

    let dir: Vec2 = vec2.create(0,0);

    if (WDown)
    {
    }
    else if (SDown)
    {
    }

    charEntity.vx = 0;
    if (ADown)
    {
        charEntity.vx = -1.0;
        if (!charShooting) charFacing = 1;
    }
    else if (DDown)
    {
        charEntity.vx = 1.0;
        if (!charShooting) charFacing = -1;
    }

    charShootTimer -= deltaTime;
    if (charShooting && charShootTimer <= 0 && charEntity.alive)
    {
        shootBullet();
        charShootTimer = 0.05;
    }

    vec2.normalize(dir, dir);
    if (!Number.isNaN(deltaTime))
    {
        //console.log(charEntity.vy);
        //dir[1] += charEntity.vy * deltaTime;
    }

    charEntity.Update(deltaTime);
    dir[0] = charEntity.vx;
    dir[1] = charEntity.vy * (!Number.isNaN(deltaTime) ? deltaTime : 0);
    //console.log("char vx " + charEntity.vx);
    if (vec2.len(dir) > 0)
    {
        moveAndHandleCollision(charEntity, b, deltaTime, dir);
        charEntity.x = charEntity.rect.x + (charEntity.rect.width/2);//+= dir[0]*deltaTime;
        charEntity.y = charEntity.rect.y + (charEntity.rect.height/2);//+= dir[1]*deltaTime;
    }

    for (let entity of entities)
    {
        entity.Update(deltaTime);
    }

    for (let i = 0; i < entities.length; ++i)
    {
        let entity = entities[i];

        if (entity.type == EntityType.Projectile 
            && charEntity.alive && !charEntity.charSwinging
            && isColliding(entity.rect, {x: charEntity.x, y: charEntity.y, width:0, height:0}))
        {
            entity.alive = false;

            charHealth -= 1
            if (charHealth <= 0)
            {
                killPlayer();
            }
            break;
        }
        for (var j = 0; j < entities.length; ++j)
        {
            let entityOther = entities[j];

            if ((entityOther.type == EntityType.Enemy || entityOther.type == EntityType.BigEnemy)
                && entity.type == EntityType.Bullet 
                && entityOther.alive
                && isColliding(entity.rect, entityOther.rect))
            {
                entity.alive = false;

                var enemy = (entityOther as Enemy);
                enemy.health -= 1;
                enemy.SetFlashing(true);

                if (enemy.health <= 0)
                {
                    bossFight.currentHealth -= enemy.maxHealth; //we need to do this for swing attacks too... 
                    //enemy.alive = false;
                    //deadEntities.push(j);
                }
                //break; lets say we can damage more than one
            }
        }

        if (bossFight.currentHealth <= 0 && (entity.type == EntityType.Enemy || entity.type == EntityType.BigEnemy))
        {
            entity.alive = false;
        }

        // waves
        // progression triggered by boss health progression
        var outOfBounds: boolean = entity.x > Width/Height || entity.x < -Width/Height || entity.y < -1.0 || entity.y > 1.0;// || bossFight.currentHealth <= 0;
        if (!entity.keepOffScreen && outOfBounds && (entity.type == EntityType.Bullet || entity.type == EntityType.Projectile || entity.type == EntityType.Particle))
        {
            entity.alive = false;
        }

        if (!entity.alive)
        {
            deadEntities.push(i);
        }
    }

    var outOfBoundsPlayer: boolean = charEntity.x > Width/Height*1.1 || charEntity.x < -Width/Height*1.1 || charEntity.y < -1.1 || charEntity.y > 1.1;
    if (charEntity.alive && outOfBoundsPlayer)
    {
        killPlayer();
    }

    for (let i of deadEntities)
    {
        let e = entities[i];
        if (e.type == EntityType.Bullet)
        {
            createRandomParticles(e.x, e.y, 1, 1, 1);
            createRandomParticles(e.x, e.y, 1, 6, 4, [1, 1, 1, 1], false, 0.4, 0, EntityType.Explosion);
        }
        else if (e.type == EntityType.BigEnemy)
        {
            createRandomParticles(e.x, e.y, 6, 3, 0.1);
        }
        else if (e.type == EntityType.Enemy)
        {
            createRandomParticles(e.x, e.y, 8, 2, 0.1);
        }
    }

    let back = entities.length - 1;
    for (let i of deadEntities)
    {
        let temp = entities[back];
        while (temp.alive == false && back > i)
        {
            --back;
            temp = entities[back];
        }

        if (back == i)
        {
            break;
        }
        else
        {
            entities[back] = entities[i];
            entities[i] = temp;
        }
    }
    if (deadEntities.length > 0) entities.splice(back, entities.length - back);
    deadEntities.splice(0, deadEntities.length);

    if (false)
    {
        var inc = Math.floor(Math.random() * 3 + 1);
        lastSpawnPoint += inc;
        lastSpawnPoint %= 4;
        console.log("inc " + inc);
        console.log("spawn " + lastSpawnPoint);
        var point = enemySpawnPoints[lastSpawnPoint];
        var newEnemyDir = enemySpawnPointDirs[lastSpawnPoint];
        var enemy: Enemy = new Enemy(point[0], point[1], 0, 0, 0, 0, {x:0, y:0, width:0.2, height:0.2}, entities, 10, [newEnemyDir[0], newEnemyDir[1]]);
        entities.push(enemy);
    }
}

async function createTexture(bitmapUrl: string)
{
    var device = WebGpuObj.device;
    let texture: GPUTexture;
    {
     const response = await fetch(bitmapUrl);
     const imageBitmap = await createImageBitmap(await response.blob());

     // could change this to the proper external texture usage
     texture = device.createTexture({
       size: [imageBitmap.width, imageBitmap.height, 1],
       format: 'rgba8unorm',
       usage:
         GPUTextureUsage.TEXTURE_BINDING |
         GPUTextureUsage.COPY_DST |
         GPUTextureUsage.RENDER_ATTACHMENT,
     });
     device.queue.copyExternalImageToTexture(
       { source: imageBitmap },
       { texture: texture },
       [imageBitmap.width, imageBitmap.height]
     );
    }
    return texture;
}

function createVertexBuffer(device: GPUDevice, buffer: Float32Array)
{
    const verticesBuffer = 
    device.createBuffer({
        size: buffer.byteLength,
        usage: GPUBufferUsage.VERTEX,
        mappedAtCreation: true,
    });

    new Float32Array(verticesBuffer.getMappedRange()).set(buffer);
    verticesBuffer.unmap(); // since we already set the data we don't need the mapping anymore, I guess
    return verticesBuffer;
}

function createUniformBuffer()
{
    var uniformBuffer: GPUBuffer;
    uniformBuffer = WebGpuObj.device.createBuffer({
        size: 4*24,
        usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    });
    return uniformBuffer
}

function draw(uniformBuffer: GPUBuffer, renderPass: GPURenderPassEncoder, transform: Float32Array, verticesBuffer: GPUBuffer, texture: GPUTexture, pipeline: GPURenderPipeline = Pipeline, color: [number,number,number,number] = [1,1,1,1])
{
    var device = WebGpuObj.device;

    var rawBuffer: Float32Array = new Float32Array(24);
    for (let i = 0; i < 16; ++i) rawBuffer[i] = transform[i];
    rawBuffer[16] = color[0];
    rawBuffer[17] = color[1];
    rawBuffer[18] = color[2];
    rawBuffer[19] = color[3];
    rawBuffer[20] = globalTime;

    //if (!uniformBuffer){ uniformBuffer = createUniformBuffer(); console.log("uniform created");}

    device.queue.writeBuffer(
          uniformBuffer,
          0,
          rawBuffer.buffer,
          rawBuffer.byteOffset,
          rawBuffer.byteLength
    );

    // Create a sampler with linear filtering for smooth interpolation.
    const sampler = device.createSampler({
        magFilter: 'linear',
        minFilter: 'linear',
      });
  
      const bindGroup = device.createBindGroup({
        layout: pipeline.getBindGroupLayout(0),
          entries: [
          {
              binding: 0,
              resource: {buffer: uniformBuffer}
          },
          {
              binding: 1,
              resource: sampler,
          },
          {
              binding: 2,
              resource: texture.createView(),
          },
        ],
      });

    renderPass.setBindGroup(0, bindGroup);
    renderPass.setVertexBuffer(0, verticesBuffer);
    renderPass.draw(6, 1, 0, 0); // 6 verts, 1 instance, start at 0th vert of 0th intstance
}

var screenTexts: Map<string, ScreenText> = new Map<string, ScreenText>();

function drawText(renderPass: GPURenderPassEncoder, textString: string, mat: Float32Array, scale: number = 1.0, color: [number, number, number, number] = [1,1,1,1], cache: boolean = true, key: string = "")
{
    var device = WebGpuObj.device;
    var mapKey = textString + key;
    //for(var num in mat)
    //{
    //    mapKey += num;
    //}
    var screenText = screenTexts.get(mapKey);
    if (!screenText)
    {
        //console.log("creating text " + mapKey);
        screenText = new ScreenText(textString, mat, scale, device);
        if (cache) screenTexts.set(mapKey, screenText);
    }
    var i = 0;
    for (var c of textString)
    {
        var buffer = screenText.getVertexBuffer(c);
        var glyph = glyphs.get(c);
        if (!glyph) continue;
        if (!buffer || c == ' ')
        {
            mat4.scale(mat, [scale/ 10, scale / 10, 1], mat);
            mat4.translate(mat, [glyph.xadvance / 50,0,0], mat);
            mat4.scale(mat, [10/scale, 10/scale, 1], mat);
            continue;
        }
        mat4.scale(mat, [scale/ 10, scale / 10, 1], mat);
        mat4.translate(mat, [glyph.xoffset / 50, -glyph.yoffset / 50, 0], mat);
        draw(screenText.uniforms[i], renderPass, mat, buffer, fontTexture, Pipeline, color);
        mat4.translate(mat, [glyph.xadvance / 50,0,0], mat);
        mat4.translate(mat, [-glyph.xoffset / 50, glyph.yoffset / 50, 0], mat);
        mat4.scale(mat, [10/scale, 10/scale, 1], mat);
        ++i;
    }
}

function createSpriteBuffer(color: [number, number, number, number] = [1,1,1,1],)
{
    const sprite = new Float32Array([
        -0.5, -0.5, 0, 1,    color[0],color[1],color[2],color[3],   0, 1,
        -0.5, 0.5, 0, 1,     color[0],color[1],color[2],color[3],   0, 0,
        0.5, -0.5, 0, 1,     color[0],color[1],color[2],color[3],   1, 1,

        0.5, -0.5, 0, 1,     color[0],color[1],color[2],color[3],   1, 1,
        -0.5, 0.5, 0, 1,     color[0],color[1],color[2],color[3],   0, 0,
        0.5, 0.5, 0, 1,      color[0],color[1],color[2],color[3],   1, 0,
    ]);

    const verticesBuffer = createVertexBuffer(WebGpuObj.device, sprite);
    return verticesBuffer;
}

var spriteBuffer: GPUBuffer;

function drawSprite(uniformBuffer: GPUBuffer, renderPass: GPURenderPassEncoder, transform: Float32Array, texture: GPUTexture, color: [number, number, number, number] = [1,1,1,1], pipeline: GPURenderPipeline = Pipeline, cache: boolean = false)
{
    if (!spriteBuffer)
    {
        console.log("Creating sprite buffer");
        spriteBuffer = createSpriteBuffer();
    }
    draw(uniformBuffer, renderPass, transform, spriteBuffer, texture, pipeline, color);
}

function createRandomParticles(x: number, y: number, count: number, scale: number = 1, fadeRate: number = 0, color: [number, number, number, number] = [1, 0, 0, 1], stayAlive: boolean = false, velScale: number = 1, gravMod: number = 1, type: EntityType = EntityType.Particle)
{
    for (let i = 0; i < count; ++i)
    {
        let vxRand = -0.5 + Math.random() * 1;
        let vyRand = -0.5 + Math.random() * 1;
        vxRand *= scale * velScale;
        vyRand *= scale * velScale;
        let rect: Rect = new Rect();
        rect.x = 0; rect.y = 0;
        rect.width = 0.025 * scale; rect.height = 0.025 * scale;
        let part: ParticleEntity = new ParticleEntity(x, y, vxRand, vyRand, 0, -4.5 * gravMod, rect);
        part.type = type;
        part.keepOffScreen = stayAlive;
        part.fadeRate = fadeRate;
        part.color = color;
        entities.push(part);
    }
}

let flipStart = 0;
var bgUniform: GPUBuffer; 
var worldUniform: GPUBuffer;
var charUniform: GPUBuffer;
var cdUniform: GPUBuffer;
var bossHpUniform: GPUBuffer;
var bossHpUniformBg: GPUBuffer;
var pulseTimer: number = 0;

function lerpVec4(a: [number,number,number,number], b: [number,number,number,number], val: number)
{
    var ret: [number,number,number,number] = [0,0,0,0];
    for(var i = 0; i < 4; ++i)
    {
        ret[i] = (b[i] * val) + (a[i]*(1.0 - val));
    }
    return ret;
}

async function render() 
{
    const now = performance.now();
    const flipTime = now - flipStart;
    //if (flipTime > 10) console.log("flip time " + flipTime);
    const deltaTime = (now - LastFrameMS) / 1000;
    if (!isNaN(deltaTime)) globalTime += deltaTime;
    //console.log(deltaTime);
    LastFrameMS = now;

    var device = WebGpuObj.device;
    const commandEncoder = device.createCommandEncoder();

    const renderPass = commandEncoder.beginRenderPass({
        colorAttachments: [{
            view: WebGpuObj.context.getCurrentTexture().createView(),
            clearValue: { r: 1.0, g: 1.0, b: 1.0, a: 0.0 },
            loadOp: "clear",
            storeOp: "store",
        }],
    });

    var gabeRect: Rect = {x: -0.5, y: -1.5, width: 1.0, height: 1.0};

    charEntity.rect.x = charEntity.x - (charEntity.rect.width/2);
    charEntity.rect.y = charEntity.y - (charEntity.rect.height/2);

    if (!Number.isNaN(deltaTime)) accTime += (SpaceDown && slowTime > 0 && !slowRecharging) ? deltaTime * 0.25 : deltaTime;
    if (SpaceDown && slowTime > 0 && !slowRecharging)
    {
        slowTime -= deltaTime*0.5;
        if (slowTime <= 0)
        {
            slowTime = 0;
            slowRecharging = true;
            SpaceDown = false;
        }
    }
    else
    {
        slowRecharging = true;
    }
    if (!Number.isNaN(deltaTime) && slowRecharging)
    {
        slowTime += deltaTime;
        if (slowTime >= 1.0)
        {
            slowTime = 1.0;
            slowRecharging = false;
        }
    }
    let thresh = 0.008;

    while (accTime >= thresh)
    {
        updateWorld(thresh, gabeRect);
        accTime -= thresh;
    }

    var mat = mat4.identity();
    mat4.translate(mat, [charEntity.x, charEntity.y, 0.0], mat);
    var matChar = mat4.identity();

    // 0.1, 0.2 -> 0.8 1.0
    mat4.scale(mat, [charFacing * charEntity.rect.width*4.5, charEntity.rect.height*1.25, 1.0], matChar)
    mat4.translate(matChar, [(-charEntity.rect.width*4.5)/2, 0.12, 0], matChar);
    mat4.scale(mat, [charEntity.rect.width, charEntity.rect.height, 1.0], mat)
    var orthoMat = mat4.ortho(-ratio, ratio, -1.0, 1.0, 0.0, 5.0);
    mat = mat4.mul(orthoMat, mat);
    matChar = mat4.mul(orthoMat, matChar);

    var mat1 = mat4.identity();
    mat1 = mat4.mul(orthoMat, mat1);

    renderPass.setPipeline(PipelineBg);
    drawSprite(bgUniform, renderPass, mat4.scale(mat4.identity(), [2, 2, 1]), blankTexture, [1, 1, 1, 1], PipelineBg);

    renderPass.setPipeline(Pipeline);
    
    // draw world
    var matGabe = mat4.identity();
    matGabe = mat4.mul(orthoMat, matGabe)
    mat4.scale(matGabe, [gabeRect.width, gabeRect.height*0.65, 1.0], matGabe);
    mat4.translate(matGabe, [0, -1, 0], matGabe);
    drawSprite(worldUniform, renderPass, matGabe, groundTexture, [1, 1, 1, 1]);
    
    
    //draw character
    if (charEntity.alive)
    {
        //drawSprite(renderPass, mat, blankTexture); //<-- hit point visual
        drawSprite(charUniform, renderPass, matChar, charTexture);
        /*if (charEntity.charSwinging)
        {
            var matSwing = mat4.identity();
            mat4.translate(matSwing, [charSwingEntity.x, charSwingEntity.y, 0.0], matSwing);
            mat4.scale(matSwing, [charSwingEntity.rect.width, charSwingEntity.rect.height, 1], matSwing);
            mat4.mul(orthoMat, matSwing, matSwing);
            drawSprite(renderPass, matSwing, blankTexture);
        }*/
    }
    
    // draw entities
    for (let entity of entities)
    {
        let matEntity = mat4.clone(orthoMat);
        mat4.translate(matEntity, [entity.x, entity.y, 0], matEntity);
        if (entity.type == EntityType.Particle || entity.type == EntityType.Intro || entity.type == EntityType.Explosion)
        {
            mat4.rotateZ(matEntity, (entity as ParticleEntity).rotation, matEntity);
        }
        let dir = 1;
        let scale = 1;
        if (entity.type == EntityType.Enemy || entity.type == EntityType.BigEnemy) dir = entity.x > 0 ? -1 : 1;
        if (entity.type == EntityType.Enemy || entity.type == EntityType.BigEnemy) scale = 1.3;
        mat4.scale(matEntity, [dir * entity.rect.width * scale, entity.rect.height * scale, 1.0], matEntity)
        var color: [number,number,number,number] = [5,0.5,0.5,1];
        var texture = blankTexture;
        var flashing = false;
        if (entity.type == EntityType.Enemy || entity.type == EntityType.BigEnemy)
        {
            var enemy = entity as Enemy;
            flashing = enemy.GetFlashing();
            texture = entity.type == EntityType.BigEnemy ? bigEnemyTexture : smallEnemyTexture;
            drawProgressBar(enemy.hpUniform, enemy.hpUniformBg, renderPass, enemy.health, enemy.maxHealth, {x: entity.x, y: entity.y + enemy.rect.height/2 + 0.05, width: 0.3, height: 0.03});
            color = [1,1,1,1];
        } 
        else if (entity.type == EntityType.Bullet)
        {
            color = [1,1,1,1];
            texture = bulletTexture;
        }
        else if (entity.type == EntityType.Projectile)
        {
            texture = bulletTexture;
        }
        else if (entity.type == EntityType.HitBox)
        {
            continue;
        }
        else if (entity.type == EntityType.Particle)
        {
            color = (entity as ParticleEntity).color;
            texture = blankTexture;
        }
        else if (entity.type == EntityType.Intro)
        {
            color = (entity as ParticleEntity).color;
            texture = introTexture;
        }
        else if (entity.type == EntityType.Explosion)
            {
                color = (entity as ParticleEntity).color;
                texture = explosionTexture;
            }
        drawSprite(entity.uniformBuffer, renderPass, matEntity, texture, flashing ? [1,0.5,0.5,1] : color);
    }

    // fps counter calc
    if (!Number.isNaN(deltaTime))
        lastFpsCalc += deltaTime;
    if (lastFpsCalc > 0.1)
    {
        lastFpsCalc = 0.0;
        let fps = (1/deltaTime);
        displayText = fps.toPrecision(3) + "fps";
        if (fps < 100.0)
        {
            console.log(deltaTime + " is delta");
            console.log(fps + " is low");
        }
    }
    
    //garbage collector is causing hitches!!!

    // draw UI
    // TODO: white text, more phases, art, restart button, start screen
    // slow cooldown bar
    drawProgressBar(cdUniform, cdUniform, renderPass, slowTime, 1.0, {x:-Width/Height + 0.16, y:0.9, width:0.3, height:0.05}, [0,0,0,1], [0,1,1,1]);

    // boss health
    if (charEntity.alive)
    {
        var bossHealthMat = mat4.identity();
        mat4.translate(bossHealthMat, [-0.95, -0.85, 0], bossHealthMat);
        drawText(renderPass, "Boss Health", bossHealthMat, 0.5);
        drawProgressBar(bossHpUniform, bossHpUniformBg, renderPass, bossFight.currentHealth, bossFight.maxHealth, {x: 0, y: -0.95, width: 1.9*Width/Height, height:0.05}, [0,0,0,1], [1,0,0,1]);
    }

    if (!charEntity.alive)
    {
        let preventedMat = mat4.identity();
        //drawText(renderPass, "Press R to fight!", mat4.translate(preventedMat, [-0.51, 0.085, 0]), 1.0, [0, 0, 0, 1]);
        //drawText(renderPass, "Press R to fight!", mat4.translate(preventedMat, [-0.52, 0.1, 0]), 1.0);
        var scale = 1.0 + (0.1 * Math.cos(pulseTimer*6.0));

        //0.5 + 0.5*Math.sin(pulseTimer*8.0)

        var halfPI = Math.PI/2.0;
        var color = lerpVec4([0,1,1,1], [0,0,1,1], Math.min(pulseTimer/halfPI, 1.0));
        if (pulseTimer > halfPI && pulseTimer <= Math.PI)
        {
            var prog = (pulseTimer - halfPI) / halfPI;
            prog = Math.min(prog, 1.0);
            color = lerpVec4([0,0,1,1], [1,0,0,1],  prog);
        }
        else if (pulseTimer > Math.PI && pulseTimer <= Math.PI + halfPI)
        {
            var prog = (pulseTimer - Math.PI) / halfPI;
            prog = Math.min(prog, 1.0);
            color = lerpVec4([1,0,0,1], [1,1,0,1], prog);
        }
        else if (pulseTimer > Math.PI + halfPI && pulseTimer <= Math.PI*2.0)
        {
            var prog = (pulseTimer - (Math.PI+halfPI)) / halfPI;
            prog = Math.min(prog, 1.0);
            color = lerpVec4([1,1,0,1], [0,1,1,1], prog);
        }

        pulseTimer += isNaN(deltaTime) ? 0.0 : deltaTime*1.0;
        if (pulseTimer > Math.PI * 2.0) pulseTimer = 0.0;

        
        
        drawText(renderPass, "Press R", mat4.translate(preventedMat, [0.25, 0.2, 0]), scale, [0, 0, 0, 1], true, "blk");
        drawText(renderPass, "Press R", mat4.translate(preventedMat, [0.24, 0.21, 0]), scale, color, true, "col");
        drawText(renderPass, "to fight!", mat4.translate(preventedMat, [0.35, -0.1, 0]), scale, [0, 0, 0, 1], true, "blk");
        drawText(renderPass, "to fight!", mat4.translate(preventedMat, [0.34, -0.09, 0]), scale, color, true, "col");
    }
    else if (bossFight.currentHealth <= 0)
    {
        let preventedMat = mat4.identity();
        drawText(renderPass, "INVADER EXTERMINATED", mat4.translate(preventedMat, [-0.9, 0, 0]), 1.0);
    }

    // fps counter
    mat4.translate(mat1, [-Width/Height, 1.0, 0], mat1);
    drawText(renderPass, displayText, mat1, 0.5, [1,1,1,1], false);

    renderPass.end();
    device.queue.submit([commandEncoder.finish()]);
    await device.queue.onSubmittedWorkDone();
    requestAnimationFrame(render);
}

function handleKeyDown(e: KeyboardEvent)
{
    //console.log(e.code);
    switch(e.code)
    {
        case 'KeyW':
            if (!WDown)
            {
                charEntity.vy = 200;
            }
            WDown = true;
            break;
        case 'KeyA':
            ADown = true;
            break;
        case 'KeyS':
            SDown = true;
            break;
        case 'KeyD':
            DDown = true;
            break;
        case 'Space':
            SpaceDown = true;
            break;
        case 'ShiftLeft':
            ShiftLeftDown = true;
            break;
    }
}

var music = new Audio("./music/bg_music.mp3")
var playing = false;
function handleKeyUp(e: KeyboardEvent)
{
    switch(e.code)
    {
        case 'KeyW':
            WDown = false;
            break;
        case 'KeyA':
            ADown = false;
            break;
        case 'KeyS':
            SDown = false;
            break;
        case 'KeyD':
            DDown = false;
            break;
        case 'Space':
            SpaceDown = false;
            break;
        case 'ShiftLeft':
            ShiftLeftDown = false;
            break;
        case 'KeyR':
            if (!charEntity.alive)
            {
                if (!playing)
                {
                    music.currentTime = 0;
                    music.play();
                } 

                entities.splice(0, entities.length);
                bossFight.maxHealth = 1000;
                bossFight.currentHealth = bossFight.maxHealth;

                charEntity.x = 0;
                charEntity.y = 1.0;
                charEntity.vx = 0;
                charEntity.vy = 0;
                charEntity.ax = 0;
                charEntity.ay = -450;
                charEntity.alive = true;
                charHealth = 1; // TODO: move all the character data to the entity

                var waveHandler = new WaveHandler(bossFight, 1000, entities);
                entities.push(waveHandler);
                waveHandler.Start();
            }
            break;
    }
}

function handleMouseUp(e: MouseEvent)
{
    if (e.button == 0)
    {
        lmbDown = false;
    }
}

function handleMouseDown(e: MouseEvent)
{
    if (e.button == 0)
    {
        lmbDown = true;
    }

    e.preventDefault();
    e.stopPropagation();
}

function handleMouseMove(e: MouseEvent)
{
    var rect: DOMRect = canvas.getBoundingClientRect();
    let x = (e.x - rect.x);
    let y = (e.y - rect.y);
    x /= Height;
    y /= Height;
    x *= 2;
    y *= -2;
    x -= (Width/Height);
    y += 1;

    mouseX = x;
    mouseY = y;
}

function shootBullet()
{
    let x = mouseX;
    let y = mouseY;
    x -= charEntity.x;
    y -= charEntity.y;
    let dir: Float32Array = vec2.create(x, y);
    charFacing = -1*Math.sign(x);

    vec2.normalize(dir, dir);
    let entity: GameEntity = new GameEntity();
    entity.x = charEntity.x;
    entity.y = charEntity.y;
    entity.vx = dir[0] * 3;
    entity.vy = dir[1] * 3;
    entity.rect.x = entity.x;
    entity.rect.y = entity.y;
    entity.rect.width = 0.08;
    entity.rect.height = 0.08;
    entity.type = EntityType.Bullet;
    entities.push(entity);
}

async function main() 
{
    WDown = false;
    ADown = false;
    SDown = false;
    DDown = false;
    SpaceDown = false;
    lmbDown = false;
    lastFpsCalc = 10.0;

    window.addEventListener('keydown', (e) => handleKeyDown(e));
    window.addEventListener('keyup', (e) => handleKeyUp(e));

    WebGpuObj = await initWebGPU();
    Pipeline = await createPipeline(WebGpuObj.device, WebGpuObj.format);
    PipelineBg = await createPipelineBackground(WebGpuObj.device, WebGpuObj.format);
    animeGirlTexture = await createTexture('./megaphone_girl.png');
    gabeTexture = await createTexture('./IMG_3372.png');
    fontTexture = await createTexture('./font/white_font.png');

    charTexture = await createTexture('./img/chick.png');
    bulletTexture = await createTexture('./img/bullet.png');
    bigEnemyTexture = await createTexture('./img/enemy_big_v1.png');
    smallEnemyTexture = await createTexture('./img/enemy_small.png');
    introTexture = await createTexture('./img/angel_true_size_glow.png');
    chickTexture = await createTexture('./img/chick.png');
    explosionTexture = await createTexture('./img/explosion.png');
    groundTexture = await createTexture('./img/platform_ready1.png');

    await loadUIAssets();

    bgUniform = createUniformBuffer();
    charUniform = createUniformBuffer();
    worldUniform = createUniformBuffer();
    cdUniform= createUniformBuffer();
    bossHpUniform = createUniformBuffer();
    bossHpUniformBg = createUniformBuffer();
    //bossHpTextUniform= createUniformBuffer();
    //fpsTxtUniform= createUniformBuffer();
    //winTxtUniform= createUniformBuffer();
    //startRTxtUniform= createUniformBuffer();
    //startRTxtShadUniform= createUniformBuffer();
    //startTxtUniform= createUniformBuffer();
    //startTxtShadUniform= createUniformBuffer();

    charEntity = new CharacterEntity();
    charEntity.x = 0;
    charEntity.y = 1.0;
    charEntity.rect.width = 0.1;
    charEntity.rect.height = 0.2;
    charEntity.alive = false;
    charEntity.type = EntityType.Player;
    charEntity.ay = -450;

    entities.push(new IntroAnimation(entities));

    requestAnimationFrame(render);
    
}

main();