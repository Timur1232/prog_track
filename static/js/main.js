'use strict'

import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import WebGL from 'three/addons/capabilities/WebGL.js';

if (WebGL.isWebGL2Available()) {
    main();
} else {
    const warning = WebGL.getWebGL2ErrorMessage();
    document.getElementById('container').appendChild(warning);
}

async function main() {
    const renderer = new THREE.WebGLRenderer({ antialias: true, canvas });
    renderer.setSize(canvas.innerWidth, canvas.innerHeight);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xeeeeee);

    const camera = new THREE.PerspectiveCamera(75, canvas.innerWidth / canvas.innerHeight, 0.1, 1000);
    camera.position.z = 5;

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(1, 1, 1);
    scene.add(directionalLight);

    const loader = new GLTFLoader();
    const mage = await loader.loadAsync('models/mage.glb');
    scene.add(mage.scene);

    let direction = true;
    function animate() {
        if (mage != null) {
            mage.scene.rotation.y += 0.01;
        }

        if (camera.position.y >= 10) {
            direction = false;
        } else if (camera.position.y <= -10) {
            direction = true;
        }

        if (direction) {
            camera.position.y += 0.01;
        } else {
            camera.position.y -= 0.01;
        }
        camera.lookAt(0, 0, 0);

        renderer.render(scene, camera);
    }
    renderer.setAnimationLoop(animate);

    window.addEventListener('resize', () => {
        camera.aspect = canvas.innerWidth / canvas.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(canvas.innerWidth, canvas.innerHeight);
    });
}
