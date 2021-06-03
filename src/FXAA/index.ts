import { Mesh } from "../util/mesh";
import { ShaderProgram } from "../util/shaderProgram";

export class FXAA {

    private static readonly shader_prefix = `#version 300 es
    precision mediump float;
    `;

    private static readonly vertex_shader = `
    layout(location = 0) in vec3 a_position;
    out vec2 uv;
    void main() {
        gl_Position = vec4(a_position.xyz, 1.0);
        uv = a_position.xy * 0.5 + 0.5;
    }`;

    private static readonly fragment_shader = `
    layout(location = 0) out vec4 FragColor;
    uniform sampler2D u_texture;
    uniform vec2 inverseScreenSize;
    in vec2 uv;

    float rgb2luma(vec3 color) {
        return color.y * (0.587/0.299) + color.x;
    }

    #define EDGE_THRESHOLD_MIN 0.0312
    #define EDGE_THRESHOLD_MAX 0.125
    #define ITERATIONS 12
    #define SUBPIXEL_QUALITY 0.75

    void main() {
        vec4 colorC = texture(u_texture, uv).rgba;

        float lumaC = rgb2luma(colorC.rgb);

        float lumaN = rgb2luma(textureOffset(u_texture, uv, ivec2(0, 1)).rgb);
        float lumaS = rgb2luma(textureOffset(u_texture, uv, ivec2(0,-1)).rgb);
        float lumaW = rgb2luma(textureOffset(u_texture, uv, ivec2( 1,0)).rgb);
        float lumaE = rgb2luma(textureOffset(u_texture, uv, ivec2(-1,0)).rgb);

        float lumaMin = min(lumaC, min(min(lumaN, lumaS), min(lumaW, lumaE)));
        float lumaMax = max(lumaC, max(max(lumaN, lumaS), max(lumaW, lumaE)));

        float lumaRange = lumaMax - lumaMin;

        if (lumaRange < max(EDGE_THRESHOLD_MIN, lumaMax*EDGE_THRESHOLD_MAX)) {
            FragColor = colorC;
            return;
        }

        float lumaNW = rgb2luma(textureOffset(u_texture, uv, ivec2( 1, 1)).rgb);
        float lumaSW = rgb2luma(textureOffset(u_texture, uv, ivec2( 1,-1)).rgb);
        float lumaNE = rgb2luma(textureOffset(u_texture, uv, ivec2(-1, 1)).rgb);
        float lumaSE = rgb2luma(textureOffset(u_texture, uv, ivec2(-1,-1)).rgb);

        float lumaSN = lumaS + lumaN;
        float lumaEW = lumaE + lumaW;

        float lumaCornersW = lumaNW + lumaSW;
        float lumaCornersE = lumaNE + lumaSE;
        float lumaCornersN = lumaNW + lumaNE;
        float lumaCornersS = lumaSW + lumaSE;

        float edgeHorizontal = abs(-2.0 * lumaW + lumaCornersW) + abs(-2.0 * lumaC + lumaSN) * 2.0 + abs(-2.0 * lumaW + lumaCornersW);
        float edgeVertical = abs(-2.0 * lumaN + lumaCornersN) + abs(-2.0 * lumaC + lumaEW) * 2.0 + abs(-2.0 * lumaS + lumaCornersS);

        bool isHorizontal = edgeHorizontal >= edgeVertical;

        float luma1 = isHorizontal ? lumaS : lumaE;
        float luma2 = isHorizontal ? lumaN : lumaW;

        float gradient1 = luma1 - lumaC;
        float gradient2 = luma2 - lumaC;

        bool is1Steepest = abs(gradient1) >= abs(gradient2);

        float gradientScaled = 0.25 * max(abs(gradient1), abs(gradient2));

        float stepLength = isHorizontal? inverseScreenSize.y : inverseScreenSize.x;

        float lumaLocalAverage = 0.0;

        if (is1Steepest) {
            stepLength = -stepLength;
            lumaLocalAverage = 0.5 * (luma1 + lumaC);
        } else {
            lumaLocalAverage = 0.5 * (luma2 + lumaC);
        }

        vec2 currentUV = uv;
        if (isHorizontal) {
            currentUV.y += stepLength * 0.5;
        } else {
            currentUV.x += stepLength * 0.5;
        }

        vec2 offset = isHorizontal ? vec2(inverseScreenSize.x, 0.0) : vec2(0.0, inverseScreenSize.y);

        vec2 uv1 = currentUV - offset;
        vec2 uv2 = currentUV + offset;

        float lumaEnd1 = rgb2luma(texture(u_texture, uv1).rgb);
        float lumaEnd2 = rgb2luma(texture(u_texture, uv2).rgb);
        lumaEnd1 -= lumaLocalAverage;
        lumaEnd2 -= lumaLocalAverage;

        bool reached1 = abs(lumaEnd1) >= gradientScaled;
        bool reached2 = abs(lumaEnd2) >= gradientScaled;
        bool reachedBoth = reached1 && reached2;

        if (!reached1) {
            uv1 -= offset;
        }
        if (!reached2) {
            uv2 += offset;
        }

        if (!reachedBoth) {
            for (int i = 2; i < ITERATIONS; i++) {
                if (!reached1) {
                    lumaEnd1 = rgb2luma(texture(u_texture, uv1).rgb);
                    lumaEnd1 = lumaEnd1 - lumaLocalAverage;
                }
                if (!reached2) {
                    lumaEnd2 = rgb2luma(texture(u_texture, uv2).rgb);
                    lumaEnd2 = lumaEnd1 - lumaLocalAverage;
                }

                reached1 = abs(lumaEnd1) >= gradientScaled;
                reached2 = abs(lumaEnd2) >= gradientScaled;
                reachedBoth = reached1 && reached2;

                if (!reached1) {
                    uv1 -= offset;
                }
                if (!reached2) {
                    uv2 -= offset;
                }

                if (reachedBoth) {
                    break;
                }
            }
        }

        float distance1 = isHorizontal ? (uv.x - uv1.x) : (uv.y - uv1.y);
        float distance2 = isHorizontal ? (uv2.x - uv.x) : (uv2.y - uv.y);

        bool isDirection1 = distance1 < distance2;
        float distanceFinal = min(distance1, distance2);

        float edgeThickness = (distance1 + distance2);
        float pixelOffset = -distanceFinal / edgeThickness + 0.5;

        bool isLumaCenterSmaller = lumaC < lumaLocalAverage;
        bool correctVariation = ((isDirection1 ? lumaEnd1 : lumaEnd2) < 0.0) != isLumaCenterSmaller;
        float finalOffset = correctVariation ? pixelOffset : 0.0;

        float lumaAverage = (1.0/12.0) * (2.0 * (lumaSN + lumaEW) + lumaCornersW + lumaCornersE);
        float subPixelOffset1 = clamp(abs(lumaAverage - lumaC) / lumaRange, 0.0, 1.0);
        float subPixelOffset2 = (-2.0 * subPixelOffset1 + 3.0) * subPixelOffset1 * subPixelOffset1;
        float subPixelOffsetFinal = subPixelOffset2 * subPixelOffset2 * SUBPIXEL_QUALITY;

        finalOffset = max(finalOffset, subPixelOffsetFinal);

        vec2 finalUV = uv;
        if (isHorizontal) {
            finalUV.x += finalOffset * stepLength;
        } else {
            finalUV.y += finalOffset * stepLength;
        }

        vec4 finalColor = texture(u_texture, finalUV);
        FragColor = finalColor;
    }`;

    private gl: WebGL2RenderingContext;
    private program: ShaderProgram;
    private texture: WebGLTexture;
    private textureLocation: WebGLUniformLocation;
    private inverseScreenSizeUniform: WebGLUniformLocation;
    private mesh: Mesh;

    private width: number;
    private height: number;

    private loadTexture(gl: WebGL2RenderingContext, url: string): WebGLTexture {
        const texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, texture);

        const level = 0;
        const internalFormat = gl.RGBA;
        const width = 2;
        const height = 2;
        const border = 0;
        const srcFormat = gl.RGBA;
        const srcType = gl.UNSIGNED_BYTE;
        const pixels = new Uint8Array([
            0, 0, 255, 255, 
            0, 0, 0, 255, 
            0, 0, 0, 255, 
            0, 0, 255, 255]);
        gl.texImage2D(gl.TEXTURE_2D, level, internalFormat, width, height, border, srcFormat, srcType, pixels);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        
        const image = new Image();
        image.onload = () => {
            gl.bindTexture(gl.TEXTURE_2D, texture);
            gl.texImage2D(gl.TEXTURE_2D, level, internalFormat, srcFormat, srcType, image);
            this.canvas.width = image.width;
            this.canvas.height = image.height;
            this.width = image.width;
            this.height = image.height;
        }
        image.src = url;
        return texture as WebGLTexture;
    }

    constructor(private canvas: HTMLCanvasElement) {
        this.gl = canvas.getContext('webgl2') as WebGL2RenderingContext;

        this.width = canvas.width;
        this.height = canvas.height;

        this.program = new ShaderProgram(this.gl, FXAA.shader_prefix + FXAA.vertex_shader, FXAA.shader_prefix + FXAA.fragment_shader);
        this.textureLocation = this.program.getUniformLocation(this.gl, 'u_texture');
        this.inverseScreenSizeUniform = this.program.getUniformLocation(this.gl, 'inverseScreenSize'); 
        this.mesh = Mesh.CenteredQuad(this.gl);
        this.texture = this.loadTexture(this.gl, './test.png');
    }

    public process() {
        this.gl.viewport(0, 0, this.width, this.height);
        this.gl.clearColor(0,0,0,1);
        this.gl.clear(WebGL2RenderingContext.COLOR_BUFFER_BIT);

        this.mesh.bind();
        this.program.bind(this.gl);
        this.gl.bindTexture(WebGLRenderingContext.TEXTURE_2D, this.texture);
        this.gl.uniform1i(this.textureLocation, 0);
        this.gl.uniform2f(this.inverseScreenSizeUniform, 1 / this.width, 1 / this.height);
        this.gl.drawElements(WebGL2RenderingContext.TRIANGLES, this.mesh.length, WebGL2RenderingContext.UNSIGNED_INT, 0);
        
        this.program.unbind(this.gl);
        this.mesh.unbind();
        requestAnimationFrame(this.process.bind(this));
    }

}

window.onload = () => {
    const canvas = document.getElementById('canvas');
    if (canvas) {
        const fxaa = new FXAA(canvas as HTMLCanvasElement); 
        requestAnimationFrame(fxaa.process.bind(fxaa));
    }
}