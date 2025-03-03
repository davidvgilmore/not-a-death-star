import * as THREE from 'three';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';
import { FontLoader } from 'three/addons/loaders/FontLoader.js';
import { PointerLockControls } from 'three/addons/controls/PointerLockControls.js';

// Scene setup
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000033); // Dark blue sky
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
document.body.appendChild(renderer.domElement);

// Create ground
const groundGeometry = new THREE.PlaneGeometry(100, 100);
const groundMaterial = new THREE.MeshStandardMaterial({ 
    color: 0x1a472a,  // Dark green
    roughness: 0.8,
    metalness: 0.2
});
const ground = new THREE.Mesh(groundGeometry, groundMaterial);
ground.rotation.x = -Math.PI / 2;
ground.position.y = -10;
ground.receiveShadow = true;
scene.add(ground);

// Create Death Star
const createDeathStar = () => {
    const deathStarGroup = new THREE.Group();
    
    // Main sphere
    const sphereGeometry = new THREE.SphereGeometry(40, 64, 64);
    const sphereMaterial = new THREE.MeshStandardMaterial({
        color: 0x888888,
        roughness: 0.7,
        metalness: 0.5,
        flatShading: true
    });
    const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
    deathStarGroup.add(sphere);

    // Create equatorial trench
    const trenchGeometry = new THREE.TorusGeometry(40, 1, 16, 100);
    const trenchMaterial = new THREE.MeshStandardMaterial({
        color: 0x444444,
        roughness: 0.8,
        metalness: 0.6
    });
    const trench = new THREE.Mesh(trenchGeometry, trenchMaterial);
    trench.rotation.x = Math.PI / 2;
    deathStarGroup.add(trench);

    // Create superlaser dish
    const dishGeometry = new THREE.CircleGeometry(8, 32);
    const dishMaterial = new THREE.MeshStandardMaterial({
        color: 0x333333,
        roughness: 0.9,
        metalness: 0.7,
        side: THREE.DoubleSide
    });
    const dish = new THREE.Mesh(dishGeometry, dishMaterial);
    dish.position.set(-38, 0, 0); // Position on the surface
    dish.rotation.y = Math.PI / 2;
    deathStarGroup.add(dish);

    // Add surface details
    for (let i = 0; i < 100; i++) {
        const detailGeometry = new THREE.BoxGeometry(
            Math.random() * 2 + 1,
            Math.random() * 2 + 1,
            0.5
        );
        const detailMaterial = new THREE.MeshStandardMaterial({
            color: 0x666666,
            roughness: 0.8,
            metalness: 0.6
        });
        const detail = new THREE.Mesh(detailGeometry, detailMaterial);
        
        // Position on sphere surface
        const phi = Math.random() * Math.PI * 2;
        const theta = Math.random() * Math.PI;
        detail.position.x = 40 * Math.sin(theta) * Math.cos(phi);
        detail.position.y = 40 * Math.sin(theta) * Math.sin(phi);
        detail.position.z = 40 * Math.cos(theta);
        
        // Orient to face outward
        detail.lookAt(0, 0, 0);
        deathStarGroup.add(detail);
    }

    // Add memex.tech text
    const fontLoader = new FontLoader();
    fontLoader.load('https://threejs.org/examples/fonts/helvetiker_regular.typeface.json', function(font) {
        const textGeometry = new TextGeometry('memex.tech', {
            font: font,
            size: 8,
            height: 1,
            curveSegments: 12,
            bevelEnabled: true,
            bevelThickness: 0.2,
            bevelSize: 0.1,
            bevelOffset: 0,
            bevelSegments: 5
        });
        const textMaterial = new THREE.MeshStandardMaterial({
            color: 0xffffff,
            roughness: 0.3,
            metalness: 0.7
        });
        const textMesh = new THREE.Mesh(textGeometry, textMaterial);
        
        // Center the text
        textGeometry.computeBoundingBox();
        const textWidth = textGeometry.boundingBox.max.x - textGeometry.boundingBox.min.x;
        textMesh.position.set(-textWidth/2, 20, -35);
        textMesh.lookAt(0, 0, 0);
        
        deathStarGroup.add(textMesh);
    });

    // Position Death Star in background
    deathStarGroup.position.set(-100, 50, -150);
    
    return deathStarGroup;
};

// Add enhanced stars
const createEnhancedStars = () => {
    const starsGroup = new THREE.Group();
    
    // Multiple layers of stars
    const createStarLayer = (count, size, depth) => {
        const geometry = new THREE.BufferGeometry();
        const vertices = [];
        
        for (let i = 0; i < count; i++) {
            const x = (Math.random() - 0.5) * 400;
            const y = Math.random() * 200;
            const z = (Math.random() - 0.5) * 400 + depth;
            vertices.push(x, y, z);
        }
        
        geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
        const material = new THREE.PointsMaterial({
            color: 0xFFFFFF,
            size: size,
            sizeAttenuation: true
        });
        
        return new THREE.Points(geometry, material);
    };
    
    starsGroup.add(createStarLayer(2000, 0.15, -200));
    starsGroup.add(createStarLayer(2000, 0.1, -100));
    starsGroup.add(createStarLayer(2000, 0.05, 0));
    
    return starsGroup;
};

const stars = createEnhancedStars();
scene.add(stars);

const deathStar = createDeathStar();
scene.add(deathStar);

// Create comet
const cometGeometry = new THREE.SphereGeometry(
    1.5,     // radius
    128,     // widthSegments - doubled for smoother surface
    64,      // heightSegments - doubled for smoother surface
    0,       // phiStart - starting angle
    Math.PI * 2, // phiLength - full circle
    0,       // thetaStart - starting vertical angle 
    Math.PI  // thetaLength - full height
);
const cometTexture = new THREE.TextureLoader().load('https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/planets/moon_1024.jpg');
const cometMaterial = new THREE.MeshStandardMaterial({ 
    map: cometTexture,
    roughness: 0.9,
    metalness: 0.1,
    color: 0x444444
});
const comet = new THREE.Mesh(cometGeometry, cometMaterial);
comet.castShadow = true;

// Create multiple flame layers for the tail
const createFlameMesh = (radius, length, color, emissiveColor, opacity) => {
    const geometry = new THREE.ConeGeometry(radius, length, 32);
    const material = new THREE.MeshPhongMaterial({
        color: color,
        emissive: emissiveColor,
        emissiveIntensity: 0.5,
        transparent: true,
        opacity: opacity
    });
    return new THREE.Mesh(geometry, material);
};

// Create main tail
const tail = createFlameMesh(0.9, 9, 0xff4400, 0xff8844, 0.6);
tail.position.x = -4.5;
tail.rotation.z = Math.PI / 2;
comet.add(tail);

// Create inner flame
const innerFlame = createFlameMesh(0.6, 7, 0xff7700, 0xffaa22, 0.7);
innerFlame.position.x = -3.5;
innerFlame.rotation.z = Math.PI / 2;
comet.add(innerFlame);

// Create outer flame
const outerFlame = createFlameMesh(1.1, 11, 0xff3300, 0xff6611, 0.4);
outerFlame.position.x = -5.5;
outerFlame.rotation.z = Math.PI / 2;
comet.add(outerFlame);

// Add particle systems for the trail
const createParticleSystem = (count, size, color, spread) => {
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const velocities = new Float32Array(count * 3);
    
    for(let i = 0; i < count * 3; i += 3) {
        positions[i] = 0;
        positions[i + 1] = 0;
        positions[i + 2] = 0;
        // More focused velocities, mainly moving backward
        velocities[i] = -Math.random() * spread; // Mainly backward movement
        velocities[i + 1] = (Math.random() - 0.5) * spread * 0.3; // Reduced vertical spread
        velocities[i + 2] = (Math.random() - 0.5) * spread * 0.3; // Reduced depth spread
    }
    
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('velocity', new THREE.BufferAttribute(velocities, 3));
    
    const material = new THREE.PointsMaterial({
        size: size,
        color: color,
        transparent: true,
        opacity: 0.6,
        blending: THREE.AdditiveBlending
    });
    
    return new THREE.Points(geometry, material);
};

// Create multiple particle systems for different effects
const mainParticles = createParticleSystem(1000, 0.05, 0xff6622, 0.08);
const sparkParticles = createParticleSystem(500, 0.03, 0xffaa44, 0.1);
const glowParticles = createParticleSystem(300, 0.08, 0xff4400, 0.04);

scene.add(mainParticles);
scene.add(sparkParticles);
scene.add(glowParticles);

scene.add(comet);

// Add lighting
const ambientLight = new THREE.AmbientLight(0x404040);
scene.add(ambientLight);

const moonLight = new THREE.DirectionalLight(0xffffff, 1);
moonLight.position.set(10, 20, 10);
moonLight.castShadow = true;
moonLight.shadow.camera.near = 0.1;
moonLight.shadow.camera.far = 100;
moonLight.shadow.camera.left = -20;
moonLight.shadow.camera.right = 20;
moonLight.shadow.camera.top = 20;
moonLight.shadow.camera.bottom = -20;
scene.add(moonLight);

// Load font and create text
const fontLoader = new FontLoader();
fontLoader.load('https://threejs.org/examples/fonts/helvetiker_regular.typeface.json', function(font) {
    const textGeometry = new TextGeometry('memex.tech', {
        font: font,
        size: 0.5,  // Larger text
        height: 0.03,  // More depth
        curveSegments: 12,
        bevelEnabled: true,
        bevelThickness: 0.01,
        bevelSize: 0.015,
        bevelOffset: 0,
        bevelSegments: 5
    });
    const textMaterial = new THREE.MeshPhongMaterial({ 
        color: 0xffffff,
        emissive: 0xffffff,
        emissiveIntensity: 0.5,
        shininess: 100
    });
    const textMesh = new THREE.Mesh(textGeometry, textMaterial);
    
    // Center and position the text on the side of the comet
    textGeometry.computeBoundingBox();
    const textWidth = textGeometry.boundingBox.max.x - textGeometry.boundingBox.min.x;
    textMesh.position.x = 0;
    textMesh.position.y = -0.5;  // Move down slightly
    textMesh.position.z = 1.5;  // Position on the side
    textMesh.rotation.z = Math.PI;  // Flip text right-side up
    textMesh.rotation.y = -Math.PI;  // Face outward from comet
    textMesh.rotation.x = Math.PI;  // Face outward from comet
    
    comet.add(textMesh);
});

// Setup controls
const controls = new PointerLockControls(camera, document.body);

// Initial camera position
camera.position.set(0, 5, 20);

// Movement variables
const moveSpeed = 0.3;
const moveState = {
    forward: false,
    backward: false,
    left: false,
    right: false,
    up: false,
    down: false
};

// Click to start
document.addEventListener('click', function () {
    controls.lock();
});

// Movement controls
document.addEventListener('keydown', function (event) {
    switch (event.code) {
        case 'ArrowUp':
        case 'KeyW':
            moveState.forward = true;
            break;
        case 'ArrowDown':
        case 'KeyS':
            moveState.backward = true;
            break;
        case 'ArrowLeft':
        case 'KeyA':
            moveState.left = true;
            break;
        case 'ArrowRight':
        case 'KeyD':
            moveState.right = true;
            break;
        case 'Space':
            moveState.up = true;
            break;
        case 'ShiftLeft':
            moveState.down = true;
            break;
    }
});

document.addEventListener('keyup', function (event) {
    switch (event.code) {
        case 'ArrowUp':
        case 'KeyW':
            moveState.forward = false;
            break;
        case 'ArrowDown':
        case 'KeyS':
            moveState.backward = false;
            break;
        case 'ArrowLeft':
        case 'KeyA':
            moveState.left = false;
            break;
        case 'ArrowRight':
        case 'KeyD':
            moveState.right = false;
            break;
        case 'Space':
            moveState.up = false;
            break;
        case 'ShiftLeft':
            moveState.down = false;
            break;
    }
});

// Instructions overlay
const instructions = document.createElement('div');
instructions.style.position = 'absolute';
instructions.style.top = '10px';
instructions.style.width = '100%';
instructions.style.textAlign = 'center';
instructions.style.color = '#ffffff';
instructions.style.fontSize = '14px';
instructions.style.fontFamily = 'Arial';
instructions.style.textShadow = '1px 1px 1px rgba(0,0,0,0.5)';
instructions.innerHTML = 'Click to start<br>WASD/Arrows = Move, Space = Up, Shift = Down<br>Mouse = Look around';
document.body.appendChild(instructions);

controls.addEventListener('lock', function () {
    instructions.style.display = 'none';
});

controls.addEventListener('unlock', function () {
    instructions.style.display = 'block';
});

// Animation
let time = 0;
const cometPath = {
    startX: -30,
    endX: 30,
    height: 10,
    duration: 500 // frames for one complete path
};

function animate() {
    requestAnimationFrame(animate);

    // Handle movement
    if (controls.isLocked) {
        const actualMoveSpeed = moveSpeed;

        if (moveState.forward) {
            controls.moveForward(actualMoveSpeed);
        }
        if (moveState.backward) {
            controls.moveForward(-actualMoveSpeed);
        }
        if (moveState.left) {
            controls.moveRight(-actualMoveSpeed);
        }
        if (moveState.right) {
            controls.moveRight(actualMoveSpeed);
        }
        if (moveState.up) {
            camera.position.y += actualMoveSpeed;
        }
        if (moveState.down) {
            camera.position.y -= actualMoveSpeed;
        }
    }
    
    time += 1;
    
    // Move comet in a horizontal path
    const progress = (time % cometPath.duration) / cometPath.duration;
    comet.position.x = cometPath.startX + (cometPath.endX - cometPath.startX) * progress;
    comet.position.y = cometPath.height;
    comet.position.z = Math.sin(progress * Math.PI * 2) * 2; // Small z-axis movement for interest
    
    // Animate flame layers
    const flameTime = time * 0.05;
    innerFlame.scale.y = 1 + Math.sin(flameTime * 1.5) * 0.1;
    outerFlame.scale.y = 1 + Math.cos(flameTime) * 0.15;
    tail.scale.y = 1 + Math.sin(flameTime * 0.8) * 0.05;

    // Rotate flames slightly for more dynamic effect
    innerFlame.rotation.x = Math.sin(flameTime * 0.5) * 0.05;
    outerFlame.rotation.x = Math.cos(flameTime * 0.3) * 0.08;

    // Update particle systems
    const updateParticles = (particles, speed, spread, decay) => {
        const positions = particles.geometry.attributes.position.array;
        const velocities = particles.geometry.attributes.velocity.array;
        
        for(let i = 0; i < positions.length; i += 3) {
            // Move particles based on their velocity
            positions[i] += velocities[i] * speed;
            positions[i + 1] += velocities[i + 1] * speed;
            positions[i + 2] += velocities[i + 2] * speed;
            
            // Reset particles that move too far from their current spawn point
            const distanceFromComet = Math.abs(positions[i] - comet.position.x);
            if(distanceFromComet > 10) {
                // Reset to just behind the comet
                positions[i] = comet.position.x;
                positions[i + 1] = comet.position.y;
                positions[i + 2] = comet.position.z;
                
                // Initialize velocity relative to comet's movement
                velocities[i] = -Math.random() * decay;
                velocities[i + 1] = (Math.random() - 0.5) * spread * 0.2;
                velocities[i + 2] = (Math.random() - 0.5) * spread * 0.2;
            }
        }
        particles.geometry.attributes.position.needsUpdate = true;
    };

    // Update particle systems with reduced spread
    updateParticles(mainParticles, 0.15, 0.3, 0.2);
    updateParticles(sparkParticles, 0.2, 0.4, 0.3);
    updateParticles(glowParticles, 0.1, 0.2, 0.15);
    
    // Animate stars and Death Star
    stars.rotation.y += 0.0001;
    deathStar.rotation.y += 0.0001;
    
    renderer.render(scene, camera);
}

// Handle window resize
window.addEventListener('resize', onWindowResize, false);

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

animate();
