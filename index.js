// index.js
import path from 'path';
import fs from 'fs';
import Fastify from 'fastify';
import fastifyStatic from '@fastify/static';
import fastifyFormbody from '@fastify/formbody';
import fastifyCookie from '@fastify/cookie';
import fastifySession from '@fastify/session';

import { Yii } from './framework/Application.js';
import { config } from './config/main.js';
import { setupRouter } from './framework/Router.js';
import { var_dump, dd } from './framework/helpers/VarDumper.js';
import connectSqlite3 from 'connect-sqlite3';

const SQLiteStore = connectSqlite3(fastifySession);

// Регистрируем функции в глобальной области
globalThis.var_dump = var_dump;
globalThis.dd = dd;

const fastify = Fastify({ logger: true });

async function bootstrap() {
    Yii.init(config);

    const publicPath = path.resolve('public');
    if (!fs.existsSync(publicPath)) {
        fs.mkdirSync(publicPath);
    }

    await fastify.register(fastifyFormbody);
    await fastify.register(fastifyCookie);
    await fastify.register(fastifySession, {
        secret: 'a_secret_key_minimum_32_characters_long_12345',
        cookie: {
            secure: false, // false для localhost (http)
            maxAge: 86400 * 1000 // 1 день
        },
        // store: new SQLiteStore({
        //     db: 'sessions.sqlite', // Файл для хранения сессий
        //     dir: './'
        // }),
    });

    await fastify.register(fastifyStatic, {
        root: publicPath,
        prefix: '/',
        wildcard: false
    });

    // framework/Application.js (или в точке входа)
    // В onRequest хуке Fastify:
    fastify.addHook('onRequest', (req, reply, done) => {
        // Оборачиваем весь цикл обработки запроса в ALS
        Yii.app.runInContext({ req, res: reply, identity: null }, () => {
            done();
        });
    });

    setupRouter(fastify);

    try {
        await fastify.listen({ port: 3008 });
        console.log('Server runs on http://localhost:3000');
    } catch (err) {
        fastify.log.error(err);
        process.exit(1);
    }
}

bootstrap();