import { vec3, mat4 } from "gl-matrix"
import { Mesh } from "./util/mesh";
import { ShaderProgram } from "./util/ShaderProgram";

class App {

    private program: ShaderProgram;
    private mesh: Mesh;

    private transformLocation: WebGLUniformLocation;
    private projectionLocation: WebGLUniformLocation;

    private lastFrame = 0;
    private t = 0;
    private color: vec3;

    private width: number;
    private height: number;

    private readonly shader_prefix = `#version 300 es
    precision mediump float;`
    private readonly vertex_source = `
    in vec3 a_position;

    uniform mat4 u_transform;
    uniform mat4 u_projection;

    out vec3 v_color;
    
    void main() {
        gl_Position = u_projection * u_transform * vec4(a_position.xyz * 0.5, 1.0);
        v_color = a_position * 0.25 + 0.5;
    }`
    private readonly fragment_source = `
    out vec4 FragColor;

    in vec3 v_color;
    
    void main() {
        FragColor = vec4(v_color, 1.0);
    }`

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

        this.program = new ShaderProgram(gl, this.shader_prefix + this.vertex_source, this.shader_prefix + this.fragment_source);
        this.checkGLError(gl);

        this.transformLocation = this.program.getUniformLocation(gl, 'u_transform');
        this.projectionLocation = this.program.getUniformLocation(gl, 'u_projection');

        this.mesh = Mesh.CenteredCube(gl);
        this.color = vec3.fromValues(.3,.5,.6);

        this.width = width;
        this.height = height;
    }

    public Update(timestamp: number) {
        const gl = this.gl;

        const delta = (timestamp - this.lastFrame) * 0.001;
        this.lastFrame = timestamp;

        this.t += delta;

        const fov = (Math.PI / 180) * 70;
        const projection = mat4.perspective(mat4.create(), fov, this.width / this.height, 0.1, 1000);
        const view = mat4.lookAt(mat4.create(), vec3.fromValues(3,0,0), vec3.fromValues(0,0,0), vec3.fromValues(0,1,0));
        const viewProjection = mat4.mul(mat4.create(), projection, view);
        

        const transform = mat4.create();
        mat4.rotateX(transform, transform, this.t);
        mat4.rotateY(transform, transform, this.t * 0.5);
        mat4.rotateZ(transform, transform, this.t * 0.2);
        // mat4.scale(transform, transform, vec3.fromValues(100, 100, 100));

        gl.clearColor(this.color[0], this.color[1], this.color[2], 1.0);
        gl.clear(WebGLRenderingContext.COLOR_BUFFER_BIT | WebGLRenderingContext.DEPTH_BUFFER_BIT);

        this.program.bind(gl);
        gl.uniformMatrix4fv(this.projectionLocation, false, viewProjection);
        gl.uniformMatrix4fv(this.transformLocation, false, transform);

        this.mesh.bind();
        gl.drawElements(WebGLRenderingContext.TRIANGLES, this.mesh.length, gl.UNSIGNED_INT, 0);
        this.mesh.unbind();

        this.program.unbind(gl);
        requestAnimationFrame(this.Update.bind(this));
    }

    public destroy() {
        const gl = this.gl;
        if (this.mesh) {
            this.mesh.delete();
        }
        this.program.delete(gl);
    }
}

window.onload = () => {
    const canvas : HTMLCanvasElement = document.getElementById('canvas') as HTMLCanvasElement;
    const gl = canvas.getContext('webgl2') as WebGL2RenderingContext;
    const app = new App(gl, canvas.width, canvas.height);
    requestAnimationFrame(app.Update.bind(app));
}