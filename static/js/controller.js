'use strict'

import * as THREE from 'three';

export default class ModelController {
    constructor(modelGroup) {
        this.group = modelGroup;

        this.rotationY = 0;
        this.rotationX = 0;
        this.targetRotationY = 0;
        this.targetRotationX = 0;

        this.velocityY = 0.01;
        this.defaultVelocity = 0.01;
        this.friction = 0.95;
        this.returnSpeed = 0.1;

        this.isDragging = false;
        this.lastMouseX = 0;
        this.lastMouseY = 0;

        this.maxTilt = 0.3;

        this.init();
    }

    init() {
        document.addEventListener('mousedown', this.onMouseDown.bind(this));
        document.addEventListener('mousemove', this.onMouseMove.bind(this));
        document.addEventListener('mouseup', this.onMouseUp.bind(this));
    }

    onMouseDown(e) {
        this.isDragging = true;
        this.lastMouseX = e.clientX;
        this.lastMouseY = e.clientY;
    }

    onMouseMove(e) {
        if (!this.isDragging) return;

        const deltaX = e.clientX - this.lastMouseX;
        const deltaY = e.clientY - this.lastMouseY;

        this.velocityY = deltaX * 0.01;
        this.targetRotationY += deltaX * 0.01;

        this.targetRotationX = THREE.MathUtils.clamp(
            this.targetRotationX + deltaY * 0.005,
            -this.maxTilt,
            this.maxTilt
        );

        this.lastMouseX = e.clientX;
        this.lastMouseY = e.clientY;
    }

    onMouseUp() {
        this.isDragging = false;
    }

    update() {
        if (!this.isDragging) {
            if (Math.abs(this.velocityY) > this.defaultVelocity) {
                this.velocityY *= this.friction;
                if (Math.abs(this.velocityY) <= this.defaultVelocity) {
                    this.velocityY = this.defaultVelocity * (this.velocityY > 0 ? 1 : -1);
                }
            } else {
                this.velocityY *= this.friction;
                if (Math.abs(this.velocityY) < 0.001) {
                    this.velocityY = 0;
                }
            }

            this.targetRotationY += this.velocityY;
            this.targetRotationX *= (1 - this.returnSpeed);
        }

        this.rotationY = THREE.MathUtils.lerp(this.rotationY, this.targetRotationY, 0.1);
        this.rotationX = THREE.MathUtils.lerp(this.rotationX, this.targetRotationX, 0.1);

        this.group.rotation.y = this.rotationY;
        this.group.rotation.x = this.rotationX;
    }

    setModels(figurine, stand) {
        while (this.group.children.length > 0) {
            this.group.remove(this.group.children[0]);
        }

        this.group.add(figurine);
        this.group.add(stand);
    }
}
