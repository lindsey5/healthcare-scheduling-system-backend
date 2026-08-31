import { NextFunction, Request, Response } from "express";
import { Op, Sequelize } from "sequelize";
import { Admin, Audit, Staff } from "../models/index";

export const getAudits = async (req: Request, res: Response, next: NextFunction) => {
    try{
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 10;
        const offset = (page - 1) * limit;

        const search = (req.query.search as string) || "";
        const severity = (req.query.severity as string) || "";
        const userType = req.query.userType || ""

        const startDate = req.query.startDate;
        const endDate = req.query.endDate;

        const where : any = { };

        if(search) {
            where[Op.or] = [
                { 
                    action: {
                        [Op.like]: `%${search}%`,
                    },
                },
                { 
                    entity: {
                        [Op.like]: `%${search}%`,
                    },
                },
                Sequelize.where(
                    Sequelize.fn(
                        "CONCAT",
                        Sequelize.col("staff.firstname"),
                        " ",
                        Sequelize.col("staff.lastname")
                    ),
                    {
                        [Op.like]: `%${search}%`,
                    }
                ),
                Sequelize.where(
                    Sequelize.fn(
                        "CONCAT",
                        Sequelize.col("admin.firstname"),
                        " ",
                        Sequelize.col("admin.lastname")
                    ),
                    {
                        [Op.like]: `%${search}%`,
                    }
                ),
                {
                "$admin.email$": {
                    [Op.like]: `%${search}%`,
                    },
                },
                {
                "$staff.email$": {
                    [Op.like]: `%${search}%`,
                    },
                },
            ]
        }

        if(severity) {
            where.severity = severity
        }

        if(userType){
            where.userType = userType
        }
        
        if (startDate || endDate) {
            where.createdAt = {
                ...(startDate && { [Op.gte]: startDate }),
                ...(endDate && { [Op.lte]: endDate }),
            };
        }

        const { count: total, rows: audits } = await Audit.findAndCountAll({
            where,
            include: [
                {
                    model: Admin,
                    as: 'admin',
                    attributes: [
                        "id",
                        "firstname",
                        "lastname",
                        "email",
                    ],
                },
                {
                model: Staff,
                    as: "staff",
                    attributes: [
                        "id",
                        "firstname",
                        "lastname",
                        "email",
                    ],
                },
            ],
            order: [["createdAt", "DESC"]],
            limit,
            offset
        })

        res.status(200).json({
            audits,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
            total
        })

    }catch(err){
        next(err);
    }
}

export const getRecentAudit = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const recentAudits = await Audit.findAll({
            order: [["createdAt", "DESC"]],
            limit: 5,
        });

        return res.status(200).json({
            audits: recentAudits
        });
    } catch (err) {
        next(err);
    }
};