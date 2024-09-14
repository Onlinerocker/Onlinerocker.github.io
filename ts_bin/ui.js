import { drawSprite, createTexture, ratio } from "web_gpu";
import { mat4 } from 'wgpu-matrix';
export { drawProgressBar, loadUIAssets, blankTexture };
// health bars
// particles
// big enemies w big projectiles
// make small enemies fly around
// reset button
// background shader
// can be used for loading, health, etc
var blankTexture;
function drawProgressBar(renderPass, val, max, rect, bgColor = [0.2, 0.2, 0.2, 1], fgColor = [1, 0, 0, 1]) {
    var transform = mat4.ortho(-ratio, ratio, -1.0, 1.0, 0.0, 5.0);
    mat4.translate(transform, [rect.x, rect.y, 0], transform);
    mat4.scale(transform, [rect.width, rect.height, 1], transform);
    drawSprite(renderPass, transform, blankTexture, bgColor);
    var pct = val / max;
    pct = Math.max(pct, 0);
    mat4.translate(transform, [-0.5 * (1 - pct), 0, 0], transform);
    mat4.scale(transform, [pct, 1, 1], transform);
    drawSprite(renderPass, transform, blankTexture, fgColor);
}
async function loadUIAssets() {
    blankTexture = await createTexture('./white.png');
}
