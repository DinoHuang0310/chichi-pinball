import * as THREE from 'three';

import gameWorld from './useGameWorld'

let pinball = {
  length: 5
};

export default () => {
  const { scene } = gameWorld

  const setPinball = (num) => {
    pinball.length += num
    render()
  }

  const resetPinball = () => {
    pinball.length = 5
    render()
  }

  let lightGroup;
  const render = () => {
    if (lightGroup) {
      scene.remove(lightGroup);
    }
    lightGroup = new THREE.Group();
    let x = -3;

    for(let i = 0; i < pinball.length; i++) {
      const sphere = new THREE.SphereGeometry(0.16, 16, 8);

      // lights
      const light = new THREE.PointLight( '#ff66f2', 1 );
      light.add(new THREE.Mesh(sphere, new THREE.MeshPhongMaterial({
        color: '#676cfe',
        emissive: '#000000',
        specular: '#ff66f2',
        shininess: 100,
        transparent: true,
        opacity: 1,
      }) ));
      light.position.set(x, 0.25, -5.5)
      
      lightGroup.add(light)
      x += 0.45
    }
    
    scene.add(lightGroup);
  }

  render()

  return {
    pinball,
    setPinball,
    resetPinball,
  }
}