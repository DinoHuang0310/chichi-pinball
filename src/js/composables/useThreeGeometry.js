import * as THREE from 'three';
import * as CANNON from 'cannon-es';

import gameWorld from './useGameWorld'

export default () => {
  const { scene, world, defaultMaterial } = gameWorld;
  
  // const threeMaterial = new THREE.MeshPhongMaterial({color: 'white', shininess: 100,})
  // const threeMaterial = new THREE.MeshMatcapMaterial({color: 'white'})
  const threeMaterial = new THREE.MeshNormalMaterial()

  const removeGeometry = (target, targetBody) => (
    () => {
      scene.remove(target)
      world.removeBody(targetBody);
    }
  )

  const createGroup = (geometryList) => {
    const createGeometry = {
      'box': ({
        size = [1, 1, 1],
        material = threeMaterial,
      } = {}) => {
        return new THREE.Mesh(new THREE.BoxGeometry(size[0], size[1], size[2]), material)
      },
      'cylinder': ({
        radiusTop = 1,
        radiusBottom = 1,
        height = 3,
        numSegments = 16,
        material = threeMaterial,
      } = {}) => {
        return new THREE.Mesh(
          new THREE.CylinderGeometry(radiusTop, radiusBottom, height, numSegments),
          material,
        )
      },
    }
    const createShape = {
      'box': ({size = [1, 1, 1]} = {}) => {
        return new CANNON.Box(new CANNON.Vec3(size[0] * 0.5, size[1] * 0.5, size[2] * 0.5))
      },
      'cylinder': ({radiusTop = 1, radiusBottom = 1, height = 3, numSegments = 16} = {}) => {    
        return new CANNON.Cylinder(radiusTop, radiusBottom, height, numSegments)
      },
    }

    // 建立模組群組
    const geometryGroup = new THREE.Group();

    // 建立物理實體
    const body = new CANNON.Body({
      mass: 0,
      material: {
        friction: 0,
        restitution: 1
      }
    })

    geometryList.forEach((item) => {
      const { type, options } = item;
      const { position, quaternion, visible = true } = options;

      // 加入模組
      if (visible) {
        const geometry = createGeometry[type](options)
        geometry.castShadow = true
        geometry.receiveShadow = true
        geometry.position.set(position[0], position[1], position[2]);
        if (quaternion) geometry.quaternion.set(quaternion.x, quaternion.y, quaternion.z, quaternion.w);
        geometryGroup.add(geometry)
      }

      // 加入物理實體
      body.addShape(
        createShape[type](options),
        new CANNON.Vec3(position[0], position[1], position[2]),
        quaternion || null
      )
    })

    scene.add(geometryGroup);
    world.addBody(body);

    return {
      geometry: geometryGroup,
      body,
      remove: removeGeometry(geometryGroup, body)
    }
  }

  const createBox = ({
    size = [1, 1, 1],
    position = [0, 0, 0],
    mass = 1,
    category,
    material = threeMaterial,
  } = {}) => {
    // 建立模組
    const geometry = new THREE.Mesh(
      new THREE.BoxGeometry(size[0], size[1], size[2]),
      material
    );
    geometry.castShadow = true
    geometry.receiveShadow = true
    scene.add(geometry);

    // 建立物理實體
    const body = new CANNON.Body({
      mass,
      position: new CANNON.Vec3(position[0], position[1], position[2]),
      shape: new CANNON.Box(new CANNON.Vec3(size[0] * 0.5, size[1] * 0.5, size[2] * 0.5)),
      material: defaultMaterial
    })

    if (category) {
      body.category = category
    }

    world.addBody(body);

    const render = () => {
      // 綁定畫面與物理實體
      geometry.position.copy(body.position);
      geometry.quaternion.copy(body.quaternion);
      requestAnimationFrame(render)
    }

    render();
    
    return {
      geometry,
      body,
      remove: removeGeometry(geometry, body)
    }
  }

  const createBall = ({
    x = Math.floor(Math.random() * 7) - 3,
    y = 8,
    z = Math.floor(Math.random() * 7) - 3,
    velocity = [],
    radius = Math.random() / 2, widthSegments, heightSegments, phiStart, phiLength, thetaStart, thetaLength,
    material = threeMaterial,
    onCollide = null
  } = {}) => {

    // 物理反應同步模組
    let hookOn = true

    // 建立模組
    const sphere = new THREE.Mesh(
      new THREE.SphereGeometry(radius, widthSegments, heightSegments, phiStart, phiLength, thetaStart, thetaLength),
      material
    );
    sphere.rotation.x = 0.5 * Math.PI
    sphere.castShadow = true
    sphere.receiveShadow = true
    scene.add(sphere);

    // 建立物理實體
    const body = new CANNON.Body({
      mass: 1, // 質量
      position: new CANNON.Vec3(x, y, z),
      shape: new CANNON.Sphere(radius),
      material: {
        friction: 0.7,
        restitution: 0.5
      }
    });

    if (velocity.length) {
      body.velocity.set(velocity[0], velocity[1], velocity[2])
    }

    if (onCollide && typeof onCollide === 'function') {
      body.addEventListener('collide', (e) => {
        const breakHook = () => {
          hookOn = false
        }
        onCollide(e, breakHook)
      });
    }
    world.addBody(body);

    const render = () => {
      // 綁定畫面與物理實體
      if (hookOn) {
        sphere.position.copy(body.position);
        sphere.quaternion.copy(body.quaternion);
      }
      
      requestAnimationFrame(render)
    }

    render();
    
    return {
      geometry: sphere,
      body,
      remove: removeGeometry(sphere, body)
    }
  }

  return {
    createGroup,
    createBox,
    createBall,
  }

}