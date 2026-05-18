import * as THREE from "three";
import { degToRad } from "three/src/math/MathUtils.js";
import { scene } from "./world/scene";
import { camera, renderer } from "./world/renderer";
import { Cube } from "./components/cube";
import { Terrain } from "./components/terrain";
import { TIMER } from "./world/clock";

const terrain = new Terrain();

function animate(): void {
  requestAnimationFrame(animate);
  TIMER.update();

  terrain.update();

  renderer.render(scene, camera);
}

animate();
