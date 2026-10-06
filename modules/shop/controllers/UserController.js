import { BaseController } from '../../../framework/BaseController.js';
import { User } from '../../../models/User.js';
import { ActiveDataProvider } from '../../../framework/ActiveDataProvider.js';
import { GridView } from '../../../framework/widgets/GridView.js';
import { DetailView } from '../../../framework/widgets/DetailView.js';
import { Yii } from '../../../framework/Application.js';

export class UserController extends BaseController {

    // Список записей
    async actionIndex() {
        const dataProvider = new ActiveDataProvider({
            query: User.find(),
            pageSize: 10
        });

        const gridViewHtml = await GridView.widget({
            dataProvider,
            columns: [
                'id',
                'username',
                'email',
                'password',
                {
                    label: 'Действия',
                    value: (model) => `
                        <a href="/shop/user/view?id=${model.id}" class="btn btn-sm btn-info">Смотреть</a>
                        <a href="/shop/user/update?id=${model.id}" class="btn btn-sm btn-primary">Редактировать</a>
                        <a href="/shop/user/delete?id=${model.id}" class="btn btn-sm btn-danger" onclick="return confirm('Удалить запись?')">Удалить</a>
                    `
                }
            ]
        });

        return this.render('index', {
            title: 'User',
            gridViewHtml
        });
    }

    // Просмотр одной записи
    async actionView() {
        const id = this.req.query.id;
        const model = await User.findOne(id);
        
        if (!model) {
            Yii.app.session?.setFlash('danger', 'Запись не найдена');
            return this.res.redirect('/shop/user/index');
        }

        const detailViewHtml = await DetailView.widget({
            model,
            attributes: ["id","username","email","password"]
        });

        return this.render('view', {
            title: `Просмотр: #${model.id}`,
            model,
            detailViewHtml
        });
    }

    // Создание записи
    async actionCreate() {
        const model = new User();

        if (this.req.method === 'POST') {
            if (model.load(this.req.body) && await model.validate()) {
                if (await model.save()) {
                    Yii.app.session?.setFlash('success', 'Запись успешно создана');
                    return this.res.redirect(`/shop/user/view?id=${model.id}`);
                }
            }
        }

        return this.render('create', {
            title: 'Создание User',
            model
        });
    }

    // Редактирование записи
    async actionUpdate() {
        const id = this.req.query.id;
        const model = await User.findOne(id);
        
        if (!model) {
            Yii.app.session?.setFlash('danger', 'Запись не найдена');
            return this.res.redirect('/shop/user/index');
        }

        if (this.req.method === 'POST') {
            if (model.load(this.req.body) && await model.validate()) {
                if (await model.save()) {
                    Yii.app.session?.setFlash('success', 'Запись обновлена');
                    return this.res.redirect(`/shop/user/view?id=${model.id}`);
                }
            }
        }

        return this.render('update', {
            title: `Редактирование: #${model.id}`,
            model
        });
    }

    // Удаление записи
    async actionDelete() {
        const id = this.req.query.id;
        const model = await User.findOne(id);
        if (model) {
            await model.delete();
            Yii.app.session?.setFlash('success', 'Запись удалена');
        }
        return this.res.redirect('/shop/user/index');
    }
}
