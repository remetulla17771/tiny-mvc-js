// modules/gii/generators/CrudGenerator.js
import fs from 'fs/promises';
import path from 'path';

export class CrudGenerator {
    /**
     * Генерирует Контроллер и Представления (Views) для модели
     * @param {Object} config
     * @param {string} config.modelClass Имя класса модели (напр. 'User')
     * @param {string} config.controllerClass Имя контроллера (напр. 'UserController')
     */
    static async generate({modelClass, controllerClass}) {
        const modelName = modelClass.toLowerCase(); // 'user'
        const controllerDir = path.resolve(process.cwd(), 'controllers');
        const viewsDir = path.resolve(process.cwd(), 'views', modelName);

        await fs.mkdir(controllerDir, {recursive: true});
        await fs.mkdir(viewsDir, {recursive: true});

        // 1. Генерация файла контроллера
        const controllerCode = CrudGenerator.generateControllerCode(modelClass, controllerClass, modelName);
        const controllerPath = path.join(controllerDir, `${controllerClass}.js`);
        await fs.writeFile(controllerPath, controllerCode, 'utf-8');

        // 2. Генерация файлов представлений (Views)
        await fs.writeFile(path.join(viewsDir, 'index.njk'), CrudGenerator.generateIndexView(modelClass, modelName), 'utf-8');
        await fs.writeFile(path.join(viewsDir, 'view.njk'), CrudGenerator.generateViewTemplate(modelClass, modelName), 'utf-8');
        await fs.writeFile(path.join(viewsDir, 'create.njk'), CrudGenerator.generateCreateView(modelClass, modelName), 'utf-8');
        await fs.writeFile(path.join(viewsDir, 'update.njk'), CrudGenerator.generateUpdateView(modelClass, modelName), 'utf-8');
        await fs.writeFile(path.join(viewsDir, '_form.njk'), CrudGenerator.generateFormPartial(modelClass, modelName), 'utf-8');

        return {
            success: true,
            controllerPath,
            viewsDir
        };
    }

    static generateControllerCode(modelClass, controllerClass, modelName) {
        return `import { BaseController } from '../framework/BaseController.js';
import { ${modelClass} } from '../models/${modelClass}.js';
import { ActiveDataProvider } from '../framework/data/ActiveDataProvider.js';
import { GridView } from '../framework/widgets/GridView.js';
import { DetailView } from '../framework/widgets/DetailView.js';
import { Yii } from '../framework/Application.js';

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
                'id',
                'username',
                'email',
                {
                    label: 'Действия',
                    value: (model) => \`
                        <a href="/${modelName}/view?id=\${model.id}" class="btn btn-sm btn-info">Смотреть</a>
                        <a href="/${modelName}/update?id=\${model.id}" class="btn btn-sm btn-primary">Редактировать</a>
                        <a href="/${modelName}/delete?id=\${model.id}" class="btn btn-sm btn-danger" onclick="return confirm('Удалить запись?')">Удалить</a>
                    \`
                }
            ]
        });

        return this.render('${modelName}/index', {
            title: '${modelClass}',
            gridViewHtml
        });
    }

    // Просмотр одной записи
    async actionView() {
        const model = await ${modelClass}.findOne(this.req.query.id);
        if (!model) {
            Yii.app.session?.setFlash('danger', 'Запись не найдена');
            return this.res.redirect('/${modelName}/index');
        }

        const detailViewHtml = await DetailView.widget({
            model,
            attributes: ['id', 'username', 'email']
        });

        return this.render('${modelName}/view', {
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
                    return this.res.redirect(\`/${modelName}/view?id=\${model.id}\`);
                }
            }
        }

        return this.render('${modelName}/create', {
            title: 'Создание ${modelClass}',
            model
        });
    }

    // Редактирование записи
    async actionUpdate() {
        const model = await ${modelClass}.findOne(this.req.query.id);
        if (!model) {
            Yii.app.session?.setFlash('danger', 'Запись не найдена');
            return this.res.redirect('/${modelName}/index');
        }

        if (this.req.method === 'POST') {
            if (model.load(this.req.body) && await model.validate()) {
                if (await model.save()) {
                    Yii.app.session?.setFlash('success', 'Запись обновлена');
                    return this.res.redirect(\`/${modelName}/view?id=\${model.id}\`);
                }
            }
        }

        return this.render('${modelName}/update', {
            title: \`Редактирование: #\${model.id}\`,
            model
        });
    }

    // Удаление записи
    async actionDelete() {
        const model = await ${modelClass}.findOne(this.req.query.id);
        if (model) {
            await model.delete();
            Yii.app.session?.setFlash('success', 'Запись удалена');
        }
        return this.res.redirect('/${modelName}/index');
    }
}
`;
    }

    static generateIndexView(modelClass, modelName) {
        return `{% extends "layouts/main.njk" %}

{% block content %}
<div class="d-flex justify-content-between align-items-center mb-3">
    <h2>{{ title }}</h2>
    <a href="/${modelName}/create" class="btn btn-success">+ Создать</a>
</div>

{{ gridViewHtml | safe }}
{% endblock %}
`;
    }

    static generateViewTemplate(modelClass, modelName) {
        return `{% extends "layouts/main.njk" %}

{% block content %}
<div class="d-flex justify-content-between align-items-center mb-3">
    <h2>{{ title }}</h2>
    <div>
        <a href="/${modelName}/update?id={{ model.id }}" class="btn btn-primary">Редактировать</a>
        <a href="/${modelName}/index" class="btn btn-secondary">Назад</a>
    </div>
</div>

{{ detailViewHtml | safe }}
{% endblock %}
`;
    }

    static generateCreateView(modelClass, modelName) {
        return `{% extends "layouts/main.njk" %}

{% block content %}
<h2>{{ title }}</h2>

{% include "${modelName}/_form.njk" %}
{% endblock %}
`;
    }

    static generateUpdateView(modelClass, modelName) {
        return `{% extends "layouts/main.njk" %}

{% block content %}
<h2>{{ title }}</h2>

{% include "${modelName}/_form.njk" %}
{% endblock %}
`;
    }

    static generateFormPartial(modelClass, modelName) {
        return `{% set form = ActiveForm.begin({ method: 'post' }) %}

{{ form.renderBegin() | safe }}

    {{ form.field(model, 'username').textInput() | safe }}
    {{ form.field(model, 'email').textInput() | safe }}

    <div class="mt-3">
        <button type="submit" class="btn btn-success">Сохранить</button>
        <a href="/${modelName}/index" class="btn btn-secondary">Отмена</a>
    </div>

{{ ActiveForm.end() | safe }}
`;
    }
}