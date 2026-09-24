export declare class ActivityNotFoundError extends Error {
}
export declare class ActivityForbiddenError extends Error {
}
export declare class AgencyNotFoundError extends Error {
}
declare class ActivityService {
    listByAgency(agencyId: number, sellerId: number): Promise<import("../entities/actividad").Actividad[]>;
    markAsRead(activityId: number, sellerId: number): Promise<import("../entities/actividad").Actividad>;
    unreadCount(agencyId: number, sellerId: number): Promise<{
        count: number;
    }>;
}
export declare const activityService: ActivityService;
export {};
