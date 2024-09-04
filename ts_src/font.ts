export {parseBitmapFont, GlyphInfo, getGlyphUv, fillGlyphVertexBuffer}

const FONT_BITMAP_W = 512;
const FONT_BITMAP_H = 512;

class GlyphInfo
{
    id: number = 0;
    x: number = 0;
    y: number = 0;
    xoffset: number = 0;
    yoffset: number = 0;
    width: number = 0;
    height: number = 0;
    xadvance: number = 0;
}

function getGlyphUv(glyph: GlyphInfo)
{
    var uv: Float32Array = new Float32Array([
        glyph.x / FONT_BITMAP_W,
        glyph.y / FONT_BITMAP_H,
        (glyph.x + glyph.width) / FONT_BITMAP_W,
        (glyph.y + glyph.height) / FONT_BITMAP_H,
    ]);
    return uv;
}

function fillGlyphVertexBuffer(buffer: Float32Array, glyph: GlyphInfo)
{
    var glyphUvs = getGlyphUv(glyph);
    var xuv = glyph.width / 50.0;
    var yuv = glyph.height / 50.0;

    buffer[0] = 0;//-xuv;
    buffer[1] = 0;//-yuv;

    buffer[10] = 0;//-xuv;
    buffer[11] = -yuv;

    buffer[20] = xuv;
    buffer[21] = 0;//-yuv;

    buffer[30] = xuv;
    buffer[31] = 0;//-yuv;

    buffer[40] = 0;//-xuv;
    buffer[41] = -yuv;

    buffer[50] = xuv;
    buffer[51] = -yuv;

    buffer[8] = glyphUvs[0];
    buffer[9] = glyphUvs[1];

    buffer[18] = glyphUvs[0];
    buffer[19] = glyphUvs[3];

    buffer[28] = glyphUvs[2];
    buffer[29] = glyphUvs[1];

    buffer[38] = glyphUvs[2];
    buffer[39] = glyphUvs[1];

    buffer[48] = glyphUvs[0];
    buffer[49] = glyphUvs[3];

    buffer[58] = glyphUvs[2];
    buffer[59] = glyphUvs[3];
}

// reads .txt files generated from https://snowb.org/
async function parseBitmapFont(filePath: string)
{
    const fileContent = await fetch(filePath).then(response => response.text());

    // Split the file into lines or process the content as needed
    const lines = fileContent.split('\n');
    const countStr = lines[3].split('=')[1];
    const count = Number.parseInt(countStr);
    let glyphs: Map<string, GlyphInfo> = new Map();
    for (let i = 4; i < lines.length; i++)
    {
        let curLine = lines[i];
        let parameters = curLine.split(' ');
        let glyph: GlyphInfo = new GlyphInfo();
        for (let param of parameters)
        {
            let vals = param.split('=');
            if (vals.length == 2)
            {
                if (Reflect.has(glyph, vals[0]))
                {
                    Reflect.set(glyph, vals[0], Number.parseFloat(vals[1]));
                }
            }
        }
        glyphs.set(String.fromCharCode(glyph.id), glyph);
    }
    return glyphs
}