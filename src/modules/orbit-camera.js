import * as THREE from "three";

export class OrbitCamera {
  constructor(camera, domElement) {
    this.camera = camera;
    this.domElement = domElement;

    this.state = {
      radius: 50,
      theta: Math.PI / 4,
      phi: Math.PI / 3,
      target: new THREE.Vector3(0, 8, 0),
      isDragging: false,
      lastMouseX: 0,
      lastMouseY: 0,
    };

    this._bindEvents();
    this.updatePosition();
  }

  setTarget(y) {
    this.state.target.set(0, y, 0);
  }

  setRadius(radius) {
    this.state.radius = Math.max(15, Math.min(120, radius));
  }

  updatePosition() {
    const { radius, theta, phi, target } = this.state;
    this.camera.position.x =
      target.x + radius * Math.sin(phi) * Math.cos(theta);
    this.camera.position.y = target.y + radius * Math.cos(phi);
    this.camera.position.z =
      target.z + radius * Math.sin(phi) * Math.sin(theta);
    this.camera.lookAt(target);
  }

  reset() {
    this.state.radius = 50;
    this.state.theta = Math.PI / 4;
    this.state.phi = Math.PI / 3;
    this.state.target.set(0, 8, 0);
  }

  _bindEvents() {
    this.domElement.addEventListener("mousedown", (e) => {
      if (e.button === 0) {
        this.state.isDragging = true;
        this.state.lastMouseX = e.clientX;
        this.state.lastMouseY = e.clientY;
      }
    });

    this.domElement.addEventListener("mousemove", (e) => {
      if (!this.state.isDragging) return;

      const dx = e.clientX - this.state.lastMouseX;
      const dy = e.clientY - this.state.lastMouseY;
      this.state.theta -= dx * 0.005;
      this.state.phi = Math.max(
        0.2,
        Math.min(Math.PI - 0.2, this.state.phi + dy * 0.005),
      );
      this.state.lastMouseX = e.clientX;
      this.state.lastMouseY = e.clientY;
    });

    this.domElement.addEventListener("mouseup", () => {
      this.state.isDragging = false;
    });

    this.domElement.addEventListener("wheel", (e) => {
      this.state.radius = Math.max(
        15,
        Math.min(120, this.state.radius + e.deltaY * 0.05),
      );
    });

    window.addEventListener("resize", () => {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
    });
  }
}
