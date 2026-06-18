import { Router } from 'express';
import { getItems, createItem } from '../controllers/itemsController';

export const apiRouter = Router();

// Items resource
apiRouter.get('/items', getItems);
apiRouter.post('/items', createItem);
