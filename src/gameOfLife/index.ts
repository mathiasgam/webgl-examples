import { Mesh } from "../util/mesh";
import { ShaderProgram } from "../util/ShaderProgram";

class App {

    private static readonly shader_prefix = `#version 300 es
    precision mediump float;
    `
    private static readonly vertex_source = `
    layout(location = 0) in vec3 a_position;
    void main() {
        gl_Position = vec4(a_position.xyz, 1.0);
    }
    `
    private static readonly fragment_source = `
    layout(location = 0) out vec4 FragColor;
    uniform sampler2D u_texture;

    int get(ivec2 fragCoord, ivec2 offset) {
        return int(texelFetch(u_texture, fragCoord + offset, 0).r);
    }

    void main() {
        ivec2 fc = ivec2(gl_FragCoord.xy);
        int sum = 
            get(fc, ivec2(-1,-1)) +
            get(fc, ivec2( 1,-1)) + 
            get(fc, ivec2(-1, 1)) + 
            get(fc, ivec2( 1, 1)) + 
            get(fc, ivec2( 0,-1)) + 
            get(fc, ivec2( 0, 1)) + 
            get(fc, ivec2(-1, 0)) + 
            get(fc, ivec2( 1, 0));
        if (sum == 3) {
            FragColor = vec4(1.0, 1.0, 1.0, 1.0);
        } else if (sum == 2) {
            FragColor = texelFetch(u_texture, fc, 0);
        } else  {
            FragColor = vec4(0.0, 0.0, 0.0, 1.0);
        }
    }`

    private static readonly vertex_blit = `
    layout(location = 0) in vec3 a_position;
    out vec2 uv;
    void main() {
        gl_Position = vec4(a_position.xyz, 1.0);
        uv = a_position.xy * 0.5 + 0.5;
    }`

    private static readonly fragment_blit = `
    layout(location = 0) out vec4 FragColor;
    uniform sampler2D u_texture;
    in vec2 uv;
    void main() {
        FragColor = texture(u_texture, uv);
    }`

    private program: ShaderProgram;
    private textureTarget: WebGLTexture;
    private textureSource: WebGLTexture;
    private framebuffer: WebGLFramebuffer;

    private textureLocation: WebGLUniformLocation;
    private textureLocationBlit: WebGLUniformLocation;

    private programBlit: ShaderProgram;

    private quad: Mesh;

    private gl: WebGL2RenderingContext;
    private width: number;
    private height: number;

    private createTexture(gl: WebGLRenderingContext, width: number, height: number): WebGLTexture {
        const texture = gl.createTexture();
        if (texture === null) {
            throw new Error('Failed to create texture');
        }

        const N = width * height;
        const pixels = new Uint8Array(N * 4);

        for (let i = 0; i < N; i++) {
            const val = Math.random() < 0.5 ? 0 : 255;
            pixels[i * 4] = val;
            pixels[i * 4 + 1] = 0;
            pixels[i * 4 + 2] = 0;
            pixels[i * 4 + 3] = 255;
        }

        gl.bindTexture(WebGLRenderingContext.TEXTURE_2D, texture);
        gl.texImage2D(WebGLRenderingContext.TEXTURE_2D, 0, WebGLRenderingContext.RGBA, width, height, 0, WebGLRenderingContext.RGBA, WebGLRenderingContext.UNSIGNED_BYTE, pixels);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

        return texture as WebGLTexture;
    }

    private createFrameBuffer(gl: WebGLRenderingContext): WebGLFramebuffer {
        const framebuffer = gl.createFramebuffer();
        if (framebuffer === null) {
            throw new Error('Failed to create framebuffer');
        }
        return framebuffer as WebGLFramebuffer;
    }

    private checkGLError(gl: WebGLRenderingContext) {
        const err = gl.getError();
        if (err) {
            throw new Error('WebGL Error: ' + err);
        }
    }

    constructor(canvas: HTMLCanvasElement) {
        this.width = canvas.width;
        this.height = canvas.height;

        const gl = canvas.getContext('webgl2') as WebGL2RenderingContext;
        this.gl = gl;
        gl.viewport(0,0,this.width,this.height);

        gl.clearColor(0,0,0,1);
        gl.clear(WebGLRenderingContext.COLOR_BUFFER_BIT);


        this.program = new ShaderProgram(gl, App.shader_prefix + App.vertex_source, App.shader_prefix + App.fragment_source);
        this.programBlit = new ShaderProgram(gl, App.shader_prefix + App.vertex_blit, App.shader_prefix + App.fragment_blit);
        this.textureLocation = this.program.getUniformLocation(gl, 'u_texture');
        this.textureLocationBlit = this.programBlit.getUniformLocation(gl, 'u_texture');

        this.quad = Mesh.CenteredQuad(gl);

        this.textureTarget = this.createTexture(gl, this.width, this.height);
        this.textureSource = this.createTexture(gl, this.width, this.height);

        this.framebuffer = this.createFrameBuffer(gl);

    }

    public Update(timestamp: number): void {
        requestAnimationFrame(this.Update.bind(this));
        this.quad.bind();

        
        this.program.bind(this.gl);
        this.gl.bindTexture(WebGLRenderingContext.TEXTURE_2D, this.textureSource);

        this.gl.bindFramebuffer(WebGLRenderingContext.FRAMEBUFFER, this.framebuffer);
        this.gl.framebufferTexture2D(WebGLRenderingContext.FRAMEBUFFER, WebGLRenderingContext.COLOR_ATTACHMENT0, WebGLRenderingContext.TEXTURE_2D, this.textureTarget, 0);

        this.gl.drawElements(WebGLRenderingContext.TRIANGLES, this.quad.length, WebGLRenderingContext.UNSIGNED_INT, 0);
        

        this.gl.bindFramebuffer(WebGLRenderingContext.FRAMEBUFFER, null);
        this.gl.viewport(0, 0, this.width, this.height);

        this.gl.clear(WebGLRenderingContext.COLOR_BUFFER_BIT);
        
        this.programBlit.bind(this.gl);
        this.gl.bindTexture(WebGLRenderingContext.TEXTURE_2D, this.textureSource);
        this.gl.uniform1i(this.textureLocationBlit, 0);
        this.gl.drawElements(WebGLRenderingContext.TRIANGLES, this.quad.length, WebGLRenderingContext.UNSIGNED_INT, 0);
        this.programBlit.unbind(this.gl);
        
        this.quad.unbind();

        const tmp = this.textureTarget;
        this.textureTarget = this.textureSource;
        this.textureSource = tmp;

        this.checkGLError(this.gl);
    }

}

window.onload = () => {
    console.clear();
    const canvas = document.getElementById('canvas') as HTMLCanvasElement;
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
    const app = new App(canvas);
    requestAnimationFrame(app.Update.bind(app));
}