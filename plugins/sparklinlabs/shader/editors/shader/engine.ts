import ui from "./ui";
import { data } from "./network";
import { createShaderMaterial } from "../../components/Shader";

let THREE = SupEngine.THREE;

let canvasElt = <HTMLCanvasElement>document.querySelector("canvas");
let gameInstance = new SupEngine.GameInstance(canvasElt);

let cameraActor = new SupEngine.Actor(gameInstance, "Camera");
cameraActor.setLocalPosition(new THREE.Vector3(0, 0, 10));
let cameraComponent = new SupEngine.componentClasses["Camera"](cameraActor);
let cameraControls = new SupEngine.editorComponentClasses["Camera3DControls"](cameraActor, cameraComponent);

let texture = THREE.ImageUtils.loadTexture("/plugins/sparklinlabs/shader/editors/shader/leonard.png");
texture.magFilter = THREE.NearestFilter;
texture.minFilter = THREE.NearestFilter;

let previewActor: SupEngine.Actor;
let material: THREE.ShaderMaterial;

export function setupPreview() {
  if (previewActor != null) gameInstance.destroyActor(previewActor); 
  previewActor = new SupEngine.Actor(gameInstance, "Preview");
  previewActor.setLocalPosition(new THREE.Vector3(0, 0, 0));

  let previewGeometry: THREE.BufferGeometry;
  switch (ui.previewTypeSelect.value) {
    case "Plane":
      previewGeometry = new THREE.PlaneBufferGeometry(2, 2);
      break;
    case "Box":
      previewGeometry = new THREE.BufferGeometry().fromGeometry(new THREE.BoxGeometry(2, 2, 2));
      break;
    case "Sphere":
      previewGeometry = new THREE.BufferGeometry().fromGeometry(new THREE.SphereGeometry(2, 12, 12));
      break;
  }
  material = createShaderMaterial(data.shaderAsset.pub, texture, previewGeometry);
  let spherePreviewMesh = new THREE.Mesh(previewGeometry, material);
  previewActor.threeObject.add(spherePreviewMesh);
  spherePreviewMesh.updateMatrixWorld(false);
}

let tickAnimationFrameId = requestAnimationFrame(tick);
let lastTimestamp = 0;
let accumulatedTime = 0;
let frame = 0;
function tick(timestamp=0) {
  tickAnimationFrameId = requestAnimationFrame(tick);

  accumulatedTime += timestamp - lastTimestamp;
  lastTimestamp = timestamp;
  let { updates, timeLeft } = gameInstance.tick(accumulatedTime);
  accumulatedTime = timeLeft;

  if (updates === 0) return;

  if (material != null) material.uniforms.time.value += 1 / gameInstance.framesPerSecond;
  gameInstance.draw();
}
