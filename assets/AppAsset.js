// assets/AppAsset.js
import { AssetBundle } from '../framework/web/AssetBundle.js';
import {BootstrapAsset} from "./BootstrapAsset.js";

export class AppAsset extends AssetBundle {
    constructor() {
        super();
        this.baseUrl = ''; // Оставляем корень относительно public/

        this.css = [
            '/css/site.css'
        ];

        this.js = [
            '/js/main.js'
        ];

        this.depends = [
            BootstrapAsset
        ]
    }
}