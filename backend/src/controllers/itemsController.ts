import { Request, Response } from 'express';

interface Item {
  id: number;
  name: string;
  createdAt: string;
}

// In-memory store (replace with a real DB in production)
const items: Item[] = [
  { id: 1, name: 'Sample Item 1', createdAt: new Date().toISOString() },
  { id: 2, name: 'Sample Item 2', createdAt: new Date().toISOString() },
];

export function getItems(_req: Request, res: Response): void {
  res.status(200).json({
    success: true,
    data: items,
    count: items.length,
  });
}

export function createItem(req: Request, res: Response): void {
  const { name } = req.body as { name?: string };

  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    res.status(400).json({
      success: false,
      error: 'Field "name" is required and must be a non-empty string.',
    });
    return;
  }

  const newItem: Item = {
    id: items.length + 1,
    name: name.trim(),
    createdAt: new Date().toISOString(),
  };

  items.push(newItem);
  res.status(201).json({ success: true, data: newItem });
}
