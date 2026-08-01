import { NextFunction, Response, Request } from "express";
import { Doctor, DoctorService, Service } from "../models/index";
import { sequelize } from "../config/db";
import { Op } from "sequelize";

export const createDoctor = async (
    req: Request,
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

export const deleteDoctor = async (req: Request, res: Response, next: NextFunction) => {
    try{
        const id = req.params.id;

        const doctor = await Doctor.findByPk(Number(id));

        if(!doctor){
            return res.status(404).json({ message: "Doctor not found" });
        }

        doctor.status = 'Inactive';
        await doctor.save();

        res.status(200).json({
            message: "Doctor successfully deleted."
        })

    }catch(err){
        next(err);
    }
}

export const updateDoctor = async (req: Request, res: Response, next: NextFunction) => {
    const transaction = await sequelize.transaction();
    
    try{
        const id = req.params.id;

        const { doctorServices : serviceIds , ...rest } = req.body;

        if (!Array.isArray(serviceIds) || serviceIds.length === 0) {
            return res.status(400).json({
                message: "At least one service is required",
            });
        }

        const doctor = await Doctor.findByPk(Number(id));

        if(!doctor){
            return res.status(404).json({ message: "Doctor not found" });
        }

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

        return res.status(200).json({
            message: "Doctor successfully updated",
            doctor
        })

    }catch(err){
        next(err);
    }
}