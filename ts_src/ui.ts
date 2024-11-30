import { Rect, } from "collision";
import { drawSprite, createTexture, ratio, createVertexBuffer, createUniformBuffer } from "web_gpu";
import { mat4 } from 'wgpu-matrix';
import { parseBitmapFont, GlyphInfo, getGlyphUv, fillGlyphVertexBuffer } from 'font'

export { drawProgressBar, loadUIAssets, blankTexture, ScreenText }

// health bars
// particles
// big enemies w big projectiles
// make small enemies fly around
// reset button
// background shader

// can be used for loading, health, etc

var blankTexture: GPUTexture;
var glyphs: Map<string, GlyphInfo>;
var glyphBuffers: Map<string, GPUBuffer> = new Map();

class ScreenText
{
    uniforms: Array<GPUBuffer> = new Array<GPUBuffer>();
    mats: Array<Float32Array> = new Array<Float32Array>();
    text: string;
    triData: Float32Array;
    device: GPUDevice;

    constructor(text: string, mat: Float32Array, scale: number, device: GPUDevice)
    {
        this.text = text;
        this.device = device;
        this.triData = new Float32Array([
            -0.5, -0.5, 0, 1,    1,1,1,1,   0, 1,
            -0.5, 0.5, 0, 1,     1,1,1,1,   0, 0,
            0.5, -0.5, 0, 1,     1,1,1,1,   1, 1,
    
            0.5, -0.5, 0, 1,     1,1,1,1,   1, 1,
            -0.5, 0.5, 0, 1,     1,1,1,1,   0, 0,
            0.5, 0.5, 0, 1,      1,1,1,1,   1, 0,
        ]);
        for (let c of text)
        {
            // need to scale each glyph the right size
            // then need to advance the right distance
            // also need to apply offset
            let glyph = glyphs.get(c);
            let glyphUvs: Float32Array;
            if (glyph)
            {
                //glyphUvs = getGlyphUv(glyph);
                //var matScaled = mat4.identity();
        
                if (glyph.id == 32)
                {
                    mat4.scale(mat, [scale/ 10, scale / 10, 1], mat);
                    mat4.translate(mat, [glyph.xadvance / 50,0,0], mat);
                    mat4.scale(mat, [10/scale, 10/scale, 1], mat);
                    continue;
                }
                mat4.scale(mat, [scale/ 10, scale / 10, 1], mat);
                mat4.translate(mat, [glyph.xoffset / 50, -glyph.yoffset / 50, 0], mat);
        
                var verticesBufferText = glyphBuffers.get(c);
                if (verticesBufferText == undefined)
                {
                    fillGlyphVertexBuffer(this.triData, glyph);
                    verticesBufferText = createVertexBuffer(device, this.triData);
                    glyphBuffers.set(c, verticesBufferText);
    
                }

                this.uniforms.push(createUniformBuffer());
                this.mats.push(new Float32Array(mat));
                //console.log("insert " + c);

                mat4.translate(mat, [glyph.xadvance / 50,0,0], mat);
                mat4.translate(mat, [-glyph.xoffset / 50, glyph.yoffset / 50, 0], mat);
                mat4.scale(mat, [10/scale, 10/scale, 1], mat);
            }
        }
    }

    public getVertexBuffer(char: string)
    {
        var verticesBufferText =  glyphBuffers.get(char);
        var glyph = glyphs.get(char);
        if (verticesBufferText == undefined && glyph)
        {
            fillGlyphVertexBuffer(this.triData, glyph);
            verticesBufferText = createVertexBuffer(this.device, this.triData);
            glyphBuffers.set(char, verticesBufferText);
        }
        return verticesBufferText;
    }
}

function drawProgressBar(uniformBuffer: GPUBuffer, renderPass: GPURenderPassEncoder, val: number, max: number, rect: Rect, 
    bgColor: [number,number,number,number] = [0.2, 0.2, 0.2, 1], 
    fgColor: [number,number,number,number] = [1, 0, 0, 1])
{
    var transform = mat4.ortho(-ratio, ratio, -1.0, 1.0, 0.0, 5.0);
    mat4.translate(transform, [rect.x, rect.y, 0], transform);
    mat4.scale(transform, [rect.width, rect.height, 1], transform);
    drawSprite(uniformBuffer, renderPass, transform, blankTexture, bgColor);

    var pct = val/max;
    pct = Math.max(pct, 0);
    mat4.translate(transform, [-0.5*(1-pct), 0, 0], transform);
    mat4.scale(transform, [pct, 1, 1], transform);
    drawSprite(uniformBuffer, renderPass, transform, blankTexture, fgColor);
}

async function loadUIAssets()
{
    blankTexture = await createTexture('./white.png');
    glyphs = await parseBitmapFont("./font/white_font.txt");
}