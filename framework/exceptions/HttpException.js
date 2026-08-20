// framework/exceptions/HttpException.js

export class HttpException extends Error {
    constructor(status, message) {
        super(message);
        this.status = status;
        this.name = `HttpException (${status})`;
    }
}

export class NotFoundHttpException extends HttpException {
    constructor(message = 'Страница не найдена.') {
        super(404, message);
        this.name = 'Страница не найдена (404)';
    }
}

export class BadRequestHttpException extends HttpException {
    constructor(message = 'Неверный запрос.') {
        super(400, message);
        this.name = 'Неверный запрос (400)';
    }
}