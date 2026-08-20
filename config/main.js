import knex from 'knex';
import nunjucks from 'nunjucks';
import path from 'path';
import {Session} from "../framework/Session.js";
import {UserComponent} from "../framework/web/UserComponent.js";
import {AdminModule} from "../modules/admin/Module.js";
import {GiiModule} from "../modules/gii/Module.js";
import {ShopModule} from "../modules/shop/Module.js";

export const config = {
    appName: "Tiny MVC Node",
    components: {
        db: () => {
            return knex({
                client: 'sqlite3',
                connection: { filename: './dev.sqlite' },
                useNullAsDefault: true
            });
        },
        // Компонент View
        view: () => {
            const viewsPath = path.resolve('views');
            const env = nunjucks.configure(['views', '.'], {
                autoescape: true,
                noCache: true
            });

            // Регистрируем фильтр date
            env.addFilter('date', (dateVal, format = 'Y') => {
                const d = dateVal === 'now' ? new Date() : new Date(dateVal);
                if (format === 'Y') return d.getFullYear();
                return d.toLocaleDateString();
            });

            return env;
        },
        session: () => new Session(),
        user: () => new UserComponent()
    },
    modules: {
        admin: {
            class: AdminModule
        },
        gii: {
            class: GiiModule
        },
        shop: {
            class: ShopModule
        }
    }
};