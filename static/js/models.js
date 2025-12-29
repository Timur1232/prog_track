'use strict'

import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

class ModelManager {
    constructor() {
        this.models = {
            classes: {
                mage: null,
                warrior: null,
                archer: null,
                paladin: null
            },
            abilities: {
                ability1: null,
                ability2: null,
                ability3: null,
                ability4: null,
                ability5: null
            }
        };

        this.loadingProgress = {
            total: 9,
            loaded: 0
        };

        this.loader = new GLTFLoader();

        this.events = {
            onProgress: null,
            onComplete: null,
            onError: null
        };
    }

    async loadAll() {
        try {
            console.log('загрузка 3d моделей');

            await Promise.all([
                this.loadClass('mage', 'models/mage.glb'),
                this.loadClass('warrior', 'models/warrior.glb'),
                this.loadClass('archer', 'models/archer.glb'),
                this.loadClass('paladin', 'models/paladin.glb')
            ]);

            const abilityPromises = [];
            for (let i = 1; i <= 5; i++) {
                abilityPromises.push(
                    this.loadAbility(`ability${i}`, `models/placeholder.glb`)
                );
            }
            await Promise.all(abilityPromises);

            console.log('все модели загружены');

            if (this.events.onComplete) {
                this.events.onComplete();
            }
            return this.models;
        } catch (error) {
            console.error('ошибка загрузки моделей:', error);
            if (this.events.onError) {
                this.events.onError(error);
            }
            throw error;
        }
    }

    async loadClass(key, path) {
        return new Promise((resolve, reject) => {
            console.log(`загрузка класса: ${key} (${path})`);
            this.loader.load(
                path,
                (gltf) => {
                    this.models.classes[key] = gltf;
                    this._updateProgress();

                    console.log(`класс ${key} загружен`);

                    this._setupModel(gltf.scene);
                    resolve(gltf);
                },
                (progress) => {
                    const percent = Math.round((progress.loaded / progress.total) * 100);
                    if (percent % 25 === 0) {
                        console.log(`${key}: ${percent}%`);
                    }

                    if (this.events.onProgress) {
                        this.events.onProgress(key, 'class', percent);
                    }
                },
                (error) => {
                    console.error(`ошибка загрузки класса ${key}:`, error);
                    reject(error);
                }
            );
        });
    }

    async loadAbility(key, path) {
        return new Promise((resolve, reject) => {
            console.log(`загрузка способности: ${key} (${path})`);
            this.loader.load(
                path,
                (gltf) => {

                    this.models.abilities[key] = gltf;
                    this._updateProgress();

                    console.log(`способность ${key} загружена`);

                    this._setupModel(gltf.scene);
                    resolve(gltf);
                },
                (progress) => {
                    if (this.events.onProgress) {
                        const percent = Math.round((progress.loaded / progress.total) * 100);
                        this.events.onProgress(key, 'ability', percent);
                    }
                },
                (error) => {
                    console.error(`ошибка загрузки способности ${key}:`, error);
                    reject(error);
                }
            );
        });
    }

    _setupModel(model) {
        const box = new THREE.Box3().setFromObject(model);
        const center = box.getCenter(new THREE.Vector3());
        model.position.sub(center);

        const size = box.getSize(new THREE.Vector3());
        const maxDim = Math.max(size.x, size.y, size.z);
        const scale = 2 / maxDim;
        model.scale.multiplyScalar(scale);

        model.traverse((child) => {
            if (child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;

                if (child.material) {
                    child.material.side = THREE.DoubleSide;
                }
            }
        });
    }

    _updateProgress() {
        this.loadingProgress.loaded++;
        const percent = Math.round((this.loadingProgress.loaded / this.loadingProgress.total) * 100);

        console.log(`прогресс: ${percent}% (${this.loadingProgress.loaded}/${this.loadingProgress.total})`);

        const progressBar = document.getElementById('loading-progress');
        if (progressBar) {
            progressBar.style.width = `${percent}%`;
            progressBar.textContent = `${percent}%`;
        }
    }

    getClass(key) {
        return this.models.classes[key] ? this.models.classes[key].scene.clone() : null;
    }

    getAbility(key) {
        return this.models.abilities[key] ? this.models.abilities[key].scene.clone() : null;
    }

    getAvailableClasses() {
        return Object.keys(this.models.classes).filter(key => this.models.classes[key] !== null);
    }

    getAvailableAbilities() {
        return Object.keys(this.models.abilities).filter(key => this.models.abilities[key] !== null);
    }

    isLoaded() {
        return this.loadingProgress.loaded === this.loadingProgress.total;
    }

    onProgress(callback) {
        this.events.onProgress = callback;
    }

    onComplete(callback) {
        this.events.onComplete = callback;
    }

    onError(callback) {
        this.events.onError = callback;
    }

    dispose() {
        Object.values(this.models.classes).forEach(model => {
            if (model) {
                this._disposeModel(model.scene);
            }
        });

        Object.values(this.models.abilities).forEach(model => {
            if (model) {
                this._disposeModel(model.scene);
            }
        });

        this.models = {
            classes: { mage: null, warrior: null, archer: null, paladin: null },
            abilities: { ability1: null, ability2: null, ability3: null, ability4: null, ability5: null }
        };

        console.log('ресурсы моделей освобождены');
    }

    _disposeModel(model) {
        model.traverse((child) => {
            if (child.isMesh) {
                if (child.geometry) child.geometry.dispose();
                if (child.material) {
                    if (child.material.map) child.material.map.dispose();
                    if (child.material.lightMap) child.material.lightMap.dispose();
                    if (child.material.bumpMap) child.material.bumpMap.dispose();
                    if (child.material.normalMap) child.material.normalMap.dispose();
                    if (child.material.specularMap) child.material.specularMap.dispose();
                    if (child.material.envMap) child.material.envMap.dispose();
                    child.material.dispose();
                }
            }
        });
    }
}

export const modelManager = new ModelManager();
