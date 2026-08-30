import { NextFunction, Response, Request } from "express";
import { Doctor, DoctorService, Service } from "../models/index";
import { sequelize } from "../config/db";
import { Op, Sequelize } from "sequelize";
import { createAudit } from "../services/auditService";
import { AuthRequest } from "../types/type";

export const createDoctor = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    const transaction = await sequelize.transaction();

    try {
        const { doctorServices : serviceIds, ...doctor } = req.body;

        if (!doctor) {
            return res.status(400).json({
                message: "Doctor is required",
            });
        }

        if (!Array.isArray(serviceIds) || serviceIds.length === 0) {
            return res.status(400).json({
                message: "At least one service is required",
            });
        }

        const newDoctor = await Doctor.create(doctor, { transaction });

        const doctorServices = serviceIds.map((serviceId: number) => ({
            doctorId: newDoctor.id,
            serviceId,
        }));

        await DoctorService.bulkCreate(doctorServices, {
            transaction,
        });

        await transaction.commit();

        await createAudit({
            userId: req.user.id,
            userType: req.user.role,
            action: "CREATE",
            entity: "DOCTOR",
            entityId: newDoctor.id,
            oldValues: {},
            newValues: {
                firstname: newDoctor.firstname,
                lastname: newDoctor.lastname,
                doctorServices
            },
            severity: "WARNING",
            ipAddress: req.ip ?? "Unknown",
            userAgent: req.headers["user-agent"] ?? "Unknown",
        })

        return res.status(201).json({
            doctor: newDoctor,
            message: "New doctor successfully created",
        });
    } catch (err) {
        await transaction.rollback();
        next(err);
    }
};

export const getDoctors = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const serviceId = req.query.serviceId as string | undefined;
        const search = req.query.search as string | undefined;

        const where: any = { status: "Active" };

        if (search) {
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
                {
                    firstname: {
                        [Op.like]: `%${search}%`,
                    },
                },
                {
                    lastname: {
                        [Op.like]: `%${search}%`,
                    },
                },
            ];
        }

        const doctors = await Doctor.findAll({
            where,
            include: [
                {
                    model: DoctorService,
                    as: "doctorServices",
                    required: !!serviceId,
                    include: [
                        {
                            model: Service,
                            as: "service",
                            where: serviceId
                                ? {
                                      id: serviceId,
                                  }
                                : undefined,
                            required: !!serviceId,
                        },
                    ],
                },
            ],
            order: [["firstName", "ASC"]],
        });

        return res.status(200).json({
            doctors,
        });
    } catch (err) {
        next(err);
    }
};

export const deleteDoctor = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try{
        const id = req.params.id;

        const doctor = await Doctor.findByPk(Number(id));

        if(!doctor){
            return res.status(404).json({ message: "Doctor not found" });
        }

        doctor.status = 'Inactive';
        await doctor.save();

        await createAudit({
            userId: req.user.id,
            userType: req.user.role,
            action: "DELETE",
            entity: "Doctor",
            entityId: doctor.id,
            oldValues: {
                firstname: doctor.firstname,
                lastname: doctor.lastname,
            },
            newValues: {},
            severity: "WARNING",
            ipAddress: req.ip ?? "Unknown",
            userAgent: req.headers["user-agent"] ?? "Unknown",
        })


        res.status(200).json({
            message: "Doctor successfully deleted."
        })

    }catch(err){
        next(err);
    }
}

export const updateDoctor = async (req: AuthRequest, res: Response, next: NextFunction) => {
    const transaction = await sequelize.transaction();
    
    try{
        const id = req.params.id;

        const { doctorServices : serviceIds , ...rest } = req.body;

        if (!Array.isArray(serviceIds) || serviceIds.length === 0) {
            return res.status(400).json({
                message: "At least one service is required",
            });
        }

        const doctor = await Doctor.findByPk(Number(id), {
            include: {
                model: DoctorService,
                as: 'doctorServices'
            }
        });

        if(!doctor){
            return res.status(404).json({ message: "Doctor not found" });
        }

        const oldValues : any = doctor;

        doctor.set(rest);

        await doctor.save();

        await DoctorService.destroy({
            where: {
                doctorId: doctor.id
            }
        })

        const doctorServices = serviceIds.map((serviceId: number) => ({
            doctorId: doctor.id,
            serviceId,
        }));

        await DoctorService.bulkCreate(doctorServices, {
            transaction,
        });

        await transaction.commit(); 

        await createAudit({
            userId: req.user.id,
            userType: req.user.role,
            action: "UPDATE",
            entity: "Doctor",
            entityId: doctor.id,
            oldValues: {
                firstname: oldValues.firstname,
                lastname: oldValues.lastname,
                doctorServices: oldValues.doctorServices
                
            },
            newValues: {
                firstname: doctor.firstname,
                lastname: doctor.lastname,
                doctorServices,
            },
            severity: "WARNING",
            ipAddress: req.ip ?? "Unknown",
            userAgent: req.headers["user-agent"] ?? "Unknown",
        })

        return res.status(200).json({
            message: "Doctor successfully updated",
            doctor
        })

    }catch(err){
        next(err);
    }
}