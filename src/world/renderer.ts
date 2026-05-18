import * as THREE from "three";

// const frustumSize = 15;

// export const camera = new THREE.OrthographicCamera();
export const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);

const updateCanvas = () => {
  const width = window.innerWidth;
  const height = window.innerHeight;

  const aspect = width / height;

  // ORTHOGRAPHIC (commented out)
  // camera.left = (-frustumSize * aspect) / 2;
  // camera.right = (frustumSize * aspect) / 2;
  // camera.top = frustumSize / 2;
  // camera.bottom = -frustumSize / 2;

  // camera.updateProjectionMatrix();

  // PERSPECTIVE
  camera.aspect = aspect;
  camera.updateProjectionMatrix();

  renderer.setSize(width, height);
  renderer.setPixelRatio(window.devicePixelRatio);
};

camera.position.add(new THREE.Vector3(100, 40, 100));
camera.lookAt(new THREE.Vector3(0, -100, 0));

export const renderer = new THREE.WebGLRenderer({
  antialias: true,
});

renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
document.body.appendChild(renderer.domElement);

updateCanvas();

window.addEventListener("resize", updateCanvas);
