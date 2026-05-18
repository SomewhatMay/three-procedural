import * as THREE from "three";
import { degToRad } from "three/src/math/MathUtils.js";
import { scene } from "./world/scene";
import { camera, renderer } from "./world/renderer";
import { Cube } from "./components/cube";

function animate(): void {
  requestAnimationFrame(animate);

  renderer.render(scene, camera);
}

animate();
