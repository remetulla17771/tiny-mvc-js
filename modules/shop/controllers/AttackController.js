import { BaseController } from '../../../framework/BaseController.js';

export class AttackController extends BaseController {
    layout = 'main';

    async actionIndex() {
        return this.json({attack: 1})
    }
}
