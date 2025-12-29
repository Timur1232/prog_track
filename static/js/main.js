'use strict'

import * as THREE from 'three';
import { modelManager } from './models.js';
import WebGL from 'three/addons/capabilities/WebGL.js';

let scene, camera, renderer, canvas;
let currentCharacter = null;
let currentStand = null;
let animationId = null;

const appState = {
    selectedClass: 'mage',
    selectedAbility: 'ability1',
    isModelLoaded: false
};

if (WebGL.isWebGL2Available()) {
    initializeApp();
} else {
    const warning = WebGL.getWebGL2ErrorMessage();
    document.body.innerHTML = `<div style="padding: 20px; color: red;">${warning}</div>`;
    console.error(warning);
}

async function initializeApp() {
    try {
        canvas = document.getElementById('canvas');
        initScene();
        setupLoadingHandlers();
        await modelManager.loadAll();
        hideLoadingScreen();
        createModel();
        setupLighting();
        setupEventListeners();
        startAnimation();
    } catch (error) {
        console.error('ошибка инициализации:', error);
        document.getElementById('loading-text').textContent =
            `ошибка загрузки: ${error.message}`;
    }
}

function initScene() {
    renderer = new THREE.WebGLRenderer({
        antialias: true,
        canvas: canvas,
        alpha: true,
        powerPreference: "high-performance"
    });

    renderer.setSize(canvas.clientWidth, canvas.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf0f0f0);

    camera = new THREE.PerspectiveCamera(
        45,
        canvas.clientWidth / canvas.clientHeight,
        0.1,
        1000
    );
    camera.position.set(0, 2, 8);
    camera.lookAt(0, 1, 0);
}

function setupLoadingHandlers() {
    modelManager.onProgress((key, type, _) => {
        const loadingText = document.getElementById('loading-text');
        const typeName = type === 'class' ? 'класс' : 'способность';
        loadingText.textContent = `загрузка ${typeName}: ${key}...`;
    });

    modelManager.onComplete(() => {
        appState.isModelLoaded = true;
        console.log('менеджер моделей готов');
    });

    modelManager.onError((error) => {
        console.error('Ошибка в менеджере моделей:', error);
    });
}

function hideLoadingScreen() {
    const loadingScreen = document.getElementById('loading-screen');
    if (loadingScreen) {
        loadingScreen.style.opacity = '0';
        setTimeout(() => {
            loadingScreen.style.display = 'none';
        }, 500);
    }
}

function createModel() {
    if (currentCharacter) {
        scene.remove(currentCharacter);
        currentCharacter = null;
    }
    if (currentStand) {
        scene.remove(currentStand);
        currentStand = null;
    }

    const characterModel = modelManager.getClass(appState.selectedClass);
    const standModel = modelManager.getAbility(appState.selectedAbility);

    if (!characterModel || !standModel) {
        console.warn('модели не загружены');
        return;
    }

    currentCharacter = characterModel;
    currentCharacter.position.set(0, 1.5, 0);
    currentCharacter.scale.set(0.8, 0.8, 0.8);

    currentStand = standModel;
    currentStand.position.set(0, 0, 0);
    currentStand.scale.set(1.2, 1.2, 1.2);

    scene.add(currentCharacter);
    scene.add(currentStand);
}

function setupLighting() {
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const mainLight = new THREE.DirectionalLight(0xffffff, 0.8);
    mainLight.position.set(5, 10, 5);
    mainLight.castShadow = true;
    mainLight.shadow.mapSize.width = 2048;
    mainLight.shadow.mapSize.height = 2048;
    scene.add(mainLight);

    const fillLight = new THREE.DirectionalLight(0xffffff, 0.3);
    fillLight.position.set(-5, 5, -5);
    scene.add(fillLight);

    const backLight = new THREE.DirectionalLight(0xffffff, 0.2);
    backLight.position.set(0, 5, -10);
    scene.add(backLight);
}

function setupEventListeners() {
    window.addEventListener('resize', onWindowResize);
}

function onWindowResize() {
    camera.aspect = canvas.clientWidth / canvas.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(canvas.clientWidth, canvas.clientHeight);
}

function startAnimation() {
    function animate() {
        animationId = requestAnimationFrame(animate);
        if (currentCharacter) {
            currentCharacter.rotation.y += 0.005;
        }
        renderer.render(scene, camera);
    }
    animate();
}

export function changeCharacterClass(className) {
    if (modelManager.models.classes[className]) {
        appState.selectedClass = className;
        createModel();
        return true;
    }
    return false;
}

export function changeAbility(abilityName) {
    if (modelManager.models.abilities[abilityName]) {
        appState.selectedAbility = abilityName;
        createModel();
        return true;
    }
    return false;
}

export function getCurrentState() {
    return { ...appState };
}

window.addEventListener('beforeunload', () => {
    if (animationId) {
        cancelAnimationFrame(animationId);
    }
    modelManager.dispose();
});
