import { NextFunction, Response, Request } from "express";
import { Doctor, DoctorService, Service } from "../models/index";
import { sequelize } from "../config/db";

export const createDoctor = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const transaction = await sequelize.transaction();

    try {
        const { doctor, serviceIds } = req.body;

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

export const getDoctors = async (req: Request, res: Response, next: NextFunction) => {
    try{
        const serviceId = req.query.serviceId;
        const status = req.query.status as 'Active' | 'Inactive';

        const doctors = await Doctor.findAll({
            where: status ? { status } : undefined,
            include: [
                {
                    model: DoctorService,
                    as: 'doctorServices',
                    required: true,
                    include: [
                        {
                            model: Service,
                            where: serviceId ? { id: serviceId } : undefined,
                            required: true,
                            as: 'service'
                        }
                    ]
                }
            ],
        });

        return res.status(200).json({
            doctors
        })

    }catch(err){
        next(err);
    }
}