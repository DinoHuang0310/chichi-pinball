import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

import * as CANNON from 'cannon-es';
import CannonDebugger from 'cannon-es-debugger'

// 是否顯示輔助線
const showDebug = false;
let cannonDebugRenderer;

const useGameWorld = {
  scene: new THREE.Scene(),
  camera: new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100),
  renderer: new THREE.WebGLRenderer(),

  world: new CANNON.World(),
  defaultMaterial: new CANNON.Material('default'),

  init: () => {
    initThree();
    initCannon();

    render();
  }
}

export default useGameWorld;

const initThree = () => {
  let { scene, camera, renderer } = useGameWorld;

  // 設定渲染器
  renderer.setSize(window.innerWidth, window.innerHeight) // 場景大小
  renderer.setClearColor(0xeeeeee, 1.0) // 預設背景顏色
  renderer.setPixelRatio(window.devicePixelRatio) // 防止canvas模糊
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = 2 // THREE.PCFSoftShadowMap

  // 將渲染器的 DOM 綁到網頁上
  document.body.appendChild(renderer.domElement)

  // 設定相機
  camera.position.set(0, 15, -10)
  camera.lookAt(scene.position)
  
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  // controls.rotateSpeed *= -1;

  // 建立光源
  const directionalLight = new THREE.DirectionalLight(0x404040, 25)
  directionalLight.position.set(1, 15, -5)
  scene.add(directionalLight)

  const spotLight = new THREE.SpotLight(0x404040, 20)
  spotLight.position.set(8, 10, -10)
  scene.add(spotLight)

  if (showDebug) {
    scene.add(new THREE.DirectionalLightHelper(directionalLight));
    scene.add(new THREE.SpotLightHelper(spotLight));

    let axes = new THREE.AxesHelper(20) // 參數為座標軸長度
    scene.add(axes)
  }
}

const initCannon = () => {
  let { scene, world, defaultMaterial } = useGameWorld;

  // 設定物理世界重力
  // 計算重力向量的分量
  const gravityMagnitude = 9.82;
  const angle = Math.PI * 0.2; // 設置斜度

  const gravityY = -gravityMagnitude * Math.cos(angle); // y 軸向下，所以是負值
  const gravityZ = -gravityMagnitude * Math.sin(angle);
  // 設置物理世界的重力
  world.gravity.set(0, gravityY, gravityZ);
  // world.gravity.set(0, -9.82, 0);

  // 預設材質
  const defaultContactMaterial = new CANNON.ContactMaterial(
    defaultMaterial,
    defaultMaterial,
    {
      friction: 0.7,
      restitution: 0.5
    }
  );
  world.addContactMaterial(defaultContactMaterial)

  if (showDebug) cannonDebugRenderer = new CannonDebugger(scene, world);
}

// 渲染場景
const render = () => {
  let { scene, camera, renderer, world } = useGameWorld;

  // 更新three模組
  renderer.render(scene, camera)

  // 更新物理世界
  // world.step(1/60, deltaTime, 3)
  world.step(1/60)

  if (showDebug) cannonDebugRenderer.update();
  
  requestAnimationFrame(render)
}