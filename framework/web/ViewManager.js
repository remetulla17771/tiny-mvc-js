// framework/web/ViewManager.js
import { Yii } from '../Application.js';

export class ViewManager {
    constructor() {
        this.cssFiles = new Set();
        this.jsFiles = new Set();
    }

    registerCssFile(url) {
        this.cssFiles.add(url);
    }

    registerJsFile(url) {
        this.jsFiles.add(url);
    }

    // Аналог $this->head() в Yii2
    renderHead() {
        let html = '';
        for (const url of this.cssFiles) {
            html += `<link rel="stylesheet" href="${url}">\n`;
        }
        return html;
    }

    // Аналог $this->endBody() в Yii2
    renderEndBody() {
        let html = '';
        for (const url of this.jsFiles) {
            html += `<script src="${url}"></script>\n`;
        }
        return html;
    }

    clear() {
        this.cssFiles.clear();
        this.jsFiles.clear();
    }
}