import { Rect, } from "collision";
import { drawSprite, createTexture, ratio } from "web_gpu";
import { mat4 } from 'wgpu-matrix';

export { drawProgressBar, loadUIAssets }

// health bars
// particles
// big enemies w big projectiles
// make small enemies fly around
// reset button
// background shader

// can be used for loading, health, etc

var progressBar: GPUTexture;

function drawProgressBar(renderPass: GPURenderPassEncoder, val: number, max: number, rect: Rect, 
    bgColor: [number,number,number,number] = [0.2, 0.2, 0.2, 1], 
    fgColor: [number,number,number,number] = [1, 0, 0, 1])
{
    var transform = mat4.ortho(-ratio, ratio, -1.0, 1.0, 0.0, 5.0);
    mat4.translate(transform, [rect.x, rect.y, 0], transform);
    mat4.scale(transform, [rect.width, rect.height, 1], transform);
    drawSprite(renderPass, transform, progressBar, bgColor);

    var pct = val/max;
    pct = Math.max(pct, 0);
    mat4.translate(transform, [-0.5*(1-pct), 0, 0], transform);
    mat4.scale(transform, [pct, 1, 1], transform);
    drawSprite(renderPass, transform, progressBar, fgColor);
}

async function loadUIAssets()
{
    progressBar = await createTexture('./white.png');
}