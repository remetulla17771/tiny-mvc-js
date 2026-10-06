// framework/web/AssetBundle.js
export class AssetBundle {
    constructor() {
        this.baseUrl = '';
        this.css = [];
        this.js = [];
        this.depends = [];
    }

    // ОБЯЗАТЕЛЬНО: static
    static register(view) {
        const bundle = new this();

        if (Array.isArray(bundle.depends)) {
            for (const DependentBundle of bundle.depends) {
                DependentBundle.register(view);
            }
        }

        if (Array.isArray(bundle.css)) {
            for (const cssFile of bundle.css) {
                view.registerCssFile(bundle.baseUrl ? `${bundle.baseUrl}/${cssFile}` : cssFile);
            }
        }

        if (Array.isArray(bundle.js)) {
            for (const jsFile of bundle.js) {
                view.registerJsFile(bundle.baseUrl ? `${bundle.baseUrl}/${jsFile}` : jsFile);
            }
        }

        return bundle;
    }
}