import * as THREE from "three";

export class OrbitCamera {
  constructor(camera, domElement, options = {}) {
    this.camera = camera;
    this.domElement = domElement;

    this.radius = options.radius || 50;
    this.theta = options.theta || Math.PI / 4;
    this.phi = options.phi || Math.PI / 3;
    this.minRadius = options.minRadius || 15;
    this.maxRadius = options.maxRadius || 120;
    this.minPhi = options.minPhi || 0.2;
    this.maxPhi = options.maxPhi || Math.PI - 0.2;
    this.rotateSpeed = options.rotateSpeed || 0.005;
    this.zoomSpeed = options.zoomSpeed || 0.05;

    this.target = new THREE.Vector3(0, 8, 0);
    this.isDragging = false;
    this.lastMouseX = 0;
    this.lastMouseY = 0;

    this._setupEventListeners();
    this.updatePosition();
  }

  _setupEventListeners() {
    const element = this.domElement;

    element.addEventListener("mousedown", (e) => {
      if (e.button === 0) {
        this.isDragging = true;
        this.lastMouseX = e.clientX;
        this.lastMouseY = e.clientY;
      }
    });

    element.addEventListener("mousemove", (e) => {
      if (this.isDragging) {
        const dx = e.clientX - this.lastMouseX;
        const dy = e.clientY - this.lastMouseY;
        this.theta -= dx * this.rotateSpeed;
        this.phi = Math.max(
          this.minPhi,
          Math.min(this.maxPhi, this.phi + dy * this.rotateSpeed),
        );
        this.lastMouseX = e.clientX;
        this.lastMouseY = e.clientY;
        this.updatePosition();
      }
    });

    element.addEventListener("mouseup", () => {
      this.isDragging = false;
    });

    element.addEventListener("wheel", (e) => {
      this.radius = Math.max(
        this.minRadius,
        Math.min(this.maxRadius, this.radius + e.deltaY * this.zoomSpeed),
      );
      this.updatePosition();
    });
  }

  updatePosition() {
    this.camera.position.x =
      this.target.x + this.radius * Math.sin(this.phi) * Math.cos(this.theta);
    this.camera.position.y =
      this.target.y + this.radius * Math.cos(this.phi);
    this.camera.position.z =
      this.target.z + this.radius * Math.sin(this.phi) * Math.sin(this.theta);
    this.camera.lookAt(this.target);
  }

  setTarget(x, y, z) {
    this.target.set(x, y, z);
    this.updatePosition();
  }

  reset() {
    this.radius = 50;
    this.theta = Math.PI / 4;
    this.phi = Math.PI / 3;
    this.target.set(0, 8, 0);
    this.updatePosition();
  }

  handleResize(aspectRatio) {
    this.camera.aspect = aspectRatio;
    this.camera.updateProjectionMatrix();
  }
}
