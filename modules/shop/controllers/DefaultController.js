import { BaseController } from '../../../framework/BaseController.js';

export class DefaultController extends BaseController {
    layout = 'main';

    async actionIndex() {
        return this.render('index', {
            title: 'Модуль shop'
        });
    }
}
