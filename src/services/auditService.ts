import Audit from "../models/Audit";

interface CreateAuditParams {
    userId: number;
    userType: "Admin" | "Staff";

    action: string;
    entity: string;
    entityId: string | number;

    severity: "INFO" | "WARNING" | "CRITICAL";

    oldValues: Record<string, unknown>;
    newValues: Record<string, unknown>;

    ipAddress: string;
    userAgent: string;
}

export const createAudit = async ({
    userId,
    userType,
    action,
    entity,
    entityId,
    severity,
    oldValues,
    newValues,
    ipAddress,
    userAgent,
}: CreateAuditParams) => {
    try {
        return await Audit.create({
            userId,
            userType,
            action,
            entity,
            entityId: String(entityId),
            severity,
            oldValues,
            newValues,
            ipAddress,
            userAgent,
        });
    } catch (error) {
        console.error("Failed to create audit log:", error);

        return null;
    }
};