import * as THREE from "three";
import { TIMER } from "../world/clock";
import { scene } from "../world/scene";
import { createNoise2D } from "simplex-noise";

const noise2D = createNoise2D();

export class Terrain {
  private xSegments = 100;
  private ySegments = 100;

  private plane = new THREE.Mesh(
    new THREE.PlaneGeometry(5, 5, this.xSegments, this.ySegments),
    new THREE.MeshPhongMaterial({ side: THREE.DoubleSide })
  );

  constructor() {
    scene.add(this.plane);

    this.plane.rotation.x = -Math.PI / 2;
  }

  update() {
    const position = this.plane.geometry.getAttribute(
      "position"
    ) as THREE.BufferAttribute;

    for (let i = 0; i < position.count; i++) {
      const height =
        Math.sin(position.getX(i) * 8 + TIMER.getElapsed()) * 0.2 -
        Math.cos(position.getY(i) * 8 + TIMER.getElapsed()) * 0.2;

      position.setZ(i, height);
    }

    position.needsUpdate = true;
    this.plane.geometry.computeVertexNormals();
  }
}
