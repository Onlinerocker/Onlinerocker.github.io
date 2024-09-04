// main.ts

// CHICKEN MACHINE GUN BATTLE ARENA ALIEN EXTERMINATION SIMULATOR 2024

import {vec4, vec3, mat4, Vec2, vec2} from 'wgpu-matrix';
import { parseBitmapFont, GlyphInfo, getGlyphUv, fillGlyphVertexBuffer } from 'font'
import { Rect, isColliding, moveAndHandleCollision } from 'collision';
import { Enemy, GameEntity, EntityType } from 'game_entity';

interface WebGpuObj
{
    device: GPUDevice,
    context: GPUCanvasContext,
    format: GPUTextureFormat
}

var WebGpuObj: WebGpuObj;
var Pipeline: GPURenderPipeline;
//var SpritePosition: Float32Array;
var LastFrameMS: number;
var WDown: boolean;
var ADown: boolean;
var SDown: boolean;
var DDown: boolean;
var SpaceDown: boolean;

var canvas: HTMLCanvasElement;
const Width:number = 800;
const Height: number = 600;
var ratio: number;

var gabeTexture: GPUTexture;
var animeGirlTexture: GPUTexture;
var fontTexture: GPUTexture;

var glyphs: Map<string, GlyphInfo>;
var vertexBuffers: Array<GPUBuffer> = new Array();

var lastFpsCalc: number = 0;
var displayText: string = "";

var accTime: number = 0;

var charEntity: GameEntity = new GameEntity();
var entities: Array<GameEntity> = new Array();
var deadEntities: Array<number> = new Array();

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
    canvas.addEventListener('mousedown', (e) => handleMouseDown(e))
    //canvas.addEventListener('click', (e) => { console.log("hi"); e.preventDefault(); e.stopPropagation(); return false;});
    //canvas.addEventListener('mosueup', (e)=> { console.log("hi"); e.preventDefault(); e.stopPropagation(); return false;});
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

async function createPipeline(device: GPUDevice, format: GPUTextureFormat) 
{
    const shaderModule = device.createShaderModule({
        code: `
            struct Uniforms
            {
                modelViewMatrix: mat4x4f,
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
                //samp.a = 1.0;
                return samp * color;//vec4(0,0,0,1);
            }
        `,
    });
    
    const pipeline = device.createRenderPipeline(
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
                        srcFactor: 'one',
                        dstFactor: 'one-minus-src-alpha' //color = src_alpha + dst (1 - src_alpha)
                    },
                    alpha: 
                    {
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
    
    return pipeline;
}

function updateWorld(deltaTime: number, b: Rect)
{
    if (!Number.isNaN(deltaTime))
    {
        charEntity.vy -= 450.0 * deltaTime;
    }
    let dir: Vec2 = vec2.create(0,0);

    if (WDown)
    {
    }
    else if (SDown)
    {
    }

    if (ADown)
    {
        dir[0] -= 1.0;
    }
    else if (DDown)
    {
        dir[0] += 1.0;
    }
    vec2.normalize(dir, dir);
    if (!Number.isNaN(deltaTime))
    {
        //console.log(charEntity.vy);
        dir[1] += charEntity.vy * deltaTime;
    }
    if (vec2.len(dir) > 0)
    {
        moveAndHandleCollision(charEntity, b, deltaTime, dir);
        charEntity.x = charEntity.rect.x + (charEntity.rect.width/2);//+= dir[0]*deltaTime;
        charEntity.y = charEntity.rect.y + (charEntity.rect.height/2);//+= dir[1]*deltaTime;
    }

    var spawnNewEnemy = false;
    for (let i = 0; i < entities.length; ++i)
    {
        let entity = entities[i];
        entity.vx += entity.ax * deltaTime;
        entity.vy += entity.ay * deltaTime;
        entity.x += entity.vx * deltaTime;
        entity.y += entity.vy * deltaTime;
        entity.rect.x = entity.x;
        entity.rect.y = entity.y;

        for (var j = 0; j < entities.length; ++j)
        {
            let entityOther = entities[j];
            if (entityOther.type == EntityType.Enemy 
                && entity.type == EntityType.Bullet 
                && entity.alive
                && isColliding(entity.rect, entityOther.rect))
            {
                entity.alive = false;

                var enemy = (entityOther as Enemy);
                enemy.health -= 1;
                if (enemy.health <= 0)
                {
                    enemy.alive = false;
                    spawnNewEnemy = true;
                    deadEntities.push(j);
                }
                //break; lets say we can damage more than one
            }
        }

        var outOfBounds: boolean = entity.x > Width/Height || entity.x < -Width/Height || entity.y < -1.0 || entity.y > 1.0;
        if (outOfBounds && entity.type == EntityType.Bullet)
        {
            entity.alive = false;
        }

        if (!entity.alive)
        {
            deadEntities.push(i);
        }
    }
    let back = entities.length - 1;
    for (let i of deadEntities)
    {
        let temp = entities[back];//GameEntity.Copy(entities[back]);
        console.log(deadEntities.length);
        console.log(temp);
        while (temp.alive == false && back > i)
        {
            --back;
            temp = entities[back];
        }

        if (back == i)
        {
            entities.splice(back, entities.length - back);
            break;
        }
        else
        {
            entities[back] = entities[i];
            entities[i] = temp;
        }
    }
    deadEntities.splice(0, deadEntities.length);

    if (spawnNewEnemy)
    {
        var enemy: Enemy = new Enemy(Math.random() * (2*Width/Height) + -Width/Height, Math.random()*2 + -1, 0, 0, 0, 0, {x:0, y:0, width:0.2, height:0.2}, 1);
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
    const verticesBuffer = device.createBuffer({
        size: buffer.byteLength,
        usage: GPUBufferUsage.VERTEX,
        mappedAtCreation: true,
    });

    new Float32Array(verticesBuffer.getMappedRange()).set(buffer);
    verticesBuffer.unmap(); // since we already set the data we don't need the mapping anymore, I guess

    vertexBuffers.push(verticesBuffer);
    return verticesBuffer;
}

function draw(renderPass: GPURenderPassEncoder, transform: Float32Array, verticesBuffer: GPUBuffer, texture: GPUTexture)
{
    var device = WebGpuObj.device;
    var pipeline = Pipeline;

    const uniformBuffer = device.createBuffer({
        size: 4*16,
        usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    });
    device.queue.writeBuffer(
          uniformBuffer,
          0,
          transform.buffer,
          transform.byteOffset,
          transform.byteLength
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

function drawText(renderPass: GPURenderPassEncoder, textString: string, mat: Float32Array, scale: number = 1.0, color: [number, number, number, number] = [1,1,1,1])
{
    var mat1 = mat4.copy(mat);
    var device = WebGpuObj.device;
    const text = new Float32Array([
        -0.5, -0.5, 0, 1,    color[0], color[1], color[2], color[3],   0, 1,
        -0.5, 0.5, 0, 1,     color[0], color[1], color[2], color[3],   0, 0,
        0.5, -0.5, 0, 1,     color[0], color[1], color[2], color[3],   1, 1,

        0.5, -0.5, 0, 1,     color[0], color[1], color[2], color[3],   1, 1,
        -0.5, 0.5, 0, 1,     color[0], color[1], color[2], color[3],   0, 0,
        0.5, 0.5, 0, 1,      color[0], color[1], color[2], color[3],   1, 0,
    ]);
    for (let c of textString)
    {
        // need to scale each glyph the right size
        // then need to advance the right distance
        // also need to apply offset
        let glyph = glyphs.get(c);
        let glyphUvs: Float32Array;
        if (glyph)
        {
            //glyphUvs = getGlyphUv(glyph);
            fillGlyphVertexBuffer(text, glyph);
            //var mat1Scaled = mat4.identity();

            if (glyph.id == 32)
            {
                mat4.scale(mat1, [scale/ 10, scale / 10, 1], mat1);
                mat4.translate(mat1, [glyph.xadvance / 50,0,0], mat1);
                mat4.scale(mat1, [10/scale, 10/scale, 1], mat1);
                continue;
            }
            mat4.scale(mat1, [scale/ 10, scale / 10, 1], mat1);

            mat4.translate(mat1, [glyph.xoffset / 50, -glyph.yoffset / 50, 0], mat1);
            const verticesBufferText = createVertexBuffer(device, text);
            draw(renderPass, mat1, verticesBufferText, fontTexture);

            mat4.translate(mat1, [glyph.xadvance / 50,0,0], mat1);
            mat4.translate(mat1, [-glyph.xoffset / 50, glyph.yoffset / 50, 0], mat1);
            mat4.scale(mat1, [10/scale, 10/scale, 1], mat1);
        }
    }
}

function drawSprite(renderPass: GPURenderPassEncoder, transform: Float32Array, texture: GPUTexture)
{
    const sprite = new Float32Array([
        -0.5, -0.5, 0, 1,    1, 1, 1, 1,   0, 1,
        -0.5, 0.5, 0, 1,     1, 1, 1, 1,   0, 0,
        0.5, -0.5, 0, 1,     1, 1, 1, 1,   1, 1,

        0.5, -0.5, 0, 1,     1, 1, 1, 1,   1, 1,
        -0.5, 0.5, 0, 1,     1, 1, 1, 1,  0, 0,
        0.5, 0.5, 0, 1,      1, 1, 1, 1,   1, 0,
    ]);

    const verticesBuffer = createVertexBuffer(WebGpuObj.device, sprite);
    draw(renderPass, transform, verticesBuffer, texture);
}

async function render() 
{
    const now = Date.now();
    const deltaTime = (now - LastFrameMS) / 1000;
    LastFrameMS = now;

    var device = WebGpuObj.device;
    const commandEncoder = device.createCommandEncoder();

    const renderPass = commandEncoder.beginRenderPass({
        colorAttachments: [{
            view: WebGpuObj.context.getCurrentTexture().createView(),
            clearValue: { r: 1.0, g: 1.0, b: 1.0, a: 1.0 },
            loadOp: "clear",
            storeOp: "store",
        }],
    });

    var gabeRect: Rect = {x: -0.5, y: -1.5, width: 1.0, height: 1.0};

    charEntity.rect.x = charEntity.x - (charEntity.rect.width/2);
    charEntity.rect.y = charEntity.y - (charEntity.rect.height/2);

    if (!Number.isNaN(deltaTime)) accTime += SpaceDown ? deltaTime * 0.25 : deltaTime;
    let thresh = 0.008;
    while (accTime >= thresh)
    {
        updateWorld(thresh, gabeRect);
        accTime -= thresh;
    }

    var mat = mat4.identity();
    mat4.translate(mat, [charEntity.x, charEntity.y, 0.0], mat);
    mat4.scale(mat, [charEntity.rect.width, charEntity.rect.height, 1.0], mat)
    var orthoMat = mat4.ortho(-ratio, ratio, -1.0, 1.0, 0.0, 5.0);
    mat = mat4.mul(orthoMat, mat);

    var mat1 = mat4.identity();
    mat1 = mat4.mul(orthoMat, mat1);

    renderPass.setPipeline(Pipeline);

    var matGabe = mat4.identity();
    matGabe = mat4.mul(orthoMat, matGabe)
    mat4.scale(matGabe, [gabeRect.width, gabeRect.height, 1.0], matGabe);
    mat4.translate(matGabe, [0, -1, 0], matGabe);
    drawSprite(renderPass, matGabe, gabeTexture);

    //draw character
    drawSprite(renderPass, mat, animeGirlTexture);

    for (let entity of entities)
    {
        let matEntity = mat4.clone(orthoMat);
        mat4.translate(matEntity, [entity.x, entity.y, 0], matEntity);
        mat4.scale(matEntity, [entity.rect.width, entity.rect.height, 1.0], matEntity)
        drawSprite(renderPass, matEntity, gabeTexture);
    }

    if (!Number.isNaN(deltaTime))
        lastFpsCalc += deltaTime;
    if (lastFpsCalc > 0.1)
    {
        lastFpsCalc = 0.0;
        displayText = (1/deltaTime).toPrecision(3) + "fps";
    }

    mat4.translate(mat1, [-Width/Height, 1.0, 0], mat1);
    drawText(renderPass, displayText, mat1, 0.5);
    mat4.translate(mat1, [0, -0.2, 0], mat1);
    if (isColliding(gabeRect, charEntity.rect))
    {
        drawText(renderPass, "colliding", mat1, 0.5);
    }
    renderPass.end();

    device.queue.submit([commandEncoder.finish()]);
    
    for (let buff of vertexBuffers)
    {
        buff.destroy();
    }
    vertexBuffers.splice(0, vertexBuffers.length);
    requestAnimationFrame(render);
}

function handleKeyDown(e: KeyboardEvent)
{
    console.log(e.code);
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
    }
}

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
    }
}

function handleMouseDown(e: MouseEvent)
{
    var rect: DOMRect = canvas.getBoundingClientRect();
    console.log(e.button);
    let x = (e.x - rect.x);
    let y = (e.y - rect.y);
    x /= Height;
    y /= Height;
    x *= 2;
    y *= -2;
    x -= (Width/Height);
    y += 1;

    x -= charEntity.x;
    y -= charEntity.y;

    if (e.button == 0)
    {
        //entities.splice(0, entities.length);
        //charEntity.x = x;
        //charEntity.y = y;
        let dir: Float32Array = vec2.create(x, y);
        vec2.normalize(dir, dir);
        let entity: GameEntity = new GameEntity();
        entity.x = charEntity.x;
        entity.y = charEntity.y;
        entity.vx = dir[0] * 3;
        entity.vy = dir[1] * 3;
        entity.rect.x = entity.x;
        entity.rect.y = entity.y;
        entity.rect.width = 0.1;
        entity.rect.height = 0.1;
        entity.type = EntityType.Bullet;
        entities.push(entity);

        console.log("x " + entity.x);
    }

    e.preventDefault();
    e.stopPropagation();
}

async function main() 
{
    console.log("hiiiii");
    glyphs = await parseBitmapFont("./font/font.txt");
    WDown = false;
    ADown = false;
    SDown = false;
    DDown = false;
    lastFpsCalc = 10.0;

    window.addEventListener('keydown', (e) => handleKeyDown(e));
    window.addEventListener('keyup', (e) => handleKeyUp(e));

    charEntity.x = 0;
    charEntity.y = 1.0;

    charEntity.rect.width = 0.1;
    charEntity.rect.height = 0.3;

    WebGpuObj = await initWebGPU();
    Pipeline = await createPipeline(WebGpuObj.device, WebGpuObj.format);
    animeGirlTexture = await createTexture('./megaphone_girl.png');
    gabeTexture = await createTexture('./IMG_3372.png');
    fontTexture = await createTexture('./font/font.png');

    var enemy: Enemy = new Enemy(0, 0, 0, 0, 0, 0, {x:0, y:0, width:0.2, height:0.2}, 10);
    entities.push(enemy);

    requestAnimationFrame(render);
}

main();