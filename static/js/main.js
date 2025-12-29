'use strict'

import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import ModelController from './controller.js';

let scene, camera, renderer;
let currentCharacter = null;
let currentStand = null;
let currentClass = 'mage';
let currentAbility = 'ability1';

const loader = new GLTFLoader();

const models = {
    classes: {},
    abilities: {}
};

function init() {
    const canvas = document.getElementById('canvas');
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    renderer.setSize(canvas.clientWidth, canvas.clientHeight);

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf0f0f0);

    camera = new THREE.PerspectiveCamera(
        45,
        canvas.clientWidth / canvas.clientHeight,
        0.1,
        1000
    );
    camera.position.set(0, 2, 10);

    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(5, 10, 5);
    scene.add(light);
    scene.add(new THREE.AmbientLight(0xffffff, 0.5));

    loadAllModels();
}

async function loadAllModels() {
    const classes = ['mage', 'warrior', 'archer', 'paladin'];
    const abilities = ['ability1', 'ability2', 'ability3', 'ability4', 'ability5'];
    try {
        for (const className of classes) {
            const model = await loadModel(`models/${className}.glb`);
            models.classes[className] = model;
            console.log(`загружен: ${className}`);
        }

        for (const ability of abilities) {
            // const model = await loadModel(`models/${ability}.glb`);
            const model = await loadModel(`models/placeholder.glb`);
            models.abilities[ability] = model;
            console.log(`загружена: ${ability}`);
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
            (error) => reject(error)
        );
    });
}

let modelController;
let modelGroup;

function createCurrentModel() {
    const character = models.classes[currentClass];
    const stand = models.abilities[currentAbility];

    if (!character || !stand) return;

    const newCharacter = character.clone();
    const newStand = stand.clone();

    if (!modelGroup) {
        modelGroup = new THREE.Group();
        scene.add(modelGroup);
        modelController = new ModelController(modelGroup);
    }

    modelController.setModels(newCharacter, newStand);
}

function setupButtons() {
    const classButtons = document.querySelectorAll('.class-btn');
    classButtons.forEach((btn, index) => {
        btn.addEventListener('click', () => {
            const classes = ['mage', 'warrior', 'archer', 'paladin'];
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

function animate() {
    requestAnimationFrame(animate);
    if (modelController) {
        modelController.update();
    }
    renderer.render(scene, camera);
}

window.addEventListener('resize', () => {
    const canvas = document.getElementById('canvas');
    camera.aspect = canvas.width / canvas.height;
    camera.updateProjectionMatrix();
    renderer.setSize(canvas.width, canvas.height, false);
});

init();
