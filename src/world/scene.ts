import * as THREE from "three";

export const scene = new THREE.Scene();

const sun = new THREE.DirectionalLight(0xffffff, 1);
sun.position.set(5, 10, 5);
scene.add(sun);
