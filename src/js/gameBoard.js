
import * as THREE from 'three';
import * as CANNON from 'cannon-es';

import useGameWorld from './composables/useGameWorld'
const { world, defaultMaterial } = useGameWorld

import useThreeGeometry from './composables/useThreeGeometry'
const { createGroup, createBox } = useThreeGeometry()

// 建立彈珠檯
export default () => {
  const railWidth = 0.42; // 發射軌道寬度

  const spacing = 0.66; // 擋針間距
  const maxLength = 9; // 擋針單排數量
  const cylinderLength = 60; // 擋針總數

  // img bg
  const texture = new THREE.TextureLoader().load('./images/bg.jpg');
  texture.colorSpace = THREE.SRGBColorSpace;
  const material = new THREE.MeshBasicMaterial({ map: texture });
  
  // 組成彈珠檯的零件
  const playFieldContent = [
    // top & bottom
    {
      type: 'box',
      options: { visible: false, size: [6, 0.04, 10], position: [0, 0.5, 0] }
    },
    {type: 'box', options: {
      size: [6, 0.2, 10],
      position: [0, 0, 0],
      material: material
    }},
    // border
    {type: 'box', options: { size: [0.04, 0.4, 10], position: [3, 0.25, 0] }},
    {type: 'box', options: { size: [0.04, 0.4, 10], position: [-3, 0.25, 0] }},
    // 軌道
    {type: 'box', options: { size: [0.04, 0.4, 7.4], position: [(-3 + railWidth), 0.25, -1.3] }},
    // 中柱
    {
      type: 'cylinder',
      options: {
        radiusTop: 0.7, radiusBottom: 0.7, height: 0.5, numSegments: 16,
        position: [0, 0.25, 3]
      }
    },
    // 計分區擋板
    {type: 'box', options: { size: [0.04, 0.4, 1.5], position: [-1.99, 0.25, -4.25] }},
    {type: 'box', options: { size: [0.04, 0.4, 1.5], position: [-1.37, 0.25, -4.25] }},
    {type: 'box', options: { size: [0.04, 0.4, 1.5], position: [-0.75, 0.25, -4.25] }},
    {type: 'box', options: { size: [0.04, 0.4, 1.5], position: [-0.13, 0.25, -4.25] }},
    {type: 'box', options: { size: [0.04, 0.4, 1.5], position: [0.49, 0.25, -4.25] }},
    {type: 'box', options: { size: [0.04, 0.4, 1.5], position: [1.11, 0.25, -4.25] }},
    {type: 'box', options: { size: [0.04, 0.4, 1.5], position: [1.73, 0.25, -4.25] }},
    {type: 'box', options: { size: [0.04, 0.4, 1.5], position: [2.35, 0.25, -4.25] }},
  ];

  (function() {
    // 建立頂端導軌
    const numBoxes = 20; // 總數
    const radius = 3 // 圓弧半徑
    const angleStep = Math.PI / numBoxes; // 計算角度
    for (let i = 1; i < numBoxes; i++) {
      // 計算角度
      const angle = i * angleStep;
      // 計算中心位置
      const x = radius * Math.cos(angle);
      const z = radius * Math.sin(angle);
      // 設定旋轉角度
      const quaternion = new CANNON.Quaternion();
      quaternion.setFromAxisAngle(new CANNON.Vec3(0, 1, 0), - angle);

      playFieldContent.push({
        type: 'box',
        options: { size: [0.08, 0.4, 1], position: [x, 0.25, z + 2], quaternion }
      })
    }

    // 建立擋針
    const radiusTop = 0.03;    // 擋針頂部半徑
    const radiusBottom = 0.03; // 擋針底部半徑
    const height = 0.5;        // 高度
    const numSegments = 8;     // 柱體分段數

    playFieldContent.push({
      type: 'cylinder',
      options: {
        radiusTop, radiusBottom, height, numSegments,
        position: [2, 0.25, 4]
      }
    })

    let startX = 2.9; // 左側起點
    let endX = startX - (maxLength - 1) * spacing + (spacing / 2)  // 右側頂點

    const firstRow = [] // 奇數排擋針X軸
    const secondRow = [] // 偶數排擋針X軸
    
    for (let i = 0; i < maxLength; i++) {
      firstRow.push(startX)
      startX -= spacing

      if (i != maxLength - 1) {
        secondRow.push(endX)
        endX += spacing
      }
    }

    const sequence = firstRow.concat(secondRow)

    let cylinderZ = 2;
    for (let i = 0; i < cylinderLength; i++) {
      const current = i % sequence.length
      const cylinderX = sequence[current]
      if (current == 0 || current == maxLength) cylinderZ -= spacing;

      playFieldContent.push({
        type: 'cylinder',
        options: {
          radiusTop, radiusBottom, height, numSegments,
          position: [cylinderX, 0.25, cylinderZ]
        }
      })
    }

  })();

  const table = createGroup(playFieldContent)

  const door = createBox({size: [0.04, 0.3, 1], position: [-2.6, 0.3, 2.9], mass: 0.1})
  // 創建鉸鏈約束
  const doorLooker = new CANNON.HingeConstraint(table.body, door.body, {
    pivotA: new CANNON.Vec3(-2.6, 0.25, 2.4), // bodyA 上的鉸鏈位置
    pivotB: new CANNON.Vec3(0, -0.02, -0.5),  // bodyB 上的鉸鏈位置
    axisA: new CANNON.Vec3(0, 0.2, 0),   // bodyA 的旋轉軸
    axisB: new CANNON.Vec3(0, 0.2, 0)    // bodyB 的旋轉軸
  });
  // 將約束添加到世界
  world.addConstraint(doorLooker);
  // 建立馬達
  doorLooker.enableMotor();
  doorLooker.setMotorSpeed(1); // 轉速, 正值表示順時針旋轉
  doorLooker.setMotorMaxForce(0.05); // 扭力
  doorLooker.collideConnected = true;

  // 計分trigger
  let startX = -2.29;
  const size = [0.5, 0.001, 0.4]
  for (let i = 0; i < 9; i++) {
    const body = new CANNON.Body({
      mass: 0,
      position: new CANNON.Vec3(startX, 0.1, -4.8),
      shape: new CANNON.Box(new CANNON.Vec3(size[0] * 0.5, size[1] * 0.5, size[2] * 0.5)),
      material: defaultMaterial
    })
    body.category = 'scoreboard'
    body.point = i;
    world.addBody(body);

    startX += 0.62
  }

  return {
    table,
    door,
  }
}