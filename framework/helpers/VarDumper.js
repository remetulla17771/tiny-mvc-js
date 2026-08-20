// framework/helpers/VarDumper.js
import util from 'util';
import { Yii } from '../Application.js';

export class VarDumper {
    static dump(target, depth = 10, highlight = true) {
        // Преобразуем любой объект/массив/переменную в структурированный текст
        const result = util.inspect(target, {
            depth: depth,
            colors: false,
            showHidden: false,
            getters: true
        });

        // Экранируем HTML
        const escaped = result
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');

        const html = `
      <pre style="
        background-color: #1e1e1e;
        color: #d4d4d4;
        font-family: 'Consolas', 'Fira Code', monospace;
        font-size: 13px;
        padding: 15px;
        border-radius: 5px;
        border-left: 5px solid #007acc;
        margin: 15px 0;
        overflow-x: auto;
        white-space: pre-wrap;
        word-wrap: break-word;
        box-shadow: 0 4px 6px rgba(0,0,0,0.3);
      "><code>${escaped}</code></pre>
    `;

        // Если есть контекст HTTP-запроса — сразу отправляем браузеру
        const res = Yii.app.response;
        if (res && !res.sent) {
            res.type('text/html').send(html);
        } else {
            console.log(result);
        }
    }
}

// Глобальная функция var_dump()
export function var_dump(...args) {
    args.forEach((arg) => VarDumper.dump(arg));
}

// Глобальная функция dd() (Dump and Die)
export function dd(...args) {
    args.forEach((arg) => VarDumper.dump(arg));
    // Прерываем дальнейшее выполнение в рамках этого запроса
    throw new Error('PHP_DIE_SIGNAL');
}