// modules/gii/Module.js
import { Module as BaseModule } from '../../framework/base/Module.js';

export class GiiModule extends BaseModule {
    constructor(id = 'gii', parent = null, config = {}) {
        super(id, parent, config);
    }
}