import { FlyControls } from "three/examples/jsm/Addons.js";
import { camera, renderer } from "./renderer";
import { TIMER } from "./clock";

const controls = new FlyControls(camera, renderer.domElement);

controls.movementSpeed = 10;
controls.rollSpeed = 0.5;
controls.dragToLook = true;

export function updateControls() {
  const delta = TIMER.getDelta();
  controls.update(delta);
}
