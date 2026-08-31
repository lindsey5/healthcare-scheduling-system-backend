import {
    Op,
    col,
    fn,
    literal,
    where,
    WhereOptions,
} from "sequelize";
import {
    Conversation,
    Message,
    Patient,
} from "../models";

interface GetConversationsOptions {
    page?: number;
    limit?: number;
    search?: string;
    assignedStaffId?: number;
}

class ConversationService {
    static async getConversations({
        page = 1,
        limit = 10,
        search = "",
        assignedStaffId,
    }: GetConversationsOptions) {
        const safePage = Math.max(page, 1);
        const safeLimit = Math.min(Math.max(limit, 1), 100);
        const offset = (safePage - 1) * safeLimit;

        const patientWhere: WhereOptions | undefined = search
            ? {
                  [Op.or]: [
                      where(
                          fn(
                              "CONCAT",
                              col("firstname"),
                              " ",
                              col("lastname")
                          ),
                          {
                              [Op.like]: `%${search}%`,
                          }
                      ),
                      {
                          email: {
                              [Op.like]: `%${search}%`,
                          },
                      },
                  ],
              }
            : undefined;

        const conversationWhere: WhereOptions = {};

        if (assignedStaffId !== undefined) {
            conversationWhere.assignedStaffId = assignedStaffId;
        }

        const {
            rows: conversations,
            count: total,
        } = await Conversation.findAndCountAll({
            where: conversationWhere,

            include: [
                {
                    model: Patient,
                    as: "patient",
                    where: patientWhere,
                    required: !!search,
                },
                {
                    model: Message,
                    as: "messages",
                    separate: true,
                    limit: 1,
                    order: [["createdAt", "DESC"]],
                },
            ],

            attributes: {
                include: [
                    [
                        literal(`(
                            SELECT COUNT(*)
                            FROM messages AS m
                            WHERE m.conversationId = Conversation.id
                            AND m.unread = true
                            AND m.senderType = 'Patient'
                        )`),
                        "unread",
                    ],
                    [
                        literal(`(
                            SELECT m.message
                            FROM messages AS m
                            WHERE m.conversationId = Conversation.id
                            ORDER BY m.createdAt DESC
                            LIMIT 1
                        )`),
                        "lastMessage",
                    ],
                    [
                        literal(`(
                            SELECT m.createdAt
                            FROM messages AS m
                            WHERE m.conversationId = Conversation.id
                            ORDER BY m.createdAt DESC
                            LIMIT 1
                        )`),
                        "lastMessageAt",
                    ],
                ],
            },

            order: [
                [
                    literal(`(
                        SELECT m.createdAt
                        FROM messages AS m
                        WHERE m.conversationId = Conversation.id
                        ORDER BY m.createdAt DESC
                        LIMIT 1
                    )`),
                    "DESC",
                ],
            ],

            limit: safeLimit,
            offset,
            distinct: true,
        });

        return {
            conversations,
            pagination: {
                page: safePage,
                limit: safeLimit,
                total,
                totalPages: Math.ceil(total / safeLimit),
            },
        };
    }
}

export default ConversationService;