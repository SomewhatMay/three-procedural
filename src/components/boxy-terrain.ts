import * as THREE from "three";
import { scene } from "../world/scene";
import { createNoise2D, createNoise3D } from "simplex-noise";
import { HEIGHT } from "../main";
import { Trees } from "./trees";

const noise2D = createNoise2D();
const noise3D = createNoise3D();

type SolidBlockType = (typeof SOLID_BLOCK_TYPES)[number];
type BlockType = SolidBlockType | "air";

const SOLID_BLOCK_TYPES = [
  "grass",
  "stone",
  "wood",
  "leaves",
  "water",
] as const;

const seaLevel = 9;
const riverThreshold = 0.78;

export class BoxyTerrain {
  private blocks = new Map<string, BlockType>();

  private instancedMeshes = new Map<SolidBlockType, THREE.InstancedMesh>();

  private geometry = new THREE.BoxGeometry(1, 1, 1);

  private materials: Record<SolidBlockType, THREE.Material> = {
    grass: new THREE.MeshStandardMaterial({ color: "green" }),
    stone: new THREE.MeshStandardMaterial({ color: "gray" }),
    wood: new THREE.MeshStandardMaterial({ color: "brown" }),
    leaves: new THREE.MeshStandardMaterial({
      color: "darkgreen",
      transparent: true,
      opacity: 0.9,
      depthWrite: false,
    }),
    water: new THREE.MeshBasicMaterial({
      color: "blue",
      transparent: true,
      opacity: 0.6,
      depthWrite: false,
    }),
  };

  private trees: Trees;

  constructor() {
    this.trees = new Trees(this);
  }

  private getRiverRegion(x: number, z: number) {
    return 1 - Math.abs(noise2D(x * 0.02, z * 0.02));
  }

  private getHeight(x: number, z: number): number {
    const height = Math.floor(
      Math.max(
        1,
        noise2D(x * 0.01, z * 0.01) * 3 +
          noise2D(x * 0.05, z * 0.05) * 1 +
          noise2D(x * 0.001, z * 0.001) * 15 +
          10
      )
    );

    const riverRegion = this.getRiverRegion(x, z);
    const riverDepth =
      riverRegion > riverThreshold ? (riverRegion - riverThreshold) * 20 : 0;

    return Math.floor(seaLevel / 2 + Math.max(0, height - riverDepth));
  }

  private isRiver(x: number, z: number) {
    return this.getRiverRegion(x, z) > riverThreshold;
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

  private key(x: number, y: number, z: number) {
    return `${x}|${y}|${z}`;
  }

  private parseKey(key: string): [number, number, number] {
    const [xs, ys, zs] = key.split("|");
    return [Number(xs), Number(ys), Number(zs)];
  }

  getBlock(x: number, y: number, z: number): BlockType {
    const key = this.key(x, y, z);
    const overridden = this.blocks.get(key);
    if (overridden) return overridden;

    const h = this.getHeight(x, z);

    if (this.isCave(x, y, z)) return "air";
    if (y > h) return "air";
    if (y === h) return "grass";
    return "stone";
  }

  setBlock(x: number, y: number, z: number, type: BlockType): void {
    const key = this.key(x, y, z);

    if (type === "air") {
      this.blocks.delete(key);
      return;
    }

    this.blocks.set(key, type);
  }

  private placeLeaves(cx: number, cy: number, cz: number): void {
    const radius = 2;

    for (let x = -radius; x <= radius; x++) {
      for (let y = -radius; y <= radius; y++) {
        for (let z = -radius; z <= radius; z++) {
          const dist = Math.abs(x) + Math.abs(y) + Math.abs(z);

          if (dist > 3) continue;

          const lx = cx + x;
          const ly = cy + y;
          const lz = cz + z;

          if (this.getBlock(lx, ly, lz) === "air") {
            this.setBlock(lx, ly, lz, "leaves");
          }
        }
      }
    }
  }

  private clearInstancedMeshes(): void {
    for (const [_, mesh] of this.instancedMeshes) {
      scene.remove(mesh);
    }
    this.instancedMeshes.clear();
  }

  private rebuildInstancedMeshes(): void {
    this.clearInstancedMeshes();

    const positions: Record<SolidBlockType, THREE.Vector3[]> = {
      grass: [],
      stone: [],
      wood: [],
      leaves: [],
      water: [],
    };

    for (const [key, type] of this.blocks.entries()) {
      if (type === "air") continue;
      const [x, y, z] = this.parseKey(key);
      positions[type].push(new THREE.Vector3(x, y, z));
    }

    const matrix = new THREE.Matrix4();

    for (const type of SOLID_BLOCK_TYPES) {
      const blockPositions = positions[type];
      if (blockPositions.length === 0) continue;

      const mesh = new THREE.InstancedMesh(
        this.geometry,
        this.materials[type],
        blockPositions.length
      );

      for (let i = 0; i < blockPositions.length; i++) {
        const p = blockPositions[i];
        matrix.makeTranslation(p.x + 0.5, p.y + 0.5, p.z + 0.5);
        mesh.setMatrixAt(i, matrix);
      }

      mesh.instanceMatrix.needsUpdate = true;
      scene.add(mesh);
      this.instancedMeshes.set(type, mesh);
    }
  }

  generate(sizeX: number, sizeY: number, sizeZ: number): void {
    this.blocks.clear();

    for (let x = 0; x < sizeX; x++) {
      for (let z = 0; z < sizeZ; z++) {
        for (let y = 0; y < sizeY; y++) {
          const block = this.getBlock(x, y, z);

          if (block === "air") {
            const bottom = this.getBlock(x, y - 1, z);

            if (bottom === "grass" && y > seaLevel && !this.isRiver(x, z)) {
              if (this.trees.hasTree(x, z)) {
                for (let i = 0; i < 3; i++) {
                  this.setBlock(x, y + i, z, "wood");
                }

                this.placeLeaves(x, y + 5, z);
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

          if (!isVisible) continue;

          this.setBlock(x, y, z, block);
        }

        for (let y = 0; y <= seaLevel; y++) {
          const current = this.getBlock(x, y, z);

          if (current === "air") {
            const isRiver = this.isRiver(x, z);

            if (isRiver || y <= seaLevel) {
              this.setBlock(x, y, z, "water");
            }
          }
        }
      }
    }

    this.rebuildInstancedMeshes();
  }
}
