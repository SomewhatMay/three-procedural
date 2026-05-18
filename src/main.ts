import * as THREE from "three";
import { degToRad } from "three/src/math/MathUtils.js";
import { scene } from "./world/scene";
import { camera, renderer } from "./world/renderer";
import { Cube } from "./components/cube";
import { Terrain } from "./components/terrain";
import { TIMER } from "./world/clock";
import { BoxyTerrain } from "./components/boxy-terrain";

// const terrain = new Terrain();
const terrain = new BoxyTerrain(5, 5);

function animate(): void {
  requestAnimationFrame(animate);
  TIMER.update();

  terrain.setHeight(0, 0, 2);
  terrain.setHeight(3, 2, 3);

  // terrain.update();

  renderer.render(scene, camera);
}

animate();
