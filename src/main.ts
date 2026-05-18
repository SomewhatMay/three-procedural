import * as THREE from "three";
import { degToRad } from "three/src/math/MathUtils.js";
import { scene } from "./world/scene";
import { camera, renderer } from "./world/renderer";
import { Cube } from "./components/cube";
import { Terrain } from "./components/terrain";
import { TIMER } from "./world/clock";
import { BoxyTerrain } from "./components/boxy-terrain";
import { updateControls } from "./world/controls";

const terrain = new BoxyTerrain();
export const HEIGHT = 40;

terrain.generate(100, HEIGHT, 100);

function animate(): void {
  requestAnimationFrame(animate);
  TIMER.update();

  updateControls();
  renderer.render(scene, camera);
}

animate();
