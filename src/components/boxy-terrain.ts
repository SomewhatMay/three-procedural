import * as THREE from "three";
import { scene } from "../world/scene";
import { createNoise2D, createNoise3D } from "simplex-noise";
import { HEIGHT } from "../main";
import { Trees } from "./trees";

const noise2D = createNoise2D();
const noise3D = createNoise3D();

type BlockType = "air" | "grass" | "stone" | "wood" | "leaves";

export class BoxyTerrain {
  private blocks = new Map<string, THREE.Mesh>();

  private geometry = new THREE.BoxGeometry(1, 1, 1);
  private material = new THREE.MeshStandardMaterial({ vertexColors: false });

  private trees: Trees;

  constructor() {
    this.trees = new Trees(this);
  }

  private getHeight(x: number, z: number): number {
    return Math.floor(
      Math.max(
        1,
        noise2D(x * 0.01, z * 0.01) * 3 +
          noise2D(x * 0.05, z * 0.05) * 1 +
          noise2D(x * 0.001, z * 0.001) * 15 +
          10
      )
    );
  }

  private isCave(x: number, y: number, z: number) {
    if (y === 1) return false;

    const frequency = 0.05;
    const value =
      noise3D(x * frequency, y * frequency, z * frequency) +
      0 * noise3D(x * frequency * 2, y * frequency * 2, z * frequency * 2);

    const depthMultiplier = y / HEIGHT;

    return value + depthMultiplier > 0.8;
  }

  getBlock(x: number, y: number, z: number): BlockType {
    const h = this.getHeight(x, z);

    if (this.isCave(x, y, z)) return "air";

    if (y > h) return "air";
    if (y === h) return "grass";
    return "stone";
  }

  private key(x: number, y: number, z: number) {
    return `${x}|${y}|${z}`;
  }

  setBlock(x: number, y: number, z: number, type: BlockType): void {
    const key = this.key(x, y, z);

    // Remove if a block already exists
    const existing = this.blocks.get(key);
    if (existing) {
      scene.remove(existing);
      this.blocks.delete(key);
    }

    // Skip air
    if (type === "air") return;
    const mesh = new THREE.Mesh(this.geometry, this.material);
    mesh.position.set(x + 0.5, y + 0.5, z + 0.5);

    if (type === "grass") {
      mesh.material = new THREE.MeshStandardMaterial({ color: "green" });
    } else if (type === "stone") {
      mesh.material = new THREE.MeshStandardMaterial({ color: "gray" });
    } else if (type === "wood") {
      mesh.material = new THREE.MeshStandardMaterial({ color: "brown" });
    } else if (type === "leaves") {
      mesh.material = new THREE.MeshStandardMaterial({
        color: "darkgreen",
        transparent: true,
        opacity: 0.9,
      });
    } else {
      throw new Error(`Unknown tree type ${type}`);
    }
    scene.add(mesh);
    this.blocks.set(key, mesh);
  }

  generate(sizeX: number, sizeY: number, sizeZ: number): void {
    for (let x = 0; x < sizeX; x++) {
      for (let z = 0; z < sizeZ; z++) {
        for (let y = 0; y < sizeY; y++) {
          const block = this.getBlock(x, y, z);

          // Place tree and do not place anything here if it's not visible
          if (block === "air") {
            const bottom = this.getBlock(x, y - 1, z);

            if (bottom === "grass") {
              const hasTree = this.trees.hasTree(x, z);

              if (hasTree) {
                this.setBlock(x, y, z, "wood");
              }
            }
            continue;
          }

          const top = this.getBlock(x, y + 1, z);
          const right = this.getBlock(x + 1, y, z);
          const left = this.getBlock(x - 1, y, z);
          const front = this.getBlock(x, y, z + 1);
          const back = this.getBlock(x, y, z - 1);
          const bottom = this.getBlock(x, y - 1, z);

          const isVisible =
            top === "air" ||
            right === "air" ||
            left === "air" ||
            front === "air" ||
            back === "air" ||
            bottom === "air";

          if (!isVisible) {
            continue;
          }

          this.setBlock(x, y, z, block);
        }
      }
    }
  }
}
