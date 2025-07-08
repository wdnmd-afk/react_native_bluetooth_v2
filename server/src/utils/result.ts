import { Response } from 'express';

class Result {
    private code: number;
    private msg: string;
    private data: any;

    constructor(code: number, msg: string, data: any) {
        this.code = code;
        this.msg = msg;
        this.data = data;
    }

    static success(res: Response, data: any, msg = 'Success') {
        res.status(200).json({
            code: 200,
            msg,
            data,
        });
    }

    static error(res: Response, code: number, msg = 'Error') {
        res.status(code).json({
            code,
            msg,
            data: null,
        });
    }
}

export default Result;