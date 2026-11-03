import { NextFunction, Response, Request } from "express";
import {
    Doctor,
    DoctorOfferedService,
    DoctorService,
    Service,
} from "../models/index";
import { Op, Sequelize } from "sequelize";
import { sequelize } from "../config/db";
import { createAudit } from "../services/auditService";
import { AuthRequest } from "../types/type";

const getServiceIdsError = (serviceIds: unknown): string | null => {
    if (
        !Array.isArray(serviceIds) ||
        !serviceIds.every(
            (serviceId) => Number.isInteger(serviceId) && serviceId > 0
        )
    ) {
        return "Select valid services this doctor can offer.";
    }

    if (new Set(serviceIds).size !== serviceIds.length) {
        return "A service can only be assigned once to a doctor.";
    }

    return null;
};

const validateServiceIds = async (
    serviceIds: number[],
    transaction: Awaited<ReturnType<typeof sequelize.transaction>>
) => {
    if (serviceIds.length === 0) {
        return null;
    }

    const activeCount = await Service.count({
        where: {
            id: { [Op.in]: serviceIds },
            status: "Active",
        },
        transaction,
    });

    return activeCount === serviceIds.length
        ? null
        : "One or more selected services are unavailable.";
};

export const createDoctor = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    const serviceIds = req.body.serviceIds;
    const payloadError = getServiceIdsError(serviceIds);
    if (payloadError) {
        return res.status(400).json({ message: payloadError });
    }

    const transaction = await sequelize.transaction();
    let transactionCommitted = false;

    try {
        const newDoctor = await Doctor.create({
            firstname: req.body.firstname,
            lastname: req.body.lastname,
            status: "Active",
        }, { transaction });

        const serviceError = await validateServiceIds(serviceIds, transaction);
        if (serviceError) {
            await transaction.rollback();
            return res.status(409).json({ message: serviceError });
        }

        if (serviceIds.length > 0) {
            await DoctorOfferedService.bulkCreate(
                serviceIds.map((serviceId: number) => ({
                    serviceId,
                    doctorId: newDoctor.id,
                })),
                { transaction }
            );
        }

        await transaction.commit();
        transactionCommitted = true;

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
        if (!transactionCommitted) {
            await transaction.rollback();
        }
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
        const dayOfWeek = req.query.dayOfWeek as string | undefined;

        const where: any = {
            status: "Active",
        };

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
                        [Op.iLike]: `%${search}%`,
                    }
                ),
                {
                    firstname: {
                        [Op.iLike]: `%${search}%`,
                    },
                },
                {
                    lastname: {
                        [Op.iLike]: `%${search}%`,
                    },
                },
            ];
        }

        const days = dayOfWeek
            ? dayOfWeek.split(",").filter(Boolean)
            : [];

        const serviceWhere: Record<string, unknown> = {};
        if (serviceId) {
            serviceWhere.id = Number(serviceId);
        }
        if (days.length > 0) {
            serviceWhere.dayOfWeek = { [Op.in]: days };
        }
        const hasServiceFilter = Object.keys(serviceWhere).length > 0;

        const doctors = await Doctor.findAll({
            where,

            include: [
                {
                    model: DoctorOfferedService,
                    as: "offeredServices",
                    include: [{ model: Service, as: "service" }],
                },
                {
                    model: DoctorService,
                    as: "doctorServices",
                    required: hasServiceFilter,
                    include: [
                        {
                            model: Service,
                            as: "service",
                            where: hasServiceFilter ? serviceWhere : undefined,
                            required: hasServiceFilter,
                        },
                    ],
                },
            ],

            order: [["firstname", "ASC"]],
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
    const serviceIds = req.body.serviceIds;
    const payloadError = getServiceIdsError(serviceIds);
    if (payloadError) {
        return res.status(400).json({ message: payloadError });
    }

    const transaction = await sequelize.transaction();
    let transactionCommitted = false;

    try{
        const id = req.params.id;
        const doctor = await Doctor.findByPk(Number(id), { transaction });

        if(!doctor){
            await transaction.rollback();
            return res.status(404).json({ message: "Doctor not found" });
        }

        const serviceError = await validateServiceIds(serviceIds, transaction);
        if (serviceError) {
            await transaction.rollback();
            return res.status(409).json({ message: serviceError });
        }

        const oldValues = {
            firstname: doctor.firstname,
            lastname: doctor.lastname,
        };

        await doctor.update({
            firstname: req.body.firstname,
            lastname: req.body.lastname,
        }, { transaction });

        await DoctorOfferedService.destroy({
            where: { doctorId: doctor.id },
            transaction,
        });
        if (serviceIds.length > 0) {
            await DoctorOfferedService.bulkCreate(
                serviceIds.map((serviceId: number) => ({
                    serviceId,
                    doctorId: doctor.id,
                })),
                { transaction }
            );
        }

        await transaction.commit();
        transactionCommitted = true;

        await createAudit({
            userId: req.user.id,
            userType: req.user.role,
            action: "UPDATE",
            entity: "Doctor",
            entityId: doctor.id,
            oldValues: {
                firstname: oldValues.firstname,
                lastname: oldValues.lastname,
            },
            newValues: {
                firstname: doctor.firstname,
                lastname: doctor.lastname,
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
        if (!transactionCommitted) {
            await transaction.rollback();
        }
        next(err);
    }
}