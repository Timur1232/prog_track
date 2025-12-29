'use strict'

import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import ModelController from './controller.js';

let scene, camera, renderer;
// let currentCharacter = null;
// let currentStand = null;
let currentClass = 'mage';
let currentAbility = 'ability1';

const classes = ['warrior', 'archer', 'mage', 'paladin'];
const abilities = ['ability1', 'ability2', 'ability3', 'ability4', 'ability5'];

let modelController = null;
let modelGroup = null;

const models = {
    classes: {},
    abilities: {}
};

const loader = new GLTFLoader();

let leftLight, rightLight, ambientLight;

function init() {
    const canvas = document.getElementById('canvas');

    renderer = new THREE.WebGLRenderer({
        canvas,
        antialias: true,
        powerPreference: "high-performance"
    });

    scene = new THREE.Scene();

    scene.background = new THREE.Color(0x1a1a2e);

    camera = new THREE.PerspectiveCamera(
        45,
        canvas.clientWidth / canvas.clientHeight,
        0.1,
        1000
    );
    camera.position.set(0, 1, 12);
    console.log(camera);

    setupLighting();
    loadAllModels();
}

function setupLighting() {
    if (leftLight) scene.remove(leftLight);
    if (rightLight) scene.remove(rightLight);
    if (ambientLight) scene.remove(ambientLight);

    const warmColor = new THREE.Color(0xffaa66);

    leftLight = new THREE.DirectionalLight(warmColor, 0.9);
    leftLight.position.set(-8, 5, 4);
    leftLight.castShadow = true;
    scene.add(leftLight);

    rightLight = new THREE.DirectionalLight(warmColor, 0.9);
    rightLight.position.set(8, 5, 4);
    rightLight.castShadow = true;
    scene.add(rightLight);

    ambientLight = new THREE.AmbientLight(0x404040, 0.4);
    scene.add(ambientLight);

    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
}

function setBackground(imageUrl, ambientColor = 0x404040, ambientIntensity = 0.4) {
    const textureLoader = new THREE.TextureLoader();

    if (imageUrl) {
        textureLoader.load(imageUrl, (texture) => {
            scene.background = texture;

            if (ambientLight) {
                ambientLight.color.setHex(ambientColor);
                ambientLight.intensity = ambientIntensity;
            }
        });
    } else {
        scene.background = new THREE.Color(ambientColor);
        if (ambientLight) {
            ambientLight.color.setHex(ambientColor);
            ambientLight.intensity = ambientIntensity;
        }
    }
}

async function loadAllModels() {
    try {
        for (const className of classes) {
            const model = await loadModel(`models/${className}.glb`);
            models.classes[className] = model;
        }

        for (const ability of abilities) {
            // const model = await loadModel(`models/${ability}.glb`);
            const model = await loadModel(`models/ability_placeholder.glb`);
            models.abilities[ability] = model;
        }

        createCurrentModel();
        setupButtons();
        animate();
    } catch (error) {
        console.error('ошибка загрузки:', error);
    }
}

function loadModel(path) {
    return new Promise((resolve, reject) => {
        loader.load(
            path,
            (gltf) => resolve(gltf.scene),
            null,
            reject
        );
    });
}

function createCurrentModel() {
    const character = models.classes[currentClass];
    const stand = models.abilities[currentAbility];

    if (!character || !stand) return;

    const newCharacter = character.clone();
    const newStand = stand.clone();

    if (!modelGroup) {
        modelGroup = new THREE.Group();
        scene.add(modelGroup);
        modelController = new ModelController(modelGroup, canvas);
    }

    modelController.setModels(newCharacter, newStand);
}

function setupButtons() {
    const classButtons = document.querySelectorAll('.class-btn');
    classButtons.forEach((btn, index) => {
        btn.addEventListener('click', () => {
            currentClass = classes[index];
            createCurrentModel();
        });
    });

    const abilityButtons = document.querySelectorAll('.ability-btn');
    abilityButtons.forEach((btn, index) => {
        btn.addEventListener('click', () => {
            currentAbility = `ability${index + 1}`;
            createCurrentModel();
        });
    });
}

function updateCanvasSize() {
    const canvas = document.getElementById('canvas');
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;

    if (canvas.width !== width || canvas.height !== height) {
        renderer.setSize(width, height, false);
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
    }
}

function animate() {
    requestAnimationFrame(animate);

    updateCanvasSize();
    if (modelController) {
        modelController.update();
    }

    renderer.render(scene, camera);
}

window.addEventListener('resize', updateCanvasSize);
window.setBackground = setBackground;
init();
