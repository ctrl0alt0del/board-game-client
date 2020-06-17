import { Injectable } from "injection-js";
import { TextureLoader, Texture } from "three";
import { TextureConfig } from "./TextureConfig.interface";
import {DDSLoader} from 'three/examples/jsm/loaders/DDSLoader';
import { Material } from "cannon";

@Injectable() 
export class TexturesFactory {


    load(config: TextureConfig) {
        return this._internalLoad(config.loadUrl);
    }

    async loadGroupOf(configs: TextureConfig[], modifier?: Partial<Texture>) {
        const texts = await Promise.all(configs.map(config => this.load(config)));
        if(modifier) {
            texts.forEach(tex => Object.assign(tex, modifier));
        }
        return texts;
    }

    private _internalLoad(loadUrl: string) {
        const loader = this.getLoader(loadUrl);
        return new Promise<Texture>((resolve, reject) => {
            loader.load(loadUrl, resolve, null, reject);
        })
    }

    private getLoader(loadUrl: string) {
        if(loadUrl.endsWith('.dds')) {
            return new DDSLoader();
        }
        return new TextureLoader();
    }
}