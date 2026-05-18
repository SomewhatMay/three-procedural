import * as THREE from "three";

const frustumSize = 10;

export const camera = new THREE.OrthographicCamera();
const updateCanvas = () => {
  const aspect = window.innerWidth / window.innerHeight;

  camera.left = (-frustumSize * aspect) / 2;
  camera.right = (frustumSize * aspect) / 2;
  camera.top = frustumSize / 2;
  camera.bottom = -frustumSize / 2;

  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);
};

camera.position.add(new THREE.Vector3(5, 5, 8));
camera.lookAt(new THREE.Vector3(0, 0, 0));

export const renderer = new THREE.WebGLRenderer({
  antialias: true,
});

renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

updateCanvas();

window.addEventListener("resize", updateCanvas);
