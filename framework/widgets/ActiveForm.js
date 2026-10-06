// framework/widgets/ActiveForm.js

class ActiveField {
    constructor(model, attribute, options = {}) {
        this.model = model;
        this.attribute = attribute;
        this.options = options;
        this._type = 'text';
        this._label = null;
        this._items = {}; // Для dropDownList
    }

    label(text) {
        this._label = text;
        return this;
    }

    textInput(options = {}) {
        this._type = 'text';
        Object.assign(this.options, options);
        return this;
    }

    passwordInput(options = {}) {
        this._type = 'password';
        Object.assign(this.options, options);
        return this;
    }

    textarea(options = {}) {
        this._type = 'textarea';
        Object.assign(this.options, options);
        return this;
    }

    dropDownList(items = {}, options = {}) {
        this._type = 'select';
        this._items = items;
        Object.assign(this.options, options);
        return this;
    }

    render() {
        const value = this.model[this.attribute] ?? '';
        const labelText = this._label || (typeof this.model.getAttributeLabel === 'function'
            ? this.model.getAttributeLabel(this.attribute)
            : this.attribute);
        const errors = this.model?.errors?.[this.attribute] || [];
        const hasError = errors.length > 0;

        // Bootstrap 5 классы для валидации
        const inputClass = `form-control ${hasError ? 'is-invalid' : ''}`;
        let inputHtml = '';

        if (this._type === 'textarea') {
            inputHtml = `<textarea id="${this.attribute}" name="${this.attribute}" class="${inputClass}">${value}</textarea>`;
        } else if (this._type === 'select') {
            let optionsHtml = '';
            for (const [val, name] of Object.entries(this._items)) {
                const selected = String(val) === String(value) ? 'selected' : '';
                optionsHtml += `<option value="${val}" ${selected}>${name}</option>`;
            }
            inputHtml = `<select id="${this.attribute}" name="${this.attribute}" class="form-select ${hasError ? 'is-invalid' : ''}">${optionsHtml}</select>`;
        } else {
            inputHtml = `<input type="${this._type}" id="${this.attribute}" name="${this.attribute}" value="${value}" class="${inputClass}" />`;
        }

        const errorHtml = hasError ? `<div class="invalid-feedback">${errors[0]}</div>` : '';

        return `
            <div class="mb-3 field-${this.attribute}">
                <label for="${this.attribute}" class="form-label">${labelText}</label>
                ${inputHtml}
                ${errorHtml}
            </div>
        `;
    }

    toString() {
        return this.render();
    }
}

export class ActiveForm {
    constructor(options = {}) {
        this.action = options.action || '';
        this.method = options.method || 'POST';
    }

    // Метод begin возвращает сам объект формы
    static begin(options = {}) {
        return new ActiveForm(options);
    }

    // Выводит открывающий тег <form>
    renderBegin() {
        return `<form action="${this.action}" method="${this.method}">`;
    }

    static end() {
        return `</form>`;
    }

    field(model, attribute, options = {}) {
        return new ActiveField(model, attribute, options);
    }
}