import '../css/style.css'
import * as CANNON from 'cannon-es';

import gameWorld from './composables/useGameWorld'
import useShootFire from './composables/useShootFire'
import createGameBoard from './gameBoard'

import usePoint from './composables/usePoint'
import useSkybox from './composables/useSkybox'

const { init, world, defaultMaterial } = gameWorld;
init()

const { init: initPointBoard } = usePoint();
initPointBoard()

// 建立地面剛體, 並加入世界
const floorBody = new CANNON.Body({
  mass: 0,
  shape: new CANNON.Plane(),
  material: defaultMaterial,
})
floorBody.quaternion.setFromAxisAngle(new CANNON.Vec3(-1, 0, 0), Math.PI * 0.5);
world.addBody(floorBody);

// 建立彈珠檯
createGameBoard()

// 建立場景
const { createSkybox } = useSkybox()
createSkybox('./images/background.jpg')

// 約束
// const lockConstraint = new CANNON.LockConstraint(floorBody, pinballTable.body);
// world.addConstraint(lockConstraint);

// 轉動整個檯面
// pinballTable.body.quaternion.setFromAxisAngle(new CANNON.Vec3(-1, 0, 0), Math.PI * 0.2);
// pinballTable.geometry.quaternion.copy(pinballTable.body.quaternion)

useShootFire()