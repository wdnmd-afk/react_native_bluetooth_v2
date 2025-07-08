import { Router } from 'express';
import Result from '../utils/result';

const router = Router();

router.get('/', (req, res) => {
    // 模拟一个错误
    const auth = req.headers['authorization'];
    if (!auth) {
        Result.error(res, 401, 'Unauthorized');
        return;
    }

    // 成功情况
    Result.success(res, { file: 'example.txt' }, 'This is the /files endpoint');
});

export default router;