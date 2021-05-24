

class App {

    private vbo : WebGLBuffer;
    private ebo : WebGLBuffer;
    private program : WebGLProgram;

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

    private createBuffer(gl: WebGL2RenderingContext): WebGLBuffer {
        const buffer = gl.createBuffer();
        if (buffer === null) {
            throw new Error('Failed to create buffer');
        }
        return buffer as WebGLBuffer;
    }

    private createProgram(gl: WebGL2RenderingContext) {
        const program = gl.createProgram();
        if (program === null) {
            throw new Error('Failed to create program');
        }
        return program as WebGLProgram;
    }

    public constructor(private gl: WebGL2RenderingContext) {

        gl.clearColor(.2,.4,.6,1.0);
        gl.clear(WebGLRenderingContext.COLOR_BUFFER_BIT);
        
        // #### Vertex data ####
        const index_data = new Uint32Array([0,1,2, 0,2,3]);
        const vertex_data = new Float32Array([-1,-1,0, 1,-1,0, 1,1,0, -1,1,0]);

        this.vbo = this.createBuffer(gl);
        gl.bindBuffer(WebGLRenderingContext.ARRAY_BUFFER, this.vbo);
        gl.bufferData(WebGLRenderingContext.ARRAY_BUFFER, vertex_data, WebGLRenderingContext.STATIC_DRAW);

        this.ebo = this.createBuffer(gl);
        gl.bindBuffer(WebGLRenderingContext.ELEMENT_ARRAY_BUFFER, this.ebo);
        gl.bufferData(WebGLRenderingContext.ELEMENT_ARRAY_BUFFER, index_data, WebGLRenderingContext.STATIC_DRAW);
        
        // #### Shader program ####
        this.program = this.createProgram(gl);
        gl.attachShader(this.program, this.createVertexShader(gl));
        gl.attachShader(this.program, this.createFragmentShader(gl));
        gl.linkProgram(this.program);
        
        gl.useProgram(this.program);
        
        // #### bind shader attributes ####
        const locationPosition = gl.getAttribLocation(this.program, 'aPosition');
        gl.vertexAttribPointer(locationPosition, 3, WebGLRenderingContext.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(locationPosition);
        
        gl.drawElements(WebGLRenderingContext.TRIANGLES, index_data.length, gl.UNSIGNED_INT, 0);
    }

    public run() {

    }

    public destroy() {
        if (this.gl) {   
            if (this.vbo) {
                this.gl.deleteBuffer(this.vbo);
            }
            if (this.ebo) {
                this.gl.deleteBuffer(this.ebo);
            }
        }
    }
}

window.onload = () => {
    const canvas : HTMLCanvasElement = document.getElementById('canvas') as HTMLCanvasElement;
    const gl = canvas.getContext('webgl2') as WebGL2RenderingContext;
    const app = new App(gl);
    app.run();
}