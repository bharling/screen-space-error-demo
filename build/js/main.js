(function() {
  var DEBUG, DEBUG_OBJECT, MAX_DEPTH, Patch, PatchFactory, animate, calculateSSE, camera, clock, controls, createObjects, createUI, fragSrc, initScene, object, patch, randomColor, randomMaterial, render, renderer, scene, shaderMaterial, span, updateErrorStat, vertSrc;

  scene = camera = renderer = object = span = patch = controls = null;

  DEBUG = true;

  DEBUG_OBJECT = new THREE.Object3D();

  MAX_DEPTH = 8;

  clock = new THREE.Clock();

  randomColor = function() {
    return Math.random() * 0xffffff;
  };

  randomMaterial = function() {
    return new THREE.MeshBasicMaterial({
      color: randomColor(),
      side: THREE.DoubleSide
    });
  };

  vertSrc = document.getElementById('vert').textContent;

  fragSrc = document.getElementById('frag').textContent;

  shaderMaterial = new THREE.ShaderMaterial({
    vertexShader: vertSrc,
    vertexColors: THREE.VertexColors,
    fragmentShader: fragSrc,
    wireframe: true,
    side: THREE.DoubleSide
  });

  PatchFactory = (function() {
    function PatchFactory() {}

    PatchFactory.geom = new THREE.PlaneBufferGeometry(1.0, 1.0, 8, 8);

    PatchFactory.cache = [];

    PatchFactory.get = function() {
      var mesh;
      if (PatchFactory.cache.length > 0) {
        return PatchFactory.cache.pop();
      }
      mesh = new THREE.Mesh(PatchFactory.geom, shaderMaterial);
      return mesh;
    };

    PatchFactory.recycle = function(mesh) {
      return PatchFactory.cache.push(mesh);
    };

    return PatchFactory;

  })();

  Patch = (function() {
    function Patch(center, halfSize, parent, maxDepth) {
      var max, min, size;
      this.center = center;
      this.halfSize = halfSize;
      this.parent = parent;
      this.maxDepth = maxDepth != null ? maxDepth : 3;
      this.position = this.center.clone();
      min = new THREE.Vector2(this.center.x - this.halfSize, this.center.y + this.halfSize);
      max = new THREE.Vector2(this.center.x + this.halfSize, this.center.y - this.halfSize);
      this.box = new THREE.Box2(min, max);
      this.children = null;
      if (DEBUG) {
        size = this.box.size();
        this.object = PatchFactory.get();
        this.object.visible = true;
        this.object.scale.x = size.x;
        this.object.scale.y = size.y;
        this.object.position.set(this.center.x, this.center.y, this.center.z);
        DEBUG_OBJECT.add(this.object);
      }
    }

    Patch.prototype.clear = function() {};

    Patch.prototype.unsplit = function() {};

    Patch.prototype.merge = function() {
      var c, _i, _len, _ref;
      if (this.children == null) {
        return;
      }
      _ref = this.children;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        c = _ref[_i];
        PatchFactory.recycle(c.object);
        DEBUG_OBJECT.remove(c.object);
        c.object.visible = false;
        c.object = null;
      }
      this.children = null;
      return this.object.visible = true;
    };

    Patch.prototype.getScreenSpaceError = function(camera) {
      var d, lambda, me;
      lambda = window.innerHeight / camera.fov;
      d = this.position.distanceTo(camera.position);
      me = 1.2;
      return lambda * (me / d);
    };

    Patch.prototype.update = function(camera) {
      var c, has_error, p, _i, _len, _ref;
      p = this.getScreenSpaceError(camera);
      has_error = p > (1.0 / this.maxDepth);
      if (this.children != null) {
        _ref = this.children;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          c = _ref[_i];
          c.update(camera);
        }
      }
      if (has_error) {
        return this.split();
      } else {
        return this.merge();
      }
    };

    Patch.prototype.split = function() {
      var depth, ne, nw, qs, se, sw;
      if (this.children != null) {
        return;
      }
      qs = this.halfSize / 2;
      depth = this.maxDepth - 1;
      if (depth <= 0) {
        return;
      }
      if (this.object != null) {
        this.object.visible = false;
      }
      ne = this.center.clone().set(this.center.x - qs, this.center.y + qs, 0);
      nw = this.center.clone().set(this.center.x + qs, this.center.y + qs, 0);
      se = this.center.clone().set(this.center.x - qs, this.center.y - qs, 0);
      sw = this.center.clone().set(this.center.x + qs, this.center.y - qs, 0);
      this.children = [];
      this.children.push(new Patch(ne, qs, this, depth));
      this.children.push(new Patch(nw, qs, this, depth));
      this.children.push(new Patch(se, qs, this, depth));
      return this.children.push(new Patch(sw, qs, this, depth));
    };

    return Patch;

  })();

  initScene = function() {
    var container;
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 3000);
    scene.add(camera);
    renderer = new THREE.WebGLRenderer();
    renderer.setClearColor(0xf0f0f0);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);
    camera.position.z = 500;
    camera.lookAt(scene.position);
    controls = new THREE.FlyControls(camera);
    controls.movementSpeed = 500;
    controls.rollSpeed = Math.PI / 12;
    container = document.createElement('div');
    document.body.appendChild(container);
    return controls.domElement = document.body;
  };

  createObjects = function() {
    var pos;
    pos = scene.position.clone();
    patch = new Patch(pos, 100, null, MAX_DEPTH);
    return scene.add(DEBUG_OBJECT);
  };

  createUI = function() {
    span = document.createElement('span');
    document.body.appendChild(span);
    span.style.position = 'fixed';
    span.style.top = 0;
    span.style.left = 0;
    span.style.display = 'block';
    span.innerHTML = 'Error Value:';
    span.style.background = '#000';
    span.style.padding = '4px';
    span.style.color = '#fff';
    return span.style['font-family'] = 'Arial, sans-serif';
  };

  updateErrorStat = function(errorValue) {
    return span.innerHTML = 'Error Value: ' + errorValue;
  };

  animate = function() {
    requestAnimationFrame(animate);
    patch.update(camera);
    render();
    return calculateSSE();
  };

  calculateSSE = function() {
    var d, lambda, me, p;
    lambda = window.innerHeight / camera.fov;
    d = DEBUG_OBJECT.position.distanceTo(camera.position);
    me = 2.0;
    p = lambda * (me / d);
    return updateErrorStat(p);
  };

  render = function() {
    var delta;
    delta = clock.getDelta();
    controls.update(delta);
    return renderer.render(scene, camera);
  };

  initScene();

  createObjects();

  createUI();

  animate();

}).call(this);
