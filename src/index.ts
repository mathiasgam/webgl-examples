import { vec3, mat4 } from "gl-matrix"
import { Camera } from "./util/camera";
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

    private moveX = 0;
    private moveY = 0;

    private camera: Camera;

    private readonly shader_prefix = `#version 300 es
    precision mediump float;`
    private readonly vertex_source = `
    layout(location = 0) in vec3 a_position;

    uniform mat4 u_transform;
    uniform mat4 u_projection;

    out vec3 v_color;
    
    void main() {
        gl_Position = u_projection * u_transform * vec4(a_position.xyz, 1.0);
        v_color = a_position * 0.25 + 0.5;
    }`
    private readonly fragment_source = `
    in vec3 v_color;
    
    layout(location = 0) out vec4 FragColor;
    
    void main() {
        FragColor = vec4(v_color, 1.0);
    }`

    private checkGLError(gl: WebGLRenderingContext) {
        const err = gl.getError();
        if (err) {
            throw new Error('WebGL Error: ' + err);
        }
    }

    public constructor(private gl: WebGL2RenderingContext, private width: number, private height: number) {

        gl.enable(WebGLRenderingContext.DEPTH_TEST);
        gl.enable(WebGLRenderingContext.CULL_FACE)
        gl.viewport(0, 0, width, height);

        gl.clearColor(.2,.4,.6,1.0);
        gl.clear(WebGLRenderingContext.COLOR_BUFFER_BIT | WebGLRenderingContext.DEPTH_BUFFER_BIT);

        this.program = new ShaderProgram(gl, this.shader_prefix + this.vertex_source, this.shader_prefix + this.fragment_source);
        this.checkGLError(gl);

        this.transformLocation = this.program.getUniformLocation(gl, 'u_transform');
        this.projectionLocation = this.program.getUniformLocation(gl, 'u_projection');

        this.mesh = Mesh.CenteredCube(gl);
        this.color = vec3.fromValues(.3,.5,.6);
        this.camera = new Camera();
        this.camera.position = vec3.fromValues(0,0,5);
        this.camera.fov = 70;

        this.width = width;
        this.height = height;
    }

    public Update(timestamp: number) {
        const gl = this.gl;

        const delta = (timestamp - this.lastFrame) * 0.001;
        this.lastFrame = timestamp;

        this.t += delta;

        this.camera.yaw += (1.68 / this.width) * this.moveX;
        this.camera.pitch += (1.68 / this.height) * this.moveY;

        this.moveX = 0;
        this.moveY = 0;

        const viewProjection = mat4.mul(mat4.create(), this.camera.projection, this.camera.view);
        const transform = mat4.create();

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

    public onMouseMoved(e: MouseEvent): void {
        console.log(e);
        if (e.buttons === 1) {
            this.moveX += e.movementX;
            this.moveY += e.movementY;
        }
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

    canvas.addEventListener('mousemove', app.onMouseMoved.bind(app));
}

