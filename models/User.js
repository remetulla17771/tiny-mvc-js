import { ActiveRecord } from '../framework/ActiveRecord.js';
import bcrypt from 'bcryptjs';
export class User extends ActiveRecord {
    static tableName() {
        return 'users';
    }

    attributeLabels() {
        return {
            id: 'ID',
            username: 'Имя пользователя',
            email: 'Электронная почта'
        };
    }

    rules() {
        return [
            [['username', 'email'], 'required'],
            ['email', 'email'],
            ['username', 'string', { min: 3 }]
        ];
    }


    // Найти пользователя по логину/email
    static async findByUsername(username) {
        const data = await this.find().where({ username }).one();
        return data ? data : null;
    }

    // Проверка пароля
    validatePassword(password) {
        if (!this.password) return false;
        return bcrypt.compareSync(password, this.password);
    }

    // Генерация хеша перед сохранением
    setPassword(password) {
        this.password = bcrypt.hashSync(password, 10);
    }

}