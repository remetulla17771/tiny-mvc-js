// assets/BootstrapAsset.js
import { AssetBundle } from '../framework/web/AssetBundle.js';

export class BootstrapAsset extends AssetBundle {
    constructor() {
        super();
        this.baseUrl = 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist';
        this.css = ['css/bootstrap.min.css'];
        this.js = ['js/bootstrap.bundle.min.js'];
    }

    static register(view) {
        // Подключаем Bootstrap CSS из CDN или локальной папки
        view.registerCssFile('https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css');

        // Подключаем Bootstrap JS
        view.registerJsFile('https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.min.js');
    }

}