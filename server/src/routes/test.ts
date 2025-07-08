import { Router, Request, Response } from 'express';

const router = Router();

router.get('/', (req: Request, res: Response) => {
  res.json({ message: 'This is the /test endpoint' });
});

router.get('/sub', (req: Request, res: Response) => {
  res.json({ message: 'This is the /test/sub endpoint' });
});

export default router;