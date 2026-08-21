import { BaseController } from '../framework/BaseController.js';

export class NewsController extends BaseController {
    async actionIndex() {
        return this.render('index', {
            title: 'INDEX'
        });
    }
}
