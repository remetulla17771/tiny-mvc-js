// modules/gii/generators/CrudGenerator.js
import fs from 'fs/promises';
import path from 'path';
import { Yii } from '../../../framework/Application.js';

export class CrudGenerator {
    /**
     * Генерирует Контроллер и Представления (Views) для модели
     * @param {Object} config
     * @param {string} config.modelClass Имя класса модели (напр. 'Product')
     * @param {string} config.controllerClass Имя контроллера (напр. 'ProductController')
     * @param {string} [config.moduleId] Имя модуля (напр. 'admin')
     * @param {Array<string>} [config.attributes] Список полей таблицы (необязательно)
     */
    static async generate({ modelClass, controllerClass, moduleId = null, attributes }) {
        const modelName = modelClass.toLowerCase();

        // Определяем базовые пути в зависимости от наличия модуля
        const baseDir = moduleId
            ? path.resolve(process.cwd(), 'modules', moduleId)
            : process.cwd();

        const controllerDir = path.join(baseDir, 'controllers');
        const viewsDir = path.join(baseDir, 'views', modelName);

        let modelAttributes = attributes;

        try {
            // Попытка динамического импорта класса модели
            // Проверяем как локальную папку модуля, так и общую папки models/
            let modelModule;
            try {
                if (moduleId) {
                    modelModule = await import(`../../../modules/${moduleId}/models/${modelClass}.js`);
                } else {
                    modelModule = await import(`../../../models/${modelClass}.js`);
                }
            } catch {
                modelModule = await import(`../../../models/${modelClass}.js`);
            }

            const ModelCtor = modelModule[modelClass] || modelModule.default;

            if (!modelAttributes || modelAttributes.length === 0) {
                const tableName = ModelCtor.tableName();
                const db = Yii.app.db;
                const columnInfo = await db(tableName).columnInfo();
                modelAttributes = Object.keys(columnInfo);
            }
        } catch (err) {
            console.warn(`[Gii Warning]: Не удалось прочитать схему таблицы модели ${modelClass}.`, err.message);
            modelAttributes = modelAttributes || ['id'];
        }

        await fs.mkdir(controllerDir, { recursive: true });
        await fs.mkdir(viewsDir, { recursive: true });

        const formAttributes = modelAttributes.filter(attr => !['id', 'created_at', 'updated_at'].includes(attr));

        // 1. Генерация контроллера
        const controllerCode = CrudGenerator.generateControllerCode({
            modelClass,
            controllerClass,
            modelName,
            moduleId,
            attributes: modelAttributes
        });
        const controllerPath = path.join(controllerDir, `${controllerClass}.js`);
        await fs.writeFile(controllerPath, controllerCode, 'utf-8');

        // 2. Генерация шаблонов
        await fs.writeFile(path.join(viewsDir, 'index.njk'), CrudGenerator.generateIndexView(modelClass, modelName, moduleId), 'utf-8');
        await fs.writeFile(path.join(viewsDir, 'view.njk'), CrudGenerator.generateViewTemplate(modelClass, modelName, moduleId), 'utf-8');
        await fs.writeFile(path.join(viewsDir, 'create.njk'), CrudGenerator.generateCreateView(modelClass, modelName), 'utf-8');
        await fs.writeFile(path.join(viewsDir, 'update.njk'), CrudGenerator.generateUpdateView(modelClass, modelName), 'utf-8');
        await fs.writeFile(path.join(viewsDir, '_form.njk'), CrudGenerator.generateFormPartial(modelClass, modelName, moduleId, formAttributes), 'utf-8');

        return {
            success: true,
            controllerPath,
            viewsDir,
            attributes: modelAttributes
        };
    }

    static generateControllerCode({ modelClass, controllerClass, modelName, moduleId, attributes }) {
        const gridColumns = attributes.map(attr => `'${attr}'`).join(',\n                ');
        const detailAttributes = JSON.stringify(attributes);

        // Префикс пути в роутинге (/admin/product или /product)
        const routePrefix = moduleId ? `/${moduleId}/${modelName}` : `/${modelName}`;

        // Относительные пути импорта компонентов фреймворка из модуля или корня
        const frameworkRel = moduleId ? '../../../framework' : '../framework';
        const modelRel = moduleId ? `../../../models/${modelClass}.js` : `../models/${modelClass}.js`;

        return `import { BaseController } from '${frameworkRel}/BaseController.js';
import { ${modelClass} } from '${modelRel}';
import { ActiveDataProvider } from '${frameworkRel}/ActiveDataProvider.js';
import { GridView } from '${frameworkRel}/widgets/GridView.js';
import { DetailView } from '${frameworkRel}/widgets/DetailView.js';
import { Yii } from '${frameworkRel}/Application.js';


export class ${controllerClass} extends BaseController {

    // Список записей
    async actionIndex() {
        const dataProvider = new ActiveDataProvider({
            query: ${modelClass}.find(),
            pageSize: 10
        });

        const gridViewHtml = await GridView.widget({
            dataProvider,
            columns: [
                ${gridColumns},
                {
                    label: 'Действия',
                    value: (model) => \`
                        <a href="${routePrefix}/view?id=\${model.id}" class="btn btn-sm btn-info">Смотреть</a>
                        <a href="${routePrefix}/update?id=\${model.id}" class="btn btn-sm btn-primary">Редактировать</a>
                        <a href="${routePrefix}/delete?id=\${model.id}" class="btn btn-sm btn-danger" onclick="return confirm('Удалить запись?')">Удалить</a>
                    \`
                }
            ]
        });

        return this.render('index', {
            title: '${modelClass}',
            gridViewHtml
        });
    }

    // Просмотр одной записи
    async actionView() {
        const id = this.req.query.id;
        const model = await ${modelClass}.findOne(id);
        
        if (!model) {
            Yii.app.session?.setFlash('danger', 'Запись не найдена');
            return this.res.redirect('${routePrefix}/index');
        }

        const detailViewHtml = await DetailView.widget({
            model,
            attributes: ${detailAttributes}
        });

        return this.render('view', {
            title: \`Просмотр: #\${model.id}\`,
            model,
            detailViewHtml
        });
    }

    // Создание записи
    async actionCreate() {
        const model = new ${modelClass}();

        if (this.req.method === 'POST') {
            if (model.load(this.req.body) && await model.validate()) {
                if (await model.save()) {
                    Yii.app.session?.setFlash('success', 'Запись успешно создана');
                    return this.res.redirect(\`${routePrefix}/view?id=\${model.id}\`);
                }
            }
        }

        return this.render('create', {
            title: 'Создание ${modelClass}',
            model
        });
    }

    // Редактирование записи
    async actionUpdate() {
        const id = this.req.query.id;
        const model = await ${modelClass}.findOne(id);
        
        if (!model) {
            Yii.app.session?.setFlash('danger', 'Запись не найдена');
            return this.res.redirect('${routePrefix}/index');
        }

        if (this.req.method === 'POST') {
            if (model.load(this.req.body) && await model.validate()) {
                if (await model.save()) {
                    Yii.app.session?.setFlash('success', 'Запись обновлена');
                    return this.res.redirect(\`${routePrefix}/view?id=\${model.id}\`);
                }
            }
        }

        return this.render('update', {
            title: \`Редактирование: #\${model.id}\`,
            model
        });
    }

    // Удаление записи
    async actionDelete() {
        const id = this.req.query.id;
        const model = await ${modelClass}.findOne(id);
        if (model) {
            await model.delete();
            Yii.app.session?.setFlash('success', 'Запись удалена');
        }
        return this.res.redirect('${routePrefix}/index');
    }
}
`;
    }

    static generateIndexView(modelClass, modelName, moduleId) {
        const routePrefix = moduleId ? `/${moduleId}/${modelName}` : `/${modelName}`;
        return `<div class="d-flex justify-content-between align-items-center mb-3">
    <h2>{{ title }}</h2>
    <a href="${routePrefix}/create" class="btn btn-success">+ Создать</a>
</div>

{{ gridViewHtml | safe }}
`;
    }

    static generateViewTemplate(modelClass, modelName, moduleId) {
        const routePrefix = moduleId ? `/${moduleId}/${modelName}` : `/${modelName}`;
        return `<div class="d-flex justify-content-between align-items-center mb-3">
    <h2>{{ title }}</h2>
    <div>
        <a href="${routePrefix}/update?id={{ model.id }}" class="btn btn-primary">Редактировать</a>
        <a href="${routePrefix}/index" class="btn btn-secondary">Назад</a>
    </div>
</div>

{{ detailViewHtml | safe }}
`;
    }

    static generateCreateView(modelClass, modelName) {
        return `<h2>{{ title }}</h2>

{% include "${modelName}/_form.njk" %}
`;
    }

    static generateUpdateView(modelClass, modelName) {
        return `<h2>{{ title }}</h2>

{% include "${modelName}/_form.njk" %}
`;
    }

    static generateFormPartial(modelClass, modelName, moduleId, attributes) {
        const routePrefix = moduleId ? `/${moduleId}/${modelName}` : `/${modelName}`;

        const fieldsHtml = attributes.map(attr => {
            if (attr.includes('password')) {
                return `    {{ form.field(model, '${attr}').passwordInput() | safe }}`;
            } else if (attr.includes('text') || attr.includes('description') || attr.includes('content')) {
                return `    {{ form.field(model, '${attr}').textarea() | safe }}`;
            }
            return `    {{ form.field(model, '${attr}').textInput() | safe }}`;
        }).join('\n');

        return `{% set form = ActiveForm.begin({ method: 'post' }) %}

{{ form.html | safe }}

${fieldsHtml}

    <div class="mt-3">
        <button type="submit" class="btn btn-success">Сохранить</button>
        <a href="${routePrefix}/index" class="btn btn-secondary">Отмена</a>
    </div>

{{ ActiveForm.end() | safe }}
`;
    }
}