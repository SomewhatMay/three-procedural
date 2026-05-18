import * as THREE from "three";
import { scene } from "../world/scene";

export class BoxyTerrain {
  private meshes: THREE.Mesh[][];

  private heights: number[][];

  constructor(private sizeX: number, private sizeY: number) {
    const geometry = new THREE.BoxGeometry(1, 1, 1);

    this.heights = Array.from({ length: sizeX }, () => Array(sizeY).fill(1));

    this.meshes = Array.from({ length: sizeX }, () => Array<THREE.Mesh>(sizeY));

    for (let x = 0; x < sizeX; x++) {
      for (let y = 0; y < sizeY; y++) {
        const material = new THREE.MeshNormalMaterial();

        const mesh = new THREE.Mesh(geometry, material);

        const h = this.heights[x][y];

        mesh.position.set(x, h + 0.5, y);

        scene.add(mesh);
        this.meshes[x][y] = mesh;
      }
    }
  }

  setHeight(x: number, y: number, height: number) {
    this.heights[x][y] = height;

    const mesh = this.meshes[x][y];

    mesh.position.y = height + 0.5;
  }

  setTexture(x: number, y: number, material: THREE.Material) {
    this.meshes[x][y].material = material;
  }
}
