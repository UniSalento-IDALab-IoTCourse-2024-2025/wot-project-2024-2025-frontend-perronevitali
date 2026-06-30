export declare const IBEACON = "IBEACON";
export declare const EDDYSTONE = "EDDYSTONE";
export declare const SECURE_PROFILE = "SECURE_PROFILE";
export declare const scanMode: {
    LOW_POWER: number;
    BALANCED: number;
    LOW_LATENCY: number;
};
export declare const scanPeriod: {
    RANGING: string;
    MONITORING: string;
    create: ({ activePeriod, passivePeriod }: {
        activePeriod?: number | undefined;
        passivePeriod?: number | undefined;
    }) => {
        activePeriod: number;
        passivePeriod: number;
    };
};
export declare const activityCheckConfiguration: {
    DISABLED: string;
    MINIMAL: string;
    DEFAULT: string;
    create: ({ inactivityTimeout, checkPeriod }: {
        inactivityTimeout?: number | undefined;
        checkPeriod?: number | undefined;
    }) => {
        inactivityTimeout: number;
        checkPeriod: number;
    };
};
export declare const forceScanConfiguration: {
    DISABLED: string;
    MINIMAL: string;
    create: ({ forceScanActivePeriod, forceScanPassivePeriod }: {
        forceScanActivePeriod?: number | undefined;
        forceScanPassivePeriod?: number | undefined;
    }) => {
        forceScanActivePeriod: number;
        forceScanPassivePeriod: number;
    };
};
export declare const monitoringEnabled: {
    TRUE: boolean;
    FALSE: boolean;
};
export declare const monitoringSyncInterval: {
    DEFAULT: number;
};
