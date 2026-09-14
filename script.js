import * as THREE from './three.module.min.js';

(() => {
  const sceneHost = document.getElementById('scene');
  const progressBar = document.getElementById('progress-bar');
  const stageLabel = document.getElementById('scene-stage');
  const sceneTitle = document.getElementById('scene-label');
  const journeyToggle = document.getElementById('journey-toggle');
  const journeyToggleLabel = document.getElementById('journey-toggle-label');
  const starfield = document.getElementById('starfield');
  const sections = [...document.querySelectorAll('.stage-section[data-stage]')];
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const stageNames = ['FIRST STEPS', 'EARLY MOMENTUM', 'POLYTECHNIC DIPLOMA', 'IN PROGRESS', 'FIRST STEPS INTO TECH', 'THE WORKPLACE', 'SKILLS CONSTELLATION', 'CERTIFICATIONS', 'THE JOURNEY CONTINUES'];

  if (!prefersReduced && starfield) {
    const starContext = starfield.getContext('2d');
    const stars = Array.from({ length: 44 }, (_, index) => ({ x: (index * 83) % window.innerWidth, y: (index * 137) % window.innerHeight, size: 1 + index % 2, phase: index * .7 }));
    const sparks = [];
    const pointer = { x: -100, y: -100, active: false };
    const resizeStars = () => { const ratio = Math.min(window.devicePixelRatio, 2); starfield.width = window.innerWidth * ratio; starfield.height = window.innerHeight * ratio; starContext.setTransform(ratio, 0, 0, ratio, 0, 0); };
    const drawStars = (time) => {
      starContext.clearRect(0, 0, window.innerWidth, window.innerHeight);
      stars.forEach((star) => {
        const glow = .25 + (Math.sin(time * .002 + star.phase) + 1) * .22;
        starContext.fillStyle = `rgba(150, 226, 255, ${glow})`;
        starContext.beginPath();
        starContext.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        starContext.fill();
      });
      sparks.forEach((spark, index) => {
        spark.life -= .018;
        spark.x += spark.vx;
        spark.y += spark.vy;
        spark.vy += .012;
        starContext.fillStyle = `rgba(99, 226, 142, ${Math.max(0, spark.life)})`;
        starContext.beginPath();
        starContext.arc(spark.x, spark.y, spark.size, 0, Math.PI * 2);
        starContext.fill();
        if (spark.life <= 0) sparks.splice(index, 1);
      });
      if (pointer.active) {
        starContext.strokeStyle = 'rgba(66, 199, 255, .32)';
        starContext.lineWidth = 1;
        starContext.beginPath();
        starContext.arc(pointer.x, pointer.y, 11 + Math.sin(time * .006) * 3, 0, Math.PI * 2);
        starContext.stroke();
      }
      requestAnimationFrame(drawStars);
    };
    window.addEventListener('resize', resizeStars);
    window.addEventListener('pointermove', (event) => {
      pointer.x = event.clientX;
      pointer.y = event.clientY;
      pointer.active = true;
      for (let i = 0; i < 2; i += 1) sparks.push({ x: pointer.x, y: pointer.y, vx: (Math.random() - .5) * 1.8, vy: (Math.random() - .5) * 1.8, size: 1 + Math.random() * 1.5, life: .9 });
    }, { passive: true });
    window.addEventListener('pointerleave', () => { pointer.active = false; });
    resizeStars();
    requestAnimationFrame(drawStars);
  }

  if (prefersReduced) return;
  try {
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'high-performance' });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.setSize(sceneHost.clientWidth || window.innerWidth, window.innerHeight);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    sceneHost.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(34, (sceneHost.clientWidth || window.innerWidth) / window.innerHeight, .1, 100);
    camera.position.set(5.8, 2.6, 9);
    const ambient = new THREE.HemisphereLight(0x9cc9df, 0x050a12, 1.7);
    scene.add(ambient);
    const key = new THREE.DirectionalLight(0x2e9cd0, 2.8);
    key.position.set(-4, 7, 5);
    scene.add(key);

    const blue = new THREE.MeshStandardMaterial({ color: 0x126894, roughness: .48, metalness: .05 });
    const skin = new THREE.MeshStandardMaterial({ color: 0xe0a27d, roughness: .75 });
    const dark = new THREE.MeshStandardMaterial({ color: 0x07111c, roughness: .6 });
    const white = new THREE.MeshStandardMaterial({ color: 0xdbeef6, roughness: .7 });
    const glow = new THREE.MeshBasicMaterial({ color: 0x42c7ff, transparent: true, opacity: .85 });
    const world = new THREE.Group();
    scene.add(world);
    const makeLabel = (text, color = '#42c7ff', width = 2.5) => {
      const canvas = document.createElement('canvas');
      canvas.width = 640;
      canvas.height = 96;
      const context = canvas.getContext('2d');
      context.font = '600 28px Arial';
      context.fillStyle = color;
      context.textAlign = 'center';
      context.fillText(text, canvas.width / 2, 58);
      const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(canvas), transparent: true, depthWrite: false }));
      sprite.scale.set(width, width * .15, 1);
      return sprite;
    };
    const makeComputer = (x, y, z, label) => {
      const computer = new THREE.Group();
      const monitor = new THREE.Mesh(new THREE.BoxGeometry(.78, .5, .08), dark);
      const screen = new THREE.Mesh(new THREE.PlaneGeometry(.63, .34), glow);
      screen.position.z = .06;
      monitor.add(screen);
      computer.add(monitor);
      const stand = new THREE.Mesh(new THREE.BoxGeometry(.08, .28, .08), dark);
      stand.position.y = -.36;
      computer.add(stand);
      const base = new THREE.Mesh(new THREE.BoxGeometry(.42, .04, .22), dark);
      base.position.y = -.51;
      computer.add(base);
      const code = makeLabel(label, '#91e5ff', 1.15);
      code.position.set(0, .03, .11);
      computer.add(code);
      computer.position.set(x, y, z);
      return computer;
    };

    const floor = new THREE.Mesh(new THREE.PlaneGeometry(40, 40), new THREE.MeshBasicMaterial({ color: 0x050b12 }));
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -.72;
    world.add(floor);
    const path = new THREE.Mesh(new THREE.PlaneGeometry(.16, 34), new THREE.MeshBasicMaterial({ color: 0x42c7ff, transparent: true, opacity: .55 }));
    path.rotation.x = -Math.PI / 2;
    path.position.set(0, -.69, -7);
    world.add(path);
    const rail = new THREE.Mesh(new THREE.TorusGeometry(2.9, .012, 8, 80, Math.PI * 1.1), new THREE.MeshBasicMaterial({ color: 0x42c7ff, transparent: true, opacity: .32 }));
    rail.rotation.x = Math.PI / 2;
    rail.position.set(0, -.55, -3);
    world.add(rail);

    const education = new THREE.Group();
    for (let row = 0; row < 2; row += 1) {
      const shelf = new THREE.Mesh(new THREE.BoxGeometry(2.4, .1, .34), blue);
      shelf.position.set(-1.8, .35 + row * .85, -.9);
      education.add(shelf);
      for (let book = 0; book < 6; book += 1) {
        const bookMesh = new THREE.Mesh(new THREE.BoxGeometry(.16, .46, .22), new THREE.MeshStandardMaterial({ color: book % 2 ? 0x164a67 : 0x1c88af, roughness: .7 }));
        bookMesh.position.set(-2.75 + book * .36, .63 + row * .85, -.9);
        education.add(bookMesh);
      }
    }
    const readingTable = new THREE.Mesh(new THREE.BoxGeometry(1.7, .1, .75), dark);
    readingTable.position.set(.15, .1, -.7);
    education.add(readingTable);
    const openBook = new THREE.Mesh(new THREE.BoxGeometry(.85, .04, .55), white);
    openBook.position.set(.15, .2, -.7);
    openBook.rotation.y = -.18;
    education.add(openBook);
    const libraryLabel = makeLabel('BOOKS / LEARNING', '#91e5ff', 2.3);
    libraryLabel.position.set(-.8, 1.8, -.8);
    education.add(libraryLabel);
    world.add(education);

    const coding = new THREE.Group();
    coding.add(makeComputer(-2.1, .65, -.8, 'ANDROID'));
    coding.add(makeComputer(-.9, .85, -.7, 'PYTHON'));
    coding.add(makeComputer(.3, .65, -.8, '</>'));
    const desk = new THREE.Mesh(new THREE.BoxGeometry(3.9, .1, .9), dark);
    desk.position.set(-.9, .05, -.8);
    coding.add(desk);
    const codingLabel = makeLabel('CODE / PRACTICE', '#91e5ff', 2.3);
    codingLabel.position.set(-.9, 1.85, -.8);
    coding.add(codingLabel);
    world.add(coding);

    const character = new THREE.Group();
    character.position.set(2.9, 0, 1.7);
    world.add(character);
    character.visible = false;
    const body = new THREE.Mesh(new THREE.CapsuleGeometry(.46, .82, 5, 10), blue);
    body.position.y = -.02;
    character.add(body);
    const neck = new THREE.Mesh(new THREE.CylinderGeometry(.13, .15, .22, 8), skin);
    neck.position.y = .72;
    character.add(neck);
    const head = new THREE.Mesh(new THREE.SphereGeometry(.45, 16, 10), skin);
    head.position.y = 1.15;
    character.add(head);
    const hair = new THREE.Mesh(new THREE.SphereGeometry(.47, 12, 8, 0, Math.PI * 2, 0, Math.PI * .52), dark);
    hair.position.y = 1.28;
    character.add(hair);
    const eyeGeo = new THREE.SphereGeometry(.035, 8, 8);
    [-.15, .15].forEach((x) => { const eye = new THREE.Mesh(eyeGeo, dark); eye.position.set(x, 1.2, .4); character.add(eye); });
    const mouth = new THREE.Mesh(new THREE.TorusGeometry(.08, .012, 6, 14, Math.PI), dark);
    mouth.position.set(0, 1.01, .43);
    mouth.rotation.x = Math.PI / 2;
    character.add(mouth);
    const limbGeo = new THREE.CapsuleGeometry(.095, .58, 4, 8);
    const legL = new THREE.Mesh(limbGeo, dark); legL.position.set(-.18, -.73, 0); character.add(legL);
    const legR = new THREE.Mesh(limbGeo, dark); legR.position.set(.18, -.73, 0); character.add(legR);
    const shoeGeo = new THREE.SphereGeometry(.15, 10, 6);
    const shoeL = new THREE.Mesh(shoeGeo, dark); shoeL.scale.set(1.15, .55, 1.5); shoeL.position.set(-.2, -1.1, .09); character.add(shoeL);
    const shoeR = new THREE.Mesh(shoeGeo, dark); shoeR.scale.set(1.15, .55, 1.5); shoeR.position.set(.2, -1.1, .09); character.add(shoeR);
    const armL = new THREE.Mesh(limbGeo, skin); armL.position.set(-.56, .13, 0); armL.rotation.z = -.15; character.add(armL);
    const armR = new THREE.Mesh(limbGeo, skin); armR.position.set(.56, .13, 0); armR.rotation.z = .15; character.add(armR);
    const handGeo = new THREE.SphereGeometry(.12, 10, 6);
    const handL = new THREE.Mesh(handGeo, skin); handL.position.set(-.61, -.23, 0); character.add(handL);
    const handR = new THREE.Mesh(handGeo, skin); handR.position.set(.61, -.23, 0); character.add(handR);
    const shadow = new THREE.Mesh(new THREE.CircleGeometry(1.15, 32), new THREE.MeshBasicMaterial({ color: 0x42c7ff, transparent: true, opacity: .14 }));
    shadow.rotation.x = -Math.PI / 2;
    shadow.position.set(2.9, -.7, 1.7);
    world.add(shadow);

    const portrait = new THREE.Group();
    const portraitTexture = new THREE.TextureLoader().load('./3d.png');
    portraitTexture.colorSpace = THREE.SRGBColorSpace;
    const portraitMaterial = new THREE.MeshBasicMaterial({ map: portraitTexture, transparent: true, depthWrite: false, side: THREE.DoubleSide });
    const portraitPlane = new THREE.Mesh(new THREE.PlaneGeometry(3.5, 3.35), portraitMaterial);
    portrait.add(portraitPlane);
    portrait.position.set(2.9, .2, 1.7);
    world.add(portrait);

    const diploma = new THREE.Group();
    const diplomaPaper = new THREE.Mesh(new THREE.BoxGeometry(.85, .58, .08), white);
    diploma.add(diplomaPaper);
    const seal = new THREE.Mesh(new THREE.CylinderGeometry(.12, .12, .04, 16), glow);
    seal.rotation.x = Math.PI / 2; seal.position.z = .07; diploma.add(seal);
    diploma.position.set(1.2, 1.6, -.4);
    world.add(diploma);

    const cap = new THREE.Group();
    const capTop = new THREE.Mesh(new THREE.BoxGeometry(.8, .08, .8), dark); capTop.rotation.y = .2; cap.add(capTop);
    const capBase = new THREE.Mesh(new THREE.CylinderGeometry(.18, .28, .2, 4), dark); capBase.position.y = -.14; cap.add(capBase);
    cap.position.set(-1.2, 2.1, -.5); world.add(cap);

    const rack = new THREE.Group();
    const rackBody = new THREE.Mesh(new THREE.BoxGeometry(1.2, 2.6, .65), dark); rack.add(rackBody);
    for (let i = 0; i < 5; i += 1) { const light = new THREE.Mesh(new THREE.BoxGeometry(.08, .035, .03), glow); light.position.set(-.3 + (i % 3) * .27, .8 - Math.floor(i / 3) * .55, .35); rack.add(light); }
    rack.position.set(-1.9, .65, -.7); world.add(rack);
    const cable = new THREE.Mesh(new THREE.TorusGeometry(1.1, .025, 8, 40, Math.PI), glow); cable.rotation.z = Math.PI / 2; cable.position.set(-.8, 1, -.5); world.add(cable);

    const network = new THREE.Group();
    const makeRack = (x, z) => {
      const rackUnit = new THREE.Group();
      const cabinet = new THREE.Mesh(new THREE.BoxGeometry(.78, 2.2, .48), dark);
      rackUnit.add(cabinet);
      for (let row = 0; row < 5; row += 1) {
        const server = new THREE.Mesh(new THREE.BoxGeometry(.58, .12, .04), blue);
        server.position.set(0, .72 - row * .32, .27);
        rackUnit.add(server);
        const led = new THREE.Mesh(new THREE.SphereGeometry(.025, 8, 8), glow);
        led.position.set(.23, .72 - row * .32, .31);
        rackUnit.add(led);
      }
      rackUnit.position.set(x, .4, z);
      return rackUnit;
    };
    network.add(makeRack(-2.1, -.8));
    network.add(makeRack(-1.15, -.75));
    const router = new THREE.Mesh(new THREE.BoxGeometry(.85, .18, .45), blue);
    router.position.set(.25, .35, -.75);
    network.add(router);
    for (let port = 0; port < 5; port += 1) {
      const light = new THREE.Mesh(new THREE.SphereGeometry(.035, 8, 8), glow);
      light.position.set(-.28 + port * .14, .35, -.5);
      network.add(light);
    }
    const firewall = new THREE.Mesh(new THREE.BoxGeometry(.7, .85, .18), new THREE.MeshStandardMaterial({ color: 0x183d57, roughness: .4, metalness: .3 }));
    firewall.position.set(1.35, .7, -.8);
    network.add(firewall);
    const firewallMark = makeLabel('FIREWALL', '#91e5ff', 1.45);
    firewallMark.position.set(1.35, .72, -.66);
    network.add(firewallMark);
    const networkLabel = makeLabel('SERVERS / ROUTERS / FIREWALL', '#91e5ff', 3.6);
    networkLabel.position.set(-.35, 2.05, -.8);
    network.add(networkLabel);
    world.add(network);

    const orbs = new THREE.Group();
    for (let i = 0; i < 14; i += 1) {
      const orb = new THREE.Mesh(new THREE.SphereGeometry(.09 + (i % 3) * .025, 10, 10), glow);
      const angle = (i / 14) * Math.PI * 2;
      orb.position.set(Math.cos(angle) * (1.7 + (i % 2) * .4), .8 + Math.sin(angle * 2) * 1.05, Math.sin(angle) * 1.2);
      orbs.add(orb);
    }
    world.add(orbs);
    const applicationNames = ['LAN', 'WINDOWS', 'LINUX', 'VMWARE', 'QEMU', 'VNC', 'ANYDESK', 'TEAMVIEWER', 'MS OFFICE', 'LIBREOFFICE', 'CLI', 'HACKING TERM.', 'MOTHERBOARD'];
    const applicationOrbit = new THREE.Group();
    applicationNames.forEach((name, index) => {
      const angle = (index / applicationNames.length) * Math.PI * 2;
      const node = new THREE.Mesh(new THREE.SphereGeometry(.11, 12, 12), glow);
      node.position.set(Math.cos(angle) * 2.15, .7 + Math.sin(angle * 2) * 1.1, Math.sin(angle) * 1.15);
      applicationOrbit.add(node);
      const label = makeLabel(name, '#b9f0ff', 1.15);
      label.position.copy(node.position);
      label.position.y += .2;
      applicationOrbit.add(label);
    });
    const coreLabel = makeLabel('VIDIT / IT SUPPORT', '#ffffff', 2.3);
    coreLabel.position.set(0, .95, .15);
    applicationOrbit.add(coreLabel);
    const motherboard = new THREE.Group();
    const board = new THREE.Mesh(new THREE.BoxGeometry(.95, .06, .7), new THREE.MeshStandardMaterial({ color: 0x124f55, roughness: .55, metalness: .2 }));
    board.position.set(-.25, .45, .15);
    motherboard.add(board);
    for (let chip = 0; chip < 5; chip += 1) {
      const component = new THREE.Mesh(new THREE.BoxGeometry(.12, .06, .12), glow);
      component.position.set(-.55 + (chip % 3) * .3, .51, .02 + Math.floor(chip / 3) * .22);
      motherboard.add(component);
    }
    const boardLabel = makeLabel('HARDWARE', '#b9f0ff', 1.3);
    boardLabel.position.set(-.25, .8, .15);
    motherboard.add(boardLabel);
    applicationOrbit.add(motherboard);
    world.add(applicationOrbit);
    const shelf = new THREE.Group();
    const shelfBase = new THREE.Mesh(new THREE.BoxGeometry(3.2, .12, .45), blue); shelf.add(shelfBase);
    for (let i = 0; i < 5; i += 1) { const badge = new THREE.Mesh(new THREE.CylinderGeometry(.22, .22, .08, 8), glow); badge.rotation.x = Math.PI / 2; badge.position.set(-1.2 + i * .6, .35, 0); shelf.add(badge); }
    shelf.position.set(0, .2, -.8); world.add(shelf);

    // The background stays intentionally quiet so the resume copy remains primary.
    [floor, path, rail, education, coding, diploma, cap, rack, cable, network, orbs, applicationOrbit, shelf, shadow].forEach((object) => { object.visible = false; });
    const backdrop = new THREE.Group();
    const backdropMaterial = new THREE.LineBasicMaterial({ color: 0x16435b, transparent: true, opacity: .45 });
    for (let x = -3; x <= 3; x += 1) {
      const line = new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(x, -2.8, -3), new THREE.Vector3(x, 3.4, -3)]), backdropMaterial);
      backdrop.add(line);
    }
    for (let y = -2; y <= 3; y += 1) {
      const line = new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(-3.8, y, -3), new THREE.Vector3(3.8, y, -3)]), backdropMaterial);
      backdrop.add(line);
    }
    const nodes = [];
    for (let i = 0; i < 18; i += 1) {
      const node = new THREE.Mesh(new THREE.SphereGeometry(i % 4 === 0 ? .075 : .045, 10, 10), glow);
      node.position.set(-3.1 + (i % 6) * 1.25, -1.9 + Math.floor(i / 6) * 1.55, -2.7 - (i % 3) * .1);
      node.userData.baseY = node.position.y;
      backdrop.add(node);
      nodes.push(node);
    }
    const connectionMaterial = new THREE.LineBasicMaterial({ color: 0x2a7898, transparent: true, opacity: .48 });
    for (let i = 0; i < nodes.length - 1; i += 1) {
      const connection = new THREE.Line(new THREE.BufferGeometry().setFromPoints([nodes[i].position, nodes[i + 1].position]), connectionMaterial);
      backdrop.add(connection);
    }
    const route = new THREE.Line(new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(-3.3, -2.2, -2.45),
      new THREE.Vector3(-1.5, -1.25, -2.45),
      new THREE.Vector3(.2, -.25, -2.45),
      new THREE.Vector3(1.6, .85, -2.45),
      new THREE.Vector3(3.2, 1.6, -2.45)
    ]), new THREE.LineBasicMaterial({ color: 0x42c7ff, transparent: true, opacity: .7 }));
    backdrop.add(route);
    const backdropRing = new THREE.Mesh(new THREE.RingGeometry(1.35, 1.37, 64), new THREE.MeshBasicMaterial({ color: 0x42c7ff, transparent: true, opacity: .26, side: THREE.DoubleSide }));
    backdropRing.position.set(1.1, .45, -2.4);
    backdrop.add(backdropRing);
    world.add(backdrop);

    portrait.visible = false;
    character.visible = false;
    const modelGroups = {};
    const earthBlue = new THREE.MeshStandardMaterial({ color: 0x126894, roughness: .7, metalness: .15 });
    const earthGreen = new THREE.MeshStandardMaterial({ color: 0x2f9b68, roughness: .8, metalness: .05 });
    const fiberGreen = new THREE.MeshBasicMaterial({ color: 0x63e28e, transparent: true, opacity: .9 });
    const silver = new THREE.MeshStandardMaterial({ color: 0xa7cad6, roughness: .3, metalness: .75 });
    const screenMaterial = new THREE.MeshBasicMaterial({ color: 0x42c7ff, transparent: true, opacity: .86 });
    const createEarth = (style) => {
      const group = new THREE.Group();
      const sphere = new THREE.Mesh(new THREE.SphereGeometry(1.15, style === 'wireframe' ? 20 : 32, style === 'wireframe' ? 12 : 20), earthBlue);
      group.add(sphere);
      const landPositions = [[-.55, .55, .75], [.58, .35, .78], [-.7, -.35, .67], [.35, -.65, .78], [.8, -.05, .48]];
      landPositions.forEach(([x, y, z]) => {
        const land = new THREE.Mesh(new THREE.SphereGeometry(.35, 8, 5), earthGreen);
        land.scale.set(1.4, .22, .8);
        land.position.set(x, y, z).normalize().multiplyScalar(1.08);
        land.lookAt(0, 0, 0);
        group.add(land);
      });
      if (style === 'wireframe') {
        const wire = new THREE.Mesh(new THREE.SphereGeometry(1.18, 16, 10), new THREE.MeshBasicMaterial({ color: 0x42c7ff, wireframe: true, transparent: true, opacity: .42 }));
        group.add(wire);
      }
      const fiberCurve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(-1.55, -.4, .1), new THREE.Vector3(-.7, 1.35, .3), new THREE.Vector3(.55, .95, -.2), new THREE.Vector3(1.55, -.25, .2), new THREE.Vector3(.2, -1.38, -.3), new THREE.Vector3(-1.55, -.4, .1)
      ]);
      group.add(new THREE.Mesh(new THREE.TubeGeometry(fiberCurve, 80, .025, 8, false), fiberGreen));
      if (style !== 'core') {
        const ring = new THREE.Mesh(new THREE.TorusGeometry(1.48, .018, 8, 80), fiberGreen);
        ring.rotation.x = style === 'wireframe' ? .6 : .35;
        group.add(ring);
      }
      return group;
    };
    const createLaptop = () => {
      const laptop = new THREE.Group();
      const base = new THREE.Mesh(new THREE.BoxGeometry(.7, .06, .48), silver);
      laptop.add(base);
      const screen = new THREE.Mesh(new THREE.BoxGeometry(.55, .42, .04), silver);
      screen.position.set(0, .25, -.2); screen.rotation.x = -.16; laptop.add(screen);
      const display = new THREE.Mesh(new THREE.PlaneGeometry(.43, .3), screenMaterial);
      display.position.set(0, .25, -.17); display.rotation.x = -.16; laptop.add(display);
      return laptop;
    };
    const createServer = () => {
      const server = new THREE.Group();
      const bodyMesh = new THREE.Mesh(new THREE.BoxGeometry(.45, .7, .34), dark); server.add(bodyMesh);
      for (let i = 0; i < 4; i += 1) {
        const led = new THREE.Mesh(new THREE.BoxGeometry(.07, .025, .02), fiberGreen); led.position.set(-.12 + (i % 2) * .16, .23 - Math.floor(i / 2) * .18, .19); server.add(led);
      }
      return server;
    };
    const createRam = () => {
      const ram = new THREE.Group();
      const stick = new THREE.Mesh(new THREE.BoxGeometry(.12, .65, .035), new THREE.MeshStandardMaterial({ color: 0x2aa06b, metalness: .3, roughness: .45 })); ram.add(stick);
      for (let i = 0; i < 4; i += 1) { const chip = new THREE.Mesh(new THREE.BoxGeometry(.07, .09, .04), dark); chip.position.set(0, -.22 + i * .14, .03); ram.add(chip); }
      return ram;
    };
    const createSsd = () => {
      const ssd = new THREE.Mesh(new THREE.BoxGeometry(.5, .16, .08), silver);
      const light = new THREE.Mesh(new THREE.BoxGeometry(.28, .025, .02), fiberGreen); light.position.z = .05; ssd.add(light);
      return ssd;
    };
    const createBook = () => {
      const book = new THREE.Group();
      const cover = new THREE.Mesh(new THREE.BoxGeometry(.45, .08, .6), new THREE.MeshStandardMaterial({ color: 0x42c7ff, roughness: .6 })); book.add(cover);
      const pages = new THREE.Mesh(new THREE.BoxGeometry(.38, .04, .52), white); pages.position.y = .06; book.add(pages);
      return book;
    };
    const addOrbitingEquipment = (group, tight = false) => {
      const equipment = [createBook(), createLaptop(), createServer(), createRam(), createSsd()];
      equipment.forEach((item, index) => {
        const angle = index * 1.25;
        item.position.set(Math.cos(angle) * (tight ? 1.75 : 2.05), Math.sin(angle * 1.4) * .72, Math.sin(angle) * 1.05);
        item.rotation.set(angle * .2, angle, angle * .14);
        group.add(item);
      });
    };
    ['orbital', 'wireframe', 'core'].forEach((style) => {
      const group = new THREE.Group();
      group.add(createEarth(style));
      addOrbitingEquipment(group, style === 'core');
      if (style === 'core') {
        const core = new THREE.Mesh(new THREE.SphereGeometry(.33, 16, 16), fiberGreen);
        group.add(core);
      }
      group.position.set(0, .1, -1.1);
      modelGroups[style] = group;
      world.add(group);
    });
    let selectedModel = 'wireframe';
    Object.entries(modelGroups).forEach(([name, group]) => { group.visible = name === selectedModel; });

    const sizes = [0.68, .82, .98, 1.08, 1.15, 1.2, 1.2, 1.2, 1.2];
    function lerp(a, b, t) { return a + (b - a) * t; }
    function update(scrollProgress) {
      const scaled = scrollProgress * (sections.length - 1);
      const index = Math.min(Math.round(scaled), sections.length - 1);
      const local = scaled - index;
      const next = Math.min(index + 1, sections.length - 1);
      const growth = lerp(sizes[index], sizes[next], local);
      character.scale.setScalar(growth);
      character.rotation.y = Math.sin(scrollProgress * Math.PI * 5) * .09;
      character.position.z = lerp(1.7, -1.3, scrollProgress);
      character.position.x = lerp(2.9, 1.45, scrollProgress);
      character.position.y = Math.sin(scrollProgress * Math.PI * 9) * .08;
      portrait.scale.setScalar(growth);
      portrait.position.z = character.position.z;
      portrait.position.x = character.position.x;
      portrait.position.y = .12 + Math.sin(scrollProgress * Math.PI * 9) * .04;
      portrait.rotation.y = Math.sin(scrollProgress * Math.PI * 5) * .04;
      shadow.position.x = character.position.x;
      shadow.position.z = character.position.z;
      camera.position.x = lerp(5.8, 3.8, scrollProgress) + Math.sin(scrollProgress * 4) * .4;
      camera.position.y = lerp(2.6, 3.4, scrollProgress);
      camera.lookAt(0, .65, lerp(0, -2, scrollProgress));
      backdrop.position.y = Math.sin(scrollProgress * Math.PI * 2) * .08;
      backdrop.rotation.z = Math.sin(scrollProgress * Math.PI) * .018;
      world.rotation.y = Math.sin(scrollProgress * Math.PI) * .08;
      stageLabel.textContent = String(index + 1).padStart(2, '0');
      sceneTitle.textContent = stageNames[index];
      progressBar.style.height = `${Math.max(4, scrollProgress * 100)}px`;
    }
    function render() {
      const now = performance.now();
      backdropRing.rotation.z = now * .00015;
      nodes.forEach((node, index) => { node.position.y = node.userData.baseY + Math.sin(now * .0015 + index) * .035; });
      Object.values(modelGroups).forEach((group, index) => {
        if (group.visible) {
          group.rotation.y += .0028 + index * .0004;
          group.rotation.x = Math.sin(now * .0005) * .04;
        }
      });
      renderer.render(scene, camera);
      requestAnimationFrame(render);
    }
    function onScroll() {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      update(max ? window.scrollY / max : 0);
    }
    let autoPlaying = true;
    let autoIndex = 0;
    let autoTimer;
    function setAutoButton() {
      const icon = journeyToggle.querySelector('span:first-child');
      icon.textContent = autoPlaying ? 'Ⅱ' : '▶';
      journeyToggleLabel.textContent = autoPlaying ? 'Pause journey' : 'Play journey';
      journeyToggle.setAttribute('aria-label', `${autoPlaying ? 'Pause' : 'Play'} automatic journey`);
      journeyToggle.title = `${autoPlaying ? 'Pause' : 'Play'} automatic journey`;
    }
    function scheduleNextStage() {
      clearTimeout(autoTimer);
      if (!autoPlaying || autoIndex >= sections.length - 1) return;
      autoTimer = setTimeout(() => {
        autoIndex += 1;
        sections[autoIndex].scrollIntoView({ behavior: 'smooth', block: 'start' });
        scheduleNextStage();
      }, 3200);
    }
    function pauseForUser() {
      if (!autoPlaying) return;
      autoPlaying = false;
      clearTimeout(autoTimer);
      setAutoButton();
    }
    journeyToggle.addEventListener('click', () => {
      autoPlaying = !autoPlaying;
      if (autoPlaying) {
        if (autoIndex >= sections.length - 1) { autoIndex = 0; window.scrollTo({ top: 0, behavior: 'smooth' }); }
        scheduleNextStage();
      } else clearTimeout(autoTimer);
      setAutoButton();
    });
    document.querySelectorAll('.model-option').forEach((button) => {
      button.addEventListener('click', () => {
        selectedModel = button.dataset.model;
        Object.entries(modelGroups).forEach(([name, group]) => { group.visible = name === selectedModel; });
        document.querySelectorAll('.model-option').forEach((option) => option.classList.toggle('active', option === button));
      });
    });
    window.addEventListener('wheel', pauseForUser, { passive: true });
    window.addEventListener('touchstart', pauseForUser, { passive: true });
    window.addEventListener('keydown', (event) => { if (['ArrowDown', 'ArrowUp', 'PageDown', 'PageUp', ' '].includes(event.key)) pauseForUser(); });
    setAutoButton();
    scheduleNextStage();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', () => { const width = sceneHost.clientWidth || window.innerWidth; camera.aspect = width / window.innerHeight; camera.updateProjectionMatrix(); renderer.setSize(width, window.innerHeight); });
    onScroll(); render();
  } catch (error) {
    document.documentElement.classList.add('no-webgl');
    console.warn('3D scene unavailable; using accessible timeline.', error);
  }
})();
