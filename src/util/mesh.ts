export class Mesh {
    private vao: WebGLVertexArrayObject;
    private bufferVertex: WebGLBuffer;
    private bufferIndex: WebGLBuffer;

    private numIndices: number;
    public get length(): number {
        return this.numIndices;
    }

    constructor(private gl: WebGL2RenderingContext, vertices: Float32Array, indices: Uint32Array) {
        this.vao = this.createVertexArrayObject(gl);
        gl.bindVertexArray(this.vao);

        this.bufferVertex = this.createBuffer(gl);
        gl.bindBuffer(WebGLRenderingContext.ARRAY_BUFFER, this.bufferVertex);
        gl.bufferData(WebGLRenderingContext.ARRAY_BUFFER, vertices, WebGLRenderingContext.STATIC_DRAW);

        this.bufferIndex = this.createBuffer(gl);
        gl.bindBuffer(WebGLRenderingContext.ELEMENT_ARRAY_BUFFER, this.bufferIndex);
        gl.bufferData(WebGLRenderingContext.ELEMENT_ARRAY_BUFFER, indices, WebGLRenderingContext.STATIC_DRAW);

        gl.vertexAttribPointer(0, 3, WebGLRenderingContext.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(0);

        gl.bindVertexArray(null);
        gl.bindBuffer(WebGLRenderingContext.ARRAY_BUFFER, null);
        gl.bindBuffer(WebGLRenderingContext.ELEMENT_ARRAY_BUFFER, null);

        this.numIndices = indices.length;
    }

    public delete(): void {
        const gl = this.gl;
        gl.deleteBuffer(this.bufferVertex);
        gl.deleteBuffer(this.bufferIndex);
        gl.deleteVertexArray(this.vao);
    }

    public bind(): void {
        this.gl.bindVertexArray(this.vao);
    }

    public unbind(): void {
        this.gl.bindVertexArray(null);
    }

    private createVertexArrayObject(gl: WebGL2RenderingContext): WebGLVertexArrayObject {
        const vao = gl.createVertexArray();
        if (vao === null) {
            throw new Error('Failed to create Vertex Array Object');
        }
        return vao as WebGLVertexArrayObject;
    }

    private createBuffer(gl: WebGL2RenderingContext): WebGLBuffer {
        const buffer = gl.createBuffer();
        if (buffer === null) {
            throw new Error('Failed to create buffer');
        }
        return buffer as WebGLBuffer;
    }
}