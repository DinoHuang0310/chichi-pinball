import * as THREE from 'three';
import gsap from 'gsap';

import useThreeGeometry from './useThreeGeometry'
import gameWorld from './useGameWorld'
import usePoint from './usePoint'
import usePinball from './usePinball'

export default () => {
  const { scene, camera } = gameWorld;
  const { createBall } = useThreeGeometry()
  const { plus } = usePoint()
  const { pinball, setPinball } = usePinball()

  // demo
  // const raycaster = new THREE.Raycaster();
  // let shootDirection = new THREE.Vector3()
  // const pointer = new THREE.Vector2();
  // const getShootDir = (event) => {
  //   // 取得滑鼠在網頁上 (x, y) 位置
  //   pointer.x = (event.clientX / window.innerWidth) * 2 - 1
  //   pointer.y = -(event.clientY / window.innerHeight) * 2 + 1
  //   // 透過 raycaster 取得目前玩家朝向方向
  //   raycaster.setFromCamera(pointer, camera)
  //   // 取得 raycaster 方向並決定發射方向
  //   shootDirection.copy(raycaster.ray.direction)
  // }
  // window.addEventListener('pointermove', getShootDir);
  // demo
  
  const minPower = 5;
  const maxPower = 20;

  let power = minPower;
  let isIncrement = true;
  let cylinder;

  const hold = (speed = 1) => {
    if (!pinball.length) return;
    
    if (isIncrement) {
      power+=speed
      if (power >= maxPower) isIncrement = false;
    } else {
      power-=speed
      if (power <= minPower) isIncrement = true;
    }

    renderPowerBar()
  }

  const fire = () => {
    if (!pinball.length) return;
    
    const ball = createBall({
      x: -2.774, y: 0.289, z: -4.442,
      radius: 0.16,
      velocity: [
        -0.0074 * power,
        -0.0414 * power,
        0.9991 * power
      ],
      phiLength: Math.PI * 2,
      // material: new THREE.MeshMatcapMaterial({color: 'red', transparent: true, opacity: 1}),
      material: new THREE.MeshPhongMaterial({
        color: '#676cfe',
        emissive: '#000000',
        specular: '#ff66f2',
        shininess: 100,
        transparent: true,
        opacity: 1,
      }),
      onCollide: ({ body }, breakHook) => {
        if (body.category == 'scoreboard') {
          // 若碰撞目標是計分trigger, 讓模組脫離物理引擎
          breakHook()

          plus(body.point)

          // 再對模組執行動畫
          const duration = 0.2;
          const ease = 'power4.out';
          gsap.to(ball.geometry.material, { opacity: 0, duration, ease })
          gsap.to(ball.geometry.scale, { x: 2, y: 2, z: 2, duration, ease })

          // 結束後銷毀
          setTimeout(() => { ball.remove() }, 500);
        }
      }
    })
    setPinball(-1)
    power = minPower;
    renderPowerBar()
  }
  
  window.addEventListener('keydown', (e) => {
    if (e.key === ' ') hold()
  })
  window.addEventListener('keyup', (e) => {
    if (e.key === ' ') {
      fire()
      // const {x, y, z} = camera.position.clone();
      // const shootVelo = 30;
      // console.log(x, y, z)
      // console.log(shootDirection.x, shootDirection.y, shootDirection.z)
      // const ball = createBall({
      //   x, y, z,
      //   radius: 0.16,
      //   phiLength: Math.PI,
      //   velocity: [
      //     shootDirection.x * shootVelo,
      //     shootDirection.y * shootVelo,
      //     shootDirection.z * shootVelo
      //   ]
      // })
    }
  })

  let touchHold = false
  const mobileHold = () => {
    if (touchHold) {
      setTimeout(() => {
        hold(2)
        mobileHold()
      }, 50);
    }
  }
  window.addEventListener('touchstart', (e) => {
    touchHold = true;
    mobileHold()
  })
  window.addEventListener('touchend', (e) => {
    touchHold = false;
    fire()
  })

  const renderPowerBar = () => {
    if (cylinder) {
      scene.remove(cylinder);
      cylinder.geometry.dispose();
      cylinder.material.dispose();
    }
    
    const height = power * 0.05
    const geometry = new THREE.CylinderGeometry(0.1, 0.1, height, 16);
    const material = new THREE.MeshNormalMaterial()
    cylinder = new THREE.Mesh(geometry, material);
    cylinder.rotation.x = Math.PI * 0.5;
    cylinder.position.set(-3.5, 0.25, (height / 2) - 5)
    
    scene.add(cylinder);
  }

  renderPowerBar()

}