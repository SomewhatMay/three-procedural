import * as THREE from "three";
import { degToRad } from "three/src/math/MathUtils.js";
import { scene } from "./world/scene";
import { camera, renderer } from "./world/renderer";
import { Cube } from "./components/cube";
import { Terrain } from "./components/terrain";

const terrain = new Terrain();

function animate(): void {
  requestAnimationFrame(animate);

  terrain.update();

  renderer.render(scene, camera);
}

animate();
