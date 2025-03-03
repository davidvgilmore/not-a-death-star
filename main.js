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
const groundGeometry = new THREE.PlaneGeometry(1000, 1000);
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
    
    // Main sphere with darker materials
    const sphereGeometry = new THREE.SphereGeometry(40, 64, 64);
    const sphereMaterial = new THREE.MeshStandardMaterial({
        color: 0x666666,         // Darker gray (was 0xaaaaaa)
        roughness: 0.7,          // Increased roughness for more matte look
        metalness: 0.4,          // Slight increase for better definition
        emissive: 0x222222,
        emissiveIntensity: 0.1   // Reduced to make it darker
    });
    const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
    deathStarGroup.add(sphere);

    // Create equatorial trench with more subtle geometry
    const trenchGeometry = new THREE.TorusGeometry(40, 0.6, 16, 100);
    const trenchMaterial = new THREE.MeshStandardMaterial({
        color: 0x222222,
        roughness: 0.7,
        metalness: 0.6
    });
    const trench = new THREE.Mesh(trenchGeometry, trenchMaterial);
    trench.rotation.x = Math.PI / 2;
    deathStarGroup.add(trench);

    // Add three perpendicular trenches (longitudinal lines) at 60-degree intervals
    // First longitudinal trench (already exists)
    const trench2 = trench.clone();
    trench2.rotation.x = 0;
    trench2.rotation.y = Math.PI / 2;
    deathStarGroup.add(trench2);

    // Second longitudinal trench - at 60 degrees
    const trench3 = trench.clone();
    trench3.rotation.x = 0;
    trench3.rotation.y = Math.PI / 2 + Math.PI / 3; // 90° + 60°
    deathStarGroup.add(trench3);

    // Third longitudinal trench - at 120 degrees
    const trench4 = trench.clone();
    trench4.rotation.x = 0;
    trench4.rotation.y = Math.PI / 2 + 2 * Math.PI / 3; // 90° + 120°
    deathStarGroup.add(trench4);

    // Modify the crater geometry to be less protruding
    const craterGeometry = new THREE.SphereGeometry(10, 32, 32, 0, Math.PI * 0.4, 0, Math.PI * 0.4);
    const craterMaterial = new THREE.MeshStandardMaterial({
        color: 0x222222,
        roughness: 0.6,
        metalness: 0.7,
        side: THREE.BackSide,
        emissive: 0x111111,
        emissiveIntensity: 0.2
    });

    // Adjust crater position to be flush with the surface
    const crater = new THREE.Mesh(craterGeometry, craterMaterial);
    crater.position.set(0, 0, -39.8); // Moved slightly inward
    crater.rotation.y = Math.PI;
    // deathStarGroup.add(crater);

    // Add superlaser components with more dramatic appearance
    const weaponGroup = new THREE.Group();

    // Main weapon dish - larger and more defined
    const weaponGeometry = new THREE.CircleGeometry(9, 32);
    const weaponMaterial = new THREE.MeshStandardMaterial({
        color: 0x333333,
        metalness: 0.9,
        roughness: 0.3,
        side: THREE.DoubleSide,
        emissive: 0x222222,
        emissiveIntensity: 0.4
    });
    const weapon = new THREE.Mesh(weaponGeometry, weaponMaterial);
    weaponGroup.add(weapon);

    // Add concentric rings to the weapon for more detail
    const ringGeometries = [7, 5, 3];
    for (let i = 0; i < ringGeometries.length; i++) {
        const ringGeometry = new THREE.RingGeometry(ringGeometries[i], ringGeometries[i] + 0.5, 32);
        const ringMaterial = new THREE.MeshStandardMaterial({
            color: 0x444444,
            metalness: 0.8,
            roughness: 0.4,
            side: THREE.DoubleSide
        });
        const ring = new THREE.Mesh(ringGeometry, ringMaterial);
        ring.position.z = 0.1 * (i + 1); 
        weaponGroup.add(ring);
    }

    // Center focusing lens with strong glow effect
    const lensGeometry = new THREE.CircleGeometry(2, 32);
    const lensMaterial = new THREE.MeshStandardMaterial({
        color: 0xcccccc,        // Light metallic grey 
        emissive: 0x666666,     // Subtle grey glow
        emissiveIntensity: 0.7, 
        metalness: 1.0,
        roughness: 0.2,         // Smooth reflective surface
        side: THREE.DoubleSide
    });
    const lens = new THREE.Mesh(lensGeometry, lensMaterial);
    lens.position.z = 0.5;
    weaponGroup.add(lens);

    // Position weapon in the northern hemisphere, offset from grid lines
    const weaponPosition = new THREE.Vector3(-16, 15, -30); // X offset, Y up, Z toward camera
    const normalizedPos = weaponPosition.clone().normalize().multiplyScalar(40);
    
    // Store the weapon position on the Death Star group for later reference
    deathStarGroup.userData.weaponPosition = normalizedPos.clone();

    // Update weapon group position and rotation
    weaponGroup.position.copy(normalizedPos);
    // Make weapon face outward from its position
    weaponGroup.lookAt(0, 0, 0);
    // Add the weapon group to the Death Star
    deathStarGroup.add(weaponGroup);

    // Create a visible crater around the weapon
    const visibleCraterGeometry = new THREE.CircleGeometry(12, 32);
    const visibleCraterMaterial = new THREE.MeshStandardMaterial({
        color: 0x222222,
        roughness: 0.7,
        metalness: 0.5,
        side: THREE.DoubleSide
    });
    const visibleCrater = new THREE.Mesh(visibleCraterGeometry, visibleCraterMaterial);
    // Position slightly behind weapon to avoid z-fighting
    visibleCrater.position.copy(normalizedPos);
    visibleCrater.lookAt(0, 0, 0);
    // Move slightly toward center to avoid z-fighting
    visibleCrater.position.multiplyScalar(0.995);
    deathStarGroup.add(visibleCrater);

    // Add strong red point light for the weapon
    const weaponLight = new THREE.PointLight(0xaaaaff, 2, 20); // Subtle bluish-white light
    weaponLight.position.copy(normalizedPos);
    // Move light slightly inward
    weaponLight.position.multiplyScalar(0.95);
    deathStarGroup.add(weaponLight);

    // Reduce the size of the glow effect to make it more focused
    const glowGeometry = new THREE.CircleGeometry(7, 32); // Smaller size
    const glowMaterial = new THREE.MeshBasicMaterial({
        color: 0xcccccc,         // Light grey glow
        transparent: true,
        opacity: 0.1,            // More subtle
        side: THREE.DoubleSide
    });
    const glow = new THREE.Mesh(glowGeometry, glowMaterial);
    glow.position.copy(normalizedPos);
    // Make sure the glow faces outward correctly
    glow.lookAt(0, 0, 0);
    // Move slightly outward to avoid z-fighting
    glow.position.multiplyScalar(1.001);
    deathStarGroup.add(glow);

    // Add surface details - more prominent and varied
    for (let i = 0; i < 200; i++) {
        // Vary detail sizes and shapes
        const size = Math.random() * 2 + 0.5;
        let detailGeometry;
        
        // Mix different geometric shapes for details
        const shapeType = Math.floor(Math.random() * 3);
        if (shapeType === 0) {
            detailGeometry = new THREE.BoxGeometry(size, size, 0.5);
        } else if (shapeType === 1) {
            detailGeometry = new THREE.CylinderGeometry(size/3, size/3, 0.5, 6);
        } else {
            detailGeometry = new THREE.BoxGeometry(size, size/2, 0.3);
        }
        
        const detailMaterial = new THREE.MeshStandardMaterial({
            color: Math.random() > 0.8 ? 0x777777 : 0x555555,
            roughness: 0.8,
            metalness: 0.6
        });
        
        const detail = new THREE.Mesh(detailGeometry, detailMaterial);
        
        // Don't put details where the weapon is
        let validPlacement = false;
        let phi, theta;
        
        while (!validPlacement) {
            phi = Math.random() * Math.PI * 2;
            theta = Math.random() * Math.PI;
            
            // Position on sphere surface
            const x = 40 * Math.sin(theta) * Math.cos(phi);
            const y = 40 * Math.sin(theta) * Math.sin(phi);
            const z = 40 * Math.cos(theta);
            
            // Distance to weapon position
            const weaponDistSquared = 
                Math.pow(x - normalizedPos.x, 2) +
                Math.pow(y - normalizedPos.y, 2) +
                Math.pow(z - normalizedPos.z, 2);
                
            // Increase the minimum distance to ensure no details inside weapon
            if (weaponDistSquared > 300) {
                validPlacement = true;
                detail.position.set(x, y, z);
            }
        }
        
        // Orient to face outward
        detail.lookAt(0, 0, 0);
        deathStarGroup.add(detail);
    }

    // Add memex.tech text - proper positioning and orientation
    const fontLoader = new FontLoader();
    fontLoader.load('https://threejs.org/examples/fonts/helvetiker_regular.typeface.json', function(font) {
        const textGeometry = new TextGeometry('memex.tech', {
            font: font,
            size: 6,
            height: 0.5,               // Reduced from 1 to 0.5 for less thickness
            curveSegments: 12,
            bevelEnabled: true,
            bevelThickness: 0.1,       // Reduced from 0.2 to 0.1
            bevelSize: 0.05,           // Reduced from 0.1 to 0.05
            bevelOffset: 0,
            bevelSegments: 5
        });
        const textMaterial = new THREE.MeshStandardMaterial({
            color: 0xffffff,          // Already white
            roughness: 0.2,          // Reduced for more shininess
            metalness: 0.5,          // Reduced to avoid darkening
            emissive: 0xffffff,      // Pure white emissive for maximum brightness
            emissiveIntensity: 0.7   // Increased intensity for more glow
        });
        
        // Center the text
        textGeometry.computeBoundingBox();
        const textWidth = textGeometry.boundingBox.max.x - textGeometry.boundingBox.min.x;
        const textMesh = new THREE.Mesh(textGeometry, textMaterial);
        
        // Position text so it faces the camera
        textMesh.position.set(-textWidth/2, 0, -43); // Position in front of sphere on -z axis
        textMesh.rotation.y = Math.PI; // Rotate to face the camera
        
        deathStarGroup.add(textMesh);
    });

    // Position Death Star for better visibility - center in scene
    deathStarGroup.position.set(-80, 60, -160);
    // Set a fixed 180-degree rotation around y-axis (Math.PI)
    deathStarGroup.rotation.y = Math.PI; // Rotated 180 degrees
    
    return deathStarGroup;
};

// Add enhanced stars
const createEnhancedStars = () => {
    const starsGroup = new THREE.Group();
    
    // Multiple layers of stars with much greater distances
    const createStarLayer = (count, size, depth) => {
        const geometry = new THREE.BufferGeometry();
        const vertices = [];
        
        for (let i = 0; i < count; i++) {
            // Increase spread to create a more expansive starfield
            const x = (Math.random() - 0.5) * 2000;
            const y = (Math.random() - 0.5) * 2000;
            const z = (Math.random() - 0.5) * 2000 + depth;
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
    
    // Create much more distant star layers
    starsGroup.add(createStarLayer(3000, 0.3, -3000));  // Far background stars
    starsGroup.add(createStarLayer(3000, 0.2, -2000));  // Mid-distance stars
    starsGroup.add(createStarLayer(3000, 0.1, -1000));  // Closer stars
    
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

// Update comet path for circular motion
const cometPath = {
    radius: 300,         // Large radius for the circular path
    height: 70,          // Height above the ground
    centerX: 0,          // Center of the circular path (X)
    centerZ: -100,       // Center of the circular path (Z)
    speed: 0.0005        // Speed of rotation (slower for a more majestic flight)
};

// Create a laser beam for the Death Star - change to dramatic red
let isLaserFiring = false;
let laserInitialized = false;  // Add this flag to track initialization

const createLaserBeam = () => {
    // Create a group to hold and orient the laser components
    const laserGroup = new THREE.Group();
    
    // Create laser geometry - a long cylinder
    // The cylinder's axis will be along the Y-axis by default
    const laserGeometry = new THREE.CylinderGeometry(2, 2, 1000, 16, 1, false);
    
    // Center the cylinder at its origin for easier rotation
    laserGeometry.translate(0, 500, 0);
    
    const laserMaterial = new THREE.MeshBasicMaterial({
        color: 0xff0000, // Dramatic red color
        transparent: true,
        opacity: 0.7,
        side: THREE.DoubleSide
    });
    
    // Create the beam
    const beam = new THREE.Mesh(laserGeometry, laserMaterial);
    
    // Add glow effect
    const glowGeometry = new THREE.CylinderGeometry(4, 4, 1000, 16, 1, false);
    glowGeometry.translate(0, 500, 0);
    
    const glowMaterial = new THREE.MeshBasicMaterial({
        color: 0xff3333, // Slightly different red for the glow
        transparent: true,
        opacity: 0.3,
        side: THREE.DoubleSide
    });
    
    const glow = new THREE.Mesh(glowGeometry, glowMaterial);
    
    // Add beam and glow to the group
    laserGroup.add(beam);
    laserGroup.add(glow);
    
    // The rotation will be set dynamically when firing
    
    // Hide initially
    laserGroup.visible = false;
    
    // Add to scene
    scene.add(laserGroup);
    
    return laserGroup;
};

// Initialize the laser beam
const laserBeam = createLaserBeam();

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
    
    // Move comet in a circular path around the sky
    const angle = time * cometPath.speed;
    comet.position.x = cometPath.centerX + cometPath.radius * Math.cos(angle);
    comet.position.y = cometPath.height; // Fixed height above ground
    comet.position.z = cometPath.centerZ + cometPath.radius * Math.sin(angle);
    
    // Rotate comet to face direction of travel
    comet.rotation.y = Math.atan2(
        -Math.cos(angle),  // Direction X
        -Math.sin(angle)   // Direction Z
    );
    
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
            const distanceFromComet = Math.sqrt(
                Math.pow(positions[i] - comet.position.x, 2) + 
                Math.pow(positions[i+1] - comet.position.y, 2) + 
                Math.pow(positions[i+2] - comet.position.z, 2)
            );
            
            if(distanceFromComet > 10) {
                // Reset to comet's position
                positions[i] = comet.position.x;
                positions[i + 1] = comet.position.y;
                positions[i + 2] = comet.position.z;
                
                // Calculate velocity direction away from travel direction
                const tangentX = -Math.sin(angle);
                const tangentZ = Math.cos(angle);
                
                // Initialize velocity relative to comet's movement direction
                velocities[i] = -Math.random() * decay * tangentX;
                velocities[i + 1] = (Math.random() - 0.5) * spread * 0.2;
                velocities[i + 2] = -Math.random() * decay * tangentZ;
            }
        }
        particles.geometry.attributes.position.needsUpdate = true;
    };

    // Update particle systems
    updateParticles(mainParticles, 0.15, 0.3, 0.2);
    updateParticles(sparkParticles, 0.2, 0.4, 0.3);
    updateParticles(glowParticles, 0.1, 0.2, 0.15);
    
    // Laser firing logic - every 15 seconds, fire for 3 seconds
    const laserCycleTime = 10000; // 15 seconds in milliseconds
    const laserDuration = 4000;   // 3 seconds in milliseconds
    
    // Use modulo of current time to determine firing state
    const currentTime = Date.now();
    
    // Add a delay before first firing to ensure everything is initialized
    if (!laserInitialized && time > 100) {  // Small delay to ensure Death Star is positioned
        laserInitialized = true;
    }
    
    const cyclePosition = currentTime % laserCycleTime;
    
    // Get the weapon position from the Death Star userData
    const weaponPos = deathStar.userData.weaponPosition;
    
    // Check if we should be firing, if the weapon position is available, and if initialization is complete
    if (cyclePosition < laserDuration && weaponPos && laserInitialized) {
        // We're in the firing period
        if (!isLaserFiring) {
            // Laser just started firing
            isLaserFiring = true;
            laserBeam.visible = true;
            
            // Get the weapon's GLOBAL position by properly accounting for Death Star's position and rotation
            const deathStarWorldPosition = new THREE.Vector3();
            const deathStarWorldQuaternion = new THREE.Quaternion();
            const deathStarWorldScale = new THREE.Vector3();
            
            deathStar.matrixWorld.decompose(deathStarWorldPosition, deathStarWorldQuaternion, deathStarWorldScale);
            
            // Create a vector for the weapon position in local space
            const localWeaponPos = weaponPos.clone();
            
            // Convert to world space by applying the Death Star's world transformation
            const weaponGlobalPos = localWeaponPos.clone()
                .applyQuaternion(deathStarWorldQuaternion)
                .multiply(deathStarWorldScale)
                .add(deathStarWorldPosition);
            
            // Get direction from Death Star center to weapon (in world space)
            const deathStarCenter = deathStar.position.clone();
            const weaponDirection = new THREE.Vector3().subVectors(weaponGlobalPos, deathStarCenter).normalize();
            
            // Position laser beam at weapon position
            laserBeam.position.copy(weaponGlobalPos);
            
            // Point the laser beam away from the Death Star
            const targetPoint = new THREE.Vector3()
                .copy(weaponGlobalPos)
                .add(weaponDirection.multiplyScalar(500)); // Point far away in weapon direction
                
            // Create rotation that points the beam outward from the weapon
            laserBeam.lookAt(targetPoint);
            
            // Rotate 90 degrees to align cylinder axis with beam direction
            laserBeam.rotateX(Math.PI/2);
            
            // Create bright flash at weapon
            const flashLight = new THREE.PointLight(0xff0000, 10, 100);
            flashLight.position.copy(weaponPos);
            flashLight.name = "flashLight";
            deathStar.add(flashLight);
        }
        
        // Animate the laser intensity
        const intensity = 0.7 + Math.sin(time * 0.1) * 0.3;
        laserBeam.children[0].material.opacity = intensity;
        laserBeam.children[1].material.opacity = intensity * 0.5;
    } else if (isLaserFiring) {
        // We just stopped firing
        isLaserFiring = false;
        laserBeam.visible = false;
        
        // Remove the flash light
        const flashLight = deathStar.getObjectByName("flashLight");
        if (flashLight) {
            deathStar.remove(flashLight);
        }
    }
    
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
