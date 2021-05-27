// modules are defined as an array
// [ module function, map of requires ]
//
// map of requires is short require name -> numeric require
//
// anything defined in a previous bundle is accessed via the
// orig method which is the require for previous bundles
parcelRequire = (function (modules, cache, entry, globalName) {
  // Save the require from previous bundle to this closure if any
  var previousRequire = typeof parcelRequire === 'function' && parcelRequire;
  var nodeRequire = typeof require === 'function' && require;

  function newRequire(name, jumped) {
    if (!cache[name]) {
      if (!modules[name]) {
        // if we cannot find the module within our internal map or
        // cache jump to the current global require ie. the last bundle
        // that was added to the page.
        var currentRequire = typeof parcelRequire === 'function' && parcelRequire;
        if (!jumped && currentRequire) {
          return currentRequire(name, true);
        }

        // If there are other bundles on this page the require from the
        // previous one is saved to 'previousRequire'. Repeat this as
        // many times as there are bundles until the module is found or
        // we exhaust the require chain.
        if (previousRequire) {
          return previousRequire(name, true);
        }

        // Try the node require function if it exists.
        if (nodeRequire && typeof name === 'string') {
          return nodeRequire(name);
        }

        var err = new Error('Cannot find module \'' + name + '\'');
        err.code = 'MODULE_NOT_FOUND';
        throw err;
      }

      localRequire.resolve = resolve;
      localRequire.cache = {};

      var module = cache[name] = new newRequire.Module(name);

      modules[name][0].call(module.exports, localRequire, module, module.exports, this);
    }

    return cache[name].exports;

    function localRequire(x){
      return newRequire(localRequire.resolve(x));
    }

    function resolve(x){
      return modules[name][1][x] || x;
    }
  }

  function Module(moduleName) {
    this.id = moduleName;
    this.bundle = newRequire;
    this.exports = {};
  }

  newRequire.isParcelRequire = true;
  newRequire.Module = Module;
  newRequire.modules = modules;
  newRequire.cache = cache;
  newRequire.parent = previousRequire;
  newRequire.register = function (id, exports) {
    modules[id] = [function (require, module) {
      module.exports = exports;
    }, {}];
  };

  var error;
  for (var i = 0; i < entry.length; i++) {
    try {
      newRequire(entry[i]);
    } catch (e) {
      // Save first error but execute all entries
      if (!error) {
        error = e;
      }
    }
  }

  if (entry.length) {
    // Expose entry point to Node, AMD or browser globals
    // Based on https://github.com/ForbesLindesay/umd/blob/master/template.js
    var mainExports = newRequire(entry[entry.length - 1]);

    // CommonJS
    if (typeof exports === "object" && typeof module !== "undefined") {
      module.exports = mainExports;

    // RequireJS
    } else if (typeof define === "function" && define.amd) {
     define(function () {
       return mainExports;
     });

    // <script>
    } else if (globalName) {
      this[globalName] = mainExports;
    }
  }

  // Override the current require with this new one
  parcelRequire = newRequire;

  if (error) {
    // throw error from earlier, _after updating parcelRequire_
    throw error;
  }

  return newRequire;
})({"util/mesh.ts":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var Mesh =
/** @class */
function () {
  function Mesh(gl, vertices, indices) {
    this.gl = gl;
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

  Object.defineProperty(Mesh.prototype, "length", {
    get: function get() {
      return this.numIndices;
    },
    enumerable: true,
    configurable: true
  });

  Mesh.prototype.delete = function () {
    var gl = this.gl;
    gl.deleteBuffer(this.bufferVertex);
    gl.deleteBuffer(this.bufferIndex);
    gl.deleteVertexArray(this.vao);
  };

  Mesh.prototype.bind = function () {
    this.gl.bindVertexArray(this.vao);
  };

  Mesh.prototype.unbind = function () {
    this.gl.bindVertexArray(null);
  };

  Mesh.prototype.createVertexArrayObject = function (gl) {
    var vao = gl.createVertexArray();

    if (vao === null) {
      throw new Error('Failed to create Vertex Array Object');
    }

    return vao;
  };

  Mesh.prototype.createBuffer = function (gl) {
    var buffer = gl.createBuffer();

    if (buffer === null) {
      throw new Error('Failed to create buffer');
    }

    return buffer;
  };

  Mesh.CenteredQuad = function (gl) {
    var indices = new Uint32Array([0, 1, 2, 0, 2, 3]);
    var vertices = new Float32Array([-1, -1, 0, 1, -1, 0, 1, 1, 0, -1, 1, 0]);
    return new Mesh(gl, vertices, indices);
  };

  Mesh.CenteredCube = function (gl) {
    var indices = new Uint32Array([1, 2, 3, 7, 6, 5, 4, 5, 1, 5, 6, 2, 2, 6, 7, 0, 3, 7, 0, 1, 3, 4, 7, 5, 0, 4, 1, 1, 5, 2, 3, 2, 7, 4, 0, 7]);
    var vertices = new Float32Array([1, -1, -1, 1, -1, 1, -1, -1, 1, -1, -1, -1, 1, 1, -1, 1, 1, 1, -1, 1, 1, -1, 1, -1]);
    return new Mesh(gl, vertices, indices);
  };

  return Mesh;
}();

exports.Mesh = Mesh;
},{}],"util/ShaderProgram.ts":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var ShaderProgram =
/** @class */
function () {
  function ShaderProgram(gl, vertexSource, fragmentSource) {
    // Create Program
    this.program = ShaderProgram.createProgram(gl); // Compile shaders

    var vertex = ShaderProgram.createShader(gl, WebGLRenderingContext.VERTEX_SHADER, vertexSource);
    var fragment = ShaderProgram.createShader(gl, WebGLRenderingContext.FRAGMENT_SHADER, fragmentSource); // Attach and link shaders to the program

    gl.attachShader(this.program, vertex);
    gl.attachShader(this.program, fragment);
    gl.linkProgram(this.program); // Delete the shaders

    gl.deleteShader(vertex);
    gl.deleteShader(fragment);
  }

  Object.defineProperty(ShaderProgram.prototype, "value", {
    get: function get() {
      return this.program;
    },
    enumerable: true,
    configurable: true
  });

  ShaderProgram.createProgram = function (gl) {
    var program = gl.createProgram();

    if (program === null) {
      throw new Error('Failed to create WebGLProgram');
    }

    return program;
  };

  ShaderProgram.createShader = function (gl, type, source) {
    var shader = gl.createShader(type);

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
  };

  ShaderProgram.prototype.bind = function (gl) {
    gl.useProgram(this.program);
  };

  ShaderProgram.prototype.unbind = function (gl) {
    gl.useProgram(null);
  };

  ShaderProgram.prototype.getUniformLocation = function (gl, name) {
    var location = gl.getUniformLocation(this.program, name);

    if (location === null) {
      throw new Error('Failed to find uniform: "' + name + '"');
    }

    return location;
  };

  ShaderProgram.prototype.delete = function (gl) {
    gl.deleteProgram(this.program);
  };

  return ShaderProgram;
}();

exports.ShaderProgram = ShaderProgram;
},{}],"index.ts":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var mesh_1 = require("../util/mesh");

var ShaderProgram_1 = require("../util/ShaderProgram");

var App =
/** @class */
function () {
  function App(canvas) {
    this.width = canvas.width;
    this.height = canvas.height;
    var gl = canvas.getContext('webgl2');
    this.gl = gl;
    gl.viewport(0, 0, this.width, this.height);
    gl.clearColor(0, 0, 0, 1);
    gl.clear(WebGLRenderingContext.COLOR_BUFFER_BIT);
    this.program = new ShaderProgram_1.ShaderProgram(gl, App.shader_prefix + App.vertex_source, App.shader_prefix + App.fragment_source);
    this.programBlit = new ShaderProgram_1.ShaderProgram(gl, App.shader_prefix + App.vertex_blit, App.shader_prefix + App.fragment_blit);
    this.textureLocation = this.program.getUniformLocation(gl, 'u_texture');
    this.textureLocationBlit = this.programBlit.getUniformLocation(gl, 'u_texture');
    this.quad = mesh_1.Mesh.CenteredQuad(gl);
    this.textureTarget = this.createTexture(gl, this.width, this.height);
    this.textureSource = this.createTexture(gl, this.width, this.height);
    this.framebuffer = this.createFrameBuffer(gl);
  }

  App.prototype.createTexture = function (gl, width, height) {
    var texture = gl.createTexture();

    if (texture === null) {
      throw new Error('Failed to create texture');
    }

    var N = width * height;
    var pixels = new Uint8Array(N * 4);

    for (var i = 0; i < N; i++) {
      var val = Math.random() < 0.5 ? 0 : 255;
      pixels[i * 4] = val;
      pixels[i * 4 + 1] = 0;
      pixels[i * 4 + 2] = 0;
      pixels[i * 4 + 3] = 255;
    }

    gl.bindTexture(WebGLRenderingContext.TEXTURE_2D, texture);
    gl.texImage2D(WebGLRenderingContext.TEXTURE_2D, 0, WebGLRenderingContext.RGBA, width, height, 0, WebGLRenderingContext.RGBA, WebGLRenderingContext.UNSIGNED_BYTE, pixels);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    return texture;
  };

  App.prototype.createFrameBuffer = function (gl) {
    var framebuffer = gl.createFramebuffer();

    if (framebuffer === null) {
      throw new Error('Failed to create framebuffer');
    }

    return framebuffer;
  };

  App.prototype.checkGLError = function (gl) {
    var err = gl.getError();

    if (err) {
      throw new Error('WebGL Error: ' + err);
    }
  };

  App.prototype.Update = function (timestamp) {
    requestAnimationFrame(this.Update.bind(this));
    this.quad.bind();
    this.program.bind(this.gl);
    this.gl.bindTexture(WebGLRenderingContext.TEXTURE_2D, this.textureSource);
    this.gl.bindFramebuffer(WebGLRenderingContext.FRAMEBUFFER, this.framebuffer);
    this.gl.framebufferTexture2D(WebGLRenderingContext.FRAMEBUFFER, WebGLRenderingContext.COLOR_ATTACHMENT0, WebGLRenderingContext.TEXTURE_2D, this.textureTarget, 0);
    this.gl.drawElements(WebGLRenderingContext.TRIANGLES, this.quad.length, WebGLRenderingContext.UNSIGNED_INT, 0);
    this.gl.bindFramebuffer(WebGLRenderingContext.FRAMEBUFFER, null);
    this.gl.viewport(0, 0, this.width, this.height);
    this.gl.clear(WebGLRenderingContext.COLOR_BUFFER_BIT);
    this.programBlit.bind(this.gl);
    this.gl.bindTexture(WebGLRenderingContext.TEXTURE_2D, this.textureSource);
    this.gl.uniform1i(this.textureLocationBlit, 0);
    this.gl.drawElements(WebGLRenderingContext.TRIANGLES, this.quad.length, WebGLRenderingContext.UNSIGNED_INT, 0);
    this.programBlit.unbind(this.gl);
    this.quad.unbind();
    var tmp = this.textureTarget;
    this.textureTarget = this.textureSource;
    this.textureSource = tmp;
    this.checkGLError(this.gl);
  };

  App.shader_prefix = "#version 300 es\n    precision mediump float;\n    ";
  App.vertex_source = "\n    layout(location = 0) in vec3 a_position;\n    void main() {\n        gl_Position = vec4(a_position.xyz, 1.0);\n    }\n    ";
  App.fragment_source = "\n    layout(location = 0) out vec4 FragColor;\n    uniform sampler2D u_texture;\n\n    int get(ivec2 fragCoord, ivec2 offset) {\n        return int(texelFetch(u_texture, fragCoord + offset, 0).r);\n    }\n\n    void main() {\n        ivec2 fc = ivec2(gl_FragCoord.xy);\n        int sum = \n            get(fc, ivec2(-1,-1)) +\n            get(fc, ivec2( 1,-1)) + \n            get(fc, ivec2(-1, 1)) + \n            get(fc, ivec2( 1, 1)) + \n            get(fc, ivec2( 0,-1)) + \n            get(fc, ivec2( 0, 1)) + \n            get(fc, ivec2(-1, 0)) + \n            get(fc, ivec2( 1, 0));\n        if (sum == 3) {\n            FragColor = vec4(1.0, 1.0, 1.0, 1.0);\n        } else if (sum == 2) {\n            FragColor = texelFetch(u_texture, fc, 0);\n        } else  {\n            FragColor = vec4(0.0, 0.0, 0.0, 1.0);\n        }\n    }";
  App.vertex_blit = "\n    layout(location = 0) in vec3 a_position;\n    out vec2 uv;\n    void main() {\n        gl_Position = vec4(a_position.xyz, 1.0);\n        uv = a_position.xy * 0.5 + 0.5;\n    }";
  App.fragment_blit = "\n    layout(location = 0) out vec4 FragColor;\n    uniform sampler2D u_texture;\n    in vec2 uv;\n    void main() {\n        FragColor = texture(u_texture, uv);\n    }";
  return App;
}();

window.onload = function () {
  console.clear();
  var canvas = document.getElementById('canvas');
  canvas.width = canvas.clientWidth;
  canvas.height = canvas.clientHeight;
  var app = new App(canvas);
  requestAnimationFrame(app.Update.bind(app));
};
},{"../util/mesh":"util/mesh.ts","../util/ShaderProgram":"util/ShaderProgram.ts"}],"../../node_modules/parcel-bundler/src/builtins/hmr-runtime.js":[function(require,module,exports) {
var global = arguments[3];
var OVERLAY_ID = '__parcel__error__overlay__';
var OldModule = module.bundle.Module;

function Module(moduleName) {
  OldModule.call(this, moduleName);
  this.hot = {
    data: module.bundle.hotData,
    _acceptCallbacks: [],
    _disposeCallbacks: [],
    accept: function (fn) {
      this._acceptCallbacks.push(fn || function () {});
    },
    dispose: function (fn) {
      this._disposeCallbacks.push(fn);
    }
  };
  module.bundle.hotData = null;
}

module.bundle.Module = Module;
var checkedAssets, assetsToAccept;
var parent = module.bundle.parent;

if ((!parent || !parent.isParcelRequire) && typeof WebSocket !== 'undefined') {
  var hostname = "" || location.hostname;
  var protocol = location.protocol === 'https:' ? 'wss' : 'ws';
  var ws = new WebSocket(protocol + '://' + hostname + ':' + "53801" + '/');

  ws.onmessage = function (event) {
    checkedAssets = {};
    assetsToAccept = [];
    var data = JSON.parse(event.data);

    if (data.type === 'update') {
      var handled = false;
      data.assets.forEach(function (asset) {
        if (!asset.isNew) {
          var didAccept = hmrAcceptCheck(global.parcelRequire, asset.id);

          if (didAccept) {
            handled = true;
          }
        }
      }); // Enable HMR for CSS by default.

      handled = handled || data.assets.every(function (asset) {
        return asset.type === 'css' && asset.generated.js;
      });

      if (handled) {
        console.clear();
        data.assets.forEach(function (asset) {
          hmrApply(global.parcelRequire, asset);
        });
        assetsToAccept.forEach(function (v) {
          hmrAcceptRun(v[0], v[1]);
        });
      } else if (location.reload) {
        // `location` global exists in a web worker context but lacks `.reload()` function.
        location.reload();
      }
    }

    if (data.type === 'reload') {
      ws.close();

      ws.onclose = function () {
        location.reload();
      };
    }

    if (data.type === 'error-resolved') {
      console.log('[parcel] ✨ Error resolved');
      removeErrorOverlay();
    }

    if (data.type === 'error') {
      console.error('[parcel] 🚨  ' + data.error.message + '\n' + data.error.stack);
      removeErrorOverlay();
      var overlay = createErrorOverlay(data);
      document.body.appendChild(overlay);
    }
  };
}

function removeErrorOverlay() {
  var overlay = document.getElementById(OVERLAY_ID);

  if (overlay) {
    overlay.remove();
  }
}

function createErrorOverlay(data) {
  var overlay = document.createElement('div');
  overlay.id = OVERLAY_ID; // html encode message and stack trace

  var message = document.createElement('div');
  var stackTrace = document.createElement('pre');
  message.innerText = data.error.message;
  stackTrace.innerText = data.error.stack;
  overlay.innerHTML = '<div style="background: black; font-size: 16px; color: white; position: fixed; height: 100%; width: 100%; top: 0px; left: 0px; padding: 30px; opacity: 0.85; font-family: Menlo, Consolas, monospace; z-index: 9999;">' + '<span style="background: red; padding: 2px 4px; border-radius: 2px;">ERROR</span>' + '<span style="top: 2px; margin-left: 5px; position: relative;">🚨</span>' + '<div style="font-size: 18px; font-weight: bold; margin-top: 20px;">' + message.innerHTML + '</div>' + '<pre>' + stackTrace.innerHTML + '</pre>' + '</div>';
  return overlay;
}

function getParents(bundle, id) {
  var modules = bundle.modules;

  if (!modules) {
    return [];
  }

  var parents = [];
  var k, d, dep;

  for (k in modules) {
    for (d in modules[k][1]) {
      dep = modules[k][1][d];

      if (dep === id || Array.isArray(dep) && dep[dep.length - 1] === id) {
        parents.push(k);
      }
    }
  }

  if (bundle.parent) {
    parents = parents.concat(getParents(bundle.parent, id));
  }

  return parents;
}

function hmrApply(bundle, asset) {
  var modules = bundle.modules;

  if (!modules) {
    return;
  }

  if (modules[asset.id] || !bundle.parent) {
    var fn = new Function('require', 'module', 'exports', asset.generated.js);
    asset.isNew = !modules[asset.id];
    modules[asset.id] = [fn, asset.deps];
  } else if (bundle.parent) {
    hmrApply(bundle.parent, asset);
  }
}

function hmrAcceptCheck(bundle, id) {
  var modules = bundle.modules;

  if (!modules) {
    return;
  }

  if (!modules[id] && bundle.parent) {
    return hmrAcceptCheck(bundle.parent, id);
  }

  if (checkedAssets[id]) {
    return;
  }

  checkedAssets[id] = true;
  var cached = bundle.cache[id];
  assetsToAccept.push([bundle, id]);

  if (cached && cached.hot && cached.hot._acceptCallbacks.length) {
    return true;
  }

  return getParents(global.parcelRequire, id).some(function (id) {
    return hmrAcceptCheck(global.parcelRequire, id);
  });
}

function hmrAcceptRun(bundle, id) {
  var cached = bundle.cache[id];
  bundle.hotData = {};

  if (cached) {
    cached.hot.data = bundle.hotData;
  }

  if (cached && cached.hot && cached.hot._disposeCallbacks.length) {
    cached.hot._disposeCallbacks.forEach(function (cb) {
      cb(bundle.hotData);
    });
  }

  delete bundle.cache[id];
  bundle(id);
  cached = bundle.cache[id];

  if (cached && cached.hot && cached.hot._acceptCallbacks.length) {
    cached.hot._acceptCallbacks.forEach(function (cb) {
      cb();
    });

    return true;
  }
}
},{}]},{},["../../node_modules/parcel-bundler/src/builtins/hmr-runtime.js","index.ts"], null)
//# sourceMappingURL=/gameOfLife.77de5100.js.map