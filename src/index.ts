import { Mesh } from "./util/mesh";

class App {

    private program : WebGLProgram;
    private mesh: Mesh;

    private readonly shader_prefix = `#version 300 es
    precision mediump float;`
    private readonly vertex_source = `
    in vec3 aPosition;
    
    void main() {
        gl_Position = vec4(aPosition.xyz * 0.5, 1.0);
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
        gl.useProgram(this.program);

        // #### Vertex data ####
        const index_data = new Uint32Array([0,1,2, 0,2,3]);
        const vertex_data = new Float32Array([-1,-1,0, 1,-1,0, 1,1,0, -1,1,0]);

        this.mesh = new Mesh(gl, vertex_data, index_data);
    }

    public Update() {
        const gl = this.gl;

        this.mesh.bind();
        gl.drawElements(WebGLRenderingContext.TRIANGLES, this.mesh.length, gl.UNSIGNED_INT, 0);
        this.mesh.unbind();
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
    app.Update();
}