// framework/Session.js
import { Yii } from './Application.js';

export class Session {
    // Вытаскиваем session из изоляции запроса
    get _rawSession() {
        const req = Yii.app.request;
        if (!req || !req.session) {
            throw new Error('Session is not initialized. Make sure fastifySession is registered.');
        }
        return req.session;
    }

    // Yii::$app->session->setFlash('success', 'Пользователь сохранен!')
    setFlash(key, value) {
        const session = this._rawSession;
        if (!session.__flashes) {
            session.__flashes = {};
        }
        session.__flashes[key] = value;
    }

    // Yii::$app->session->getFlash('success')
    getFlash(key, defaultValue = null) {
        const session = this._rawSession;
        if (!session.__flashes || !(key in session.__flashes)) {
            return defaultValue;
        }
        const value = session.__flashes[key];
        delete session.__flashes[key]; // Flash доступен ровно 1 раз
        return value;
    }

    // Yii::$app->session->hasFlash('success')
    hasFlash(key) {
        const session = this._rawSession;
        return Boolean(session.__flashes && key in session.__flashes);
    }

    // Вытащить и сразу очистить все flash-сообщения
    getAllFlashes() {
        const session = this._rawSession;
        if (!session.__flashes) return {};

        const flashes = { ...session.__flashes };
        session.__flashes = {}; // Очищаем прочитанные флеши
        return flashes;
    }
}