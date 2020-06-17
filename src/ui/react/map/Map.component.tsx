import React, { useState, useEffect, useRef } from 'react';
import { MapService, MinimapData } from '../../../game/map/Map.service';
import { CameraController } from '../../../camera/CameraController';
import { Plane, Vector3 } from 'three';
import './style.less'
interface UIMapProps {
    mapService: MapService,
    cameraCtrl: CameraController
}

export const UIMap: React.FC<UIMapProps> = props => {
    const { mapService, cameraCtrl } = props;
    const [minimap, setMinimap] = useState<MinimapData>(null);
    const [cameraRectCoords, setCameraRectCoords] = useState<Vector3[]>(null);
    const imgRealSizeRef = useRef({ width: 0, height: 0 });
    useEffect(() => {
        mapService.minimapUpdate.subscribe(url => {
            setMinimap(url)
        });
        cameraCtrl.cameraMove.subscribe(() => {
            const coords = cameraCtrl.getFrustrumIntersectionWithPlane(new Plane(new Vector3(0, 0, 1), 0));
            setCameraRectCoords(coords);
        })
    }, [])
    return (
        <React.Fragment>
            <div id="minimap-wrapper">
                {minimap && (
                    <img src={minimap.src} ref={img => {
                        if (img) {
                            imgRealSizeRef.current = {
                                width: img.width,
                                height: img.height
                            }
                        }
                    }} />
                )}
            </div>
            <div id="minimap-camera-marker">
                {cameraRectCoords && minimap && (
                    <svg>
                        <polygon stroke="white" strokeWidth={3} fill="transparent" points={cameraRectCoords.reduce<number[]>((output, vector) => {
                            if (vector) {
                                const { width, height } = imgRealSizeRef.current;
                                const { x, y } = mapService.getReletiveToMap(vector);
                                return output.concat(x * width, y * height);
                            } else {
                                return output;
                            }
                        }, []).join(',')} />
                    </svg>
                )}
            </div>
        </React.Fragment>
    )
}