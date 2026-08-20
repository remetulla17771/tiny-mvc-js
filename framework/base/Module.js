// framework/base/Module.js
export class Module {
    constructor(id, parent = null, config = {}) {
        this.id = id;
        this.module = parent;
        this.controllerNamespace = `modules/${id}/controllers`;
        this.setViewPath(`modules/${id}/views`);
    }

    setViewPath(path) {
        this._viewPath = path;
    }

    getViewPath() {
        return this._viewPath;
    }
}