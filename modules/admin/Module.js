// modules/admin/Module.js
import { Module as BaseModule } from '../../framework/base/Module.js';

export class AdminModule extends BaseModule {
    constructor(id = 'admin', parent = null, config = {}) {
        super(id, parent, config);
    }

    // Метод для проверки прав доступа к админке (BeforeAction)
    async beforeAction(controller, action) {
        // Здесь можно легко добавить проверку ролей / прав доступа
        return true;
    }
}