
import { BaseController } from '../framework/BaseController.js';
import { User } from '../models/User.js';
import { Yii } from '../framework/Application.js';
import {var_dump} from "../framework/helpers/VarDumper.js";

export class NewsController extends BaseController {
    async actionIndex() {

        return this.json({
            code: 200,
            message: "OK"
        })
    }

}