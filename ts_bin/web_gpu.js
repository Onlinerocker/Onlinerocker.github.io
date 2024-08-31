// main.ts
import { vec3, mat4 } from 'wgpu-matrix';
var WebGpuObj;
var Pipeline;
var SpritePosition;
var LastFrameMS;
var WDown;
async function initWebGPU() {
    if (!navigator.gpu) {
        throw new Error("WebGPU not supported on this browser.");
    }
    const adapter = await navigator.gpu.requestAdapter();
    if (!adapter) {
        throw new Error("No appropriate GPUAdapter found.");
    }
    const device = await adapter.requestDevice();
    const canvas = document.getElementById("canvas");
    canvas.width = 800 * devicePixelRatio;
    canvas.height = 600 * devicePixelRatio;
    const context = canvas.getContext("webgpu");
    const format = navigator.gpu.getPreferredCanvasFormat();
    context.configure({
        device: device,
        format: format,
    });
    return { device, context, format };
}
async function createPipeline(device, format) {
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
                return textureSampleBaseClampToEdge(myTexture, mySampler, uv) * color;
            }
        `,
    });
    const pipeline = device.createRenderPipeline({
        layout: "auto",
        vertex: {
            module: shaderModule,
            entryPoint: "vertexMain",
            buffers: [
                {
                    arrayStride: 4 * 10,
                    attributes: [
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
                        // pos
                        {
                            shaderLocation: 2,
                            offset: 32,
                            format: 'float32x2' // 8 bytes
                        },
                    ]
                }
            ]
        },
        fragment: {
            module: shaderModule,
            entryPoint: "fragmentMain",
            targets: [{ format: format }],
        },
        primitive: {
            topology: "triangle-list",
        },
    });
    return pipeline;
}
function updateWorld(deltaTime) {
    if (WDown) {
        SpritePosition[1] += deltaTime * 1.0;
    }
}
async function render() {
    const now = Date.now();
    const deltaTime = (now - LastFrameMS) / 1000;
    LastFrameMS = now;
    updateWorld(deltaTime);
    var device = WebGpuObj.device;
    var context = WebGpuObj.context;
    var format = WebGpuObj.format;
    var pipeline = Pipeline;
    const commandEncoder = device.createCommandEncoder();
    var mat = mat4.identity();
    mat4.translate(mat, SpritePosition, mat);
    //console.log(mat);
    const uniformBuffer = device.createBuffer({
        size: 4 * 16,
        usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    });
    device.queue.writeBuffer(uniformBuffer, 0, mat.buffer, mat.byteOffset, mat.byteLength);
    // define buffers here
    const sprite = new Float32Array([
        -0.5, -0.5, 0, 1, 1, 0, 0, 0, 0, 1,
        -0.5, 0.5, 0, 1, 0, 1, 0, 0, 0, 0,
        0.5, -0.5, 0, 1, 0, 0, 1, 0, 1, 1,
        0.5, -0.5, 0, 1, 0, 0, 1, 0, 1, 1,
        -0.5, 0.5, 0, 1, 0, 1, 0, 0, 0, 0,
        0.5, 0.5, 0, 1, 0, 1, 1, 0, 1, 0,
    ]);
    const verticesBuffer = device.createBuffer({
        size: sprite.byteLength,
        usage: GPUBufferUsage.VERTEX,
        mappedAtCreation: true,
    });
    new Float32Array(verticesBuffer.getMappedRange()).set(sprite);
    verticesBuffer.unmap(); // since we already set the data we don't need the mapping anymore, I guess
    let cubeTexture;
    {
        const response = await fetch('https://onlinerocker.github.io/megaphone_girl.png');
        const imageBitmap = await createImageBitmap(await response.blob());
        // could change this to the proper external texture usage
        cubeTexture = device.createTexture({
            size: [imageBitmap.width, imageBitmap.height, 1],
            format: 'rgba8unorm',
            usage: GPUTextureUsage.TEXTURE_BINDING |
                GPUTextureUsage.COPY_DST |
                GPUTextureUsage.RENDER_ATTACHMENT,
        });
        device.queue.copyExternalImageToTexture({ source: imageBitmap }, { texture: cubeTexture }, [imageBitmap.width, imageBitmap.height]);
    }
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
                resource: { buffer: uniformBuffer }
            },
            {
                binding: 1,
                resource: sampler,
            },
            {
                binding: 2,
                resource: cubeTexture.createView(),
            },
        ],
    });
    const renderPass = commandEncoder.beginRenderPass({
        colorAttachments: [{
                view: context.getCurrentTexture().createView(),
                clearValue: { r: 0.0, g: 0.0, b: 0.0, a: 1.0 },
                loadOp: "clear",
                storeOp: "store",
            }],
    });
    renderPass.setPipeline(pipeline);
    renderPass.setBindGroup(0, bindGroup);
    renderPass.setVertexBuffer(0, verticesBuffer);
    renderPass.draw(6, 1, 0, 0); // 6 verts, 1 instance, start at 0th vert of 0th intstance
    renderPass.end();
    device.queue.submit([commandEncoder.finish()]);
    requestAnimationFrame(render);
}
function handleKeyDown(e) {
    switch (e.code) {
        case 'KeyW':
            WDown = true;
            break;
    }
}
function handleKeyUp(e) {
    switch (e.code) {
        case 'KeyW':
            WDown = false;
            break;
    }
}
async function main() {
    WDown = false;
    window.addEventListener('keydown', (e) => handleKeyDown(e));
    window.addEventListener('keyup', (e) => handleKeyUp(e));
    SpritePosition = vec3.create(0, 0, 0);
    SpritePosition[0] = 0.25;
    WebGpuObj = await initWebGPU();
    Pipeline = await createPipeline(WebGpuObj.device, WebGpuObj.format);
    requestAnimationFrame(render);
}
main();
