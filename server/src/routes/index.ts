import { Router } from 'express';
import filesRouter from './files';
import testRouter from './test';
import Result from '../utils/result';

const router = Router();

router.get('/', (req, res) => {
    Result.success(res, null, 'This is the API root!');
});

router.use('/files', filesRouter);
router.use('/test', testRouter);

export default router;