import * as THREE from 'three';

import gameWorld from './useGameWorld'

export default () => {
  const { scene } = gameWorld;

  const removeSkybox = (target) => (
    () => {
      scene.remove(target)
    }
  )

  const createSkybox = (imgPath) => {

    const geometry = new THREE.SphereGeometry(25, 60, 60);
    // invert the geometry on the x-axis so that all of the faces point inward
    geometry.scale(-1, 1, 1);

    const texture = new THREE.TextureLoader().load(imgPath);
    texture.colorSpace = THREE.SRGBColorSpace;
    const material = new THREE.MeshBasicMaterial({ map: texture });

    const mesh = new THREE.Mesh(geometry, material);

    scene.add(mesh);

    return {
      skybox: mesh,
      remove: removeSkybox(mesh)
    }
  }

  return {
    createSkybox,
  }

}