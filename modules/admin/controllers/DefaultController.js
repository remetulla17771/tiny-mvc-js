// modules/admin/controllers/DefaultController.js
import { BaseController } from '../../../framework/BaseController.js';
import { Yii } from '../../../framework/Application.js';

export class DefaultController extends BaseController {

    layout = "admin"
    async actionIndex() {
        return this.render('index', {
            title: 'Панель управления'
        });
    }
}