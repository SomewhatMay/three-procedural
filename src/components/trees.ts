import { createNoise2D } from "simplex-noise";
import { BoxyTerrain } from "./boxy-terrain";
import { Terrain } from "./terrain";

const noise2D = createNoise2D();

export class Trees {
  constructor(terrain: BoxyTerrain) {}

  hasTree(x: number, z: number) {
    const n = noise2D(x * 2, z * 2);

    // threshold controls density
    return n > 0.95;
  }
}
