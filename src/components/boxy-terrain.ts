import * as THREE from "three";
import { scene } from "../world/scene";

type BlockType = "air" | "grass" | "stone";

export class BoxyTerrain {
  private meshes: THREE.Mesh[][];

  private blocks = new Map<string, THREE.Mesh>();
  private heights: number[][];

  private geometry = new THREE.BoxGeometry(1, 1, 1);
  private material = new THREE.MeshStandardMaterial({ vertexColors: false });

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

  private getHeight(x: number, z: number): number {
    return 10;
  }

  getBlock(x: number, y: number, z: number): BlockType {
    const h = this.getHeight(x, z);

    if (y > h) return "air";
    if (y === h) return "grass";
    return "stone";
  }

  private key(x: number, y: number, z: number) {
    return `${x}|${y}|${z}`;
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
