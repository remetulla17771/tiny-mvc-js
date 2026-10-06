import { Module as BaseModule } from '../../framework/base/Module.js';

export class ShopModule extends BaseModule {
    constructor(id = 'shop', parent = null, config = {}) {
        super(id, parent, config);
    }

    async beforeAction(controller, action) {
        return true;
    }
}
