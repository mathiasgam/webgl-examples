import { vec3, mat4 } from "gl-matrix"
import { Mesh } from "./util/mesh";

class App {

    private program : WebGLProgram;
    private mesh: Mesh;

    private transformLocation: WebGLUniformLocation;

    private lastFrame = 0;
    private t = 0;
    private transform: vec3;
    private color: vec3;

    private readonly shader_prefix = `#version 300 es
    precision mediump float;`
    private readonly vertex_source = `
    in vec3 aPosition;

    uniform mat4 u_transform;
    
    void main() {
        gl_Position = u_transform * vec4(aPosition.xyz * 0.5, 1.0);
    }`
    private readonly fragment_source = `
    out vec4 FragColor;
    
    void main() {
        FragColor = vec4(0.3, 0.8, 0.3, 1.0);
    }`
    
    private createShader(gl: WebGL2RenderingContext, type: number, source: string) {
        const shader = gl.createShader(type);
        if (shader === null) {
            throw new Error('Failed to create shader');
        }
        gl.shaderSource(shader, source);
        gl.compileShader(shader);
        
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            var log = gl.getShaderInfoLog(shader);
            throw new Error('FAILED to compile shader: ' + log);
        }
        return shader;
    }
    
    private createVertexShader(gl: WebGL2RenderingContext) {
        return this.createShader(gl, WebGLRenderingContext.VERTEX_SHADER, this.shader_prefix + this.vertex_source);
    }

    private createFragmentShader(gl: WebGL2RenderingContext) {
        return this.createShader(gl, WebGLRenderingContext.FRAGMENT_SHADER, this.shader_prefix + this.fragment_source);
    }

    private createProgram(gl: WebGL2RenderingContext) {
        const program = gl.createProgram();
        if (program === null) {
            throw new Error('Failed to create program');
        }
        return program as WebGLProgram;
    }

    private getUniformLocation(gl: WebGLRenderingContext, program: WebGLProgram, name: string): WebGLUniformLocation {
        const location = gl.getUniformLocation(program, name);
        if (location === null) {
            throw new Error('Failed to find uniform: "' + name + '"');
        }
        return location;
    }

    private checkGLError(gl: WebGLRenderingContext) {
        const err = gl.getError();
        if (err) {
            throw new Error('WebGL Error: ' + err);
        }
    }

    public constructor(private gl: WebGL2RenderingContext, width: number, height: number) {

        gl.enable(WebGLRenderingContext.DEPTH_TEST);
        gl.viewport(0, 0, width, height);

        gl.clearColor(.2,.4,.6,1.0);
        gl.clear(WebGLRenderingContext.COLOR_BUFFER_BIT | WebGLRenderingContext.DEPTH_BUFFER_BIT);

        // #### Shader program ####
        this.program = this.createProgram(gl);
        gl.attachShader(this.program, this.createVertexShader(gl));
        gl.attachShader(this.program, this.createFragmentShader(gl));
        gl.linkProgram(this.program);
        this.checkGLError(gl);

        this.transformLocation = this.getUniformLocation(gl, this.program, 'u_transform');

        this.mesh = Mesh.CenteredCube(gl);
        this.transform = vec3.fromValues(0.25,0,0);
        this.color = vec3.fromValues(.3,.5,.6);
    }

    public Update(timestamp: number) {
        const gl = this.gl;

        const delta = (timestamp - this.lastFrame) * 0.001;
        this.lastFrame = timestamp;

        this.t = this.t + delta;
        this.transform = vec3.fromValues(Math.sin(this.t), 0,0);

        const transform = mat4.create();
        mat4.rotateX(transform, transform, this.t);
        mat4.rotateY(transform, transform, this.t * 0.5);
        mat4.rotateZ(transform, transform, this.t * 0.2);

        gl.clearColor(this.color[0], this.color[1], this.color[2], 1.0);
        gl.clear(WebGLRenderingContext.COLOR_BUFFER_BIT | WebGLRenderingContext.DEPTH_BUFFER_BIT);

        gl.useProgram(this.program);
        gl.uniformMatrix4fv(this.transformLocation, false, transform);

        this.mesh.bind();
        gl.drawElements(WebGLRenderingContext.TRIANGLES, this.mesh.length, gl.UNSIGNED_INT, 0);
        this.mesh.unbind();

        gl.useProgram(null);
        requestAnimationFrame(this.Update.bind(this));
    }

    public destroy() {
        if (this.mesh) {
            this.mesh.delete();
        }
    }
}

window.onload = () => {
    const canvas : HTMLCanvasElement = document.getElementById('canvas') as HTMLCanvasElement;
    const gl = canvas.getContext('webgl2') as WebGL2RenderingContext;
    const app = new App(gl, canvas.width, canvas.height);
    requestAnimationFrame(app.Update.bind(app));
}