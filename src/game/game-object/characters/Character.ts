
import { Mesh, Group, CylinderGeometry, MeshPhongMaterial, Object3D, Box3, Sphere, Vector3, BoxHelper, CylinderBufferGeometry, BufferGeometry, MeshPhysicalMaterial, DoubleSide, Texture, Color } from "three";
import { MathUtils } from "../../../utils/Math.utils";
import { SelectableGameObject } from "../selectable/Selectable.decorator";
import { BoundingBoxSelection } from "../selectable/impl/BoundingBoxSelection.model";
import { GameObject } from "../GameObject.model";
import { BufferGeometryUtils } from 'three/examples/jsm/utils/BufferGeometryUtils';
import { ObjectsRenderingOrder } from "../../GameConstants.utils";
import { getObject3DMeshes, getNestedMesh } from "../../../utils/Common.utils";


const CHARACTER_SCALE = 200;

@SelectableGameObject(BoundingBoxSelection)
export class Character extends GameObject {
    characterObject: Object3D;

    get boundingSphere() {
        const { min, max } = this.boundingBox;
        const center = new Vector3().addVectors(min, max).multiplyScalar(0.5);
        return new Sphere(center, min.distanceTo(max));
    }

    setReceiveShadowState() {
        //tmeporary ignoring
    }
    
    setMapTexture(texture: Texture) {
        
    }

    factoryMesh(): Object3D {
        const charMesh = getNestedMesh(this.characterObject);
        const charMeshGeo = charMesh.geometry as BufferGeometry;
        charMeshGeo.rotateX(MathUtils.toRad(90));
        charMeshGeo.rotateY(MathUtils.toRad(45));
        charMeshGeo.scale(CHARACTER_SCALE, CHARACTER_SCALE, CHARACTER_SCALE);
        charMeshGeo.translate(0, -10 , 0)
        const baseGeom = new CylinderBufferGeometry(55, 55, 10, 32);
        const totalGeo = BufferGeometryUtils.mergeBufferGeometries([charMeshGeo, baseGeom])
        const material = new MeshPhysicalMaterial({
            clearcoat: 1.0,
            clearcoatRoughness: 0.1,
            metalness: 0.5,
            roughness: 0.5,
            color: 0xffffff,
            skinning: true
        });
        charMesh.material = material;
        charMesh.geometry = totalGeo;
        totalGeo.rotateX(MathUtils.toRad(-90));
        const group = new Group();
        group.renderOrder = ObjectsRenderingOrder.CharacterOrder;
        charMesh.castShadow = true;
        charMesh.renderOrder = ObjectsRenderingOrder.CharacterOrder;
        group.add(charMesh);
        return group;
    }

}