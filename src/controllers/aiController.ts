import { Request, Response } from "express";
const AI_URL = process.env.AI_URL ?? 'http://localhost:8000';

export const chatAI = async (req: Request, res: Response) => {
    try {
        const response = await fetch(`${AI_URL}/chat`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(req.body),
        });

        if (!response.ok) {
            const error = await response.text();

            return res.status(response.status).json({
                message: 'AI service request failed',
                error,
            });
        }

        const data = await response.json();

        return res.status(200).json(data);
    } catch (error) {
        console.error('AI service error:', error);

        return res.status(500).json({
            message: 'Failed to connect to AI service',
        });
    }
}