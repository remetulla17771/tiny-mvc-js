// framework/web/UserComponent.js
import { Yii } from '../Application.js';

export class UserComponent {
    // Получаем контекст текущего запроса из AsyncLocalStorage
    get currentStore() {
        return Yii.app.request ? Yii.app.asyncLocalStorage?.getStore() : null;
    }

    // Динамически берем сессию Fastify текущего запроса
    get session() {
        const req = Yii.app.request;
        return req ? req.session : null;
    }

    // Вход пользователя в систему
    async login(user) {
        const session = this.session;
        if (!session) {
            throw new Error('Сессия не доступна в текущем контексте.');
        }

        // Записываем ID в сессию Fastify
        session.userId = user.id;

        // Сохраняем модель пользователя в изолированную память ТЕКУЩЕГО запроса
        const store = this.currentStore;
        if (store) {
            store.identity = user;
        }

        return true;
    }

    // Выход пользователя
    logout() {
        const session = this.session;
        if (session) {
            delete session.userId;
        }

        const store = this.currentStore;
        if (store) {
            store.identity = null;
        }
    }

    get isGuest() {
        return !this.id;
    }

    // ID берем из сессии Fastify текущего запроса
    get id() {
        const session = this.session;
        return session ? session.userId : null;
    }

    // Получение модели текущего пользователя
    async findIdentity() {
        const store = this.currentStore;

        // 1. Проверяем кэш ТЕКУЩЕГО запроса
        if (store && store.identity) {
            return store.identity;
        }

        // 2. Если кэша нет, но есть userId в сессии — загружаем из БД
        const userId = this.id;
        if (userId) {
            const { User } = await import('../../models/User.js');
            const user = await User.findOne(userId);

            // Кэшируем внутри ТЕКУЩЕГО запроса
            if (store) {
                store.identity = user;
            }
            return user;
        }

        return null;
    }
}