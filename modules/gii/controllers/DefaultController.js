// modules/gii/controllers/DefaultController.js
import { BaseController } from '../../../framework/BaseController.js';
import { ModelGenerator } from '../generators/ModelGenerator.js';
import { ControllerGenerator } from '../generators/ControllerGenerator.js';
import {ModuleGenerator} from "../generators/ModuleGenerator.js";

export class DefaultController extends BaseController {
    layout = 'main';

    // Главная страница Gii со списком генераторов
    async actionIndex() {
        return this.render('index', {
            title: 'Yii-JS Gii Code Generator'
        });
    }

    // Генерация Модели
    async actionModel() {
        let result = null;
        let error = null;

        if (this.req.method === 'POST') {
            const { tableName, className } = this.req.body;
            try {
                result = await ModelGenerator.generate({ tableName, className });
            } catch (err) {
                error = err.message;
            }
        }

        return this.render('model', {
            title: 'Model Generator',
            result,
            error
        });
    }

    // Генерация Контроллера
    async actionController() {
        let result = null;
        let error = null;

        if (this.req.method === 'POST') {
            const { controllerName, actions } = this.req.body;
            const actionsList = actions ? actions.split(',').map(a => a.trim()).filter(Boolean) : ['index'];

            try {
                result = await ControllerGenerator.generate({
                    controllerName,
                    actions: actionsList
                });
            } catch (err) {
                error = err.message;
            }
        }

        return this.render('controller', {
            title: 'Controller Generator',
            result,
            error
        });
    }

    async actionModule() {
        let result = null;
        let error = null;

        if (this.req.method === 'POST') {
            const { moduleId, moduleClass } = this.req.body;
            try {
                result = await ModuleGenerator.generate({ moduleId, moduleClass });
            } catch (err) {
                error = err.message;
            }
        }

        return this.render('module', {
            title: 'Module Generator',
            result,
            error
        });
    }
}