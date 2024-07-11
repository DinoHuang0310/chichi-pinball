import * as THREE from 'three';
import { TTFLoader } from 'three/examples/jsm/loaders/TTFLoader.js';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js';

import useGameWorld from './useGameWorld'

let point = 0;
let jetBrainsFont;
let textMesh;

export default () => {
  const { scene } = useGameWorld;
  const { clientWidth } = document.documentElement;

  const renderText = () => {
    if (textMesh) {
      scene.remove(textMesh);
      textMesh.geometry.dispose();
      textMesh.material.dispose();
    }

    // 使用已解析的字體
    const size = clientWidth > 640 ? 1 : 0.7
    const text = `point:${point}`
    const textGeometry = new TextGeometry(text, {
      depth: 1,
      size,
      font: jetBrainsFont,
    });
    textGeometry.computeBoundingBox();
    const boundingBox = textGeometry.boundingBox;
    const textWidth = boundingBox.max.x - boundingBox.min.x;

    textMesh = new THREE.Mesh(textGeometry, new THREE.MeshNormalMaterial());
    textMesh.position.set(textWidth / 2, 4, 3);
    textMesh.rotation.y = Math.PI;
    textMesh.rotation.x = Math.PI * 0.2;
    scene.add(textMesh);
  }

  const init = () => {
    const fontLoader = new FontLoader();
    const ttfLoader = new TTFLoader();
    
    ttfLoader.load('./fonts/kenpixel.ttf', (json) => {
      // 首先解析字體
      jetBrainsFont = fontLoader.parse(json);
      renderText()
    });
  }

  const plus = (num) => {
    point += num;
    renderText()
  }

  const reset = () => {
    point = 0
    renderText()
  }

  return {
    init,
    point,
    plus,
    reset,
  }
}