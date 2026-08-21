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

    // Названия полей (переопределяются в наследниках)
    attributeLabels() {
        return {};
    }

    // Получить метку поля (Label)
    getAttributeLabel(attribute) {
        const labels = this.attributeLabels();
        if (labels && labels[attribute]) {
            return labels[attribute];
        }
        // Автоматическая генерация (например, 'created_at' -> 'Created At')
        return attribute
            .replace(/_/g, ' ')
            .replace(/([a-z])([A-Z])/g, '$1 $2')
            .replace(/^./, (str) => str.toUpperCase());
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
                const label = this.getAttributeLabel(attr);

                if (validatorType === 'required' && (value === undefined || value === null || value === '')) {
                    this.addError(attr, options?.message || `Поле "${label}" обязательно для заполнения.`);
                }

                if (validatorType === 'email' && value && !/^\S+@\S+\.\S+$/.test(value)) {
                    this.addError(attr, options?.message || `Поле "${label}" не является правильным E-mail адресом.`);
                }

                if (validatorType === 'string' && value) {
                    if (options?.min && value.length < options.min) {
                        this.addError(attr, options?.message || `Поле "${label}" должно содержать минимум ${options.min} символов.`);
                    }
                    if (options?.max && value.length > options.max) {
                        this.addError(attr, options?.message || `Поле "${label}" должно содержать максимум ${options.max} символов.`);
                    }
                }
            }
        }

        return !this.hasErrors();
    }
}