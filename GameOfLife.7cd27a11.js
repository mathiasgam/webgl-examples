parcelRequire=function(e,r,t,n){var i,o="function"==typeof parcelRequire&&parcelRequire,u="function"==typeof require&&require;function f(t,n){if(!r[t]){if(!e[t]){var i="function"==typeof parcelRequire&&parcelRequire;if(!n&&i)return i(t,!0);if(o)return o(t,!0);if(u&&"string"==typeof t)return u(t);var c=new Error("Cannot find module '"+t+"'");throw c.code="MODULE_NOT_FOUND",c}p.resolve=function(r){return e[t][1][r]||r},p.cache={};var l=r[t]=new f.Module(t);e[t][0].call(l.exports,p,l,l.exports,this)}return r[t].exports;function p(e){return f(p.resolve(e))}}f.isParcelRequire=!0,f.Module=function(e){this.id=e,this.bundle=f,this.exports={}},f.modules=e,f.cache=r,f.parent=o,f.register=function(r,t){e[r]=[function(e,r){r.exports=t},{}]};for(var c=0;c<t.length;c++)try{f(t[c])}catch(e){i||(i=e)}if(t.length){var l=f(t[t.length-1]);"object"==typeof exports&&"undefined"!=typeof module?module.exports=l:"function"==typeof define&&define.amd?define(function(){return l}):n&&(this[n]=l)}if(parcelRequire=f,i)throw i;return f}({"YZT3":[function(require,module,exports) {
"use strict";Object.defineProperty(exports,"__esModule",{value:!0});var e=function(){function e(e,r,t){this.gl=e,this.vao=this.createVertexArrayObject(e),e.bindVertexArray(this.vao),this.bufferVertex=this.createBuffer(e),e.bindBuffer(WebGLRenderingContext.ARRAY_BUFFER,this.bufferVertex),e.bufferData(WebGLRenderingContext.ARRAY_BUFFER,r,WebGLRenderingContext.STATIC_DRAW),this.bufferIndex=this.createBuffer(e),e.bindBuffer(WebGLRenderingContext.ELEMENT_ARRAY_BUFFER,this.bufferIndex),e.bufferData(WebGLRenderingContext.ELEMENT_ARRAY_BUFFER,t,WebGLRenderingContext.STATIC_DRAW),e.vertexAttribPointer(0,3,WebGLRenderingContext.FLOAT,!1,0,0),e.enableVertexAttribArray(0),e.bindVertexArray(null),e.bindBuffer(WebGLRenderingContext.ARRAY_BUFFER,null),e.bindBuffer(WebGLRenderingContext.ELEMENT_ARRAY_BUFFER,null),this.numIndices=t.length}return Object.defineProperty(e.prototype,"length",{get:function(){return this.numIndices},enumerable:!0,configurable:!0}),e.prototype.delete=function(){var e=this.gl;e.deleteBuffer(this.bufferVertex),e.deleteBuffer(this.bufferIndex),e.deleteVertexArray(this.vao)},e.prototype.bind=function(){this.gl.bindVertexArray(this.vao)},e.prototype.unbind=function(){this.gl.bindVertexArray(null)},e.prototype.createVertexArrayObject=function(e){var r=e.createVertexArray();if(null===r)throw new Error("Failed to create Vertex Array Object");return r},e.prototype.createBuffer=function(e){var r=e.createBuffer();if(null===r)throw new Error("Failed to create buffer");return r},e.CenteredQuad=function(r){var t=new Uint32Array([0,1,2,0,2,3]);return new e(r,new Float32Array([-1,-1,0,1,-1,0,1,1,0,-1,1,0]),t)},e.CenteredCube=function(r){var t=new Uint32Array([1,2,3,7,6,5,4,5,1,5,6,2,2,6,7,0,3,7,0,1,3,4,7,5,0,4,1,1,5,2,3,2,7,4,0,7]);return new e(r,new Float32Array([1,-1,-1,1,-1,1,-1,-1,1,-1,-1,-1,1,1,-1,1,1,1,-1,1,1,-1,1,-1]),t)},e}();exports.Mesh=e;
},{}],"txGY":[function(require,module,exports) {
"use strict";Object.defineProperty(exports,"__esModule",{value:!0});var r=function(){function r(e,t,o){this.program=r.createProgram(e);var a=r.createShader(e,WebGLRenderingContext.VERTEX_SHADER,t),n=r.createShader(e,WebGLRenderingContext.FRAGMENT_SHADER,o);e.attachShader(this.program,a),e.attachShader(this.program,n),e.linkProgram(this.program),e.deleteShader(a),e.deleteShader(n)}return Object.defineProperty(r.prototype,"value",{get:function(){return this.program},enumerable:!0,configurable:!0}),r.createProgram=function(r){var e=r.createProgram();if(null===e)throw new Error("Failed to create WebGLProgram");return e},r.createShader=function(r,e,t){var o=r.createShader(e);if(null===o)throw new Error("Failed to create shader");if(r.shaderSource(o,t),r.compileShader(o),!r.getShaderParameter(o,r.COMPILE_STATUS)){var a=r.getShaderInfoLog(o);throw new Error("FAILED to compile shader: "+a)}return o},r.prototype.bind=function(r){r.useProgram(this.program)},r.prototype.unbind=function(r){r.useProgram(null)},r.prototype.getUniformLocation=function(r,e){var t=r.getUniformLocation(this.program,e);if(null===t)throw new Error('Failed to find uniform: "'+e+'"');return t},r.prototype.delete=function(r){r.deleteProgram(this.program)},r}();exports.ShaderProgram=r;
},{}],"nWkL":[function(require,module,exports) {
"use strict";Object.defineProperty(exports,"__esModule",{value:!0});var e=require("../util/mesh"),t=require("../util/ShaderProgram"),r=function(){function r(i){this.width=i.width,this.height=i.height;var n=i.getContext("webgl2");this.gl=n,n.viewport(0,0,this.width,this.height),n.clearColor(0,0,0,1),n.clear(WebGLRenderingContext.COLOR_BUFFER_BIT),this.program=new t.ShaderProgram(n,r.shader_prefix+r.vertex_source,r.shader_prefix+r.fragment_source),this.programBlit=new t.ShaderProgram(n,r.shader_prefix+r.vertex_blit,r.shader_prefix+r.fragment_blit),this.textureLocation=this.program.getUniformLocation(n,"u_texture"),this.textureLocationBlit=this.programBlit.getUniformLocation(n,"u_texture"),this.quad=e.Mesh.CenteredQuad(n),this.textureTarget=this.createTexture(n,this.width,this.height),this.textureSource=this.createTexture(n,this.width,this.height),this.framebuffer=this.createFrameBuffer(n)}return r.prototype.createTexture=function(e,t,r){var i=e.createTexture();if(null===i)throw new Error("Failed to create texture");for(var n=t*r,o=new Uint8Array(4*n),a=0;a<n;a++){var u=Math.random()<.5?0:255;o[4*a]=u,o[4*a+1]=0,o[4*a+2]=0,o[4*a+3]=255}return e.bindTexture(WebGLRenderingContext.TEXTURE_2D,i),e.texImage2D(WebGLRenderingContext.TEXTURE_2D,0,WebGLRenderingContext.RGBA,t,r,0,WebGLRenderingContext.RGBA,WebGLRenderingContext.UNSIGNED_BYTE,o),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_S,e.REPEAT),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_T,e.REPEAT),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MIN_FILTER,e.NEAREST),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MAG_FILTER,e.NEAREST),i},r.prototype.createFrameBuffer=function(e){var t=e.createFramebuffer();if(null===t)throw new Error("Failed to create framebuffer");return t},r.prototype.checkGLError=function(e){var t=e.getError();if(t)throw new Error("WebGL Error: "+t)},r.prototype.Update=function(e){requestAnimationFrame(this.Update.bind(this)),this.quad.bind(),this.program.bind(this.gl),this.gl.bindTexture(WebGLRenderingContext.TEXTURE_2D,this.textureSource),this.gl.bindFramebuffer(WebGLRenderingContext.FRAMEBUFFER,this.framebuffer),this.gl.framebufferTexture2D(WebGLRenderingContext.FRAMEBUFFER,WebGLRenderingContext.COLOR_ATTACHMENT0,WebGLRenderingContext.TEXTURE_2D,this.textureTarget,0),this.gl.drawElements(WebGLRenderingContext.TRIANGLES,this.quad.length,WebGLRenderingContext.UNSIGNED_INT,0),this.gl.bindFramebuffer(WebGLRenderingContext.FRAMEBUFFER,null),this.gl.viewport(0,0,this.width,this.height),this.gl.clear(WebGLRenderingContext.COLOR_BUFFER_BIT),this.programBlit.bind(this.gl),this.gl.bindTexture(WebGLRenderingContext.TEXTURE_2D,this.textureSource),this.gl.uniform1i(this.textureLocationBlit,0),this.gl.drawElements(WebGLRenderingContext.TRIANGLES,this.quad.length,WebGLRenderingContext.UNSIGNED_INT,0),this.programBlit.unbind(this.gl),this.quad.unbind();var t=this.textureTarget;this.textureTarget=this.textureSource,this.textureSource=t,this.checkGLError(this.gl)},r.shader_prefix="#version 300 es\n    precision mediump float;\n    ",r.vertex_source="\n    layout(location = 0) in vec3 a_position;\n    void main() {\n        gl_Position = vec4(a_position.xyz, 1.0);\n    }\n    ",r.fragment_source="\n    layout(location = 0) out vec4 FragColor;\n    uniform sampler2D u_texture;\n\n    int get(ivec2 fragCoord, ivec2 offset) {\n        return int(texelFetch(u_texture, fragCoord + offset, 0).r);\n    }\n\n    void main() {\n        ivec2 fc = ivec2(gl_FragCoord.xy);\n        int sum = \n            get(fc, ivec2(-1,-1)) +\n            get(fc, ivec2( 1,-1)) + \n            get(fc, ivec2(-1, 1)) + \n            get(fc, ivec2( 1, 1)) + \n            get(fc, ivec2( 0,-1)) + \n            get(fc, ivec2( 0, 1)) + \n            get(fc, ivec2(-1, 0)) + \n            get(fc, ivec2( 1, 0));\n        if (sum == 3) {\n            FragColor = vec4(1.0, 1.0, 1.0, 1.0);\n        } else if (sum == 2) {\n            FragColor = texelFetch(u_texture, fc, 0);\n        } else  {\n            FragColor = vec4(0.0, 0.0, 0.0, 1.0);\n        }\n    }",r.vertex_blit="\n    layout(location = 0) in vec3 a_position;\n    out vec2 uv;\n    void main() {\n        gl_Position = vec4(a_position.xyz, 1.0);\n        uv = a_position.xy * 0.5 + 0.5;\n    }",r.fragment_blit="\n    layout(location = 0) out vec4 FragColor;\n    uniform sampler2D u_texture;\n    in vec2 uv;\n    void main() {\n        FragColor = texture(u_texture, uv);\n    }",r}();window.onload=function(){console.clear();var e=document.getElementById("canvas");e.width=e.clientWidth,e.height=e.clientHeight;var t=new r(e);requestAnimationFrame(t.Update.bind(t))};
},{"../util/mesh":"YZT3","../util/ShaderProgram":"txGY"}]},{},["nWkL"], null)
//# sourceMappingURL=GameOfLife.7cd27a11.js.map