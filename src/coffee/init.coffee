scene = camera = renderer = object = span = patch = controls = null

DEBUG = true
DEBUG_OBJECT = new THREE.Object3D()

MAX_DEPTH = 8

clock = new THREE.Clock()

randomColor = () ->
  Math.random() * 0xffffff
  
randomMaterial = () ->
  new THREE.MeshBasicMaterial color : randomColor(), side : THREE.DoubleSide
  
vertSrc = document.getElementById('vert').textContent;
fragSrc = document.getElementById('frag').textContent;

shaderMaterial = new THREE.ShaderMaterial(
  vertexShader: vertSrc,
  vertexColors: THREE.VertexColors,
  fragmentShader: fragSrc,
  wireframe: true,
  side: THREE.DoubleSide
)

class Patch
  constructor : (@center, @halfSize, @maxDepth=10) ->
    @position = @center.clone()
    min = new THREE.Vector2 @center.x - @halfSize, @center.y + @halfSize
    max = new THREE.Vector2 @center.x + @halfSize, @center.y - @halfSize
    @box = new THREE.Box2 min, max
    @children = null
    
    if DEBUG
      size = @box.size()
      geom = new THREE.PlaneGeometry( size.x, size.y, 1, 1 )
      geom.applyMatrix new THREE.Matrix4().makeTranslation( @center.x, @center.y, @center.z )
      color = new THREE.Color( randomColor() )
      @object = new THREE.Mesh geom, shaderMaterial
      DEBUG_OBJECT.add @object

      
  clear: () ->

      
  unsplit : () ->
    
    
    
  getScreenSpaceError: (camera) ->
    lambda = window.innerHeight / camera.fov
    d = @position.distanceTo camera.position
    me = 1.6
    lambda * (me / d)
  
  update: (camera) ->
    # calculate error metric
    
    p = @getScreenSpaceError camera
    
    has_error = p > (1.0 / @maxDepth)
    
    if @children?
      for c in @children
        c.update camera
    else
      if has_error
        @split()
    
    
  split: () ->
    if @children?
      return
    qs = @halfSize / 2
    depth = @maxDepth - 1
    if depth <= 1
      return
      
    if @object?
      @object.visible = false
      
    ne = @center.clone().set( @center.x - qs, @center.y + qs, 0 )
    nw = @center.clone().set( @center.x + qs, @center.y + qs, 0 )
    se = @center.clone().set( @center.x - qs, @center.y - qs, 0 )
    sw = @center.clone().set( @center.x + qs, @center.y - qs, 0 )
    
    @children = [] 
    @children.push new Patch ne, qs, depth
    @children.push new Patch nw, qs, depth
    @children.push new Patch se, qs, depth
    @children.push new Patch sw, qs, depth

    
    





initScene = () ->
  scene = new THREE.Scene()
  camera = new THREE.PerspectiveCamera 75, window.innerWidth / window.innerHeight, 1, 3000
  scene.add camera
  renderer = new THREE.WebGLRenderer()
  renderer.setClearColor 0xf0f0f0
  renderer.setPixelRatio window.devicePixelRatio
  renderer.setSize window.innerWidth, window.innerHeight
  document.body.appendChild renderer.domElement
  camera.position.z = 500
  camera.lookAt scene.position
  
  controls = new THREE.FlyControls camera
  controls.movementSpeed = 500
  controls.rollSpeed = Math.PI / 12
  container = document.createElement 'div'
  document.body.appendChild container
  
  controls.domElement = document.body
  
  
  
  
createObjects = () ->
  #material = new THREE.MeshBasicMaterial
  #material.color.setHex randomColor()
  #object = new THREE.Mesh new THREE.BoxGeometry( 100, 100, 100, 4, 4, 4), material
  #scene.add object
  #object
  pos = scene.position.clone()
  pos.setZ 200.0
  patch = new Patch pos, 100, MAX_DEPTH
  scene.add DEBUG_OBJECT
    
  
createUI = () ->
  span = document.createElement 'span'
  document.body.appendChild span
  span.style.position = 'fixed'
  span.style.top = 0
  span.style.left = 0
  span.style.display = 'block'
  span.innerHTML = 'Error Value:'
  span.style.background = '#000'
  span.style.padding = '4px'
  span.style.color = '#fff'
  span.style['font-family'] = 'Arial, sans-serif'
  
  
updateErrorStat = (errorValue) ->
  span.innerHTML = 'Error Value: ' + errorValue
  
animate = () ->
  requestAnimationFrame animate
  patch.update camera
  render()
  calculateSSE()
  
calculateSSE = () ->
  lambda = window.innerHeight / camera.fov
  d = DEBUG_OBJECT.position.distanceTo camera.position
  me = 2.0
  p = lambda * (me / d)
  updateErrorStat p
  
render = () ->
  delta = clock.getDelta()
  controls.update delta
  #timer = Date.now() * 0.001
  #camera.position.z = 600 + (Math.sin( timer ) * 400)
  #camera.lookAt( scene.position );
  renderer.render scene, camera
  
  
initScene()
createObjects()
createUI()
animate()



  
