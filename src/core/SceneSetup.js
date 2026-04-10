import * as THREE from "three";

export function createScene() {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x1a1a2e);
  return scene;
}

export function createCamera(aspect) {
  return new THREE.PerspectiveCamera(50, aspect, 0.1, 500);
}

export function createRenderer() {
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  return renderer;
}

export function setupLights(scene) {
  const ambient = new THREE.AmbientLight(0x404060, 1.2);
  scene.add(ambient);

  const dirLight = new THREE.DirectionalLight(0xffffff, 1.5);
  dirLight.position.set(30, 50, 20);
  dirLight.castShadow = true;
  dirLight.shadow.mapSize.width = 2048;
  dirLight.shadow.mapSize.height = 2048;
  dirLight.shadow.camera.near = 1;
  dirLight.shadow.camera.far = 120;
  dirLight.shadow.camera.left = -30;
  dirLight.shadow.camera.right = 30;
  dirLight.shadow.camera.top = 30;
  dirLight.shadow.camera.bottom = -30;
  scene.add(dirLight);

  const fillLight = new THREE.DirectionalLight(0x8888ff, 0.4);
  fillLight.position.set(-20, 30, -10);
  scene.add(fillLight);
}

export function createGround(scene) {
  const groundGeo = new THREE.PlaneGeometry(100, 100);
  const groundMat = new THREE.MeshStandardMaterial({
    color: 0x2a2a3e,
    roughness: 0.9,
  });
  const ground = new THREE.Mesh(groundGeo, groundMat);
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -0.1;
  ground.receiveShadow = true;
  scene.add(ground);
}

export function createGridHelper(scene) {
  const grid = new THREE.GridHelper(100, 50, 0x333355, 0x222244);
  grid.position.y = 0;
  scene.add(grid);
}
