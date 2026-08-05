import { NextFunction, Request, Response } from "express";
import { Admin } from "../models/index";
import { generateAccessToken, generateRefreshToken, verifyPassword } from "../utils/auth";
import { Op, Sequelize } from "sequelize";
import { AuthRequest } from "../types/type";

export const createAdmin = async (req : Request, res: Response, next: NextFunction) =>{
    try{
        const isExisting = await Admin.findOne({
            where: {
                email: req.body.email
            }
        });

        if(isExisting){
            return res.status(409).json({
                message: "Email already used."
            })
        }

        const admin = await Admin.create(req.body);

        res.status(201).json({
            admin,
            message: "New admin successfully created."
        })

    }catch(err){
        next(err);
    }
}

export const loginAdmin = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { email, password } = req.body;

        const admin = await Admin.findOne({
            where: {
                email,
            },
        });

        if (!admin) {
            return res.status(404).json({
                message: "Account not found",
            });
        }

        const isMatch = await verifyPassword(password, admin.password);

        if (!isMatch) {
            return res.status(401).json({
                message: "Incorrect password",
            });
        }

        const refreshToken = generateRefreshToken(admin.id, "admin");
        const accessToken = generateAccessToken(admin.id, "admin");

        return res.status(200).json({
            user: {
                id: admin.id,
                firstname: admin.firstname,
                lastname: admin.lastname,
                email: admin.email,
                createdAt: admin.createdAt,
                role: 'admin'
            },
            token: {
                refreshToken,
                accessToken,
            },
        });

    } catch (err) {
        next(err);
    }
};

export const getAdmins = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try{
        const search = String(req.query.search);

        const where : any = { id: { [Op.ne] : req.user.id } };

        if(search) {
            where[Op.or] = [
                Sequelize.where(
                    Sequelize.fn(
                        "CONCAT",
                        Sequelize.col("firstname"),
                        " ",
                        Sequelize.col("lastname")
                    ),
                    {
                        [Op.like]: `%${search}%`,
                    }
                ),
                { firstname: { [Op.like] : `%${search}%`} },
                { lastname: { [Op.like] : `%${search}%`} },
                { email: { [Op.like] : `%${search}%`} }
            ]
        }

        const admins = await Admin.findAll({
            where,
            attributes: {
                exclude: ["password"],
            },
        });

        return res.status(200).json({
            admins
        })

    }catch(err){
        next(err);
    }
}

export const updateAdmin = async (req : Request, res: Response, next: NextFunction) =>{
    try{
        const id = Number(req.params.id);

        const isExisting = await Admin.findOne({
            where: {
                email: req.body.email,
                id: { [Op.ne] : id }
            },
            attributes: {
                exclude: ["password"],
            },
        });

        if(isExisting){
            return res.status(409).json({
                message: "Email already used."
            })
        }

        const admin = await Admin.findByPk(id);

        if(!admin) return res.status(404).json({ message: "Admin not found" });

        admin.set(req.body);

        await admin.save()

        res.status(201).json({
            admin,
            message: "Admin successfully updated"
        })

    }catch(err){
        next(err);
    }
}

export const deleteAdmin = async (req: Request, res: Response, next: NextFunction) => {
    try{
        const id = req.params.id;

        const admin = await Admin.findByPk(Number(id));

        if(!admin) return res.status(404).json({ message: "Admin not found." });

        await admin.destroy();

        res.status(200).json({ message: "Admin successfully deleted" });

    }catch(err){
        next(err);
    }
}