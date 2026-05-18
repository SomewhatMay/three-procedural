import * as THREE from "three";
import { scene } from "../world/scene";

export class Cube {
  private obj = new THREE.Mesh(
    new THREE.BoxGeometry(),
    new THREE.MeshDepthMaterial()
  );

  constructor() {
    scene.add(this.obj);
  }
}
