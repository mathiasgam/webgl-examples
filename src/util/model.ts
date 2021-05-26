import { mat4 } from "gl-matrix";
import { Mesh } from "./mesh";

export class Model {
    
    constructor(private mesh: Mesh, public transform: mat4) {

    }

    public render(gl: WebGL2RenderingContext) {
        this.mesh.bind();
        gl.drawElements(WebGLRenderingContext.TRIANGLES, this.mesh.length, WebGLRenderingContext.UNSIGNED_INT, 0);
        this.mesh.unbind();
    }
}