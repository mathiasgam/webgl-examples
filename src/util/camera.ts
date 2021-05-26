import { vec3, mat4 } from "gl-matrix";
export class Camera {
    private _projection: mat4;
    private _view: mat4;

    private _position: vec3;
    private _pitch: number;
    private _yaw: number;

    private _near = 0.01;
    private _far = 1000.0;
    private _fov = 70;

    private _viewChanged = true;
    private _projectionChanged = true;

    constructor() {
        this._projection = mat4.create();
        this._view = mat4.create();

        this._position = vec3.fromValues(0,0,0);
        this._pitch = 0;
        this._yaw = 0;
    }

    public get position() { return this._position; }
    public set position(val: vec3) {
        this._position = val;
        this._viewChanged = true;
    }

    public get pitch() { return this._pitch; }
    public set pitch(val: number) {
        this._pitch = val;
        this._viewChanged = true;
    }

    public get yaw() { return this._yaw; }
    public set yaw(val: number) {
        this._yaw = val;
        this._viewChanged = true;
    }

    public get near() { return this._yaw; }
    public set near(val: number) {
        this._near = val;
        this._projectionChanged = true;
    }

    public get far() { return this._far; }
    public set far(val: number) {
        this._far = val;
        this._projectionChanged = true;
    }

    public get fov() { return this._fov; }
    public set fov(val: number) {
        this._fov = val;
        this._projectionChanged = true;
    }

    public get projection(): mat4 {
        if (this._projectionChanged) {
            // mat4.perspectiveFromFieldOfView(this._projection, this._fov, this._near, this._far);
            mat4.perspective(this._projection, this._fov, 720.0/512.0, this._near, this._far);
            this._projectionChanged = false;
        }
        return mat4.clone(this._projection);
    }

    public get view(): mat4 {
        if (this._viewChanged) {
            const res = mat4.create();
            mat4.translate(res, res, this._position);
            mat4.rotateY(res, res, this._yaw);
            mat4.rotateX(res, res, this._pitch);
            mat4.invert(this._view, res);

            this._viewChanged = false;
        }
        return mat4.clone(this._view);
    }
}