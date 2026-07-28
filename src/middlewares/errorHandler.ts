import { NextFunction, Request, Response } from "express";
import {
    ValidationError,
    UniqueConstraintError,
    ForeignKeyConstraintError,
    DatabaseError,
    EmptyResultError,
} from "sequelize";

export const errorHandler = (
    err: any,
    _req: Request,
    res: Response,
    _next: NextFunction
) => {
    console.error(err);

    // Sequelize Validation Error
    if (err instanceof ValidationError) {
        return res.status(400).json({
            success: false,
            error: "Validation error",
            details: err.errors.map((e) => ({
                field: e.path,
                message: e.message,
            })),
        });
    }

    // Unique Constraint Error
    if (err instanceof UniqueConstraintError) {
        return res.status(409).json({
            success: false,
            error: "Duplicate value",
            details: err.errors.map((e) => ({
                field: e.path,
                message: e.message,
            })),
        });
    }

    // Foreign Key Constraint Error
    if (err instanceof ForeignKeyConstraintError) {
        return res.status(400).json({
            success: false,
            error: "Foreign key constraint",
            message: err.message,
        });
    }

    // Record Not Found
    if (err instanceof EmptyResultError) {
        return res.status(404).json({
            success: false,
            error: "Not found",
            message: "Requested resource was not found.",
        });
    }

    // Database Error
    if (err instanceof DatabaseError) {
        return res.status(500).json({
            success: false,
            error: "Database error",
            message: err.message,
        });
    }

    // Default Error
    return res.status(err.status || 500).json({
        success: false,
        error: "Internal Server Error",
        message: err.message || "Something went wrong.",
    });
};