export class BaseModel {
    constructor() {
        this._errors = {};
    }

    // Загрузка данных: $model->load(data)
    load(data, formName = null) {
        if (!data) return false;
        const body = formName ? data[formName] : data;
        if (!body || typeof body !== 'object') return false;

        Object.assign(this, body);
        return true;
    }

    addError(attribute, message) {
        if (!this._errors[attribute]) {
            this._errors[attribute] = [];
        }
        this._errors[attribute].push(message);
    }

    get errors() {
        return this._errors;
    }

    hasErrors() {
        return Object.keys(this._errors).length > 0;
    }

    // Кастомные правила валидации (переопределяются в наследниках)
    rules() {
        return [];
    }

    async validate() {
        this._errors = {};
        const rules = this.rules();

        for (const rule of rules) {
            const [attributes, validatorType, options] = rule;
            const attrs = Array.isArray(attributes) ? attributes : [attributes];

            for (const attr of attrs) {
                const value = this[attr];

                if (validatorType === 'required' && (value === undefined || value === null || value === '')) {
                    this.addError(attr, options?.message || `${attr} cannot be blank.`);
                }

                if (validatorType === 'email' && value && !/^\S+@\S+\.\S+$/.test(value)) {
                    this.addError(attr, options?.message || `${attr} is not a valid email.`);
                }

                if (validatorType === 'string' && value) {
                    if (options?.min && value.length < options.min) {
                        this.addError(attr, `${attr} should contain at least ${options.min} characters.`);
                    }
                }
            }
        }

        return !this.hasErrors();
    }
}