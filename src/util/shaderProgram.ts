export class ShaderProgram {

    private program: WebGLProgram;
    public get value(): WebGLProgram {
        return this.program;
    }

    private static createProgram(gl: WebGLRenderingContext): WebGLProgram {
        const program = gl.createProgram();
        if (program === null) {
            throw new Error('Failed to create WebGLProgram');
        }
        return program as WebGLProgram;
    }

    private static createShader(gl: WebGLRenderingContext, type: number, source: string): WebGLShader {
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

    constructor(gl: WebGLRenderingContext, vertexSource: string, fragmentSource: string) {
        // Create Program
        this.program = ShaderProgram.createProgram(gl);

        // Compile shaders
        const vertex = ShaderProgram.createShader(gl, WebGLRenderingContext.VERTEX_SHADER, vertexSource);
        const fragment = ShaderProgram.createShader(gl, WebGLRenderingContext.FRAGMENT_SHADER, fragmentSource);

        // Attach and link shaders to the program
        gl.attachShader(this.program, vertex);
        gl.attachShader(this.program, fragment);
        gl.linkProgram(this.program);

        // Delete the shaders
        gl.deleteShader(vertex);
        gl.deleteShader(fragment);
    }

    public bind(gl: WebGLRenderingContext): void {
        gl.useProgram(this.program);
    }

    public unbind(gl: WebGLRenderingContext): void {
        gl.useProgram(null);
    }

    public getUniformLocation(gl: WebGLRenderingContext, name: string): WebGLUniformLocation {
        const location = gl.getUniformLocation(this.program, name);
        if (location === null) {
            throw new Error('Failed to find uniform: "' + name + '"');
        }
        return location;
    }

    public delete(gl: WebGLRenderingContext): void {
        gl.deleteProgram(this.program);
    }

}