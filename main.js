import * as THREE from 'three';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';
import { FontLoader } from 'three/addons/loaders/FontLoader.js';

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

// Add stars
const starsGeometry = new THREE.BufferGeometry();
const starsMaterial = new THREE.PointsMaterial({
    color: 0xFFFFFF,
    size: 0.1
});

const starsVertices = [];
for (let i = 0; i < 5000; i++) {
    const x = (Math.random() - 0.5) * 200;
    const y = Math.random() * 100; // Only above the ground
    const z = (Math.random() - 0.5) * 200;
    starsVertices.push(x, y, z);
}

starsGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starsVertices, 3));
const stars = new THREE.Points(starsGeometry, starsMaterial);
scene.add(stars);

// Create comet
const cometGeometry = new THREE.SphereGeometry(0.5, 32, 32);
const cometTexture = new THREE.TextureLoader().load('https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/planets/moon_1024.jpg');
const cometMaterial = new THREE.MeshStandardMaterial({ 
    map: cometTexture,
    roughness: 0.9,
    metalness: 0.1,
    color: 0x444444
});
const comet = new THREE.Mesh(cometGeometry, cometMaterial);
comet.castShadow = true;

// Create comet tail
const tailGeometry = new THREE.ConeGeometry(0.3, 3, 32);
const tailMaterial = new THREE.MeshPhongMaterial({
    color: 0xff4400,  // Orange-red base color
    emissive: 0xff8844,  // Lighter orange for glow
    emissiveIntensity: 0.5,
    transparent: true,
    opacity: 0.6
});
const tail = new THREE.Mesh(tailGeometry, tailMaterial);
tail.position.x = -1.5;  // Position behind the comet
tail.rotation.z = Math.PI / 2;  // Rotate to point backwards
comet.add(tail);

// Add particle system for comet trail
const particlesGeometry = new THREE.BufferGeometry();
const particlesCnt = 1000;
const posArray = new Float32Array(particlesCnt * 3);
for(let i = 0; i < particlesCnt * 3; i += 3) {
    posArray[i] = 0;     // x
    posArray[i + 1] = 0; // y
    posArray[i + 2] = 0; // z
}
particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
const particlesMaterial = new THREE.PointsMaterial({
    size: 0.05,
    color: 0xff6622,  // Orange particles
    transparent: true,
    opacity: 0.5,
    blending: THREE.AdditiveBlending
});
const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
scene.add(particlesMesh);

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
        size: 0.15,  // Smaller text
        height: 0.03,  // Less depth
        curveSegments: 12,
        bevelEnabled: true,
        bevelThickness: 0.01,
        bevelSize: 0.005,
        bevelOffset: 0,
        bevelSegments: 5
    });
    const textMaterial = new THREE.MeshStandardMaterial({ 
        color: 0xffffff,
        metalness: 0.3,
        roughness: 0.4
    });
    const textMesh = new THREE.Mesh(textGeometry, textMaterial);
    
    // Center and position the text on the side of the comet
    textGeometry.computeBoundingBox();
    const textWidth = textGeometry.boundingBox.max.x - textGeometry.boundingBox.min.x;
    textMesh.position.x = -textWidth / 2;
    textMesh.position.y = 0;
    textMesh.position.z = 0.5;  // Position on the side
    textMesh.rotation.y = Math.PI / 2;  // Rotate to face outward
    
    comet.add(textMesh);
});

// Position camera
camera.position.set(0, 5, 20);
camera.lookAt(0, 0, 0);

// Animation
let time = 0;
const cometPath = {
    startX: -30,
    endX: 30,
    height: 10,
    duration: 200 // frames for one complete path
};

function animate() {
    requestAnimationFrame(animate);
    
    time += 1;
    
    // Move comet in a horizontal path
    const progress = (time % cometPath.duration) / cometPath.duration;
    comet.position.x = cometPath.startX + (cometPath.endX - cometPath.startX) * progress;
    comet.position.y = cometPath.height;
    comet.position.z = Math.sin(progress * Math.PI * 2) * 2; // Small z-axis movement for interest
    
    // Update particle trail
    const positions = particlesMesh.geometry.attributes.position.array;
    // Move all particles back one position
    for(let i = positions.length - 1; i >= 3; i -= 3) {
        positions[i] = positions[i - 3];
        positions[i - 1] = positions[i - 4];
        positions[i - 2] = positions[i - 5];
    }
    // Add new particle at comet's position, slightly offset behind
    positions[0] = comet.position.x - 0.5;  // Offset behind the comet
    positions[1] = comet.position.y;
    positions[2] = comet.position.z;
    particlesMesh.geometry.attributes.position.needsUpdate = true;
    
    // Rotate stars slightly
    stars.rotation.y += 0.0001;
    
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
