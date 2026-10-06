import { Module as BaseModule } from '../../framework/base/Module.js';

export class ShopsModuleModule extends BaseModule {
    constructor(id = 'shops', parent = null, config = {}) {
        super(id, parent, config);
    }

    async beforeAction(controller, action) {
        return true;
    }
}
